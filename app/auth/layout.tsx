import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentifizierung | Elephant Bookings",
  description: "Anmelden oder Registrieren bei Elephant Bookings",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
