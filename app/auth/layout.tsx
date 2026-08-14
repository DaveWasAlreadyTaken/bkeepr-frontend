import type { Metadata } from "next";

import { BRANDING } from "@/app/config/branding";

export const metadata: Metadata = {
  title: `Authentifizierung | ${BRANDING.appName}`,
  description: `Anmelden oder Registrieren bei ${BRANDING.appName}`,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
