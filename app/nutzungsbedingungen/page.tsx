import type { Metadata } from "next";
import { BRANDING } from "@/app/config/branding";

export const metadata: Metadata = {
  title: `Nutzungsbedingungen – ${BRANDING.appName}`,
};

export default function NutzungsbedingungenPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Nutzungsbedingungen</h1>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        1. Geltungsbereich
      </h2>
      <p className="text-muted-foreground">
        Diese Nutzungsbedingungen gelten für die Nutzung der Webanwendung{" "}
        {BRANDING.appName} ({BRANDING.description}), bereitgestellt von der
        Elephant Webdesign &amp; Marketing GmbH, Schloßlände 26, 85049
        Ingolstadt (nachfolgend &bdquo;wir&ldquo; oder
        &bdquo;Anbieter&ldquo;). Mit der Registrierung eines Nutzerkontos
        oder der sonstigen Nutzung von {BRANDING.appName} erkennen Sie
        diese Nutzungsbedingungen an.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        2. Leistungsbeschreibung
      </h2>
      <p className="text-muted-foreground">
        {BRANDING.appName} ist eine Webanwendung zur Verwaltung von
        Arbeitsbereichen (Workspaces) und angebundenen Geräten sowie zur
        Darstellung der daraus abgeleiteten Auswertungen und
        Benachrichtigungen (Alerts). {BRANDING.appName} befindet sich in
        aktiver Entwicklung; einzelne Funktionen können sich ändern,
        eingeschränkt sein oder entfallen. Es besteht kein Anspruch auf
        Verfügbarkeit bestimmter Funktionen zu einem bestimmten Zeitpunkt.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        3. Registrierung und Nutzerkonto
      </h2>
      <p className="text-muted-foreground">
        Die Nutzung von {BRANDING.appName} setzt die Registrierung eines
        Nutzerkontos voraus. Sie sind verpflichtet, bei der Registrierung
        wahrheitsgemäße Angaben zu machen und Ihre Zugangsdaten geheim zu
        halten. Für Aktivitäten, die unter Verwendung Ihrer Zugangsdaten
        vorgenommen werden, sind Sie verantwortlich, soweit Sie den
        Missbrauch zu vertreten haben. Verdacht auf unbefugte Nutzung
        Ihres Kontos ist uns unverzüglich mitzuteilen.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        4. Pflichten der Nutzer
      </h2>
      <p className="text-muted-foreground">
        Sie verpflichten sich, {BRANDING.appName} nicht missbräuchlich zu
        nutzen. Insbesondere ist untersagt:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
        <li>
          der Versuch, sich unbefugten Zugriff auf Konten, Workspaces oder
          Systeme Dritter zu verschaffen,
        </li>
        <li>
          Handlungen, die den Betrieb von {BRANDING.appName} stören oder
          gefährden können (z. B. übermäßige automatisierte Zugriffe),
        </li>
        <li>
          das Hochladen oder Einstellen rechtswidriger Inhalte oder
          Inhalte, an denen keine ausreichenden Rechte bestehen.
        </li>
      </ul>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        5. Verfügbarkeit und Änderungen
      </h2>
      <p className="text-muted-foreground">
        Wir sind bestrebt, {BRANDING.appName} mit einer angemessenen
        Verfügbarkeit zu betreiben, garantieren jedoch keine
        unterbrechungsfreie Erreichbarkeit. Wartungsarbeiten, technische
        Störungen oder Weiterentwicklungen können zu vorübergehenden
        Einschränkungen führen. Wir behalten uns vor, Funktionen von{" "}
        {BRANDING.appName} zu ändern, zu erweitern oder einzustellen,
        soweit dies unter Berücksichtigung Ihrer berechtigten Interessen
        zumutbar ist.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        6. Geistiges Eigentum
      </h2>
      <p className="text-muted-foreground">
        Die Inhalte, die Software und das Design von {BRANDING.appName}{" "}
        sind urheberrechtlich geschützt. Eine Vervielfältigung,
        Bearbeitung oder Verbreitung außerhalb der Nutzung im Rahmen des
        bestimmungsgemäßen Betriebs von {BRANDING.appName} bedarf unserer
        vorherigen schriftlichen Zustimmung. An den von Ihnen im Rahmen
        der Nutzung eingestellten Daten und Inhalten verbleiben Ihre
        Rechte unberührt; Sie räumen uns die zur Erbringung des Dienstes
        erforderlichen Nutzungsrechte ein.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        7. Haftung
      </h2>
      <p className="text-muted-foreground">
        Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie
        nach Maßgabe des Produkthaftungsgesetzes. Für leichte Fahrlässigkeit
        haften wir nur bei der Verletzung wesentlicher Vertragspflichten
        (Kardinalpflichten), deren Erfüllung die ordnungsgemäße
        Durchführung der Nutzung überhaupt erst ermöglicht und auf deren
        Einhaltung Sie regelmäßig vertrauen dürfen; in diesem Fall ist die
        Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
        Die Haftung für Schäden aus der Verletzung des Lebens, des
        Körpers oder der Gesundheit bleibt hiervon unberührt.
      </p>
      <p className="mt-4 text-muted-foreground">
        Insbesondere übernehmen wir keine Gewähr für die Richtigkeit,
        Vollständigkeit oder Aktualität der aus angebundenen Geräten
        abgeleiteten Auswertungen und Alerts. Diese dienen der
        Information und ersetzen keine eigene fachliche Einschätzung.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        8. Laufzeit und Kündigung
      </h2>
      <p className="text-muted-foreground">
        Sie können Ihr Nutzerkonto jederzeit ohne Angabe von Gründen
        löschen. Wir können Nutzerkonten bei einem Verstoß gegen diese
        Nutzungsbedingungen oder geltendes Recht sperren oder löschen. Im
        Übrigen können wir die Bereitstellung von {BRANDING.appName} mit
        angemessener Frist einstellen.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        9. Datenschutz
      </h2>
      <p className="text-muted-foreground">
        Informationen zur Verarbeitung personenbezogener Daten finden Sie
        in unserer{" "}
        <a
          href="/datenschutz"
          className="text-primary-strong underline underline-offset-4"
        >
          Datenschutzerklärung
        </a>
        .
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        10. Änderung dieser Nutzungsbedingungen
      </h2>
      <p className="text-muted-foreground">
        Wir können diese Nutzungsbedingungen mit Wirkung für die Zukunft
        anpassen, soweit dies aufgrund einer Weiterentwicklung von{" "}
        {BRANDING.appName}, geänderter rechtlicher Rahmenbedingungen oder
        aus vergleichbaren Gründen erforderlich ist. Über wesentliche
        Änderungen informieren wir Sie in geeigneter Form.
      </p>

      <h2 className="mt-8 mb-2 text-lg font-semibold">
        11. Schlussbestimmungen
      </h2>
      <p className="text-muted-foreground">
        Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand
        für alle Streitigkeiten aus oder im Zusammenhang mit der Nutzung
        von {BRANDING.appName} ist, soweit gesetzlich zulässig, Ingolstadt.
        Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam
        sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
      </p>
    </div>
  );
}
