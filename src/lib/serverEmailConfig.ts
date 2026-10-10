const defaultStudioEmail = "info@bgrumpy-tattoo.fr";

export const studioEmail =
  process.env.STUDIO_NOTIFICATION_EMAIL?.trim() || defaultStudioEmail;

export const studioReplyToEmail =
  process.env.STUDIO_REPLY_TO_EMAIL?.trim() || studioEmail;

export const fromEmail =
  process.env.DEVIS_MAIL_FROM?.trim() || `B.Grumpy Tattoo <${studioEmail}>`;

export const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
