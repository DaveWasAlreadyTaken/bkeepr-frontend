import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 py-6">
      <div className="container mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-sm text-muted-foreground">
        <Link href="/impressum" className="hover:text-foreground">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:text-foreground">
          Datenschutzerklärung
        </Link>
        <Link href="/nutzungsbedingungen" className="hover:text-foreground">
          Nutzungsbedingungen
        </Link>
      </div>
    </footer>
  );
}
