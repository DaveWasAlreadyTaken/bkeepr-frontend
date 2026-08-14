import type { Metadata } from "next";
import { BRANDING } from "@/app/config/branding";

export const metadata: Metadata = {
  title: `Impressum – ${BRANDING.appName}`,
};

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Impressum</h1>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Angaben gemäß § 5 TMG
      </h2>
      <p className="text-muted-foreground">
        Elephant Webdesign &amp; Marketing GmbH
        <br />
        (&bdquo;Elephant Webdesign &amp; Marketing&ldquo;)
        <br />
        Schloßlände 26
        <br />
        85049 Ingolstadt
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Geschäftsführung</h2>
      <p className="text-muted-foreground">
        Jonah Runge, David Zimmert, Marius Heilmeier
      </p>

      <p className="mt-4 text-muted-foreground">
        Gericht: Amtsgericht Ingolstadt
        <br />
        Registernummer: HRB 11772
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Kontakt</h2>
      <p className="text-muted-foreground">
        Telefon: +49 176 56849000
        <br />
        E-Mail: info@elephant-agency.de
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Umsatzsteuer-ID</h2>
      <p className="text-muted-foreground">
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        <br />
        DE368353859
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Redaktionell Verantwortlicher
      </h2>
      <p className="text-muted-foreground">
        Jonah Runge, David Zimmert, Marius Heilmeier
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">EU-Streitschlichtung</h2>
      <p className="text-muted-foreground">
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-strong underline underline-offset-4"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        .
        <br />
        Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Verbraucherstreitbeilegung/Universalschlichtungsstelle
      </h2>
      <p className="text-muted-foreground">
        Wir sind nicht bereit oder verpflichtet, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Haftung für Inhalte
      </h2>
      <p className="text-muted-foreground">
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
        Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
        verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
        jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
        Informationen zu überwachen oder nach Umständen zu forschen, die
        auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      <p className="mt-4 text-muted-foreground">
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon
        unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
        Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
        Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden
        wir diese Inhalte umgehend entfernen.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Haftung für Links</h2>
      <p className="text-muted-foreground">
        Unser Angebot enthält Links zu externen Websites Dritter, auf
        deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
        diese fremden Inhalte auch keine Gewähr übernehmen. Für die
        Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
        oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
        wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
        überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
        Verlinkung nicht erkennbar.
      </p>
      <p className="mt-4 text-muted-foreground">
        Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
        jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
        zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
        derartige Links umgehend entfernen.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Urheberrecht</h2>
      <p className="text-muted-foreground">
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
        diesen Seiten unterliegen dem deutschen Urheberrecht. Die
        Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
        Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
        schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        Downloads und Kopien dieser Seite sind nur für den privaten,
        nicht kommerziellen Gebrauch gestattet.
      </p>
      <p className="mt-4 text-muted-foreground">
        Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
        wurden, werden die Urheberrechte Dritter beachtet. Insbesondere
        werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie
        trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
        bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
        Rechtsverletzungen werden wir derartige Inhalte umgehend
        entfernen.
      </p>
    </div>
  );
}
