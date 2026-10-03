const express = require('express');
const Settings = require('../models/Settings');
const Sale = require('../models/Sale');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const router = express.Router();

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// GET /api/gst - Get GST settings & tax summary statistics
router.get('/', protect, async (req, res) => {
  try {
    const settings = await getSettings();
    const gst = settings.gst || {
      enabled: true,
      gstin: '',
      legalName: 'Star Home Interior',
      tradeName: 'Star Home Interior',
      state: 'Rajasthan',
      stateCode: '08',
      defaultGstRate: 18,
      defaultHsnCode: '3925',
      invoicePrefix: 'SHI-INV-',
      invoiceTerms: '1. Goods once sold will not be taken back without original bill.\n2. 100% waterproof guarantee applicable as per manufacturer warranty.\n3. Subject to Sikar jurisdiction only.',
      bankName: 'State Bank of India',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
    };

    // Calculate GST metrics from all recorded sales
    const sales = await Sale.find().sort({ saleDate: -1, createdAt: -1 });
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.finalAmount || 0), 0);
    const gstRate = Number(gst.defaultGstRate) || 18;

    // Calculation: Total = Taxable * (1 + Rate/100) -> Taxable = Total / (1 + Rate/100)
    let totalTaxable = 0;
    let totalGst = 0;

    if (gst.enabled && totalSalesAmount > 0) {
      totalTaxable = Math.round((totalSalesAmount / (1 + gstRate / 100)) * 100) / 100;
      totalGst = Math.round((totalSalesAmount - totalTaxable) * 100) / 100;
    }

    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst / 2) * 100) / 100;

    res.json({
      success: true,
      gst,
      businessDetails: {
        name: settings.siteName || 'Star Home Interior',
        phone: settings.phone || '+91 82394 09535',
        whatsapp: settings.whatsapp || '918239409535',
        address: settings.address || 'Jaipur-Jhunjhunu Bypass Road, Opp. Maruti Authorized Service Center, Sikar, Rajasthan',
        email: settings.email || 'skysk9535@gmail.com',
      },
      stats: {
        totalSalesCount: sales.length,
        totalSalesAmount,
        totalTaxable,
        totalGst,
        cgst,
        sgst,
        igst: 0,
      },
      recentSales: sales.slice(0, 15),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/gst - Update GST settings
router.put('/', protect, async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.gst) {
      settings.gst = {};
    }

    const {
      enabled,
      gstin,
      legalName,
      tradeName,
      state,
      stateCode,
      defaultGstRate,
      defaultHsnCode,
      invoicePrefix,
      invoiceTerms,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
    } = req.body;

    settings.gst = {
      ...settings.gst.toObject(),
      enabled: enabled !== undefined ? Boolean(enabled) : settings.gst.enabled,
      gstin: gstin !== undefined ? String(gstin).trim().toUpperCase() : (settings.gst.gstin || ''),
      legalName: legalName !== undefined ? String(legalName).trim() : (settings.gst.legalName || 'Star Home Interior'),
      tradeName: tradeName !== undefined ? String(tradeName).trim() : (settings.gst.tradeName || 'Star Home Interior'),
      state: state !== undefined ? String(state).trim() : (settings.gst.state || 'Rajasthan'),
      stateCode: stateCode !== undefined ? String(stateCode).trim() : (settings.gst.stateCode || '08'),
      defaultGstRate: defaultGstRate !== undefined ? Number(defaultGstRate) : (settings.gst.defaultGstRate || 18),
      defaultHsnCode: defaultHsnCode !== undefined ? String(defaultHsnCode).trim() : (settings.gst.defaultHsnCode || '3925'),
      invoicePrefix: invoicePrefix !== undefined ? String(invoicePrefix).trim() : (settings.gst.invoicePrefix || 'SHI-INV-'),
      invoiceTerms: invoiceTerms !== undefined ? String(invoiceTerms) : (settings.gst.invoiceTerms || ''),
      bankName: bankName !== undefined ? String(bankName).trim() : (settings.gst.bankName || ''),
      accountNumber: accountNumber !== undefined ? String(accountNumber).trim() : (settings.gst.accountNumber || ''),
      ifscCode: ifscCode !== undefined ? String(ifscCode).trim().toUpperCase() : (settings.gst.ifscCode || ''),
      upiId: upiId !== undefined ? String(upiId).trim() : (settings.gst.upiId || ''),
    };

    settings.markModified('gst');
    await settings.save();

    res.json({ success: true, message: 'GST settings updated successfully', gst: settings.gst });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
