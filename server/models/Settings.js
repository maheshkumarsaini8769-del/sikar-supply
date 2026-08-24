const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Star Home Design' },
  siteTagline: { type: String, default: 'Premium Interior Materials' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },

  phone: { type: String, default: '+918239409535' },
  whatsapp: { type: String, default: '918239409535' },
  email: { type: String, default: '' },
  address: { type: String, default: 'Sikar, Rajasthan' },
  googleMapsUrl: { type: String, default: '' },
  openingHours: { type: String, default: 'Mon - Sat: 9:00 AM - 7:00 PM' },

  heroSlides: [{
    image: String,
    active: { type: Boolean, default: true },
    displayOrder: Number,
  }],
  slideDuration: { type: Number, default: 3000 },

  heroEyebrow: { type: String, default: 'STAR HOME DESIGN' },
  heroHeading: { type: String, default: 'Transform Your Space' },
  heroDescription: { type: String, default: 'Premium interior materials for modern living' },
  heroBtnText: { type: String, default: 'Explore Collection' },

  aboutHeading: { type: String, default: 'Crafting Interiors That Inspire' },
  aboutDescription: { type: String, default: '' },
  aboutImage: { type: String, default: '' },

  statsYears: { type: String, default: '12+' },
  statsProjects: { type: String, default: '1000+' },
  statsRating: { type: String, default: '5' },

  whyUsHeading: { type: String, default: 'Why Choose Star Home Design' },
  showroomHeading: { type: String, default: 'Visit Our Showroom' },
  showroomImage: { type: String, default: '' },

  textureImage: { type: String, default: '' },

  footerDescription: { type: String, default: 'Your trusted partner for premium interior materials.' },
  copyrightText: { type: String, default: '© 2024 Star Home Design. All rights reserved.' },

  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },

  seoTitle: { type: String, default: 'Star Home Design - Premium Interior Materials' },
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' },

  whatsappGreeting: { type: String, default: 'Hello Star Home Design,' },
  whatsappProductMessage: { type: String, default: 'I am interested in {product}. Please share price and availability.' },

  homeSections: [{
    id: String,
    label: String,
    active: { type: Boolean, default: true },
    order: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
