Bouw een Next.js app waarmee ik samenwerkingsovereenkomsten kan genereren en exporteren als PDF. Dit is een verse `create-next-app` met TypeScript en Tailwind CSS 4.

## Architectuur

- Split-panel layout: formulier links (w-2/5), live A4 preview rechts (w-3/5)
- PDF export via `react-to-print` (`npm install react-to-print`) — gebruikt `useReactToPrint` met een `contentRef` die naar de template-div wijst
- State management: `useState<Overeenkomst>` in de page component, doorgegeven aan formulier (onChange) en template (read-only)
- Repository-patroon voor toekomstige opslag (abstracte interface + localStorage implementatie)
- Logo upload als base64 data URL via FileReader

## Datamodel

```typescript
interface Adres {
  straat: string;
  postcode: string;
  plaats: string;
}

interface Bedrijfsgegevens {
  bedrijfsnaam: string;
  contactpersoon?: string;
  adres: Adres;
  email?: string;
  telefoon?: string;
  kvkNummer?: string;
  btwNummer?: string;
  iban?: string;
}

interface Overeenkomst {
  adviseur: Bedrijfsgegevens;
  klantNaam: string;
  omschrijving: string;        // vrije tekst: beschrijving samenwerking/traject
  tarief: number;
  tariefInclBtw: boolean;
  vorm: string;                // "1-op-1 advies" | "traject" | "losse sessies"
  betaling: string;            // vrije tekst: bijv. "per maand"
  betalingstermijn: number;    // dagen
  plaats: string;
  datum: string;               // ISO date
  logo?: string;               // base64 data URL
}
```

## Formuliervelden

Secties in het formulier:
1. **Logo** — upload knop, preview + verwijder knop
2. **Adviseur (uw gegevens)** — bedrijfsnaam, contactpersoon, adres (straat, postcode, plaats), email, telefoon, KVK-nummer, BTW-nummer, IBAN
3. **Klant** — alleen klantnaam (tekstveld)
4. **Samenwerking** — omschrijving (textarea)
5. **Prijsafspraken** — tarief (number), incl/excl BTW (select), vorm (select: 1-op-1 advies/traject/losse sessies), betaling (tekstveld), betalingstermijn in dagen (number)
6. **Ondertekening** — plaats (tekst), datum (date input)

Standaardwaarden: datum = vandaag, betalingstermijn = 30, vorm = "1-op-1 advies", tariefInclBtw = false.

## Template (A4 preview)

Het template rendert een professionele overeenkomst met deze structuur:

### Header
- Optioneel logo (gecentreerd)
- Titel: "Prijs- en samenwerkingsafspraken"

### Partijen
- Adviseur: bedrijfsnaam + KvK-nummer
- Klant: klantnaam

### Omschrijving
- "Omschrijving van de samenwerking / het traject:" gevolgd door de ingevulde tekst

### Prijsafspraak
Bullet list:
- Tarief: € bedrag (incl./excl. btw)
- Vorm: gekozen vorm
- Betaling: ingevulde tekst
- Betalingstermijn: X dagen

### Beëindigen kan altijd — belangrijk
Dit is een apart gemarkeerd blok (border + lichte achtergrond) met deze EXACTE tekst:

> De Klant kan de samenwerking of het traject op ieder moment en per direct beëindigen, zonder opgave van reden en zonder verdere consequenties, mits alle facturen tot en met de datum van beëindiging zijn voldaan.
>
> Na beëindiging vervallen geplande sessies en ontstaan geen nieuwe betalingsverplichtingen. Deze bepaling heeft voorrang op alle andere artikelen in deze overeenkomst.

### Artikelen 1-11
Vaste (hardcoded) tekst. Gebruik `style={{ breakInside: "avoid" }}` op elke artikel-sectie. Hier zijn alle artikelen met hun EXACTE tekst:

**Artikel 1 — De samenwerking**
De Adviseur levert praktisch gericht business advies en begeleiding, met als doel bedrijven concreet te ondersteunen bij het verbeteren van organisatie, strategie, structuur, processen en besluitvorming. De dienstverlening is praktijkgericht en ondersteunend, zonder garantie op resultaten.

