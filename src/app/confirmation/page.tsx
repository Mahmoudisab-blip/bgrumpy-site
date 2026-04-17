import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demande envoyée",
  description:
    "Confirmation d’envoi de demande B.Grumpy Tattoo. Le projet sera étudié avant réponse.",
};

export default function ConfirmationPage() {
  return (
    <section className="section-space">
      <div className="container-wide max-w-4xl">
        <div className="panel p-8 text-center sm:p-12">
          <p className="eyebrow">Demande envoyée</p>
          <h1 className="mt-5 font-serif text-5xl font-bold leading-none text-[color:var(--ink)] sm:text-6xl">
            Votre projet est bien transmis.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
            Merci pour votre demande. Le studio va étudier les informations envoyées, vérifier la cohérence du projet ou du flash, puis revenir vers vous avec une réponse claire après analyse.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
            <div className="subtle-panel p-5">
              <p className="font-black text-[color:var(--ink)]">1. Analyse</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Les détails du projet sont relus.
              </p>
            </div>
            <div className="subtle-panel p-5">
              <p className="font-black text-[color:var(--ink)]">2. Réponse</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Un retour vous sera envoyé par mail ou téléphone.
              </p>
            </div>
            <div className="subtle-panel p-5">
              <p className="font-black text-[color:var(--ink)]">3. Spams</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Pensez à vérifier vos courriers indésirables.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              Retour à l’accueil
            </Link>
            <Link href="/portfolio" className="btn btn-secondary">
              Revoir le portfolio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
