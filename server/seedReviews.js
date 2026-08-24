require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/Review');

const fakeReviews = [
  { name: 'Rajesh Kumar', rating: 5, text: 'PVC panels bahut achhe hain. Installation easy tha aur finish premium lag raha hai. Highly recommended!' },
  { name: 'Priya Sharma', rating: 5, text: 'Deep fluted panels liye living room ke liye. Look amazing! Guests are impressed every time.' },
  { name: 'Amit Singh', rating: 4, text: 'UV sticker sheets best hain market mein. Price bhi reasonable hai. Star Home Design se hi lunga next time.' },
  { name: 'Neha Gupta', rating: 5, text: 'Showroom visit kiya tha Sikar mein. Staff bahut helpful hai. Rafter panels exactly waise aaye jaise dikhe the.' },
  { name: 'Vikram Joshi', rating: 5, text: 'Geometric tiles lagwaye bathroom mein. Quality exceptional hai. 3 months ho gaye koi issue nahi.' },
  { name: 'Sunita Devi', rating: 5, text: 'PVC ceiling panels lagwaye poore ghar mein. Waterproof hain aur cleaning bhi easy hai. Thank you Star Home Design!' },
  { name: 'Mahesh Saini', rating: 4, text: 'Best interior materials in Sikar. Wide variety hai aur prices competitive hain. Delivery time thoda zyada tha but worth the wait.' },
  { name: 'Kavita Meena', rating: 5, text: 'Marble pattern UV sheets lagwaye kitchen mein. Ghar hotel jaisa lag raha hai! Sab pooch rahe hain kahan se karwaya.' },
  { name: 'Ravi Shankar', rating: 5, text: 'Professional service end to end. Design consultation bhi diya. Fluted panels perfect fit aaye. 10/10 recommended.' },
  { name: 'Pooja Agarwal', rating: 5, text: 'Decorative tiles mein bohot variety mili. Mere bedroom ka look completely change ho gaya. Bahut khush hoon!' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  await Review.deleteMany({});
  console.log('Old reviews cleared');
  
  await Review.insertMany(fakeReviews);
  console.log(`${fakeReviews.length} fake reviews added`);
  
  process.exit();
}

seed().catch(e => { console.error(e); process.exit(1); });