**Artikel 2 — Rol en inzet van de Adviseur**
De Adviseur zet zich zorgvuldig, deskundig en professioneel in en doet alles wat redelijkerwijs mogelijk is om passend en kwalitatief goed advies te geven. De dienstverlening betreft een inspanningsverplichting.

**Artikel 3 — Eigen verantwoordelijkheid van de Klant**
De Klant blijft te allen tijde zelf verantwoordelijk voor keuzes, acties en resultaten. Adviezen van de Adviseur zijn niet bindend en worden toegepast naar eigen inzicht.

**Artikel 4 — Eigen risico en aansprakelijkheid**
Deelname aan advies en het toepassen van inzichten gebeurt op eigen verantwoordelijkheid van de Klant. Aansprakelijkheid van de Adviseur is beperkt tot het bedrag van de laatst betaalde factuur, uitsluitend bij opzet of grove nalatigheid.

**Artikel 5 — Geheimhouding**
Partijen verplichten zich tot geheimhouding van alle vertrouwelijke informatie, ook na beëindiging van de samenwerking.

**Artikel 6 — Omgang met gegevens en kennis**
Persoonsgegevens worden verwerkt conform de AVG (GDPR). Methodes en materialen blijven intellectueel eigendom van de Adviseur.

**Artikel 7 — Betaling**
Facturen dienen binnen de afgesproken betalingstermijn te worden voldaan. Bij beëindiging zijn alleen reeds verzonden facturen verschuldigd.

**Artikel 8 — Beëindiging**
Beide partijen kunnen de overeenkomst op ieder moment beëindigen. Geheimhouding en aansprakelijkheidsbeperkingen blijven van kracht.

**Artikel 9 — Overmacht**
In geval van overmacht kan uitvoering tijdelijk worden opgeschort. Partijen treden in overleg om tot een passende oplossing te komen.

**Artikel 10 — Toepasselijk recht**
Op deze overeenkomst is Nederlands recht van toepassing. Geschillen worden bij voorkeur in overleg opgelost.

**Artikel 11 — Slotbepalingen**
Wijzigingen zijn alleen geldig indien schriftelijk overeengekomen. Deze overeenkomst bevat de volledige afspraken tussen Partijen.

### Handtekeningblok
Onderaan (met `breakInside: avoid`):
- Plaats + Datum (2 kolommen, stippellijn eronder)
- Adviseur naam + handtekeninglijn | Klant naam + handtekeninglijn (2 kolommen)

## Formatting utilities

Nederlandse formatting:
```typescript
// Bedragen: € 1.234,56
new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(bedrag)

// Datums: 11 februari 2026
new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(isoDate))
```

## Kritieke print/PDF CSS

De template container heeft `p-[20mm]` voor de schermpreview. Bij printen op meerdere pagina's werkt container-padding NIET voor pagina 2+. Oplossing in globals.css:

```css
@media print {
  body {
    background: white !important;
    margin: 0;
    padding: 0;
  }

  @page {
    size: A4;
    margin: 20mm;
  }

  .document-template {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    min-height: 0 !important;
    box-shadow: none !important;
  }
}
```

Voeg `document-template` als class toe aan de root div van het template. De `@page { margin: 20mm }` zorgt voor consistente marges op ELKE geprinte pagina.

## Repository patroon

Maak abstracte interfaces zodat localStorage later vervangen kan worden door een database:

```typescript
interface OvereenkomstRepository {
  getOvereenkomst(id: string): Promise<Overeenkomst | null>;
  saveOvereenkomst(overeenkomst: Overeenkomst): Promise<void>;
  listOvereenkomsten(): Promise<Overeenkomst[]>;
  deleteOvereenkomst(id: string): Promise<void>;
}
```

Met een localStorage-implementatie als startpunt, en een factory functie die later naar een andere implementatie kan wijzen.

## Bestandsstructuur

```
app/
  page.tsx              # Hoofdpagina: form links, preview rechts, "use client"
  layout.tsx            # lang="nl", metadata
  globals.css           # Tailwind + print CSS

components/
  overeenkomst-formulier.tsx
  overeenkomst-template.tsx   # forwardRef, A4 layout, document-template class
  logo-upload.tsx

lib/
  types.ts
  format.ts
  standaard-overeenkomst.ts   # factory met standaardwaarden
  repository.ts               # abstracte interface
  local-storage-repository.ts
  get-repository.ts
```
