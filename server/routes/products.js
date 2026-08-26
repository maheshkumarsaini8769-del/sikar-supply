const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, sort, featured, active, stock, page = 1, limit = 50 } = req.query;
    let query = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (active !== undefined) query.active = active === 'true';
    if (stock) query.stockStatus = stock;
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = { displayOrder: 1, createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true, active: true }).populate('category', 'name slug').sort({ displayOrder: 1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, upload.array('images', 10), async (req, res) => {
  try {
    const { name, category, description, shortDescription, price, salePrice, costPrice, sku, unit, stockStatus, stockQuantity, lowStockThreshold, featured, active, displayOrder, specs } = req.body;
    const images = req.files ? req.files.map((f, i) => ({
      url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
      alt: name,
      isPrimary: i === 0,
    })) : [];

    const product = await Product.create({
      name, category, description, shortDescription,
      price: Number(price) || 0,
      salePrice: Number(salePrice) || 0,
      costPrice: Number(costPrice) || 0,
      sku, unit: unit || 'sqft',
      stockStatus, stockQuantity: Number(stockQuantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      featured: featured === 'true',
      active: active !== 'false',
      displayOrder: Number(displayOrder) || 0,
      images,
      specs: specs ? JSON.parse(specs) : [],
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, upload.array('images', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updateData = { ...req.body };
    if (req.body.price !== undefined) updateData.price = Number(req.body.price);
    if (req.body.salePrice !== undefined) updateData.salePrice = Number(req.body.salePrice);
    if (req.body.costPrice !== undefined) updateData.costPrice = Number(req.body.costPrice);
    if (req.body.stockQuantity !== undefined) updateData.stockQuantity = Number(req.body.stockQuantity);
    if (req.body.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(req.body.lowStockThreshold);
    if (req.body.unit !== undefined) updateData.unit = req.body.unit;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder);
    if (req.body.featured !== undefined) updateData.featured = req.body.featured === 'true';
    if (req.body.active !== undefined) updateData.active = req.body.active === 'true';
    if (req.body.specs) updateData.specs = JSON.parse(req.body.specs);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f, i) => ({
        url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
        alt: product.name,
        isPrimary: i === 0 && product.images.length === 0,
      }));
      updateData.images = [...product.images, ...newImages];
    }

    Object.assign(product, updateData);
    await product.save();
    const populated = await Product.findById(product._id).populate('category', 'name slug');
    res.json({ success: true, product: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.active = false;
    await product.save();
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/images/reorder', protect, async (req, res) => {
  try {
    const { imageOrder } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.images = imageOrder;
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/images/:imageIndex', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.images.splice(parseInt(req.params.imageIndex), 1);
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/duplicate', protect, async (req, res) => {
  try {
    const original = await Product.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Product not found' });
    const dup = original.toObject();
    delete dup._id;
    delete dup.createdAt;
    delete dup.updatedAt;
    dup.name = original.name + ' (Copy)';
    dup.slug = '';
    dup.featured = false;
    const product = await Product.create(dup);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
