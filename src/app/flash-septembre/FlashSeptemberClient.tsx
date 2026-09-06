"use client";

import Image from "next/image";
import { ArrowRight, Check, LockKeyhole, Minus, PencilLine, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createSeptemberCustomFlash,
  FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES,
  formatSeptemberMoney as money,
  getSeptemberCustomFlash,
  priceSeptemberSelection,
  type SeptemberPaymentProvider,
  type SeptemberFlash,
} from "@/src/lib/flashSeptember";
import { emptyClientProfile, readClientProfile, type ClientProfile } from "@/src/lib/clientProfileStorage";
import styles from "./FlashSeptember.module.css";

type ClientAuthStatus = "checking" | "authenticated" | "anonymous";

type ContactValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const pendingSelectionStorageKey = "bgrumpy-flash-september-pending-selection";

const contactValuesFromProfile = (profile: ClientProfile): ContactValues => ({
  firstName: profile.prenom.trim(),
  lastName: profile.nom.trim(),
  email: profile.email.trim(),
  phone: profile.telephone.trim(),
});

export default function FlashSeptemberClient({ items }: { items: SeptemberFlash[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [step, setStep] = useState<"selection" | "contact">("selection");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customQuantity, setCustomQuantity] = useState(1);
  const [paymentProvider, setPaymentProvider] = useState<SeptemberPaymentProvider>("paypal");
  const [previewFlash, setPreviewFlash] = useState<SeptemberFlash | null>(null);
  const [authStatus, setAuthStatus] = useState<ClientAuthStatus>("checking");
  const [contactValues, setContactValues] = useState<ContactValues>(contactValuesFromProfile(emptyClientProfile));
  const summary = useRef<HTMLElement>(null);
  const contactForm = useRef<HTMLFormElement>(null);
  const selection = priceSeptemberSelection(selected.flatMap((id) => {
    const item = items.find((flash) => flash.id === id) ?? getSeptemberCustomFlash(id);
    return item ? [item] : [];
  }));
  const customFlashCount = selection.lines.filter((item) => item.custom).length;
  const availableCustomSlots = FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES - customFlashCount;
  const displayedCustomQuantity = Math.min(customQuantity, Math.max(1, availableCustomSlots));

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      const storedProfile = readClientProfile();
      setContactValues(contactValuesFromProfile(storedProfile));

      try {
        const pendingSelection = window.sessionStorage.getItem(pendingSelectionStorageKey);

        if (pendingSelection) {
          const parsed = JSON.parse(pendingSelection) as unknown;
          const validIds = Array.isArray(parsed)
            ? parsed.filter((id): id is string =>
                typeof id === "string" && (items.some((item) => item.id === id) || Boolean(getSeptemberCustomFlash(id))),
              )
            : [];

          setSelected(Array.from(new Set(validIds)));
          window.sessionStorage.removeItem(pendingSelectionStorageKey);
        }
      } catch {
        try {
          window.sessionStorage.removeItem(pendingSelectionStorageKey);
        } catch {
          // Storage can be disabled in private browsing; the selection can still be made again.
        }
      }
    });

    fetch("/api/client/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { authenticated?: boolean } | null) => {
        if (!cancelled) {
          setAuthStatus(payload?.authenticated ? "authenticated" : "anonymous");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthStatus("anonymous");
        }
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    if (!previewFlash) return;
    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewFlash(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [previewFlash]);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setError("");
  }

  function addCustomFlashes() {
    const quantity = Math.min(customQuantity, availableCustomSlots);
    if (!quantity) return;

    setSelected((current) => {
      const nextPosition = Array.from({ length: FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES }, (_, index) => index + 1)
        .filter((position) => !current.includes(createSeptemberCustomFlash(position).id))
        .slice(0, quantity);
      const nextIds = nextPosition.map((position) => createSeptemberCustomFlash(position).id);

      return [...current, ...nextIds];
    });
    setCustomQuantity(1);
    setError("");
  }

  function revealSelection() {
    summary.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function requireAccount() {
    try {
      window.sessionStorage.setItem(pendingSelectionStorageKey, JSON.stringify(selected));
    } catch {
      // The server-side session check remains the source of truth if storage is unavailable.
    }

    window.location.assign("/flash-septembre?login=1");
  }

  function proceed() {
    if (!selection.count) return;

    if (authStatus !== "authenticated") {
      requireAccount();
      return;
    }

    setStep("contact");
    requestAnimationFrame(() => { contactForm.current?.scrollIntoView({ behavior: "smooth", block: "start" }); contactForm.current?.querySelector("input")?.focus({ preventScroll: true }); });
  }

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !selection.count) return;

    if (authStatus !== "authenticated") {
      requireAccount();
      return;
    }

    const form = new FormData(event.currentTarget);
    form.set("selectionIds", JSON.stringify(selected));
    form.set("paymentProvider", paymentProvider);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/flash-septembre/checkout", {
        method: "POST",
        body: form,
      });
      const payload = await response.json();
      if (!response.ok || !payload.approvalUrl) throw new Error(payload.error || "Le paiement n’a pas pu être ouvert. Réessaie dans un instant.");
      const target = new URL(payload.approvalUrl);
      if (target.protocol !== "https:" || !["www.paypal.com", "www.sandbox.paypal.com"].includes(target.hostname)) throw new Error("Le lien de paiement est invalide.");
      window.location.assign(target.href);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Connexion interrompue. Réessaie dans un instant."); setBusy(false); }
  }

  return <main className={styles.page} data-editorial-page>
    <div className={styles.shell} data-page-shell>
      <section className={styles.hero} data-page-hero aria-labelledby="september-title">
        <img
          className={styles.heroImage}
          data-page-hero-image
          src="/flash-septembre-hero.png"
          alt=""
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} data-page-hero-overlay aria-hidden="true" />
        <div className={styles.heroVeil} data-page-hero-veil aria-hidden="true" />
        <div className={styles.heroContent} data-page-hero-content>
          <p className={styles.eyebrow} data-page-brand-sub>SEPTEMBRE 2026</p>
          <div className={styles.heroCopy} data-page-hero-copy>
            <h1 className={styles.heroTitle} id="september-title" data-page-title>JOURNÉES FLASHS</h1>
            <p className={styles.heroIntro} data-page-intro>Choisis tes flashs de septembre et réserve ta séance.</p>
            <div className={styles.priceSummary} aria-label="Tarifs des journées flashs">
              <div className={styles.priceItem}><strong className={styles.priceAmount}>70 €</strong><span className={styles.priceLabel}>par flash<small>pour 1 ou 2 flashs</small></span></div>
              <div className={styles.priceItem}><strong className={styles.priceAmount}>60 €</strong><span className={styles.priceLabel}>par flash<small>à partir du 3ᵉ flash</small></span></div>
            </div>
            <a href="#flashs-disponibles" className={styles.heroCta}>RÉSERVER MES FLASHS <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </div>

    <div className={styles.content}>
      <div className={styles.conditions}>
        <span>Shop privé en maison à Villiers-sur-Morin</span>
        <span>Adresse exacte communiquée après prise de rendez-vous</span>
        <span>Offre valable en septembre 2026</span><span>Créneaux limités</span>
      </div>
      <article className={`glass-card ${styles.customCard}`}>
        <span className={styles.customIcon}><PencilLine size={26} strokeWidth={1.5} aria-hidden="true" /></span>
        <div>
          <p className={styles.eyebrow}>Une idée à toi</p><h2>FLASH PERSO À RÉSERVER</h2>
          <p>Tu as une idée précise ? Choisis combien de flashs personnalisés tu souhaites ajouter, puis joins une photo ou une inspiration. Le shop validera les motifs avant le rendez-vous ; ils suivront ensuite le même tarif et le même acompte de 20 € que les modèles proposés.</p>
          <div className={styles.customControls}>
            <label className={styles.quantityField} htmlFor="custom-quantity">
              <span>Quantité</span>
              <span className={styles.quantityStepper}>
                <button type="button" disabled={busy || availableCustomSlots === 0 || displayedCustomQuantity <= 1} onClick={() => setCustomQuantity((value) => Math.max(1, value - 1))} aria-label="Retirer un flash personnalisé"><Minus size={17} aria-hidden="true" /></button>
                <output id="custom-quantity" aria-live="polite">{displayedCustomQuantity}</output>
                <button type="button" disabled={busy || availableCustomSlots === 0 || displayedCustomQuantity >= availableCustomSlots} onClick={() => setCustomQuantity((value) => Math.min(availableCustomSlots, value + 1))} aria-label="Ajouter un flash personnalisé"><Plus size={17} aria-hidden="true" /></button>
              </span>
            </label>
            <button type="button" disabled={busy || availableCustomSlots === 0} className={`btn btn-secondary ${styles.secondary}`} onClick={addCustomFlashes}><Plus size={17} aria-hidden="true" /> AJOUTER {displayedCustomQuantity > 1 ? `${displayedCustomQuantity} FLASHS PERSO` : "UN FLASH PERSO"}</button>
          </div>
          {customFlashCount > 0 && <p className={styles.customAdded}><Check size={16} aria-hidden="true" /> {customFlashCount} flash perso ajouté{customFlashCount > 1 ? "s" : ""} à ta sélection</p>}
        </div>
      </article>
      <div className={styles.bookingLayout}>
        <section id="flashs-disponibles" className={styles.gallerySection} aria-labelledby="gallery-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>La sélection du shop</p><h2 id="gallery-title">Trouve tes flashs</h2></div><button className={styles.selectionLink} onClick={revealSelection}>Ma sélection <span>{selection.count}</span></button></div>
          <p className={styles.lead}>Sélectionne un ou plusieurs modèles pour ton rendez-vous.</p>
          <div className={styles.gallery}>
            {items.map((item, index) => {
              const active = selected.includes(item.id); const failed = unavailable.includes(item.id);
              return <article key={item.id} className={`glass-card ${styles.flashCard} ${active ? styles.selectedCard : ""}`}>
                <div className={styles.art}>{item.image && !failed ? <button type="button" className={styles.artButton} onClick={() => setPreviewFlash(item)} aria-label={`Agrandir ${item.reference} ${item.title}`}><Image src={item.image.src} alt={item.image.alt} width={520} height={640} loading={index < 4 ? "eager" : "lazy"} sizes="(min-width: 1180px) 28vw, (min-width: 760px) 38vw, 46vw" unoptimized onError={() => { setUnavailable((list) => [...list, item.id]); setSelected((list) => list.filter((id) => id !== item.id)); }} /></button> : <p>{item.custom ? "Flash personnalisé validé" : "Image indisponible"}</p>}</div>
                <span className={styles.flashRef}>{item.reference}</span>
                <button type="button" disabled={failed || busy} aria-pressed={active} aria-label={`${active ? "Retirer" : "Réserver"} ${item.reference} ${item.title}`} className={styles.cardReserve} onClick={() => toggle(item.id)}>{active ? <Check size={18} strokeWidth={1.9} aria-hidden="true" /> : <Plus size={18} strokeWidth={1.9} aria-hidden="true" />}<span>{active ? "RETIRER DE MA SÉLECTION" : "RÉSERVER CE FLASH"}</span></button>
              </article>;
            })}
          </div>
          {!items.length && <p className={`glass-card ${styles.empty}`}>Les modèles disponibles seront ajoutés ici par le shop.</p>}
        </section>

        <aside className={styles.summaryColumn} ref={summary} id="ma-selection" aria-labelledby="selection-title">
          <div className={`glass-card ${styles.summary}`}>
            <p className={styles.eyebrow}>Ton rendez-vous</p><h2 id="selection-title">Ma sélection</h2>
            {!selection.count ? <div className={styles.empty}><Plus size={26} strokeWidth={1.2} aria-hidden="true" /><p>Choisis tes premiers flashs dans la galerie ou ajoute un flash perso.</p><p>20 € d’acompte par flash.</p></div> : <>
              <ul className={styles.lines}>{selection.lines.map((item) => <li key={item.id}>
                {item.image && <Image src={item.image.src} alt="" width={48} height={58} unoptimized />}
                <div><strong>{item.reference} · {item.title}</strong><small>{selection.count >= 3 ? "Tarif groupe : 60 € chacun" : "Tarif septembre"}</small></div><b>{money(item.price)}</b><button type="button" onClick={() => toggle(item.id)} disabled={busy} aria-label={`Retirer ${item.reference}`}><X size={17} aria-hidden="true" /></button>
              </li>)}</ul>
              <dl className={styles.totals} aria-live="polite" aria-atomic="true">
                <div>
                  <dt>{selection.count} flash{selection.count > 1 ? "s" : ""}{selection.count >= 3 && <small>Tarif groupe · 60 € chacun</small>}</dt>
                  <dd>{money(selection.total)}</dd>
                </div>
                {selection.discount > 0 && <div className={styles.savings}><dt>Économie par rapport au tarif 70 €</dt><dd>−{money(selection.discount)}</dd></div>}
                <div className={styles.total}><dt>Prix total</dt><dd>{money(selection.total)}</dd></div>
                <div className={styles.deposit}><dt>Acompte à payer<small>{selection.count} × 20 €</small></dt><dd>{money(selection.deposit)}</dd></div>
                <div><dt>Reste à payer</dt><dd>{money(selection.remaining)}</dd></div>
              </dl>
              <p className={styles.dateNote}>La date et l’adresse exacte du shop privé à Villiers-sur-Morin seront communiquées ensuite par le shop.</p>
              <p className={styles.dateNote}>Un compte client est obligatoire pour confirmer la réservation. Tes coordonnées seront reprises automatiquement.</p>
              {step === "selection" && <button className={`btn btn-primary ${styles.primary} ${styles.fullWidth}`} onClick={proceed}>RÉSERVER MES FLASHS <ArrowRight size={18} aria-hidden="true" /></button>}
            </>}
          </div>
          {step === "contact" && <form ref={contactForm} className={`glass-card ${styles.contact}`} onSubmit={pay} onChange={() => setError("")}>
            <p className={styles.eyebrow}>Avant le paiement</p><h2>Tes coordonnées</h2>
            <fieldset disabled={busy}>
              <div className={styles.names}><label>Prénom<input name="firstName" autoComplete="given-name" required maxLength={100} value={contactValues.firstName} onChange={(event) => setContactValues((current) => ({ ...current, firstName: event.target.value }))} /></label><label>Nom<input name="lastName" autoComplete="family-name" required maxLength={100} value={contactValues.lastName} onChange={(event) => setContactValues((current) => ({ ...current, lastName: event.target.value }))} /></label></div>
              <label>Adresse email<input name="email" type="email" autoComplete="email" required maxLength={254} value={contactValues.email} onChange={(event) => setContactValues((current) => ({ ...current, email: event.target.value }))} /></label>
              <label>Téléphone<input name="phone" type="tel" autoComplete="tel" required maxLength={30} value={contactValues.phone} onChange={(event) => setContactValues((current) => ({ ...current, phone: event.target.value }))} /></label>
              {customFlashCount > 0 && <label>Ton idée de flash perso <span>(obligatoire)</span><textarea name="customIdea" rows={4} required minLength={10} maxLength={3000} placeholder="Décris ton idée ou colle le lien de ton inspiration." /></label>}
              {customFlashCount > 0 && <label>Photo de référence <span>(obligatoire)</span><input name="customReference" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif" required /><small className={styles.fieldHint}>Ajoute une photo ou une capture du modèle que tu souhaites. 8 Mo maximum.</small></label>}
              <label>Remarques <span>(facultatif)</span><textarea name="notes" rows={3} maxLength={3000} /></label>
              <fieldset className={styles.paymentMethods}>
                <legend>Moyen de paiement</legend>
                <label className={styles.paymentChoice}>
                  <input type="radio" name="paymentChoice" value="paypal" checked={paymentProvider === "paypal"} onChange={() => setPaymentProvider("paypal")} />
                  <span><strong>PayPal</strong><small>Régler avec ton compte PayPal</small></span>
                </label>
                <label className={styles.paymentChoice}>
                  <input type="radio" name="paymentChoice" value="paypal_card" checked={paymentProvider === "paypal_card"} onChange={() => setPaymentProvider("paypal_card")} />
                  <span><strong>Carte bancaire via PayPal</strong><small>Payer par carte sur la page sécurisée PayPal</small></span>
                </label>
                <p className={styles.paymentMethodsNote}>Les deux choix passent par PayPal. Les données bancaires restent chez PayPal et ne sont jamais stockées sur le site.</p>
              </fieldset>
            </fieldset>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button disabled={busy || !selection.count} className={`btn btn-primary ${styles.primary} ${styles.fullWidth}`} type="submit"><LockKeyhole size={17} aria-hidden="true" />{busy ? "Ouverture du paiement…" : `PAYER L’ACOMPTE DE ${money(selection.deposit)}`}</button><p className={styles.paymentNote}>Paiement sécurisé avec {paymentProvider === "paypal_card" ? "ta carte via PayPal" : "PayPal"}.</p><button type="button" disabled={busy} className={styles.editSelection} onClick={() => setStep("selection")}><Minus size={14} aria-hidden="true" /> Revenir à ma sélection</button>
          </form>}
        </aside>
      </div>
    </div>
    {selection.count > 0 && <button
      type="button"
      className={styles.cartBubble}
      onClick={revealSelection}
      aria-label={`Voir mon panier : ${selection.count} flash${selection.count > 1 ? "s" : ""}, ${money(selection.total)}`}
    >
      <span className={styles.cartIcon}><ShoppingBag size={19} strokeWidth={1.8} aria-hidden="true" /><span>{selection.count}</span></span>
      <span className={styles.cartLabel}>{selection.count} flash{selection.count > 1 ? "s" : ""} <strong>{money(selection.total)}</strong></span>
      <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
    </button>}
    {previewFlash?.image && <div className={styles.previewBackdrop} role="presentation" onClick={() => setPreviewFlash(null)}>
      <div className={`glass-card ${styles.previewCard}`} role="dialog" aria-modal="true" aria-labelledby="flash-preview-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.previewClose} onClick={() => setPreviewFlash(null)} aria-label="Fermer l’aperçu"><X size={21} aria-hidden="true" /></button>
        <div className={styles.previewArt}>
          <span className={styles.previewStatus}>{previewFlash.status ?? "Disponible"}</span>
          <Image src={previewFlash.image.src} alt={previewFlash.image.alt} width={900} height={1100} sizes="(min-width: 760px) 700px, calc(100vw - 44px)" unoptimized />
        </div>
        <div className={styles.previewDetails}>
          <p className={styles.previewReference}>{previewFlash.reference}</p>
          <h2 id="flash-preview-title">{previewFlash.title}</h2>
          <p className={styles.previewDescription}>{previewFlash.description ?? `${previewFlash.title}, prêt à être réservé chez B.Grumpy Tattoo.`}</p>
          <dl className={styles.previewMeta}>
            <div><dt>Taille</dt><dd>{previewFlash.size ?? "À préciser"}</dd></div>
            <div><dt>Style</dt><dd>{previewFlash.style ?? "À préciser"}</dd></div>
          </dl>
          <button type="button" disabled={busy} aria-pressed={selected.includes(previewFlash.id)} className={`btn btn-primary ${styles.primary} ${styles.previewSelect}`} onClick={() => { toggle(previewFlash.id); setPreviewFlash(null); }}>
            {selected.includes(previewFlash.id) ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
            {selected.includes(previewFlash.id) ? "RETIRER DE MA SÉLECTION" : "RÉSERVER CE FLASH"}
          </button>
        </div>
      </div>
    </div>}
  </main>;
}
