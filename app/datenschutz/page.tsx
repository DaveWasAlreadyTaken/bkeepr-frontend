import type { Metadata } from "next";
import { BRANDING } from "@/app/config/branding";

export const metadata: Metadata = {
  title: `Datenschutzerklärung – ${BRANDING.appName}`,
};

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

      <h2 className="mt-8 mb-2 text-lg font-semibold">1. Verantwortlicher</h2>
      <p className="text-muted-foreground">
        Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO)
        ist:
      </p>
      <p className="mt-2 text-muted-foreground">
        Elephant Webdesign &amp; Marketing GmbH
        <br />
        Schloßlände 26
        <br />
        85049 Ingolstadt
        <br />
        Telefon: +49 176 56849000
        <br />
        E-Mail: info@elephant-agency.de
      </p>
      <p className="mt-4 text-muted-foreground">
        Kontaktdaten des Verantwortlichen sowie weitere Angaben finden Sie
        im{" "}
        <a
          href="/impressum"
          className="text-primary-strong underline underline-offset-4"
        >
          Impressum
        </a>
        .
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        2. Übersicht der Verarbeitungen
      </h2>
      <p className="text-muted-foreground">
        {BRANDING.appName} ({BRANDING.description}) ist eine Webanwendung,
        über die Sie sich mit einem Nutzerkonto anmelden und Ihre
        Arbeitsbereiche (Workspaces), Geräte und die dazugehörigen
        Auswertungen verwalten. Im Rahmen der Nutzung verarbeiten wir
        personenbezogene Daten, die für den Betrieb dieses Dienstes
        erforderlich sind. Details dazu finden Sie in den folgenden
        Abschnitten.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        3. Bereitstellung der Webseite und Erstellung von Logfiles
      </h2>
      <p className="text-muted-foreground">
        Bei jedem Aufruf unserer Webseite erfasst unser System
        automatisiert Daten und Informationen vom Computersystem des
        aufrufenden Rechners (z. B. IP-Adresse, Datum und Uhrzeit des
        Zugriffs, aufgerufene Seite, verwendeter Browser). Diese Daten
        werden temporär in einem Logfile gespeichert. Die Verarbeitung
        erfolgt zur Gewährleistung eines störungsfreien Betriebs sowie zur
        Auswertung der Systemsicherheit und -stabilität und beruht auf
        unserem berechtigten Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        4. Registrierung und Nutzerkonto
      </h2>
      <p className="text-muted-foreground">
        Zur Nutzung von {BRANDING.appName} ist die Erstellung eines
        Nutzerkontos erforderlich. Dabei erheben und verarbeiten wir
        insbesondere:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
        <li>Vor- und Nachname</li>
        <li>E-Mail-Adresse</li>
        <li>Passwort (verschlüsselt gespeichert)</li>
        <li>
          Zugehörigkeit zu Arbeitsbereichen (Workspaces) und die dort
          zugewiesene Rolle
        </li>
        <li>optional: Profilbild</li>
      </ul>
      <p className="mt-4 text-muted-foreground">
        Diese Daten werden benötigt, um Ihnen den Zugang zur Anwendung und
        die Nutzung ihrer Funktionen zu ermöglichen. Rechtsgrundlage ist
        die Erfüllung des Nutzungsvertrags mit Ihnen bzw. die Durchführung
        vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        5. Anmeldung mit Google (OAuth)
      </h2>
      <p className="text-muted-foreground">
        Alternativ zur Registrierung mit E-Mail-Adresse und Passwort
        können Sie sich über Ihr Google-Konto anmelden. Dabei werden Sie
        auf die Anmeldeseite von Google (Google Ireland Limited, Gordon
        House, Barrow Street, Dublin 4, Irland) weitergeleitet. Nach
        erfolgreicher Anmeldung übermittelt Google die für die
        Kontoerstellung notwendigen Daten (z. B. Name, E-Mail-Adresse,
        ggf. Profilbild) an uns. Es gelten zusätzlich die
        Datenschutzbestimmungen von Google. Die Verarbeitung erfolgt auf
        Grundlage Ihrer Einwilligung durch aktive Auswahl dieser
        Anmeldeoption (Art. 6 Abs. 1 lit. a DSGVO) sowie zur
        Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        6. Cookies und lokaler Speicher
      </h2>
      <p className="text-muted-foreground">
        Wir verwenden Cookies sowie den lokalen Speicher (Local Storage)
        Ihres Browsers, soweit dies für den Betrieb der Anwendung
        technisch notwendig ist:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
        <li>
          ein Sitzungs-Cookie zur Authentifizierung Ihres Anmeldestatus,
        </li>
        <li>
          ein Cookie zur Speicherung des Zustands der Seitenleiste
          (ein-/ausgeklappt),
        </li>
        <li>
          ein Eintrag im lokalen Speicher zur Speicherung Ihres
          Zugriffstokens, damit Sie nach dem Schließen des Browsers
          angemeldet bleiben.
        </li>
      </ul>
      <p className="mt-4 text-muted-foreground">
        Diese Technologien sind für den Betrieb der Anwendung zwingend
        erforderlich. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
        (Vertragserfüllung) bzw. § 25 Abs. 2 Nr. 2 TTDSG. Wir setzen
        derzeit keine Cookies oder Skripte zu Analyse-, Marketing- oder
        Tracking-Zwecken ein.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        7. Weitergabe von Daten
      </h2>
      <p className="text-muted-foreground">
        Eine Übermittlung Ihrer persönlichen Daten an Dritte findet nur
        statt, soweit dies zur Vertragsdurchführung erforderlich ist (z. B.
        an Hosting- und Auftragsverarbeiter), gesetzlich vorgeschrieben
        ist, oder Sie ausdrücklich eingewilligt haben. Mit
        Dienstleistern, die in unserem Auftrag personenbezogene Daten
        verarbeiten, schließen wir Verträge zur Auftragsverarbeitung
        gemäß Art. 28 DSGVO ab.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        8. Speicherdauer
      </h2>
      <p className="text-muted-foreground">
        Wir speichern personenbezogene Daten nur so lange, wie dies für
        die genannten Zwecke erforderlich ist oder gesetzliche
        Aufbewahrungsfristen dies vorschreiben. Nach Löschung Ihres
        Nutzerkontos werden Ihre Daten gelöscht, sofern keine gesetzliche
        Aufbewahrungspflicht entgegensteht.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        9. Ihre Rechte
      </h2>
      <p className="text-muted-foreground">
        Ihnen stehen gegenüber uns folgende Rechte hinsichtlich der Sie
        betreffenden personenbezogenen Daten zu:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung (Art. 17 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>
          Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für
          die Zukunft (Art. 7 Abs. 3 DSGVO)
        </li>
      </ul>
      <p className="mt-4 text-muted-foreground">
        Zudem steht Ihnen ein Beschwerderecht bei einer
        Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO). Bitte wenden Sie
        sich bei Fragen oder zur Ausübung Ihrer Rechte an die oben unter
        Ziffer 1 genannten Kontaktdaten.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        10. Änderung dieser Datenschutzerklärung
      </h2>
      <p className="text-muted-foreground">
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen,
        damit sie stets den aktuellen rechtlichen Anforderungen entspricht
        oder um Änderungen unserer Leistungen umzusetzen. Für Ihren
        erneuten Besuch gilt dann die neue Datenschutzerklärung.
      </p>
    </div>
  );
}
