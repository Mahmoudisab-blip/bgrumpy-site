import Link from "next/link";
import { ClipboardList, Sparkles, Wand2 } from "lucide-react";
import DevisResumeCards from "@/src/components/DevisResumeCards";
import { processSteps } from "@/src/data/site";
import styles from "./HomePage.module.css";

const quickLinks = [
  {
    href: "/flash",
    title: "Flashs",
    text: "Pièces prêtes à adopter.",
    icon: Sparkles,
  },
  {
    href: "/simulateur",
    title: "Simulateur",
    text: "Cadrer une idée en douceur.",
    icon: Wand2,
  },
  {
    href: "/devis",
    title: "Devis",
    text: "Ouvrir une demande claire.",
    icon: ClipboardList,
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.brand}>B.Grumpy</p>
            <p className={styles.brandSub}>Tattoo</p>
          </div>

          <div className={styles.heroCenter}>
            <h1 className={styles.title}>Refined Tattoo Artistry</h1>
          </div>

          <div className={styles.heroFooter}>
            <p className={styles.caption}>
              Premium, nature inspired tattoos crafted with passion and precision
            </p>
          </div>
        </section>

        <section className={styles.quickGrid} aria-label="Accès rapides">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <article className={styles.quickCard} key={item.href}>
                <Link href={item.href} className={styles.quickLink}>
                  <Icon className={styles.quickIcon} strokeWidth={1.65} />
                  <div>
                    <h2 className={styles.quickTitle}>{item.title}</h2>
                    <p className={styles.quickText}>{item.text}</p>
                  </div>
                </Link>
              </article>
            );
          })}
        </section>

        <DevisResumeCards />

        <section className={styles.section}>
          <div className={styles.cardContent}>
            <p className={styles.kicker}>Méthode</p>
            <h2 className={styles.sectionTitle}>
              Un projet lisible, précis, sans bruit.
            </h2>
            <p className={styles.sectionText}>
              Chaque demande avance avec une intention claire: comprendre la
              zone, le format, les références et la place que la pièce doit
              prendre sur le corps.
            </p>
          </div>

          <div className={styles.steps}>
            {processSteps.map((step, index) => (
              <article className={styles.step} key={step.title}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
