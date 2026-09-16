import { FLASH_SEPTEMBER_STATUS, FLASH_SEPTEMBER_TERMS_VERSION, formatSeptemberMoney } from "./flashSeptember";
import type { FlashSeptemberBooking } from "./serverFlashSeptemberBookings";

const studioEmail = process.env.STUDIO_NOTIFICATION_EMAIL || "b.grumpytattoo@gmail.com";
const bookingTimingText = "Le shop confirme ou propose une date de rendez-vous dans les 24 à 48 heures suivant le paiement. L’adresse exacte du shop privé à Villiers-sur-Morin est communiquée ensuite.";
const depositPolicyText = "L’acompte est non remboursable en cas d’annulation définitive de la part du client. En cas de report avec une nouvelle date convenue, il est conservé et déduit du rendez-vous reporté.";
const customValidationText = "Si un flash personnalisé n’est pas validé, le client peut proposer un autre projet ou demander le remboursement de l’acompte correspondant.";
const customerDepositPolicyText = "L’acompte est non remboursable en cas d’annulation définitive de ta part. En cas de report avec une nouvelle date convenue, il est conservé et déduit du rendez-vous reporté.";
const customerCustomValidationText = "Si ton flash personnalisé n’est pas validé, tu peux proposer un autre projet ou demander le remboursement de l’acompte correspondant.";
const instagramTimingText = "Après le paiement, le client peut envoyer un message privé sur Instagram avec son nom et son prénom pour accélérer la prise de rendez-vous et valider ensemble une date.";
const customerInstagramTimingText = "Après ton paiement, envoie-nous un message privé sur Instagram avec ton nom et ton prénom pour accélérer la prise de rendez-vous et valider ensemble une date.";

const paymentProviderLabel = (provider: FlashSeptemberBooking["paymentProvider"]) =>
  provider === "sumup_card"
    ? "Carte bancaire via SumUp"
    : provider === "paypal_card"
      ? "Carte bancaire via PayPal"
      : "PayPal";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const absoluteUrl = (value: string, origin: string) => {
  try {
    return new URL(value, origin).toString();
  } catch {
    return value;
  }
};

const formatPaymentDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(new Date(value))
    : "Paiement confirmé";

const flashTextLines = (booking: FlashSeptemberBooking) =>
  booking.pricing.lines.map((line) =>
    `• ${line.reference} — ${line.title} : ${formatSeptemberMoney(line.price)}`,
  );

const flashHtml = (booking: FlashSeptemberBooking) =>
  booking.pricing.lines
    .map((line) => {
      const imageUrl = line.image?.src ? absoluteUrl(line.image.src, booking.siteOrigin) : null;
      const image = imageUrl
        ? `<a href="${escapeHtml(imageUrl)}" style="display:inline-block;margin-top:8px;"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(line.image?.alt || line.title)}" width="160" style="display:block;max-width:160px;height:auto;border:1px solid #e8e2d8;border-radius:12px;background:#fff;" /></a>`
        : "";

      return `
        <li style="margin:0 0 16px;">
          <strong>${escapeHtml(line.reference)} — ${escapeHtml(line.title)}</strong><br />
          ${escapeHtml(formatSeptemberMoney(line.price))}
          ${image}
        </li>
      `;
    })
    .join("");

const emailShell = (title: string, body: string) => `
  <div style="margin:0;padding:24px;background:#f4f0e7;color:#24251d;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:680px;margin:0 auto;background:#fffdf8;border:1px solid #e8e2d8;border-radius:20px;overflow:hidden;">
      <div style="padding:24px;background:#3d4a26;color:#fffdf8;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#e4e4d3;">B.Grumpy Tattoo</p>
        <h1 style="margin:0;font-family:Georgia,serif;font-size:29px;line-height:1.15;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:24px;line-height:1.55;">${body}</div>
    </div>
  </div>
`;

const sendResendEmail = async ({
  to,
  replyTo,
  subject,
  text,
  html,
  attachments,
  idempotencyKey,
}: {
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{ filename: string; content: string; content_type?: string }>;
  idempotencyKey: string;
}) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: process.env.DEVIS_MAIL_FROM ?? "B.Grumpy Tattoo <onboarding@resend.dev>",
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
      html,
      ...(attachments?.length ? { attachments } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("L'email de confirmation n'a pas pu être envoyé.");
  }

  return true;
};

