import { SUPPORT_EMAIL } from "@/lib/site";
import { normalizeLocale, type AppLocale } from "@/lib/i18n/config";

export type LegalSlug = "terms" | "privacy";

export type LegalSection = {
  title: string;
  body: string;
};

export type LegalDocumentContent = {
  slug: LegalSlug;
  title: string;
  /** ISO date shown as “Last updated”. Edit when you change the copy. */
  updatedAt: string;
  sections: LegalSection[];
};

/** Parse `## Heading` + following paragraphs into sections. */
export function parseLegalBody(body: string): LegalSection[] {
  const trimmed = body.trim();
  if (!trimmed) {
    return [];
  }

  const parts = trimmed.split(/^##\s+/m).filter(Boolean);

  return parts.map((part) => {
    const newline = part.indexOf("\n");
    if (newline === -1) {
      return { title: part.trim(), body: "" };
    }

    return {
      title: part.slice(0, newline).trim(),
      body: part.slice(newline + 1).trim(),
    };
  });
}

function documentFromBody(
  slug: LegalSlug,
  title: string,
  updatedAt: string,
  body: string,
): LegalDocumentContent {
  return {
    slug,
    title,
    updatedAt,
    sections: parseLegalBody(body),
  };
}

const TERMS_UPDATED = "2026-03-20T12:00:00.000Z";
const PRIVACY_UPDATED = "2026-03-20T12:00:00.000Z";

const TERMS_EN = `
## Agreement
By creating an account or placing an order on Hoodini Studio, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the shop.

## Orders and payment
Orders may be placed as a guest or with an account. Cash on delivery is currently available in Kosovo, Albania, and North Macedonia. Card payments may be offered later. By placing an order you confirm that your contact and shipping details are accurate so we can fulfill and deliver it.

We may cancel or refuse an order if we cannot fulfill it, if details look fraudulent or incomplete, or if a product is unavailable. If we cancel after you ordered, we will contact you using the details you provided.

## Accounts
You are responsible for keeping your account credentials secure and for activity under your account. Provide accurate registration information. We may suspend accounts that abuse the shop or violate these terms.

## Prices, shipping, and coupons
Prices are shown in euros and may change. Shipping fees and free-shipping rules depend on destination and cart contents and are calculated at checkout. Coupons, when offered, apply under the conditions shown and may be limited or withdrawn.

## Limitation of liability
Hoodini Studio products are sold as described on the site. To the extent allowed by applicable law, we are not liable for indirect or consequential losses arising from use of the shop. Nothing in these terms limits rights you have under mandatory consumer law in your country.

## Changes
We may update these terms from time to time. The updated date on this page will change when we do. Continued use of the shop after updates means you accept the revised terms. Questions: contact us at ${SUPPORT_EMAIL}.
`.trim();

const TERMS_SQ = `
## Marrëveshja
Duke krijuar një llogari ose duke vendosur një porosi në Hoodini Studio, ju pranoni këto Kushte të shërbimit dhe Politikën e privatësisë. Nëse nuk pajtoheni, ju lutemi mos e përdorni dyqanin.

## Porositë dhe pagesa
Porositë mund të vendosen si mysafir ose me llogari. Pagesa me para në dorëzim ofrohet aktualisht në Kosovë, Shqipëri dhe Maqedoninë e Veriut. Pagesa me kartë mund të ofrohet më vonë. Duke vendosur një porosi, ju konfirmoni se të dhënat e kontaktit dhe transportit janë të sakta që të mund ta përmbushim dhe dorëzojmë.

Mund të anulojmë ose refuzojmë një porosi nëse nuk mund ta përmbushim, nëse të dhënat duken të dyshimta ose të paplota, ose nëse produkti nuk është i disponueshëm. Nëse anulojmë pas porosisë, do t'ju kontaktojmë me të dhënat që keni dhënë.

## Llogaritë
Jeni përgjegjës për sigurinë e kredencialeve të llogarisë dhe për aktivitetin nën llogarinë tuaj. Jepni informacion të saktë regjistrimi. Mund të pezullojmë llogaritë që abuzojnë me dyqanin ose shkelin këto kushte.

## Çmimet, transporti dhe kuponët
Çmimet shfaqen në euro dhe mund të ndryshojnë. Tarifat e transportit dhe rregullat e transportit falas varen nga destinacioni dhe përmbajtja e shportës dhe llogariten në pagesë. Kuponët, kur ofrohen, zbatohen sipas kushteve të shfaqura dhe mund të kufizohen ose tërheqen.

## Kufizimi i përgjegjësisë
Produktet e Hoodini Studio shiten siç përshkruhen në faqe. Në masën e lejuar nga ligji i zbatueshëm, nuk jemi përgjegjës për humbje indirekte ose pasuese që rrjedhin nga përdorimi i dyqanit. Asgjë në këto kushte nuk kufizon të drejtat që keni sipas ligjit të detyrueshëm të konsumatorit në vendin tuaj.

## Ndryshimet
Mund t'i përditësojmë këto kushte herë pas here. Data e përditësimit në këtë faqe ndryshon kur e bëjmë. Vazhdimi i përdorimit të dyqanit pas përditësimeve do të thotë se i pranoni kushtet e rishikuara. Pyetje: na kontaktoni te ${SUPPORT_EMAIL}.
`.trim();

const PRIVACY_EN = `
## Introduction
This Privacy Policy explains what personal data Hoodini Studio collects when you browse, register, checkout, or subscribe to marketing emails, and how we use it.

## What we collect
Depending on how you use the shop, we may collect:
• Account details (name, email, password hash, preferred language)
• Shipping and contact details (phone, address, city, country, postal code)
• Order details (items, totals, payment method, notes)
• Marketing preferences and guest newsletter email
• Technical data needed to run the site (session cookies, security logs)

We do not ask for card numbers while cash on delivery is the only payment method.

## How we use data
We use personal data to create and manage accounts, process and fulfill orders, communicate about orders, improve the shop, prevent abuse, and — only with your consent or separate opt-in — send marketing emails about drops and studio updates.

## Sharing
We may share data with service providers who help us host the site, send email, or deliver orders, only as needed for those purposes. We do not sell your personal data. We may disclose information if required by law or to protect the studio and customers from fraud or abuse.

## Retention
We keep account and order records as long as needed to operate the shop, fulfill legal obligations, and resolve disputes. Guest newsletter subscriptions are kept until you unsubscribe. Guest carts and favourites may be cleaned up after inactivity.

## Marketing emails
Registered customers can manage marketing preferences in account settings. Guests can subscribe via the newsletter form and unsubscribe using the link in those emails. Marketing is separate from transactional messages about your orders.

## Your rights
Depending on where you live, you may have rights to access, correct, or delete personal data, or to object to certain processing. To exercise these rights, contact us using the details below. You can also update account details and email preferences while signed in.

## Contact
For privacy questions, email ${SUPPORT_EMAIL}. We may update this policy; the updated date on this page will change when we do.
`.trim();

const PRIVACY_SQ = `
## Hyrje
Kjo Politikë e privatësisë shpjegon çfarë të dhënash personale mbledh Hoodini Studio kur shfletoni, regjistroheni, paguani ose abonoheni në email-e marketing, dhe si i përdorim ato.

## Çfarë mbledhim
Sipas mënyrës se si e përdorni dyqanin, mund të mbledhim:
• Të dhëna llogarie (emër, email, hash i fjalëkalimit, gjuha e preferuar)
• Të dhëna transporti dhe kontakti (telefon, adresë, qytet, shtet, kod postar)
• Të dhëna porosie (artikuj, totale, metoda e pagesës, shënime)
• Preferencat e marketingut dhe email-in e buletinit për mysafirë
• Të dhëna teknike për funksionimin e faqes (cookies seance, regjistra sigurie)

Nuk kërkojmë numra karte ndërsa pagesa me para në dorëzim është e vetmja metodë.

## Si i përdorim të dhënat
I përdorim të dhënat personale për të krijuar dhe menaxhuar llogaritë, për të përpunuar dhe përmbushur porositë, për të komunikuar rreth porosive, për të përmirësuar dyqanin, për të parandaluar abuzimin dhe — vetëm me pëlqimin tuaj ose abonim të veçantë — për të dërguar email-e marketing për produkte të reja dhe përditësime të studios.

## Ndarja
Mund t'i ndajmë të dhënat me ofrues shërbimesh që na ndihmojnë të hostojmë faqen, të dërgojmë email ose të dorëzojmë porosi, vetëm sa është e nevojshme për ato qëllime. Nuk i shesim të dhënat tuaja personale. Mund të zbulojmë informacion nëse e kërkon ligji ose për të mbrojtur studion dhe klientët nga mashtrimi ose abuzimi.

## Ruajtja
I mbajmë regjistrat e llogarisë dhe porosive sa është e nevojshme për të operuar dyqanin, për të përmbushur detyrimet ligjore dhe për të zgjidhur mosmarrëveshjet. Abonimet e buletinit të mysafirëve mbahen derisa të çabonoheni. Shportat dhe të preferuarat e mysafirëve mund të pastrohen pas pasivitetit.

## Email-et marketing
Klientët e regjistruar mund të menaxhojnë preferencat e marketingut në cilësimet e llogarisë. Mysafirët mund të abonohen përmes formularit të buletinit dhe të çabonohen përmes lidhjes në ato email-e. Marketingu është i ndarë nga mesazhet transakionale për porositë tuaja.

## Të drejtat tuaja
Sipas vendit ku jetoni, mund të keni të drejta për të aksesuar, korrigjuar ose fshirë të dhëna personale, ose për t'u kundërshtuar ndaj përpunimit të caktuar. Për t'i ushtruar këto të drejta, na kontaktoni me të dhënat më poshtë. Mund të përditësoni edhe të dhënat e llogarisë dhe preferencat e email-it kur jeni të identifikuar.

## Kontakt
Për pyetje privatësie, shkruani te ${SUPPORT_EMAIL}. Mund ta përditësojmë këtë politikë; data e përditësimit në këtë faqe ndryshon kur e bëjmë.
`.trim();

const DOCUMENTS: Record<LegalSlug, Record<AppLocale, LegalDocumentContent>> = {
  terms: {
    en: documentFromBody("terms", "Terms of Service", TERMS_UPDATED, TERMS_EN),
    sq: documentFromBody("terms", "Kushtet e shërbimit", TERMS_UPDATED, TERMS_SQ),
  },
  privacy: {
    en: documentFromBody("privacy", "Privacy Policy", PRIVACY_UPDATED, PRIVACY_EN),
    sq: documentFromBody(
      "privacy",
      "Politika e privatësisë",
      PRIVACY_UPDATED,
      PRIVACY_SQ,
    ),
  },
};

export function getLegalDocument(
  slug: LegalSlug,
  locale: string,
): LegalDocumentContent {
  const normalized = normalizeLocale(locale);
  return DOCUMENTS[slug][normalized];
}
