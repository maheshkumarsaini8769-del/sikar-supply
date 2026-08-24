require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Settings = require('./models/Settings');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin
    const adminExists = await User.findOne({ email: 'admin@starhomedesign.com' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@starhomedesign.com', password: 'admin123', role: 'admin' });
      console.log('Admin created');
    }

    // Create categories
    const catNames = ['PVC Panels', 'Deep Fluted Panels', 'Rafter Panels', 'UV Sticker Sheets', 'Decorative Tiles'];
    const catSlugs = ['pvc', 'fluted', 'rafter', 'uv', 'tiles'];
    const categories = [];
    for (let i = 0; i < catNames.length; i++) {
      let cat = await Category.findOne({ name: catNames[i] });
      if (!cat) {
        cat = await Category.create({ name: catNames[i], slug: catSlugs[i], displayOrder: i + 1 });
        console.log(`Category: ${catNames[i]}`);
      }
      categories.push(cat);
    }

    // Create products
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      const products = [
        {
          name: 'PVC Wall Panel Classic',
          category: categories[0]._id,
          description: 'Versatile, lightweight PVC panels perfect for modern interiors. Available in diverse finishes that combine aesthetics with easy maintenance.',
          price: 85,
          salePrice: 0,
          sku: 'PVC-001',
          stockStatus: 'in_stock',
          stockQuantity: 500,
          featured: true,
          active: true,
          displayOrder: 1,
          images: [
            { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop', alt: 'PVC Panel', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=85&auto=format&fit=crop', alt: 'PVC Panel Detail', isPrimary: false },
          ],
        },
        {
          name: 'PVC Ceiling Panel Premium',
          category: categories[0]._id,
          description: 'Premium ceiling panels with seamless finish. Water resistant and easy to install.',
          price: 95,
          salePrice: 89,
          sku: 'PVC-002',
          stockStatus: 'in_stock',
          stockQuantity: 300,
          featured: false,
          active: true,
          displayOrder: 2,
          images: [
            { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=85&auto=format&fit=crop', alt: 'Ceiling Panel', isPrimary: true },
          ],
        },
        {
          name: 'Deep Fluted Wall Panel',
          category: categories[1]._id,
          description: 'Architectural fluted wall panels that create dramatic depth and texture. A signature element of premium contemporary design.',
          price: 145,
          salePrice: 0,
          sku: 'FLT-001',
          stockStatus: 'in_stock',
          stockQuantity: 200,
          featured: true,
          active: true,
          displayOrder: 3,
          images: [
            { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85&auto=format&fit=crop', alt: 'Fluted Panel', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85&auto=format&fit=crop', alt: 'Fluted Panel Room', isPrimary: false },
          ],
        },
        {
          name: 'Fluted Panel Oak Finish',
          category: categories[1]._id,
          description: 'Warm oak finish fluted panels adding natural elegance to any space.',
          price: 165,
          salePrice: 155,
          sku: 'FLT-002',
          stockStatus: 'low_stock',
          stockQuantity: 25,
          featured: false,
          active: true,
          displayOrder: 4,
          images: [
            { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85&auto=format&fit=crop', alt: 'Oak Fluted', isPrimary: true },
          ],
        },
        {
          name: 'Rafter Ceiling Panel',
          category: categories[2]._id,
          description: 'Decorative rafter-style panels that add structural elegance to ceilings and walls with refined geometric appeal.',
          price: 120,
          salePrice: 0,
          sku: 'RFT-001',
          stockStatus: 'in_stock',
          stockQuantity: 150,
          featured: true,
          active: true,
          displayOrder: 5,
          images: [
            { url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=85&auto=format&fit=crop', alt: 'Rafter Panel', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=85&auto=format&fit=crop', alt: 'Rafter Detail', isPrimary: false },
          ],
        },
        {
          name: 'UV Glossy Sticker Sheet',
          category: categories[3]._id,
          description: 'High-gloss UV decorative sticker sheets that bring sophisticated surface finishing to any interior application.',
          price: 95,
          salePrice: 0,
          sku: 'UV-001',
          stockStatus: 'in_stock',
          stockQuantity: 400,
          featured: true,
          active: true,
          displayOrder: 6,
          images: [
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=85&auto=format&fit=crop', alt: 'UV Sheet', isPrimary: true },
          ],
        },
        {
          name: 'UV Marble Pattern Sheet',
          category: categories[3]._id,
          description: 'Premium marble pattern UV sheets for luxury interior surfaces.',
          price: 135,
          salePrice: 125,
          sku: 'UV-002',
          stockStatus: 'in_stock',
          stockQuantity: 180,
          featured: false,
          active: true,
          displayOrder: 7,
          images: [
            { url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=85&auto=format&fit=crop', alt: 'UV Marble', isPrimary: true },
          ],
        },
        {
          name: 'Decorative Wall Tile',
          category: categories[4]._id,
          description: 'Premium decorative wall tiles featuring intricate patterns and textures that elevate any room to luxury status.',
          price: 110,
          salePrice: 0,
          sku: 'TL-001',
          stockStatus: 'in_stock',
          stockQuantity: 600,
          featured: true,
          active: true,
          displayOrder: 8,
          images: [
            { url: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=85&auto=format&fit=crop', alt: 'Decorative Tile', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1600607687644-c7f34b5e4a8b?w=800&q=85&auto=format&fit=crop', alt: 'Tile Room', isPrimary: false },
          ],
        },
        {
          name: 'Geometric Pattern Tile',
          category: categories[4]._id,
          description: 'Modern geometric pattern tiles for contemporary spaces.',
          price: 125,
          salePrice: 0,
          sku: 'TL-002',
          stockStatus: 'out_of_stock',
          stockQuantity: 0,
          featured: false,
          active: true,
          displayOrder: 9,
          images: [
            { url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=85&auto=format&fit=crop', alt: 'Geometric Tile', isPrimary: true },
          ],
        },
      ];

      for (const pData of products) {
        await Product.create(pData);
      }
      console.log(`${products.length} products created`);
    }

    // Create default settings
    const settingsExists = await Settings.findOne();
    if (!settingsExists) {
      const homeSections = [
        { id: 'hero', label: 'Hero', active: true, order: 1 },
        { id: 'stats', label: 'Stats', active: true, order: 2 },
        { id: 'about', label: 'About', active: true, order: 3 },
        { id: 'materials', label: 'Materials', active: true, order: 4 },
        { id: 'products', label: 'Products', active: true, order: 5 },
        { id: 'whyus', label: 'Why Us', active: true, order: 6 },
        { id: 'texture', label: 'Texture', active: true, order: 7 },
        { id: 'showroom', label: 'Showroom', active: true, order: 8 },
        { id: 'reviews', label: 'Reviews', active: true, order: 9 },
        { id: 'quote', label: 'Quote Form', active: true, order: 10 },
      ];
      await Settings.create({
        homeSections,
        heroSlides: [
          { image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&auto=format&fit=crop', active: true, displayOrder: 0 },
          { image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85&auto=format&fit=crop', active: true, displayOrder: 1 },
          { image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format&fit=crop', active: true, displayOrder: 2 },
        ],
        slideDuration: 3000,
        heroEyebrow: 'STAR HOME DESIGN',
        heroHeading: 'Transform Your Space',
        heroDescription: 'Premium interior materials for modern living',
        heroBtnText: 'Explore Collection',
        aboutHeading: 'Crafting Interiors That Inspire',
        statsYears: '12+',
        statsProjects: '1000+',
        statsRating: '5',
        whyUsHeading: 'Why Choose Star Home Design',
        showroomHeading: 'Visit Our Showroom',
        phone: '+918239409535',
        whatsapp: '918239409535',
        address: 'Sikar, Rajasthan',
        openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
        copyrightText: '© 2024 Star Home Design. All rights reserved.',
        footerDescription: 'Your trusted partner for premium interior materials.',
        seoTitle: 'Star Home Design - Premium Interior Materials',
      });
      console.log('Settings created');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
