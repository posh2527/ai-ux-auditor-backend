const cheerio = require('cheerio');

async function detectComponent(domHtml, boundingBox = null) {
  // Parse HTML
  const $ = cheerio.load(domHtml);
  
  // Common component selectors (ordered by importance)
  const selectors = [
    'nav.navbar, nav.main-nav, header nav',
    'button.cta, button.primary, .btn-primary',
    'div.hero, .hero-section, section.hero',
    'div.cta, .call-to-action',
    'button[type="submit"]',
    'div.card, .card-component'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      return element.html() || element[0].outerHTML;
    }
  }

  // Fallback: first interactive element
  const fallback = $('button, a[href], input[type="submit"]').first();
  return fallback.length ? fallback[0].outerHTML : '<button class="px-4 py-2 bg-blue-500 text-white rounded">Sample Button</button>';
}

module.exports = { detectComponent };
