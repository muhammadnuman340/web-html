/**
 * Privacy policy, terms of use and contact page content.
 *
 * Shared by the React pages and scripts/prerender-seo.ts so both always match.
 * The policy describes what the code actually does; update it whenever the app
 * starts storing, sending or collecting anything new.
 */

export const LEGAL = {
  operator: 'NumanX Studio',
  /** Set once the new domain's mailbox exists. Until then the contact page says email is coming soon and security.txt is not published. */
  contactEmail: '',
  /** Country whose law governs the terms, e.g. 'Pakistan'. The clause is omitted until this is set. */
  governingLaw: '',
  lastUpdated: '2026-10-29',
}

/**
 * Every localStorage key the app uses, as described in the Privacy Policy.
 * "personal" keys are removed by Settings > Clear All Data; "preferences" are kept.
 * A test fails if the code uses a uc_* key that is not listed here.
 */
export const STORAGE_KEYS = {
  personal: [
    'uc_hist', 'uc_fav', 'uc_custom', 'uc_custom_units', 'uc_unit_defaults',
    'uc_ai_chat', 'uc_analytics', 'uc_streaks', 'uc_patterns',
    'uc_currency_rates', 'uc_currency_offline', 'uc_crypto_prices',
  ],
  preferences: ['uc_theme_class', 'uc_font', 'uc_prec', 'uc_mode', 'uc_haptic', 'uc_onboarded'],
}

/** Short notices shown next to health and money tools. */
export const DISCLAIMERS = {
  health: 'Results are general estimates for information only, not medical advice. Talk to a qualified health professional about your health.',
  finance: 'Rates come from third-party providers and may be delayed or cached. For information only, not financial advice and not suitable for trading.',
}

export interface LegalSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LegalDoc {
  path: '/privacy' | '/terms' | '/contact'
  h1: string
  intro: string
  sections: LegalSection[]
}

function contactSentence(): string {
  return LEGAL.contactEmail
    ? `Email us at ${LEGAL.contactEmail}.`
    : 'A dedicated contact email is being set up and will be published on our Contact page soon.'
}

export function getPrivacyPolicy(): LegalDoc {
  return {
    path: '/privacy',
    h1: 'Privacy Policy',
    intro: `This policy explains what data Omega X Converter, operated by ${LEGAL.operator}, handles when you use it. In short: there are no accounts, no ads, no analytics or tracking cookies, and every conversion is calculated in your browser.`,
    sections: [
      {
        heading: 'What stays on your device',
        paragraphs: [
          'To remember your preferences and make features work, the app saves the following in your browser\'s local storage. This data never leaves your device and we cannot see it:',
        ],
        bullets: [
          'Settings: theme, font, decimal precision, app mode, haptic feedback and default units.',
          'Your content: conversion history, favorites, custom units and AI assistant chat history.',
          'Usage statistics shown only to you on the dashboard: conversion counts, streaks and frequently used conversions.',
          'Cached currency and crypto rates, so the converters keep working offline.',
        ],
      },
      {
        heading: 'Offline support',
        paragraphs: [
          'The app installs a service worker that stores copies of its pages and files in your browser cache, so it can load without an internet connection. Like local storage, this cache stays on your device.',
        ],
      },
      {
        heading: 'Requests to other services',
        paragraphs: [
          'A few features need data from outside services. When they run, your browser connects to those services directly, which means they can see your IP address and basic browser information, as any website can. The numbers you convert are never sent.',
        ],
        bullets: [
          'Currency rates are fetched from ExchangeRate-API (open.er-api.com).',
          'Cryptocurrency prices are fetched from CoinGecko (api.coingecko.com).',
          'The website is hosted by Netlify, which keeps standard server logs (such as IP address, browser type and the page requested) to operate and secure the service.',
        ],
      },
      {
        heading: 'What we do not do',
        paragraphs: [
          'We do not use cookies, advertising, analytics or tracking tools, and we do not sell or share personal data. Fonts are served from our own website rather than a third-party font service.',
        ],
      },
      {
        heading: 'Deleting your data',
        paragraphs: [
          'Use "Clear All Data" on the Settings page to delete your history, favorites, custom units, chat history, usage statistics and cached rates. Clearing your browser\'s site data for this website removes everything, including settings and the offline cache.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'The app does not ask for or collect personal information from anyone, including children.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          `If the app starts handling data differently, we will update this page and its "last updated" date. Last updated: ${LEGAL.lastUpdated}.`,
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`Questions about privacy? ${contactSentence()}`],
      },
    ],
  }
}

