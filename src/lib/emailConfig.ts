const studioDomain = "bgrumpytattoo.fr";
const fallbackFromEmail = `B.Grumpy Tattoo <contact@${studioDomain}>`;

const hasStudioDomain = (value: string) => {
  const address = value.match(/<([^>]+)>/)?.[1] ?? value;

  return address.trim().toLowerCase().endsWith(`@${studioDomain}`);
};

export const getStudioFromEmail = () => {
  const configuredFromEmail = process.env.DEVIS_MAIL_FROM?.trim();

  return configuredFromEmail && hasStudioDomain(configuredFromEmail)
    ? configuredFromEmail
    : fallbackFromEmail;
};
