import Link from "next/link";
import {
  ArrowUpRight,
  CircleHelp,
  CreditCard,
  FileText,
  House,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { studioInfo } from "@/src/data/site";
import styles from "./Footer.module.css";

const footerGroups = [
  {
    title: "Aide & contact",
    icon: CircleHelp,
    links: [
      { href: "/faq", label: "Questions fréquentes" },
      { href: "/contact", label: "Nous contacter" },
      { href: "/messagerie", label: "Ouvrir la messagerie" },
      { href: "/devis", label: "Envoyer mon projet" },
    ],
  },
  {
    title: "Réservations",
    icon: FileText,
    links: [
      { href: "/flash", label: "Flashs disponibles" },
      { href: "/devis", label: "Demander un devis" },
      { href: "/cgv/flash-septembre", label: "CGV Flash Septembre" },
    ],
  },
  {
    title: "Paiements",
    icon: CreditCard,
    copy: "Les acomptes sont réglés sur la page sécurisée du prestataire choisi.",
    chips: ["PayPal", "Carte via SumUp"],
  },
  {
    title: "Le shop",
    icon: House,
    copy: "Shop privé en maison à Villiers-sur-Morin (77580). L’adresse exacte est communiquée après la prise de rendez-vous.",
  },
  {
    title: "Vie privée",
    icon: ShieldCheck,
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/politique-confidentialite", label: "Politique de confidentialité" },
      { href: "/cookies", label: "Cookies et statistiques" },
    ],
  },
  {
    title: "Nous suivre",
    icon: MessageCircle,
    copy: "Pour accélérer la prise de rendez-vous, envoie-nous un message privé sur Instagram après ton paiement avec ton nom et ton prénom.",
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.board}>
          <div className={styles.boardHeader}>
            <div>
              <p className={styles.kicker}><Sparkles size={14} aria-hidden="true" /> B.Grumpy Tattoo</p>
              <h2>Infos &amp; assistance</h2>
              <p className={styles.headerCopy}>Tout ce qu’il faut savoir avant de nous écrire, réserver ou régler un acompte.</p>
            </div>
            <Link href="/devis" className={styles.headerCta}>
              Envoyer mon projet <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.grid}>
            {footerGroups.map((group) => {
              const Icon = group.icon;
              return (
                <section key={group.title} className={styles.group} aria-labelledby={`footer-${group.title}`}>
                  <h3 id={`footer-${group.title}`}><Icon size={21} strokeWidth={1.7} aria-hidden="true" /> {group.title}</h3>
                  {group.copy && <p className={styles.copy}>{group.copy}</p>}
                  {group.chips && <div className={styles.chips}>{group.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>}
                  {group.links && <nav className={styles.links} aria-label={group.title}>{group.links.map((link) => <Link key={link.href + link.label} href={link.href}>{link.label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</nav>}
                </section>
              );
            })}
          </div>

          <div className={styles.contactLine}>
            <div>
              <strong>{studioInfo.location}</strong>
              <span>{studioInfo.email}</span>
              <span>{studioInfo.phone}</span>
            </div>
            <p>Les données bancaires restent chez le prestataire de paiement et ne sont jamais stockées sur le site.</p>
          </div>
        </div>

        <div className={styles.legalBar}>
          <span>© 2026 {studioInfo.name}. Tous droits réservés.</span>
          <span>Shop privé en maison · Villiers-sur-Morin</span>
        </div>
      </div>
    </footer>
  );
}
