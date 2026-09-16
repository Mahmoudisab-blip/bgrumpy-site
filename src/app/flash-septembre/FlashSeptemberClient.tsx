"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, Minus, PencilLine, Plus, Search as SearchIcon, ShoppingBag, SlidersHorizontal as FilterIcon, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createSeptemberCustomFlash,
  FLASH_SEPTEMBER_STATUS_FILTERS,
  FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES,
  FLASH_SEPTEMBER_TEST_DEPOSIT_EMAIL,
  createSeptemberFilterOptions,
  formatSeptemberMoney as money,
  getSeptemberFlashCategories,
  getSeptemberCustomFlash,
  priceSeptemberSelection,
  type SeptemberFilterOptions,
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

type AgeStatus = "" | "majeur" | "mineur";

type SeptemberFilterKey = "themes" | "styles" | "sizes" | "placements" | "statuses";

type SeptemberFilters = Record<SeptemberFilterKey, string[]>;

const emptySeptemberFilters: SeptemberFilters = {
  themes: [],
  styles: [],
  sizes: [],
  placements: [],
  statuses: [],
};

const splitSeptemberValues = (value: string | undefined) =>
  value
    ? value
        .split(/\s*(?:,|·)\s*/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

const normalizeSeptemberFilterValue = (value: string) => value.trim().toLocaleLowerCase("fr-FR");

const septemberItemValues = (item: SeptemberFlash, key: SeptemberFilterKey) => {
  if (key === "themes") return item.categories ?? [];
  if (key === "styles") return splitSeptemberValues(item.style);
  if (key === "sizes") return splitSeptemberValues(item.size);
  if (key === "placements") return splitSeptemberValues(item.placement);
  return [item.status ?? "Disponible"];
};

const matchesSeptemberFilter = (item: SeptemberFlash, key: SeptemberFilterKey, selected: string[]) =>
  selected.length === 0 || selected.some((value) => septemberItemValues(item, key).some((entry) => (
    key === "themes" || key === "statuses"
      ? normalizeSeptemberFilterValue(entry) === normalizeSeptemberFilterValue(value)
      : normalizeSeptemberFilterValue(entry).includes(normalizeSeptemberFilterValue(value))
  )));

const pendingSelectionStorageKey = "bgrumpy-flash-september-pending-selection";

const contactValuesFromProfile = (profile: ClientProfile): ContactValues => ({
  firstName: profile.prenom.trim(),
  lastName: profile.nom.trim(),
  email: profile.email.trim(),
  phone: profile.telephone.trim(),
});

export default function FlashSeptemberClient({ items, filterOptions }: { items: SeptemberFlash[]; filterOptions: SeptemberFilterOptions }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [step, setStep] = useState<"selection" | "contact">("selection");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customQuantity, setCustomQuantity] = useState(1);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SeptemberFilters>(emptySeptemberFilters);
  const [paymentProvider, setPaymentProvider] = useState<SeptemberPaymentProvider>("paypal");
  const [previewFlash, setPreviewFlash] = useState<SeptemberFlash | null>(null);
  const [authStatus, setAuthStatus] = useState<ClientAuthStatus>("checking");
  const [accountEmail, setAccountEmail] = useState("");
  const [contactValues, setContactValues] = useState<ContactValues>(contactValuesFromProfile(emptyClientProfile));
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [ageStatus, setAgeStatus] = useState<AgeStatus>("");
  const [ageDeclarationAccepted, setAgeDeclarationAccepted] = useState(false);
  const summary = useRef<HTMLElement>(null);
  const contactForm = useRef<HTMLFormElement>(null);
  const activeFilterOptions = filterOptions ?? createSeptemberFilterOptions();
  const themeFilterOptions = activeFilterOptions.themes;
  const styleFilterOptions = activeFilterOptions.styles;
  const sizeFilterOptions = activeFilterOptions.sizes;
  const placementFilterOptions = activeFilterOptions.placements;
  const filteredItems = items.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    const searchableText = [
      item.reference,
      item.title,
      item.description ?? "",
      ...getSeptemberFlashCategories(item),
      ...(item.categories ?? []),
    ].join(" ").toLowerCase();

    return (normalizedQuery === "" || searchableText.includes(normalizedQuery))
      && (Object.keys(filters) as SeptemberFilterKey[]).every((key) => matchesSeptemberFilter(item, key, filters[key]));
  });
  const activeFilterCount = Object.values(filters).flat().length;
  const baseSelection = priceSeptemberSelection(selected.flatMap((id) => {
    const item = items.find((flash) => flash.id === id) ?? getSeptemberCustomFlash(id);
    return item ? [item] : [];
  }));
  const selection = accountEmail === FLASH_SEPTEMBER_TEST_DEPOSIT_EMAIL && authStatus === "authenticated"
    ? { ...baseSelection, deposit: 100, remaining: baseSelection.total - 100 }
    : baseSelection;
  const customFlashCount = selection.lines.filter((item) => item.custom).length;
  const availableCustomSlots = FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES - customFlashCount;
  const displayedCustomQuantity = Math.min(customQuantity, Math.max(1, availableCustomSlots));
  const depositDescription = selection.deposit === 100
    ? "Test compte propriétaire : 1 €"
    : `${selection.count} × 20 €`;

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
                typeof id === "string" && (items.some((item) => item.id === id && item.status !== "Réservé") || Boolean(getSeptemberCustomFlash(id))),
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
      .then((payload: { authenticated?: boolean; email?: string | null } | null) => {
        if (!cancelled) {
          setAccountEmail(payload?.email?.trim().toLowerCase() ?? "");
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
    const item = items.find((flash) => flash.id === id);
    if (item?.status === "Réservé") return;

    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    setLegalAccepted(false);
    setAgeDeclarationAccepted(false);
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
    setLegalAccepted(false);
    setAgeDeclarationAccepted(false);
    setError("");
  }

  function revealSelection() {
    summary.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleFilter(key: SeptemberFilterKey, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((entry) => entry !== value)
        : [...current[key], value],
    }));
  }

  function resetFilters() {
    setQuery("");
    setFilters(emptySeptemberFilters);
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

    if (!legalAccepted) {
      setError("Coche la case d’acceptation avant de continuer vers le paiement.");
      return;
    }

    if (!ageStatus || !ageDeclarationAccepted) {
      setError("Indique si la personne tatouée est majeure ou mineure, puis coche l’attestation sur l’honneur avant de continuer.");
      return;
    }

    const form = new FormData(event.currentTarget);
    form.set("selectionIds", JSON.stringify(selected));
    form.set("paymentProvider", paymentProvider);
    form.set("legalAccepted", "true");
    form.set("ageStatus", ageStatus);
    form.set("ageDeclarationAccepted", "true");
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/flash-septembre/checkout", {
        method: "POST",
        body: form,
      });
      const payload = await response.json();
      if (!response.ok || !payload.approvalUrl) throw new Error(payload.error || "Le paiement n’a pas pu être ouvert. Réessaie dans un instant.");
      const target = new URL(payload.approvalUrl);
      const allowedHosts = paymentProvider === "sumup_card"
        ? ["checkout.sumup.com"]
        : ["www.paypal.com", "www.sandbox.paypal.com"];
      if (target.protocol !== "https:" || !allowedHosts.includes(target.hostname)) throw new Error("Le lien de paiement est invalide.");
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
        <span>Date proposée sous 24 à 48 h après paiement</span><span>Adresse exacte communiquée après prise de rendez-vous</span>
        <span>Offre valable en septembre 2026</span><span>Créneaux limités</span>
      </div>
      <article className={`glass-card ${styles.customCard}`}>
        <span className={styles.customIcon}><PencilLine size={26} strokeWidth={1.5} aria-hidden="true" /></span>
        <div>
          <p className={styles.eyebrow}>Une idée à toi</p><h2>FLASH PERSO À RÉSERVER</h2>
          <p>Tu as une idée précise ? Choisis combien de flashs personnalisés tu souhaites ajouter, puis joins une photo ou une inspiration. Le shop validera les motifs avant le rendez-vous ; ils suivront ensuite le même tarif et le même acompte de 20 € que les modèles proposés. Si une idée n’est pas validée, tu peux proposer un autre projet ou demander le remboursement de l’acompte correspondant.</p>
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
          <section className={styles.filtersPanel} aria-label="Recherche et filtres des flashs">
            <div className={styles.filterTopRow}>
              <label className={styles.filterSearch}>
                <SearchIcon aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Rechercher un flash par thème ou référence"
                  placeholder="Rechercher par thème, référence..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button
                type="button"
                className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ""}`}
                aria-expanded={showFilters}
                onClick={() => setShowFilters((current) => !current)}
              >
                <FilterIcon aria-hidden="true" />
                <span>Filtres</span>
                {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
              </button>
            </div>
            {activeFilterCount > 0 && (
              <div className={styles.activeFilters} aria-label="Filtres actifs">
                {Object.entries(filters).flatMap(([key, values]) => values.map((value) => (
                  <button key={`${key}-${value}`} type="button" onClick={() => toggleFilter(key as SeptemberFilterKey, value)}>
                    {value}<X size={13} aria-hidden="true" />
                  </button>
                )))}
                <button type="button" className={styles.clearFilters} onClick={resetFilters}>Tout effacer</button>
              </div>
            )}
            {showFilters && (
              <div className={styles.filterGroups}>
                <SeptemberFilterGroup label="Thèmes" options={themeFilterOptions} selected={filters.themes} items={items} filterKey="themes" onToggle={toggleFilter} />
                <SeptemberFilterGroup label="Style" options={styleFilterOptions} selected={filters.styles} items={items} filterKey="styles" onToggle={toggleFilter} />
                <SeptemberFilterGroup label="Taille" options={sizeFilterOptions} selected={filters.sizes} items={items} filterKey="sizes" onToggle={toggleFilter} />
                <SeptemberFilterGroup label="Emplacement" options={placementFilterOptions} selected={filters.placements} items={items} filterKey="placements" onToggle={toggleFilter} />
                <SeptemberFilterGroup label="Disponibilité" options={FLASH_SEPTEMBER_STATUS_FILTERS} selected={filters.statuses} items={items} filterKey="statuses" onToggle={toggleFilter} />
                <button type="button" className={styles.clearFiltersButton} onClick={resetFilters}>Réinitialiser la recherche et les filtres</button>
              </div>
            )}
            <p className={styles.filterResultCount} aria-live="polite">{filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}</p>
          </section>
          <div className={styles.gallery}>
            {filteredItems.map((item, index) => {
              const active = selected.includes(item.id); const failed = unavailable.includes(item.id); const reserved = item.status === "Réservé";
              return <article key={item.id} className={`glass-card ${styles.flashCard} ${active ? styles.selectedCard : ""}`}>
                <div className={styles.art}>{item.image && !failed ? <button type="button" className={styles.artButton} onClick={() => setPreviewFlash(item)} aria-label={`Agrandir ${item.reference} ${item.title}`}><Image src={item.image.src} alt={item.image.alt} width={520} height={640} loading={index < 4 ? "eager" : "lazy"} sizes="(min-width: 1180px) 28vw, (min-width: 760px) 38vw, 46vw" unoptimized onError={() => { setUnavailable((list) => [...list, item.id]); setSelected((list) => list.filter((id) => id !== item.id)); setLegalAccepted(false); setAgeDeclarationAccepted(false); }} /></button> : <p>{item.custom ? "Flash personnalisé validé" : "Image indisponible"}</p>}</div>
                <span className={`${styles.cardStatus} ${reserved ? styles.cardStatusReserved : ""}`}>{reserved ? "Réservé" : item.status ?? "Disponible"}</span>
                <span className={styles.flashRef}>{item.reference}</span>
                <button type="button" disabled={reserved || failed || busy} aria-pressed={active} aria-label={`${reserved ? "Flash réservé" : active ? "Retirer" : "Réserver"} ${item.reference} ${item.title}`} className={styles.cardReserve} onClick={() => toggle(item.id)}>{reserved ? <LockKeyhole size={16} strokeWidth={1.9} aria-hidden="true" /> : active ? <Check size={18} strokeWidth={1.9} aria-hidden="true" /> : <Plus size={18} strokeWidth={1.9} aria-hidden="true" />}<span>{reserved ? "DÉJÀ RÉSERVÉ" : active ? "RETIRER DE MA SÉLECTION" : "RÉSERVER CE FLASH"}</span></button>
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
                <div className={styles.deposit}><dt>Acompte à payer<small>{depositDescription}</small></dt><dd>{money(selection.deposit)}</dd></div>
                <div><dt>Reste à payer</dt><dd>{money(selection.remaining)}</dd></div>
              </dl>
              <p className={styles.dateNote}>Le shop confirme ou propose une date dans les 24 à 48 heures suivant le paiement. L’adresse exacte du shop privé à Villiers-sur-Morin est communiquée ensuite.</p>
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
              <fieldset className={styles.ageDeclaration}>
                <legend>Âge du client</legend>
                <p className={styles.ageIntro}>Avant le paiement, indique si la personne qui sera tatouée est majeure ou mineure.</p>
                <div className={styles.ageChoices}>
                  <label className={styles.ageChoice}>
                    <input type="radio" name="ageStatus" value="majeur" required checked={ageStatus === "majeur"} onChange={() => setAgeStatus("majeur")} />
                    <span>La personne tatouée est majeure</span>
                  </label>
                  <label className={styles.ageChoice}>
                    <input type="radio" name="ageStatus" value="mineur" required checked={ageStatus === "mineur"} onChange={() => setAgeStatus("mineur")} />
                    <span>La personne tatouée est mineure</span>
                  </label>
                </div>
                {ageStatus === "mineur" && <p className={styles.ageNotice}>Si la personne tatouée est mineure, une autorisation écrite de son représentant légal devra être fournie avant la séance.</p>}
                <label className={styles.legalCheckbox}>
                  <input type="checkbox" name="ageDeclarationAccepted" required checked={ageDeclarationAccepted} onChange={(event) => setAgeDeclarationAccepted(event.target.checked)} />
                  <span>Je certifie sur l’honneur que la déclaration concernant l’âge de la personne tatouée est exacte. Si elle est inexacte, le shop se réserve le droit d’annuler la réservation.{ageStatus === "mineur" ? " Si la personne tatouée est mineure, je fournirai l’autorisation écrite de son représentant légal avant la séance." : ""}</span>
                </label>
              </fieldset>
              <fieldset className={styles.paymentMethods}>
                <legend>Moyen de paiement</legend>
                <label className={styles.paymentChoice}>
                  <input type="radio" name="paymentChoice" value="paypal" checked={paymentProvider === "paypal"} onChange={() => setPaymentProvider("paypal")} />
                  <span><strong>PayPal</strong><small>Régler avec ton compte PayPal</small></span>
                </label>
                <label className={styles.paymentChoice}>
                  <input type="radio" name="paymentChoice" value="sumup_card" checked={paymentProvider === "sumup_card"} onChange={() => setPaymentProvider("sumup_card")} />
                  <span><strong>Carte bancaire via SumUp</strong><small>Payer par carte sur la page sécurisée SumUp</small></span>
                </label>
                <p className={styles.paymentMethodsNote}>PayPal et SumUp sont deux paiements séparés. Les données bancaires restent chez le prestataire choisi et ne sont jamais stockées sur le site.</p>
              </fieldset>
            </fieldset>
            <p className={styles.legalLink}><Link href="/cgv/flash-septembre">Consulter les conditions de réservation</Link></p>
            <p className={styles.paymentMethodsNote}>Tu vas être redirigé(e) vers le prestataire choisi pour régler l’acompte affiché ci-dessus. La réservation n’est confirmée qu’après vérification du paiement.</p>
            <div className={styles.legalAcceptance}>
              <p className={styles.legalAcceptanceNote}>L’acompte est non remboursable en cas d’annulation définitive de ta part. En cas de report avec une nouvelle date convenue, il est conservé et déduit du rendez-vous reporté. Les droits légaux applicables restent réservés.</p>
              <label className={styles.legalCheckbox}>
                <input type="checkbox" name="legalAccepted" required checked={legalAccepted} onChange={(event) => setLegalAccepted(event.target.checked)} />
                <span>J’ai compris que l’acompte de {money(selection.deposit)} est non remboursable en cas d’annulation définitive de ma part ; en cas de report avec une nouvelle date convenue, il est conservé et déduit du rendez-vous reporté ; et j’accepte les conditions de réservation. Si un flash personnalisé n’est pas validé, je peux proposer un autre projet ou demander le remboursement de l’acompte correspondant.</span>
              </label>
            </div>
            <p className={styles.paymentInstruction}><strong>Pour accélérer la prise de rendez-vous :</strong> après le paiement, envoie-nous un message privé sur Instagram avec ton nom et ton prénom afin de valider ensemble une date.</p>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button disabled={busy || !selection.count} className={`btn btn-primary ${styles.primary} ${styles.fullWidth}`} type="submit"><LockKeyhole size={17} aria-hidden="true" />{busy ? "Ouverture du paiement…" : `PAYER L’ACOMPTE DE ${money(selection.deposit)}`}</button><p className={styles.paymentNote}>Paiement sécurisé avec {paymentProvider === "sumup_card" ? "ta carte via SumUp" : paymentProvider === "paypal_card" ? "ta carte via PayPal" : "PayPal"}.</p><button type="button" disabled={busy} className={styles.editSelection} onClick={() => setStep("selection")}><Minus size={14} aria-hidden="true" /> Revenir à ma sélection</button>
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
          <button type="button" disabled={busy || previewFlash.status === "Réservé"} aria-pressed={selected.includes(previewFlash.id)} className={`btn btn-primary ${styles.primary} ${styles.previewSelect}`} onClick={() => { toggle(previewFlash.id); setPreviewFlash(null); }}>
            {previewFlash.status === "Réservé" ? <LockKeyhole size={17} aria-hidden="true" /> : selected.includes(previewFlash.id) ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
            {previewFlash.status === "Réservé" ? "FLASH DÉJÀ RÉSERVÉ" : selected.includes(previewFlash.id) ? "RETIRER DE MA SÉLECTION" : "RÉSERVER CE FLASH"}
          </button>
        </div>
      </div>
    </div>}
  </main>;
}

type SeptemberFilterGroupProps = {
  filterKey: SeptemberFilterKey;
  items: SeptemberFlash[];
  label: string;
  onToggle: (key: SeptemberFilterKey, value: string) => void;
  options: readonly string[];
  selected: string[];
};

function SeptemberFilterGroup({ filterKey, items, label, onToggle, options, selected }: SeptemberFilterGroupProps) {
  return (
    <div className={styles.filterGroup}>
      <div className={styles.filterGroupHeading}>
        <p>{label}</p>
        <span>{selected.length ? `${selected.length} sélectionné${selected.length > 1 ? "s" : ""}` : "Plusieurs choix possibles"}</span>
      </div>
      <div className={styles.filterOptions}>
        {options.map((option) => {
          const count = items.filter((item) => matchesSeptemberFilter(item, filterKey, [option])).length;
          const active = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              className={`${styles.filterOption} ${active ? styles.filterOptionActive : ""}`}
              aria-pressed={active}
              disabled={!count && !active}
              onClick={() => onToggle(filterKey, option)}
            >
              <span>{option}</span>
              <small>{count}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
