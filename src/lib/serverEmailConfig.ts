const defaultStudioEmail = "info@bgrumpy-tattoo.fr";
const studioDomain = "bgrumpy-tattoo.fr";

const extractAddress = (value: string) => value.match(/<([^>]+)>/)?.[1]?.trim() || value.trim();

const isStudioDomainAddress = (value: string) =>
  extractAddress(value).toLowerCase().endsWith(`@${studioDomain}`);

const configuredStudioEmail = process.env.STUDIO_NOTIFICATION_EMAIL?.trim() || "";
const configuredReplyToEmail = process.env.STUDIO_REPLY_TO_EMAIL?.trim() || "";
const configuredFromEmail = process.env.DEVIS_MAIL_FROM?.trim() || "";

export const studioEmail = isStudioDomainAddress(configuredStudioEmail)
  ? extractAddress(configuredStudioEmail)
  : defaultStudioEmail;

export const studioReplyToEmail = isStudioDomainAddress(configuredReplyToEmail)
  ? extractAddress(configuredReplyToEmail)
  : studioEmail;

export const fromEmail = isStudioDomainAddress(configuredFromEmail)
  ? configuredFromEmail
  : `B.Grumpy Tattoo <${studioEmail}>`;

export const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
