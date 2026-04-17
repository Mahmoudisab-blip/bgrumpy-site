type FeatureCardProps = {
  kicker?: string;
  title: string;
  description: string;
};

export default function FeatureCard({ kicker, title, description }: FeatureCardProps) {
  return (
    <article className="panel p-6">
      {kicker ? <p className="eyebrow">{kicker}</p> : null}
      <h3 className="mt-3 text-xl font-black leading-snug text-[color:var(--ink)]">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{description}</p>
    </article>
  );
}
