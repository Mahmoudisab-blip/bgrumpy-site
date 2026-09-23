const fallbackFromEmail = "B.Grumpy Tattoo <contact@bgrumpytattoo.fr>";

export const getStudioFromEmail = () =>
  process.env.DEVIS_MAIL_FROM?.trim() || fallbackFromEmail;