export const sendFlashSeptemberPaidEmails = async (booking: FlashSeptemberBooking) => {
  if (!process.env.RESEND_API_KEY) {
    return false;
  }

  const flashLines = flashTextLines(booking);
  const flashsHtml = flashHtml(booking);
  const customerName = `${booking.contact.firstName} ${booking.contact.lastName}`.trim();
  const paidAt = formatPaymentDate(booking.paidAt);
  const legalAcceptedAt = formatPaymentDate(booking.legalAcceptedAt);
  const ageDeclarationAt = formatPaymentDate(booking.ageDeclarationAt);
  const ageLabel = booking.ageStatus === "mineur" ? "Mineur(e)" : booking.ageStatus === "majeur" ? "Majeur(e)" : "Non renseigné";
  const providerLabel = paymentProviderLabel(booking.paymentProvider);
  const termsUrl = absoluteUrl("/cgv/flash-septembre", booking.siteOrigin);
  const emailAttachments = booking.attachments.map((attachment) => ({
    filename: attachment.filename,
    content: attachment.contentBase64,
    content_type: attachment.contentType,
  }));
  const referenceAttachmentText = booking.attachments.length
    ? `Photo de référence jointe : ${booking.attachments.map((attachment) => attachment.filename).join(", ")}`
    : "";
  const customIdea = booking.contact.customIdea?.trim();
  const hasCustomFlash = booking.pricing.lines.some((line) => line.custom);
  const groupRateText = booking.pricing.count >= 3
    ? "Tarif groupe : dès 3 flashs, tous les flashs sont à 60 € chacun."
    : "";
  const pricingText = [
    groupRateText,
    `Total : ${formatSeptemberMoney(booking.pricing.total)}`,
    `Acompte payé : ${formatSeptemberMoney(booking.pricing.deposit)}`,
    `Reste à payer au rendez-vous : ${formatSeptemberMoney(booking.pricing.remaining)}`,
  ].filter(Boolean);

  await Promise.all([
    sendResendEmail({
      to: [studioEmail],
      replyTo: booking.contact.email,
      subject: `Acompte payé — Flash Septembre — ${customerName}`,
      text: [
        "Réservation Flash Septembre 2026",
        "",
        `Statut : ${FLASH_SEPTEMBER_STATUS}`,
        `Client : ${customerName}`,
        `Email : ${booking.contact.email}`,
        `Téléphone : ${booking.contact.phone}`,
        `Âge déclaré : ${ageLabel}`,
        `Attestation sur l’honneur : acceptée le ${ageDeclarationAt}`,
        booking.ageStatus === "mineur" ? "Autorisation écrite du représentant légal à récupérer avant la séance." : "",
        "",
        "Flashs réservés :",
        ...flashLines,
        customIdea ? `Idée de flash personnalisé : ${customIdea}` : "",
        "",
        ...pricingText,
        `${providerLabel} confirmé : ${paidAt}`,
        `Conditions acceptées le : ${legalAcceptedAt} — version ${booking.legalVersion ?? FLASH_SEPTEMBER_TERMS_VERSION}`,
        referenceAttachmentText,
        booking.contact.notes ? `Remarques : ${booking.contact.notes}` : "",
        "",
        bookingTimingText,
        instagramTimingText,
        `Conditions de réservation : ${termsUrl}`,
        depositPolicyText,
        hasCustomFlash ? customValidationText : "",
      ].filter(Boolean).join("\n"),
      html: emailShell(
        "Acompte payé — date à confirmer",
        `
          <p style="margin-top:0;"><strong>Client :</strong> ${escapeHtml(customerName)}<br />
          <strong>Email :</strong> ${escapeHtml(booking.contact.email)}<br />
          <strong>Téléphone :</strong> ${escapeHtml(booking.contact.phone)}<br />
          <strong>Âge déclaré :</strong> ${escapeHtml(ageLabel)}<br />
          <strong>Attestation sur l’honneur :</strong> acceptée le ${escapeHtml(ageDeclarationAt)}${booking.ageStatus === "mineur" ? "<br />Autorisation écrite du représentant légal à récupérer avant la séance." : ""}</p>
          <h2 style="font-family:Georgia,serif;font-size:23px;margin:24px 0 12px;">Flashs réservés</h2>
          <ul style="padding-left:20px;margin:0;">${flashsHtml}</ul>
          ${customIdea ? `<p><strong>Idée de flash personnalisé :</strong><br />${escapeHtml(customIdea).replaceAll("\n", "<br />")}</p>` : ""}
          <div style="margin:22px 0;padding:16px;border-radius:14px;background:#f3f0e8;">
            ${booking.pricing.count >= 3 ? `<p style="margin:0 0 5px;"><strong>Tarif groupe :</strong> dès 3 flashs, tous à 60 € chacun.</p>` : ""}
            <p style="margin:0 0 5px;"><strong>Total :</strong> ${escapeHtml(formatSeptemberMoney(booking.pricing.total))}</p>
            <p style="margin:0 0 5px;"><strong>Acompte payé :</strong> ${escapeHtml(formatSeptemberMoney(booking.pricing.deposit))}</p>
            <p style="margin:0;"><strong>Reste à payer :</strong> ${escapeHtml(formatSeptemberMoney(booking.pricing.remaining))}</p>
          </div>
          <p><strong>${escapeHtml(providerLabel)} confirmé :</strong> ${escapeHtml(paidAt)}</p>
          <p><strong>Conditions acceptées le :</strong> ${escapeHtml(legalAcceptedAt)}<br /><strong>Version :</strong> ${escapeHtml(booking.legalVersion ?? FLASH_SEPTEMBER_TERMS_VERSION)}</p>
          ${referenceAttachmentText ? `<p><strong>Photo de référence jointe :</strong> ${escapeHtml(referenceAttachmentText.replace("Photo de référence jointe : ", ""))}</p>` : ""}
          ${booking.contact.notes ? `<p><strong>Remarques :</strong><br />${escapeHtml(booking.contact.notes).replaceAll("\n", "<br />")}</p>` : ""}
          <p><strong>Statut :</strong> ${escapeHtml(FLASH_SEPTEMBER_STATUS)}. ${escapeHtml(bookingTimingText)}<br />${escapeHtml(instagramTimingText)}</p>
          <p style="margin-bottom:0;"><a href="${escapeHtml(termsUrl)}">Consulter les conditions de réservation</a><br />${escapeHtml(depositPolicyText)}${hasCustomFlash ? `<br />${escapeHtml(customValidationText)}` : ""}</p>
        `,
      ),
      attachments: emailAttachments,
      idempotencyKey: `flash-septembre-shop-${booking.id}`,
    }),
    sendResendEmail({
      to: [booking.contact.email],
      subject: "Confirmation de ton acompte — Flash Septembre 2026",
      text: [
        `Bonjour ${booking.contact.firstName},`,
        "",
        "Ton acompte a bien été reçu pour l'opération Flash Septembre 2026.",
        "",
        "Flashs réservés :",
        ...flashLines,
        customIdea ? `Ton idée de flash personnalisé : ${customIdea}` : "",
        "",
        ...pricingText,
        referenceAttachmentText,
        "",
        "Statut : Acompte payé — date à confirmer.",
        bookingTimingText,
        customerInstagramTimingText,
        `Déclaration d’âge enregistrée : ${ageLabel} — attestation acceptée le ${ageDeclarationAt}.`,
        booking.ageStatus === "mineur" ? "Une autorisation écrite du représentant légal doit être fournie avant la séance." : "",
        customerDepositPolicyText,
        hasCustomFlash ? customerCustomValidationText : "",
        `Conditions de réservation : ${termsUrl}`,
      ].join("\n"),
      html: emailShell(
        `Merci ${booking.contact.firstName}`,
        `
          <p style="margin-top:0;">Ton acompte a bien été reçu pour l'opération <strong>Flash Septembre 2026</strong>.</p>
          <p><strong>Déclaration d’âge enregistrée :</strong> ${escapeHtml(ageLabel)}<br />Attestation acceptée le : ${escapeHtml(ageDeclarationAt)}${booking.ageStatus === "mineur" ? "<br />Une autorisation écrite du représentant légal doit être fournie avant la séance." : ""}</p>
          <h2 style="font-family:Georgia,serif;font-size:23px;margin:24px 0 12px;">Tes flashs réservés</h2>
          <ul style="padding-left:20px;margin:0;">${flashsHtml}</ul>
          ${customIdea ? `<p><strong>Ton idée de flash personnalisé :</strong><br />${escapeHtml(customIdea).replaceAll("\n", "<br />")}</p>` : ""}
          <div style="margin:22px 0;padding:16px;border-radius:14px;background:#f3f0e8;">
            ${booking.pricing.count >= 3 ? `<p style="margin:0 0 5px;"><strong>Tarif groupe :</strong> dès 3 flashs, tous à 60 € chacun.</p>` : ""}
            <p style="margin:0 0 5px;"><strong>Total :</strong> ${escapeHtml(formatSeptemberMoney(booking.pricing.total))}</p>
            <p style="margin:0 0 5px;"><strong>Acompte payé :</strong> ${escapeHtml(formatSeptemberMoney(booking.pricing.deposit))}</p>
            <p style="margin:0;"><strong>Reste à payer au rendez-vous :</strong> ${escapeHtml(formatSeptemberMoney(booking.pricing.remaining))}</p>
          </div>
          ${referenceAttachmentText ? `<p><strong>Photo de référence jointe :</strong> ${escapeHtml(referenceAttachmentText.replace("Photo de référence jointe : ", ""))}</p>` : ""}
          <p><strong>${escapeHtml(FLASH_SEPTEMBER_STATUS)}.</strong><br />${escapeHtml(bookingTimingText)}<br />${escapeHtml(customerInstagramTimingText)}</p>
          <p style="margin-bottom:0;"><a href="${escapeHtml(termsUrl)}">Consulter les conditions de réservation</a><br />${escapeHtml(customerDepositPolicyText)}${hasCustomFlash ? `<br />${escapeHtml(customerCustomValidationText)}` : ""}</p>
        `,
      ),
      attachments: emailAttachments,
      idempotencyKey: `flash-septembre-client-${booking.id}`,
    }),
  ]);

  return true;
};
