import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRANDING } from "@/app/config/branding";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto flex max-w-2xl flex-1 flex-col gap-6 py-12">
        <h1 className="text-3xl font-bold">Willkommen bei {BRANDING.appName}</h1>
        <p className="text-muted-foreground">{BRANDING.description}</p>
        <p className="text-sm text-muted-foreground">
          Die Geräte- und Alert-Oberfläche kommt, sobald der Pi-Agent (AP-8) läuft.
          Bis dahin: Auth und Workspace-Verwaltung aus dem Boilerplate.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/login">
            <Button>Anmelden</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline">Registrieren</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
