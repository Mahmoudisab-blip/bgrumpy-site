export const primaryAdminEmail = "b.grumpytattoo@gmail.com";

export const normalizeLoginIdentifier = (identifier: string) =>
  identifier.trim().toLowerCase().replace(/\.+$/, "");

export const isPrimaryAdminEmail = (identifier: string) =>
  normalizeLoginIdentifier(identifier) === primaryAdminEmail;
