import { cookies } from "next/headers";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";
import type { AdminQuoteStatus } from "@/src/lib/adminState";
import { readAdminState, writeAdminState } from "@/src/lib/serverAdminStore";
import { listServerDevis } from "@/src/lib/serverDevisStore";

export const runtime = "nodejs";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const clientStatusFromAdminStatus = (status?: AdminQuoteStatus) => {
  switch (status) {
    case "Répondu":
      return "Réponse envoyée" as const;
    case "Rendez-vous fixé":
      return "Réservé" as const;
    case "Refusé":
      return "Refusé" as const;
    case "Annulé":
      return "Annulé" as const;
    default:
      return "En attente" as const;
  }
};

export async function GET() {
  const cookieStore = await cookies();
  const session = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const email = normalizeEmail(session?.email ?? "");

  if (!email) {
    return Response.json({ devis: [] }, { status: 401 });
  }

  const state = await readAdminState();
  const devis = (await listServerDevis()).filter(
    (item) => normalizeEmail(item.payload.email ?? "") === email,
  );
  const devisIds = new Set(devis.map((item) => item.id));
  const reservations = state.reservations
    .filter((reservation) => {
      const quoteId = reservation.id.startsWith("quote-rdv-")
        ? reservation.id.replace("quote-rdv-", "")
        : "";

      return Boolean(quoteId && devisIds.has(quoteId));
    })
    .map((reservation) => ({
      ...reservation,
      adminStatus: state.appointmentStatusesById[reservation.id] ?? "À confirmer",
    }));
  const clientDevis = devis.map((item) => ({
    ...item,
    status: clientStatusFromAdminStatus(state.quoteStatusesById[item.id]),
  }));

  return Response.json({ devis: clientDevis, reservations });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const email = normalizeEmail(session?.email ?? "");
  const body = (await request.json().catch(() => null)) as { id?: string; status?: string } | null;

  if (!email) {
    return Response.json({ error: "Session client manquante." }, { status: 401 });
  }

  if (!body?.id || body.status !== "Annulé") {
    return Response.json({ error: "Demande de mise à jour invalide." }, { status: 400 });
  }

  const devis = (await listServerDevis()).find(
    (item) => item.id === body.id && normalizeEmail(item.payload.email ?? "") === email,
  );

  if (!devis) {
    return Response.json({ error: "Demande introuvable." }, { status: 404 });
  }

  const state = await readAdminState();
  const nextReservations = state.reservations.map((reservation) =>
    reservation.id === `quote-rdv-${body.id}`
      ? { ...reservation, status: "past" as const, adminStatus: "Annulé" as const }
      : reservation,
  );

  await writeAdminState({
    ...state,
    appointmentStatusesById: {
      ...state.appointmentStatusesById,
      [`quote-rdv-${body.id}`]: "Annulé",
    },
    quoteStatusesById: {
      ...state.quoteStatusesById,
      [body.id]: "Annulé" as AdminQuoteStatus,
    },
    reservations: nextReservations,
  });

  return Response.json({ ok: true });
}
