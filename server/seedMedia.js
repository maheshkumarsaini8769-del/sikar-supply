require('dotenv').config();
const mongoose = require('mongoose');
const Media = require('./models/Media');

const defaultMedia = [
  { filename: 'hero-1.jpg', originalName: 'hero-1.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&auto=format&fit=crop', section: 'hero', alt: 'Modern Interior' },
  { filename: 'hero-2.jpg', originalName: 'hero-2.jpg', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=85&auto=format&fit=crop', section: 'hero', alt: 'Luxury Living Room' },
  { filename: 'hero-3.jpg', originalName: 'hero-3.jpg', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format&fit=crop', section: 'hero', alt: 'Designer Interior' },
  { filename: 'about.jpg', originalName: 'about.jpg', url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1200&q=85&auto=format&fit=crop', section: 'about', alt: 'About Star Home Design' },
  { filename: 'showroom.jpg', originalName: 'showroom.jpg', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85&auto=format&fit=crop', section: 'showroom', alt: 'Showroom' },
  { filename: 'pvc-1.jpg', originalName: 'pvc-1.jpg', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=85&auto=format&fit=crop', section: 'products', alt: 'PVC Panel' },
  { filename: 'fluted-1.jpg', originalName: 'fluted-1.jpg', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85&auto=format&fit=crop', section: 'products', alt: 'Fluted Panel' },
  { filename: 'tile-1.jpg', originalName: 'tile-1.jpg', url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=85&auto=format&fit=crop', section: 'products', alt: 'Decorative Tile' },
  { filename: 'uv-1.jpg', originalName: 'uv-1.jpg', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=85&auto=format&fit=crop', section: 'products', alt: 'UV Sheet' },
  { filename: 'gallery-1.jpg', originalName: 'gallery-1.jpg', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=85&auto=format&fit=crop', section: 'gallery', alt: 'Gallery Image' },
  { filename: 'gallery-2.jpg', originalName: 'gallery-2.jpg', url: 'https://images.unsplash.com/photo-1616137466211-f73a09bfb584?w=800&q=85&auto=format&fit=crop', section: 'gallery', alt: 'Gallery Image' },
  { filename: 'gallery-3.jpg', originalName: 'gallery-3.jpg', url: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=85&auto=format&fit=crop', section: 'gallery', alt: 'Gallery Image' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  await Media.deleteMany({});
  console.log('Old media cleared');
  await Media.insertMany(defaultMedia);
  console.log(`${defaultMedia.length} media items added`);
  process.exit();
}

seed().catch(e => { console.error(e); process.exit(1); });
