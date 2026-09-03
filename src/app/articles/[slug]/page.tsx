import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getTattooArticle,
  tattooArticles,
  type TattooArticle,
} from "@/src/data/tattooArticles";
import styles from "./TattooArticlePage.module.css";

type TattooArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const articleHeroImages: Record<string, string> = {
  "bien-choisir-son-motif": "/Tatouages/B8075592-1B93-4D05-954E-AF1D58324E72.png",
  "preparer-sa-seance": "/Tatouages/6E10098A-CEC2-4795-8031-42C3C06943A7.png",
  "apres-le-tatouage": "/Tatouages/99769AAC-29F9-4F0A-ABFA-EB8FC3DEA45D.png",
  "placement-et-douleur": "/Tatouages/7C5E4242-C1BA-411F-A08F-3396BE24FA4C.png",
  "flash-ou-projet-unique": "/Tatouages/E6CFE19D-0777-4574-AFB5-3429685A985E.png",
  "combien-de-temps-prevoir": "/Tatouages/373AE924-547D-4770-927F-456503C575CF.png",
  "comment-est-fixe-le-prix": "/Tatouages/09377FE9-EFE1-4559-BD33-4DDCFBA18826.png",
};

export function generateStaticParams() {
  return tattooArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: TattooArticlePageProps) {
  const { slug } = await params;
  const article = getTattooArticle(slug);

  if (!article) {
    return {
      title: "Article introuvable | B.Grumpy Tattoo",
    };
  }

  return {
    title: `${article.title} | B.Grumpy Tattoo`,
    description: article.summary,
  };
}

export default async function TattooArticlePage({ params }: TattooArticlePageProps) {
  const { slug } = await params;
  const article = getTattooArticle(slug);

  if (!article) {
    notFound();
  }

  return <ArticleView article={article} />;
}

function ArticleView({ article }: { article: TattooArticle }) {
  return (
    <main className={styles.page} data-editorial-page>
      <article className={styles.shell} data-page-shell>
        <Link href="/#tattoo-articles" className={styles.backLink} data-page-back>
          <ArrowLeft className={styles.backIcon} strokeWidth={1.8} />
          Articles
        </Link>

        <header className={styles.header} data-page-hero>
          <img
            src={articleHeroImages[article.slug]}
            alt=""
            aria-hidden="true"
            data-page-hero-image
          />
          <div data-page-hero-overlay aria-hidden="true" />
          <div data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p className={styles.category} data-page-brand-sub>{article.category}</p>
            </div>

            <div data-page-hero-copy>
              <h1 className={styles.title} data-page-title>{article.title}</h1>
              <p className={styles.summary} data-page-intro>{article.summary}</p>
            </div>

            <div data-page-hero-badges aria-label="Auteur">
              <span>Par Bryan</span>
            </div>
          </div>
        </header>

        <div className={styles.content} data-page-content="article">
          <p className={styles.intro}>{article.intro}</p>

          {article.sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          <p className={styles.closing}>{article.closing}</p>
        </div>
      </article>
    </main>
  );
}
