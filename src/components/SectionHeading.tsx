type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black leading-tight text-[color:var(--ink)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-[color:var(--muted)]">{description}</p>
    </div>
  );
}
