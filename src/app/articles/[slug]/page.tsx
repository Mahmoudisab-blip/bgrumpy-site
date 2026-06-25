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
    <main className={styles.page}>
      <article className={styles.shell}>
        <Link href="/#tattoo-articles" className={styles.backLink}>
          <ArrowLeft className={styles.backIcon} strokeWidth={1.8} />
          Articles
        </Link>

        <header className={styles.header} data-page-hero>
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

        <div className={styles.content}>
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
