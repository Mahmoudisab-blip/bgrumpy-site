"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { formatSeptemberMoney, type SeptemberFlash, type SeptemberPaymentProvider } from "@/src/lib/flashSeptember";
import styles from "../FlashSeptember.module.css";

type Confirmation = {
  status: string;
  emailSent: boolean;
  booking: {
    id: string;
    selection: SeptemberFlash[];
    pricing: {
      total: number;
      deposit: number;
      remaining: number;
    };
  };
};

export default function PaymentResultClient({
  bookingId,
  paymentProvider,
  paymentReference,
  cancelled,
}: {
  bookingId: string;
  paymentProvider: SeptemberPaymentProvider;
  paymentReference: string | null;
  cancelled: boolean;
}) {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const paymentLabel = paymentProvider === "sumup_card"
    ? "Carte bancaire via SumUp"
    : paymentProvider === "paypal_card"
      ? "Carte bancaire via PayPal"
      : "PayPal";

  useEffect(() => {
    if (cancelled || !bookingId) {
      return;
    }

    let active = true;

    const confirm = async () => {
      try {
        const response = await fetch("/api/flash-septembre/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, paymentProvider, paymentReference }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Le prestataire n'a pas encore confirmé l'acompte.");
        }

        if (active) {
          setConfirmation(payload as Confirmation);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "La confirmation a été interrompue.");
        }
      }
    };

    void confirm();

    return () => {
      active = false;
    };
  }, [bookingId, cancelled, paymentProvider, paymentReference]);

  if (cancelled) {
    return (
      <main className={styles.paymentPage}>
        <section className={`glass-card ${styles.paymentCard}`}>
          <p className={styles.eyebrow}>Paiement annulé</p>
          <h1>Ta sélection est conservée</h1>
          <p>Tu peux revenir à tes flashs quand tu le souhaites. Aucun acompte n&apos;a été encaissé.</p>
          <Link href="/flash-septembre" className={`btn btn-primary ${styles.primary}`}>
            <RotateCcw size={18} aria-hidden="true" /> Revenir à la sélection
          </Link>
        </section>
      </main>
    );
  }

  if (!bookingId) {
    return (
      <main className={styles.paymentPage}>
        <section className={`glass-card ${styles.paymentCard}`}>
          <p className={styles.eyebrow}>Lien incomplet</p>
          <h1>Impossible de retrouver la réservation</h1>
          <p>Retourne à la page Flash Septembre pour recommencer la sélection.</p>
          <Link href="/flash-septembre" className={`btn btn-primary ${styles.primary}`}>Retour aux flashs</Link>
        </section>
      </main>
    );
  }

  if (!confirmation && !error) {
    return (
      <main className={styles.paymentPage} aria-live="polite">
        <section className={`glass-card ${styles.paymentCard}`}>
          <LoaderCircle className={styles.spinner} size={34} aria-hidden="true" />
          <p className={styles.eyebrow}>Vérification {paymentLabel}</p>
          <h1>Confirmation de ton acompte</h1>
          <p>Nous vérifions la confirmation directement auprès du prestataire. Garde cette page ouverte quelques instants.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.paymentPage}>
        <section className={`glass-card ${styles.paymentCard}`}>
          <p className={styles.eyebrow}>Confirmation en attente</p>
          <h1>On vérifie encore le paiement</h1>
          <p>{error}</p>
          <p>Si tu viens de payer, recharge cette page dans un instant : la réservation ne sera validée qu&apos;après confirmation du prestataire.</p>
          <Link href="/flash-septembre" className={`btn btn-secondary ${styles.secondary}`}>Retour aux flashs</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.paymentPage}>
      <section className={`glass-card ${styles.paymentCard}`}>
        <CheckCircle2 className={styles.successIcon} size={42} aria-hidden="true" />
        <p className={styles.eyebrow}>Acompte reçu</p>
        <h1>Merci, ta réservation est enregistrée</h1>
        <p className={styles.statusLine}>{confirmation?.status}</p>
        <p>La date du rendez-vous et l&apos;adresse exacte du shop privé à Villiers-sur-Morin te seront communiquées ensuite directement.</p>
        <div className={styles.receipt}>
          <h2>Ton récapitulatif</h2>
          <ul>
            {confirmation?.booking.selection.map((item) => <li key={item.id}>{item.reference} — {item.title}</li>)}
          </ul>
          <dl>
            <div><dt>Total</dt><dd>{formatSeptemberMoney(confirmation?.booking.pricing.total ?? 0)}</dd></div>
            <div><dt>Acompte payé</dt><dd>{formatSeptemberMoney(confirmation?.booking.pricing.deposit ?? 0)}</dd></div>
            <div><dt>Reste à payer</dt><dd>{formatSeptemberMoney(confirmation?.booking.pricing.remaining ?? 0)}</dd></div>
          </dl>
        </div>
        {confirmation?.emailSent ? <p className={styles.emailSuccess}><Mail size={17} aria-hidden="true" /> Un email récapitulatif vient de t&apos;être envoyé.</p> : <p className={styles.emailWarning}>Ton acompte est bien enregistré, mais l&apos;email est encore en cours d&apos;envoi. Recharge cette page dans un instant si besoin.</p>}
        <p className={styles.safePayment}><ShieldCheck size={17} aria-hidden="true" /> Paiement vérifié par {paymentLabel}.</p>
        <Link href="/flash-septembre" className={`btn btn-secondary ${styles.secondary}`}>Retour à Flash Septembre</Link>
      </section>
    </main>
  );
}