export function getTerms(): LegalDoc {
  const sections: LegalSection[] = [
    {
      heading: 'Using the service',
      paragraphs: [
        `Omega X Converter is a free tool operated by ${LEGAL.operator}. By using it you agree to these terms. If you do not agree, please do not use the service.`,
      ],
    },
    {
      heading: 'Accuracy of conversions',
      paragraphs: [
        'Conversions use published standard factors (such as NIST SP 811 and the BIPM SI Brochure) and are checked by automated tests, but no tool is free of errors. Results are provided for general information. Double-check any value used for engineering, medical, legal, safety-critical or financial decisions with an authoritative source.',
      ],
    },
    {
      heading: 'Currency and crypto prices',
      paragraphs: [
        'Exchange rates and cryptocurrency prices come from third-party providers. They may be delayed, cached or inaccurate, and they are not suitable for trading. Nothing on this site is financial advice.',
      ],
    },
    {
      heading: 'Health calculators',
      paragraphs: [
        'BMI, BMR and other health results are general estimates. They are not medical advice and do not replace guidance from a qualified health professional.',
      ],
    },
    {
      heading: 'Acceptable use',
      paragraphs: ['Please do not:'],
      bullets: [
        'Attempt to disrupt, overload or gain unauthorized access to the service or its hosting.',
        'Scrape or download the site in a way that degrades it for other visitors.',
        'Present the service or its content as your own without the attribution described below.',
      ],
    },
    {
      heading: 'Content and attribution',
      paragraphs: [
        `Written content on this site (articles, guides and explanations) is licensed under Creative Commons Attribution 4.0 (CC BY 4.0): you may reuse it if you credit "Omega X Converter by ${LEGAL.operator}" and link back. The Omega X name, logo and the app itself are not covered by that license.`,
      ],
    },
    {
      heading: 'Third-party services',
      paragraphs: [
        'The service relies on third parties for hosting and price data, and links to outside references such as NIST and BIPM. We are not responsible for their content or availability.',
      ],
    },
    {
      heading: 'No warranty and limitation of liability',
      paragraphs: [
        `The service is provided "as is" and "as available", without warranties of any kind. To the fullest extent permitted by law, ${LEGAL.operator} is not liable for any loss or damage arising from use of the service or reliance on its results.`,
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        `We may update these terms. Continued use after an update means you accept the new version. Last updated: ${LEGAL.lastUpdated}.`,
      ],
    },
  ]
  if (LEGAL.governingLaw) {
    sections.push({
      heading: 'Governing law',
      paragraphs: [`These terms are governed by the laws of ${LEGAL.governingLaw}.`],
    })
  }
  sections.push({ heading: 'Contact', paragraphs: [`Questions about these terms? ${contactSentence()}`] })

  return {
    path: '/terms',
    h1: 'Terms of Use',
    intro: 'These terms cover your use of Omega X Converter, including its unit converters, currency and crypto tools, calculators, guides and articles.',
    sections,
  }
}

export function getContactPage(): LegalDoc {
  return {
    path: '/contact',
    h1: 'Contact',
    intro: `Omega X Converter is built and maintained by ${LEGAL.operator}. ${contactSentence()}`,
    sections: [
      {
        heading: 'Report a wrong conversion',
        paragraphs: [
          'If a result looks wrong, tell us the page address, the value you entered and the result you expected. Accuracy reports are our top priority.',
        ],
      },
      {
        heading: 'Security',
        paragraphs: [
          LEGAL.contactEmail
            ? `To report a security vulnerability, email ${LEGAL.contactEmail} with details and steps to reproduce. Please give us reasonable time to fix the issue before disclosing it publicly. Our security contact is also listed in /.well-known/security.txt.`
            : 'To report a security vulnerability, please use the contact email once it is published here. Please give us reasonable time to fix the issue before disclosing it publicly.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'We do not collect personal data, so there is no account or profile to request or delete. See the Privacy Policy for details on what stays in your browser.',
        ],
      },
    ],
  }
}

/** Builds security.txt (RFC 9116). Returns null until a contact email is configured. */
export function buildSecurityTxt(siteUrl: string, now = new Date()): string | null {
  if (!LEGAL.contactEmail) return null
  const expires = new Date(now)
  expires.setFullYear(expires.getFullYear() + 1)
  return [
    `Contact: mailto:${LEGAL.contactEmail}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: en',
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    `Policy: ${siteUrl}/contact`,
    '',
  ].join('\n')
}
