export default function Head() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Lume',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    operatingSystem: 'Web',
    description: 'Global payroll platform built on Stellar blockchain. Pay your international team in seconds with 90% lower fees.',
    url: 'https://lume.pay',
    publisher: {
      '@type': 'Organization',
      name: 'Lume',
      url: 'https://lume.pay',
    },
    featureList: [
      'Individual Payouts',
      'Bulk Payments via CSV',
      'MoneyGram Integration',
      'Real-time FX Rates',
      'Multi-currency Support',
      'Instant Settlements',
      '1% Transaction Fee',
      'Stellar Blockchain Technology'
    ],
    screenshot: 'https://lume.pay/screenshot-desktop.png',
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lume',
    url: 'https://lume.pay',
    logo: 'https://lume.pay/icon-512.png',
    description: 'Global payroll platform powered by Stellar blockchain',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@lume.pay',
      contactType: 'Customer Support',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://twitter.com/lumepay',
      'https://github.com/pkprajapati7402/Lume',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
