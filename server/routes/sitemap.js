const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const router = express.Router();

const BASE_URL = 'https://star-home-design-five.vercel.app';

router.get('/', async (req, res) => {
  try {
    const [products, categories, settings] = await Promise.all([
      Product.find({ active: true }).select('slug updatedAt').lean(),
      Category.find({ active: true }).select('slug updatedAt').lean(),
      Settings.findOne().select('updatedAt').lean(),
    ]);

    const lastMod = settings?.updatedAt
      ? new Date(settings.updatedAt).toISOString()
      : new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    categories.forEach(cat => {
      const mod = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : lastMod;
      xml += `
  <url>
    <loc>${BASE_URL}/${cat.slug || ''}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    products.forEach(prod => {
      const mod = prod.updatedAt ? new Date(prod.updatedAt).toISOString() : lastMod;
      xml += `
  <url>
    <loc>${BASE_URL}/${prod.slug || ''}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += '\n</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
