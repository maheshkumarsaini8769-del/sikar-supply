import { useRef } from 'react';

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str.trim();
}

export default function InvoiceModal({ data, gstSettings, businessDetails, onClose }) {
  const printRef = useRef(null);

  if (!data) return null;

  // Resolve business information
  const business = {
    name: businessDetails?.name || 'Star Home Interior',
    tradeName: gstSettings?.tradeName || 'Star Home Interior',
    legalName: gstSettings?.legalName || 'Star Home Interior',
    gstin: gstSettings?.gstin || '',
    phone: businessDetails?.phone || '+91 82394 09535',
    email: businessDetails?.email || 'skysk9535@gmail.com',
    address: businessDetails?.address || 'Jaipur-Jhunjhunu Bypass Road, Opp. Maruti Authorized Service Center, Sikar, Rajasthan 332001',
    state: gstSettings?.state || 'Rajasthan',
    stateCode: gstSettings?.stateCode || '08',
    bankName: gstSettings?.bankName || 'State Bank of India',
    accountNumber: gstSettings?.accountNumber || '',
    ifscCode: gstSettings?.ifscCode || '',
    upiId: gstSettings?.upiId || '',
    terms: gstSettings?.invoiceTerms || '1. Goods once sold will not be taken back without original bill.\n2. 100% waterproof guarantee applicable as per manufacturer warranty.\n3. Subject to Sikar jurisdiction only.',
    hsnDefault: gstSettings?.defaultHsnCode || '3925',
    gstRateDefault: gstSettings?.defaultGstRate || 18,
  };

  // Resolve invoice metadata
  const invoiceNumber = data.invoiceNumber || data.saleNumber || data.orderNumber || `${gstSettings?.invoicePrefix || 'SHI-INV-'}${String(Math.floor(1000 + Math.random() * 9000))}`;
  const invoiceDate = new Date(data.saleDate || data.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const customerName = data.customerName || data.name || 'Valued Customer';
  const customerPhone = data.customerPhone || data.phone || '';
  const customerAddress = data.address || data.customerAddress || 'Sikar, Rajasthan';
  const customerGstin = data.customerGstin || '';
  const isInterState = Boolean(data.isInterState);

  // Normalize items
  const items = (data.items || []).map((it, idx) => {
    const qty = Number(it.quantity) || 1;
    const rate = Number(it.sellingPrice || it.price) || 0;
    const total = Number(it.total) || (qty * rate);
    return {
      sr: idx + 1,
      name: it.productName || it.name || 'Interior Material',
      hsn: it.hsnCode || business.hsnDefault,
      unit: it.unit || 'sqft',
      quantity: qty,
      rate,
      total,
    };
  });

  // Financial calculations
  const grossTotal = items.reduce((sum, it) => sum + it.total, 0) || Number(data.finalAmount || data.total || 0);
  const discount = Number(data.discount) || 0;
  const netPayable = Math.max(0, grossTotal - discount);

  // Tax breakdown (GST calculation)
  const gstRate = Number(gstSettings?.defaultGstRate) || 18;
  const isGstEnabled = gstSettings?.enabled !== false && Boolean(business.gstin);

  let taxableValue = netPayable;
  let totalTax = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isGstEnabled) {
    taxableValue = Math.round((netPayable / (1 + gstRate / 100)) * 100) / 100;
    totalTax = Math.round((netPayable - taxableValue) * 100) / 100;
    if (isInterState) {
      igst = totalTax;
    } else {
      cgst = Math.round((totalTax / 2) * 100) / 100;
      sgst = Math.round((totalTax / 2) * 100) / 100;
    }
  }

  const grandTotal = netPayable;
  const amountWords = numberToWords(Math.round(grandTotal));

  // Handle direct browser print
  const handlePrint = () => {
    window.print();
  };

  // Handle offline HTML invoice download
  const handleDownloadHtml = () => {
    const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoiceNumber} - ${business.name}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 0; padding: 20px; background: #fff; line-height: 1.4; font-size: 13px; }
    .invoice-box { max-width: 800px; margin: auto; border: 1px solid #222; padding: 24px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b8956a; padding-bottom: 16px; margin-bottom: 16px; }
    .header-left h1 { margin: 0 0 4px; font-size: 24px; color: #0a0a0a; letter-spacing: 0.05em; font-weight: 800; }
    .header-left p { margin: 2px 0; color: #555; font-size: 12px; }
    .header-right { text-align: right; }
    .tax-badge { display: inline-block; background: #111; color: #b8956a; padding: 4px 12px; font-weight: 700; font-size: 12px; border-radius: 4px; text-transform: uppercase; margin-bottom: 8px; }
    .meta-table { font-size: 12px; }
    .bill-to-row { display: flex; justify-content: space-between; background: #fbfbfb; border: 1px solid #ddd; padding: 12px; border-radius: 6px; margin-bottom: 16px; }
    .bill-to-col { flex: 1; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .items-table th { background: #f0ede7; color: #222; text-align: left; padding: 8px 10px; border: 1px solid #ccc; font-size: 12px; }
    .items-table td { padding: 8px 10px; border: 1px solid #ddd; font-size: 12px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-box { width: 280px; margin-left: auto; margin-bottom: 16px; border: 1px solid #ccc; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
    .grand-total { font-weight: 800; font-size: 14px; background: #f5f0eb; color: #111; border-top: 1px solid #b8956a; }
    .words-box { padding: 8px 12px; background: #fbfbfb; border-left: 3px solid #b8956a; margin-bottom: 16px; font-size: 12px; font-weight: 600; }
    .footer-row { display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 16px; margin-top: 20px; font-size: 11px; }
    .terms-box { max-width: 60%; }
    .sign-box { text-align: right; width: 35%; }
    .sign-space { height: 50px; }
    @media print { body { padding: 0; } .invoice-box { border: none; box-shadow: none; padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 15px;">
    <button onclick="window.print()" style="background:#b8956a; color:#fff; border:none; padding:10px 24px; border-radius:6px; font-size:14px; font-weight:700; cursor:pointer;">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-box">
    <div class="header">
      <div class="header-left">
        <h1>${business.name}</h1>
        <p><strong>${business.tradeName}</strong></p>
        <p>${business.address}</p>
        <p>Phone: ${business.phone} | Email: ${business.email}</p>
        ${business.gstin ? `<p><strong>GSTIN:</strong> ${business.gstin} | <strong>State:</strong> ${business.state} (${business.stateCode})</p>` : ''}
      </div>
      <div class="header-right">
        <div class="tax-badge">TAX INVOICE</div>
        <div class="meta-table">
          <div><strong>Invoice No:</strong> ${invoiceNumber}</div>
          <div><strong>Invoice Date:</strong> ${invoiceDate}</div>
          <div><strong>Place of Supply:</strong> ${business.state}</div>
        </div>
      </div>
    </div>

    <div class="bill-to-row">
      <div class="bill-to-col">
        <strong style="color: #b8956a; font-size: 11px; text-transform: uppercase;">Billed To / Customer Details:</strong>
        <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${customerName}</div>
        <div>Phone: ${customerPhone || 'N/A'}</div>
        <div>Address: ${customerAddress}</div>
        ${customerGstin ? `<div><strong>Customer GSTIN:</strong> ${customerGstin}</div>` : ''}
      </div>
      <div class="bill-to-col" style="text-align: right;">
        <strong style="color: #b8956a; font-size: 11px; text-transform: uppercase;">Payment Details:</strong>
        <div>Payment Mode: <span style="text-transform: capitalize;">${data.paymentMethod || 'Cash'}</span></div>
        ${business.upiId ? `<div>UPI ID: <strong>${business.upiId}</strong></div>` : ''}
        ${business.bankName && business.accountNumber ? `<div>Bank: ${business.bankName} - A/C: ${business.accountNumber}</div>` : ''}
        ${business.ifscCode ? `<div>IFSC: ${business.ifscCode}</div>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th class="text-center" style="width: 35px;">#</th>
          <th>Description of Goods / Service</th>
          <th class="text-center" style="width: 60px;">HSN</th>
          <th class="text-center" style="width: 60px;">Qty</th>
          <th class="text-right" style="width: 80px;">Rate (₹)</th>
          <th class="text-right" style="width: 90px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it => `
          <tr>
            <td class="text-center">${it.sr}</td>
            <td><strong>${it.name}</strong></td>
            <td class="text-center">${it.hsn}</td>
            <td class="text-center">${it.quantity} ${it.unit}</td>
            <td class="text-right">₹${it.rate.toLocaleString('en-IN')}</td>
            <td class="text-right">₹${it.total.toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="flex: 1; padding-right: 20px;">
        <div class="words-box">
          Amount in Words:<br>
          <span style="color: #111;">${amountWords}</span>
        </div>
      </div>
      <div class="totals-box">
        <div class="totals-row">
          <span>Sub Total:</span>
          <span>₹${grossTotal.toLocaleString('en-IN')}</span>
        </div>
        ${discount > 0 ? `
          <div class="totals-row" style="color: #c00;">
            <span>Discount:</span>
            <span>- ₹${discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        ${isGstEnabled ? `
          <div class="totals-row">
            <span>Taxable Value:</span>
            <span>₹${taxableValue.toLocaleString('en-IN')}</span>
          </div>
          ${!isInterState ? `
            <div class="totals-row">
              <span>CGST (${gstRate / 2}%):</span>
              <span>₹${cgst.toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row">
              <span>SGST (${gstRate / 2}%):</span>
              <span>₹${sgst.toLocaleString('en-IN')}</span>
            </div>
          ` : `
            <div class="totals-row">
              <span>IGST (${gstRate}%):</span>
              <span>₹${igst.toLocaleString('en-IN')}</span>
            </div>
          `}
        ` : ''}
        <div class="totals-row grand-total">
          <span>Grand Total:</span>
          <span>₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div class="footer-row">
      <div class="terms-box">
        <strong>Terms &amp; Conditions:</strong>
        <p style="white-space: pre-line; margin: 4px 0 0; color: #666;">${business.terms}</p>
      </div>
      <div class="sign-box">
        <p>For <strong>${business.name}</strong></p>
        <div class="sign-space"></div>
        <p style="border-top: 1px dashed #999; display: inline-block; padding-top: 4px; min-width: 140px; text-align: center;">
          Authorized Signatory
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${business.name.replace(/\s+/g, '_')}_Invoice_${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // WhatsApp bill summary share
  const handleShareWhatsApp = () => {
    const phone = customerPhone ? customerPhone.replace(/\D/g, '') : '';
    const text = encodeURIComponent(
      `*🧾 TAX INVOICE — ${business.name.toUpperCase()}*\n\n` +
      `*Invoice No:* ${invoiceNumber}\n` +
      `*Date:* ${invoiceDate}\n` +
      `*Customer:* ${customerName}\n` +
      `*Items:* ${items.length} item(s)\n` +
      `*Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}\n\n` +
      `Thank you for choosing ${business.name}!\n` +
      `📍 ${business.address}\n📞 ${business.phone}`
    );
    window.open(`https://wa.me/${phone ? (phone.startsWith('91') ? phone : '91' + phone) : ''}?text=${text}`, '_blank');
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="adm-modal adm-modal-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 860, background: '#181818', color: '#f5f5f5', maxHeight: '94vh' }}
      >
        {/* Modal Top Actions Bar */}
        <div className="adm-modal-header" style={{ borderBottom: '1px solid #2a2a2a', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🧾</span>
            <h2 style={{ fontSize: 16, margin: 0, color: '#e5e5e5' }}>
              Tax Invoice — <span style={{ color: '#b8956a' }}>{invoiceNumber}</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={handlePrint}
              style={{ background: '#b8956a', color: '#111', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              🖨️ Print Bill
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={handleDownloadHtml}
              style={{ background: '#242424', color: '#e5e5e5', border: '1px solid #444', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              📥 Download Bill
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={handleShareWhatsApp}
              style={{ background: '#25d366', color: '#fff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              💬 WhatsApp
            </button>
            <button className="adm-modal-close" onClick={onClose} style={{ marginLeft: 8 }}>&times;</button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="adm-modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
          <div
            ref={printRef}
            id="printable-invoice"
            style={{
              background: '#ffffff',
              color: '#1a1a1a',
              padding: '28px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #b8956a', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, color: '#0a0a0a', fontWeight: 800, letterSpacing: '0.04em' }}>
                  {business.name.toUpperCase()}
                </h1>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: '#b8956a', fontWeight: 600 }}>
                  {business.tradeName}
                </p>
                <p style={{ margin: '3px 0', fontSize: 12, color: '#555', maxWidth: 360, lineHeight: 1.4 }}>
                  {business.address}
                </p>
                <p style={{ margin: '2px 0', fontSize: 12, color: '#444' }}>
                  <strong>Phone:</strong> {business.phone} &nbsp;|&nbsp; <strong>Email:</strong> {business.email}
                </p>
                {business.gstin && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#111' }}>
                    <strong style={{ color: '#b8956a' }}>GSTIN:</strong> <strong>{business.gstin}</strong> &nbsp;|&nbsp; <strong>State:</strong> {business.state} ({business.stateCode})
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#111',
                    color: '#b8956a',
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.1em',
                    padding: '5px 14px',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  TAX INVOICE
                </span>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  <div><strong>Invoice #:</strong> <span style={{ fontWeight: 700 }}>{invoiceNumber}</span></div>
                  <div><strong>Date:</strong> {invoiceDate}</div>
                  <div><strong>Place of Supply:</strong> {business.state} ({business.stateCode})</div>
                </div>
              </div>
            </div>

            {/* Bill To & Payment Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 20,
                background: '#faf8f5',
                border: '1px solid #e5ded4',
                padding: '12px 16px',
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              <div>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b8956a', fontWeight: 700 }}>
                  Billed To / Customer:
                </span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginTop: 2 }}>{customerName}</div>
                <div style={{ fontSize: 12, color: '#444' }}><strong>Phone:</strong> {customerPhone || 'N/A'}</div>
                <div style={{ fontSize: 12, color: '#444' }}><strong>Address:</strong> {customerAddress}</div>
                {customerGstin && (
                  <div style={{ fontSize: 12, color: '#111', marginTop: 2 }}>
                    <strong>Customer GSTIN:</strong> {customerGstin}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, borderLeft: '1px solid #e5ded4', paddingLeft: 16 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b8956a', fontWeight: 700 }}>
                  Payment Details:
                </span>
                <div style={{ marginTop: 2 }}>
                  <strong>Payment Mode:</strong> <span style={{ textTransform: 'capitalize' }}>{data.paymentMethod || 'Cash'}</span>
                </div>
                {business.upiId && (
                  <div><strong>UPI ID:</strong> <span style={{ color: '#25d366', fontWeight: 600 }}>{business.upiId}</span></div>
                )}
                {business.bankName && business.accountNumber && (
                  <div>
                    <strong>Bank:</strong> {business.bankName} <br />
                    <strong>A/C:</strong> {business.accountNumber}
                  </div>
                )}
                {business.ifscCode && (
                  <div><strong>IFSC:</strong> {business.ifscCode}</div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f2eee8', color: '#111', borderBottom: '2px solid #b8956a' }}>
                  <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'center', width: 35 }}>#</th>
                  <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'left' }}>Description of Goods / Services</th>
                  <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'center', width: 65 }}>HSN</th>
                  <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'center', width: 65 }}>Qty</th>
                  <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'right', width: 85 }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', fontSize: 11, textAlign: 'right', width: 95 }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.sr} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '9px 10px', fontSize: 12, textAlign: 'center', color: '#666' }}>{it.sr}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, fontWeight: 600, color: '#111' }}>{it.name}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, textAlign: 'center', color: '#666' }}>{it.hsn}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, textAlign: 'center' }}>{it.quantity} {it.unit}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, textAlign: 'right' }}>₹{it.rate.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>₹{it.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary & Tax Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'flex-start' }}>
              <div>
                <div
                  style={{
                    background: '#faf8f5',
                    borderLeft: '3px solid #b8956a',
                    padding: '10px 14px',
                    borderRadius: '0 6px 6px 0',
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>
                    Invoice Amount in Words:
                  </span>
                  <div style={{ color: '#111', fontWeight: 700, marginTop: 2 }}>{amountWords}</div>
                </div>

                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>
                  <strong style={{ color: '#111' }}>Terms &amp; Conditions:</strong>
                  <div style={{ whiteSpace: 'pre-line', marginTop: 2 }}>{business.terms}</div>
                </div>
              </div>

              {/* Totals Table */}
              <div
                style={{
                  border: '1px solid #e0d8cc',
                  borderRadius: 6,
                  overflow: 'hidden',
                  fontSize: 12,
                  background: '#faf8f5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #eae2d6' }}>
                  <span>Sub Total:</span>
                  <strong>₹{grossTotal.toLocaleString('en-IN')}</strong>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #eae2d6', color: '#c00' }}>
                    <span>Discount:</span>
                    <strong>- ₹{discount.toLocaleString('en-IN')}</strong>
                  </div>
                )}

                {isGstEnabled ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #eae2d6', color: '#444' }}>
                      <span>Taxable Value:</span>
                      <span>₹{taxableValue.toLocaleString('en-IN')}</span>
                    </div>
                    {!isInterState ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #eae2d6', color: '#444' }}>
                          <span>CGST ({gstRate / 2}%):</span>
                          <span>₹{cgst.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #eae2d6', color: '#444' }}>
                          <span>SGST ({gstRate / 2}%):</span>
                          <span>₹{sgst.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #eae2d6', color: '#444' }}>
                        <span>IGST ({gstRate}%):</span>
                        <span>₹{igst.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </>
                ) : null}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: '#f2eee8',
                    color: '#0a0a0a',
                    fontWeight: 800,
                    fontSize: 14,
                    borderTop: '2px solid #b8956a',
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: '#b8956a' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, paddingTop: 16, borderTop: '1px solid #eee' }}>
              <div style={{ textAlign: 'center', minWidth: 200 }}>
                <p style={{ fontSize: 12, margin: 0, fontWeight: 700, color: '#111' }}>
                  For {business.name.toUpperCase()}
                </p>
                <div style={{ height: 48 }} />
                <p style={{ fontSize: 11, color: '#555', margin: 0, borderTop: '1px dashed #999', paddingTop: 4 }}>
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="adm-modal-footer" style={{ borderTop: '1px solid #2a2a2a' }}>
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={handlePrint}
            style={{ fontWeight: 700 }}
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* Global Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .adm-modal-overlay, .adm-modal {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .adm-modal-header, .adm-modal-footer, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
