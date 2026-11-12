import { invitation, type Parent, type Person } from "@/config/invitation";

export const fullName = (p: Person) => `${p.lastName}${p.firstName}`;

export const parentName = (p: Parent) => (p.deceased ? `故 ${p.name}` : p.name);

export const groomName = fullName(invitation.groom);
export const brideName = fullName(invitation.bride);

export function absoluteUrl(path: string) {
  return new URL(path, invitation.meta.siteUrl).toString();
}
