import { useState, useEffect } from 'react';
import api from '../api';
import InvoiceModal from '../components/InvoiceModal';

const GST_RATES = [0, 5, 12, 18, 28];

const INDIAN_STATES = [
  { code: '08', name: 'Rajasthan' },
  { code: '07', name: 'Delhi' },
  { code: '06', name: 'Haryana' },
  { code: '03', name: 'Punjab' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '19', name: 'West Bengal' },
  { code: '10', name: 'Bihar' },
];

export default function GST() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'reports' | 'invoices'

  // Selected sale for invoice preview & print
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

  // Quick custom bill modal state
  const [showQuickBillModal, setShowQuickBillModal] = useState(false);
  const [quickBill, setQuickBill] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: 'Sikar, Rajasthan',
    customerGstin: '',
    items: [
      { productName: 'PVC Wall Panel (High Density)', quantity: 50, sellingPrice: 95, unit: 'sqft' }
    ],
    discount: 0,
    paymentMethod: 'cash',
  });

  // GST Form State
  const [form, setForm] = useState({
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
  });

  // Calculator State
  const [calcAmount, setCalcAmount] = useState('10000');
  const [calcRate, setCalcRate] = useState(18);
  const [calcMode, setCalcMode] = useState('inclusive'); // 'inclusive' or 'exclusive'

  const fetchGstData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gst');
      if (res.data?.success) {
        if (res.data.gst) {
          setForm(prev => ({
            ...prev,
            ...res.data.gst,
          }));
        }
        setStats(res.data.stats);
        setBusinessDetails(res.data.businessDetails);
        setRecentSales(res.data.recentSales || []);
      }
    } catch (err) {
      console.error('Error fetching GST data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGstData();
  }, []);

  const handleStateChange = (e) => {
    const selectedStateCode = e.target.value;
    const found = INDIAN_STATES.find(s => s.code === selectedStateCode);
    if (found) {
      setForm(prev => ({ ...prev, stateCode: found.code, state: found.name }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/gst', form);
      if (res.data?.success) {
        setSuccessMsg('GST settings updated and saved successfully!');
        await fetchGstData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update GST settings');
    } finally {
      setSaving(false);
    }
  };

  // Add Item to Quick Bill
  const addQuickBillItem = () => {
    setQuickBill(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', quantity: 1, sellingPrice: 0, unit: 'sqft' }]
    }));
  };

  const updateQuickBillItem = (idx, field, value) => {
    setQuickBill(prev => {
      const items = [...prev.items];
      items[idx][field] = value;
      return { ...prev, items };
    });
  };

  const removeQuickBillItem = (idx) => {
    setQuickBill(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleGenerateQuickBill = (e) => {
    e.preventDefault();
    const finalAmount = quickBill.items.reduce((s, it) => s + (Number(it.quantity) * Number(it.sellingPrice) || 0), 0) - Number(quickBill.discount || 0);

    const invoiceData = {
      invoiceNumber: `${form.invoicePrefix}${Date.now().toString().slice(-5)}`,
      saleDate: new Date(),
      customerName: quickBill.customerName || 'Customer',
      customerPhone: quickBill.customerPhone,
      address: quickBill.customerAddress,
      customerGstin: quickBill.customerGstin,
      items: quickBill.items.map(it => ({
        productName: it.productName,
        quantity: Number(it.quantity) || 1,
        sellingPrice: Number(it.sellingPrice) || 0,
        unit: it.unit || 'sqft',
        total: (Number(it.quantity) || 1) * (Number(it.sellingPrice) || 0),
        hsnCode: form.defaultHsnCode,
      })),
      discount: Number(quickBill.discount) || 0,
      finalAmount,
      paymentMethod: quickBill.paymentMethod,
    };

    setShowQuickBillModal(false);
    setSelectedInvoiceData(invoiceData);
  };

  // Calculator Output
  const numCalc = Number(calcAmount) || 0;
  let calcTaxable = 0;
  let calcTax = 0;
  if (calcMode === 'inclusive') {
    calcTaxable = Math.round((numCalc / (1 + calcRate / 100)) * 100) / 100;
    calcTax = Math.round((numCalc - calcTaxable) * 100) / 100;
  } else {
    calcTaxable = numCalc;
    calcTax = Math.round((numCalc * (calcRate / 100)) * 100) / 100;
  }

  if (loading) {
    return <div className="adm-loading"><div className="adm-spinner" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="adm-page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="adm-page-title">🧾 GST &amp; Tax Invoicing</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>
            Manage GST registration, configure tax rates, print invoices, and view tax collection reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => setShowQuickBillModal(true)}
            style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ➕ Create &amp; Print Bill
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="adm-alert adm-alert-success" style={{ marginBottom: 16 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="adm-kpi-card" style={{ background: '#191919', padding: '16px 20px', borderRadius: 10, border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Gross Turnover</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#e5e5e5', margin: '4px 0' }}>
            ₹{(stats?.totalSalesAmount || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#b8956a' }}>{stats?.totalSalesCount || 0} Total Sales</div>
        </div>

        <div className="adm-kpi-card" style={{ background: '#191919', padding: '16px 20px', borderRadius: 10, border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Taxable Value</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#b8956a', margin: '4px 0' }}>
            ₹{(stats?.totalTaxable || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>Base value before tax</div>
        </div>

        <div className="adm-kpi-card" style={{ background: '#191919', padding: '16px 20px', borderRadius: 10, border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total GST Collected</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#25d366', margin: '4px 0' }}>
            ₹{(stats?.totalGst || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>
            CGST: ₹{(stats?.cgst || 0).toLocaleString('en-IN')} | SGST: ₹{(stats?.sgst || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="adm-kpi-card" style={{ background: '#191919', padding: '16px 20px', borderRadius: 10, border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current GST Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', margin: '4px 0' }}>
            {form.defaultGstRate}%
          </div>
          <div style={{ fontSize: 11, color: form.enabled ? '#4caf50' : '#ef5350' }}>
            {form.enabled ? '● GST Active' : '○ GST Disabled'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #2a2a2a', marginBottom: 20 }}>
        <button
          className={`adm-btn ${activeTab === 'config' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
          onClick={() => setActiveTab('config')}
          style={{ borderRadius: '6px 6px 0 0', fontWeight: 600 }}
        >
          ⚙️ GST Configuration
        </button>
        <button
          className={`adm-btn ${activeTab === 'invoices' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
          onClick={() => setActiveTab('invoices')}
          style={{ borderRadius: '6px 6px 0 0', fontWeight: 600 }}
        >
          🖨️ Print Bills &amp; Invoices ({recentSales.length})
        </button>
        <button
          className={`adm-btn ${activeTab === 'reports' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
          onClick={() => setActiveTab('reports')}
          style={{ borderRadius: '6px 6px 0 0', fontWeight: 600 }}
        >
          🧮 GST Tax Calculator &amp; Rates
        </button>
      </div>

      {/* TAB 1: GST Configuration Form */}
      {activeTab === 'config' && (
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
            {/* Card 1: Business GST Details */}
            <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: 20 }}>
              <h3 style={{ fontSize: 15, color: '#b8956a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                🏢 Business Registration &amp; GSTIN
              </h3>

              <div className="adm-form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={e => setForm({ ...form, enabled: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#b8956a' }}
                  />
                  <span style={{ color: '#fff', fontWeight: 600 }}>Enable GST on Invoices &amp; Bills</span>
                </label>
              </div>

              <div className="adm-form-group">
                <label>Business GSTIN (15 Digits)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 08AAAAA0000A1Z5"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
                />
                <small style={{ color: '#777', fontSize: 11, marginTop: 3, display: 'block' }}>
                  Leave empty if you are an unregistered dealer under GST composition limit.
                </small>
              </div>

              <div className="adm-form-grid" style={{ marginTop: 12 }}>
                <div className="adm-form-group">
                  <label>Legal Name</label>
                  <input
                    type="text"
                    value={form.legalName}
                    onChange={e => setForm({ ...form, legalName: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Trade Name</label>
                  <input
                    type="text"
                    value={form.tradeName}
                    onChange={e => setForm({ ...form, tradeName: e.target.value })}
                  />
                </div>
              </div>

              <div className="adm-form-grid" style={{ marginTop: 12 }}>
                <div className="adm-form-group">
                  <label>State</label>
                  <select value={form.stateCode} onChange={handleStateChange}>
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-group">
                  <label>State Code</label>
                  <input type="text" value={form.stateCode} readOnly style={{ background: '#111', color: '#888' }} />
                </div>
              </div>
            </div>

            {/* Card 2: Rates & Invoicing Settings */}
            <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: 20 }}>
              <h3 style={{ fontSize: 15, color: '#b8956a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                📊 Default Tax Rates &amp; Codes
              </h3>

              <div className="adm-form-group">
                <label>Default GST Rate (%)</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {GST_RATES.map(rate => (
                    <button
                      key={rate}
                      type="button"
                      className="adm-btn adm-btn-sm"
                      style={{
                        flex: 1,
                        background: form.defaultGstRate === rate ? '#b8956a' : '#222',
                        color: form.defaultGstRate === rate ? '#111' : '#ccc',
                        border: form.defaultGstRate === rate ? 'none' : '1px solid #333',
                        fontWeight: 700,
                      }}
                      onClick={() => setForm({ ...form, defaultGstRate: rate })}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <small style={{ color: '#888', fontSize: 11, display: 'block', marginTop: 4 }}>
                  Standard rate for PVC wall panels &amp; decorative sheets is 18% (CGST 9% + SGST 9%).
                </small>
              </div>

              <div className="adm-form-grid" style={{ marginTop: 14 }}>
                <div className="adm-form-group">
                  <label>Default HSN / SAC Code</label>
                  <input
                    type="text"
                    value={form.defaultHsnCode}
                    onChange={e => setForm({ ...form, defaultHsnCode: e.target.value })}
                    placeholder="3925"
                  />
                  <small style={{ color: '#777', fontSize: 11 }}>3925 = Plastic / PVC Wall Panels</small>
                </div>
                <div className="adm-form-group">
                  <label>Invoice Prefix</label>
                  <input
                    type="text"
                    value={form.invoicePrefix}
                    onChange={e => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })}
                    placeholder="SHI-INV-"
                  />
                </div>
              </div>

              <div className="adm-form-group" style={{ marginTop: 14 }}>
                <label>Invoice Terms &amp; Conditions (Printed on Bill)</label>
                <textarea
                  rows={3}
                  value={form.invoiceTerms}
                  onChange={e => setForm({ ...form, invoiceTerms: e.target.value })}
                  style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '8px 10px', fontSize: 12 }}
                />
              </div>
            </div>

            {/* Card 3: Bank & Payment Details for Bills */}
            <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: 20, gridColumn: '1/-1' }}>
              <h3 style={{ fontSize: 15, color: '#b8956a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                🏦 Bank &amp; UPI Details (Printed on Invoices for Customer Payment)
              </h3>
              <div className="adm-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="adm-form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                  />
                </div>
                <div className="adm-form-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                    placeholder="Account Number"
                  />
                </div>
                <div className="adm-form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={form.ifscCode}
                    onChange={e => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="SBIN0000000"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="adm-form-group">
                  <label>UPI ID (Google Pay / PhonePe)</label>
                  <input
                    type="text"
                    value={form.upiId}
                    onChange={e => setForm({ ...form, upiId: e.target.value })}
                    placeholder="e.g. 8239409535@upi"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              disabled={saving}
              style={{ fontWeight: 700, padding: '12px 28px', fontSize: 14 }}
            >
              {saving ? 'Saving...' : '💾 Save GST Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Recent Bills for Printing & Download */}
      {activeTab === 'invoices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, margin: 0, color: '#e5e5e5' }}>Recent Sales Bills</h3>
            <span style={{ fontSize: 12, color: '#888' }}>Click "Print Bill" or "Download" on any invoice</span>
          </div>

          <div className="adm-table-wrapper">
            <table className="adm-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill / Invoice #</th>
                  <th>Customer Name</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => {
                  const itm = sale.items?.[0] || {};
                  return (
                    <tr key={sale._id}>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(sale.saleDate || sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="adm-td-bold" style={{ color: '#b8956a' }}>
                        {sale.saleNumber || `${form.invoicePrefix}${sale._id.slice(-4).toUpperCase()}`}
                      </td>
                      <td>
                        <strong>{sale.customerName || 'Customer'}</strong>
                        {sale.customerPhone && <div style={{ fontSize: 11, color: '#888' }}>{sale.customerPhone}</div>}
                      </td>
                      <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {itm.productName || 'Material'} {sale.items?.length > 1 ? `(+${sale.items.length - 1} more)` : ''}
                      </td>
                      <td style={{ fontWeight: 700, color: '#25d366' }}>
                        ₹{(sale.finalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          background: sale.saleType === 'cash' ? 'rgba(37,211,102,0.1)' : 'rgba(99,102,241,0.1)',
                          color: sale.saleType === 'cash' ? '#25d366' : '#6366f1'
                        }}>
                          {sale.saleType || 'cash'}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{sale.paymentMethod || 'cash'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="adm-btn adm-btn-sm"
                            style={{ background: '#b8956a', color: '#111', fontWeight: 700 }}
                            onClick={() => setSelectedInvoiceData(sale)}
                          >
                            🖨️ Print Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan="8" className="adm-empty-row">No sales bills found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GST Tax Calculator */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {/* Interactive Calculator */}
          <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: 22 }}>
            <h3 style={{ fontSize: 16, color: '#b8956a', margin: '0 0 16px' }}>🧮 Interactive GST Tax Calculator</h3>

            <div className="adm-form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={calcAmount}
                onChange={e => setCalcAmount(e.target.value)}
                placeholder="Enter amount"
                style={{ fontSize: 16, fontWeight: 700 }}
              />
            </div>

            <div className="adm-form-group" style={{ marginTop: 12 }}>
              <label>Tax Rate</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {GST_RATES.map(r => (
                  <button
                    key={r}
                    type="button"
                    className="adm-btn adm-btn-sm"
                    style={{
                      flex: 1,
                      background: calcRate === r ? '#b8956a' : '#222',
                      color: calcRate === r ? '#111' : '#ccc',
                      border: calcRate === r ? 'none' : '1px solid #333',
                      fontWeight: 700,
                    }}
                    onClick={() => setCalcRate(r)}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            <div className="adm-form-group" style={{ marginTop: 12 }}>
              <label>Calculation Mode</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  style={{
                    flex: 1,
                    background: calcMode === 'inclusive' ? '#25d366' : '#222',
                    color: calcMode === 'inclusive' ? '#fff' : '#ccc',
                    border: 'none',
                    fontWeight: 600,
                  }}
                  onClick={() => setCalcMode('inclusive')}
                >
                  Tax Inclusive (GST included)
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  style={{
                    flex: 1,
                    background: calcMode === 'exclusive' ? '#6366f1' : '#222',
                    color: calcMode === 'exclusive' ? '#fff' : '#ccc',
                    border: 'none',
                    fontWeight: 600,
                  }}
                  onClick={() => setCalcMode('exclusive')}
                >
                  Tax Exclusive (Add GST on top)
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20, background: '#111', padding: 16, borderRadius: 8, border: '1px solid #282828' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                <span style={{ color: '#888' }}>Taxable Base Value:</span>
                <strong style={{ color: '#fff' }}>₹{calcTaxable.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                <span style={{ color: '#888' }}>CGST ({calcRate / 2}%):</span>
                <span style={{ color: '#b8956a' }}>₹{(Math.round((calcTax / 2) * 100) / 100).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                <span style={{ color: '#888' }}>SGST ({calcRate / 2}%):</span>
                <span style={{ color: '#b8956a' }}>₹{(Math.round((calcTax / 2) * 100) / 100).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                <span style={{ color: '#888' }}>Total Tax:</span>
                <strong style={{ color: '#25d366' }}>₹{calcTax.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: 15, fontWeight: 800 }}>
                <span style={{ color: '#e5e5e5' }}>Final Invoice Total:</span>
                <span style={{ color: '#b8956a' }}>
                  ₹{(calcMode === 'inclusive' ? numCalc : calcTaxable + calcTax).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* GST Slabs Info */}
          <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: 22 }}>
            <h3 style={{ fontSize: 16, color: '#b8956a', margin: '0 0 16px' }}>📚 Common Interior Products GST Slabs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: 12, background: '#121212', borderRadius: 6, borderLeft: '3px solid #b8956a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>PVC Wall Panels &amp; Ceiling Profiles</span>
                  <span style={{ color: '#b8956a' }}>18% GST (HSN 3925)</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>CGST 9% + SGST 9% for Intra-state in Rajasthan</div>
              </div>

              <div style={{ padding: 12, background: '#121212', borderRadius: 6, borderLeft: '3px solid #b8956a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>UV Marble Sheets &amp; Acrylic Wall Cladding</span>
                  <span style={{ color: '#b8956a' }}>18% GST (HSN 3920)</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>High gloss scratch-resistant interior sheets</div>
              </div>

              <div style={{ padding: 12, background: '#121212', borderRadius: 6, borderLeft: '3px solid #b8956a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Fluted Louvers &amp; WPC Exterior Cladding</span>
                  <span style={{ color: '#b8956a' }}>18% GST (HSN 3926)</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Architectural wood-plastic composite slats</div>
              </div>

              <div style={{ padding: 12, background: '#121212', borderRadius: 6, borderLeft: '3px solid #b8956a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Installation &amp; Jobwork Labor Contracts</span>
                  <span style={{ color: '#b8956a' }}>18% GST (SAC 9954)</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Composite construction &amp; fitting services</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Custom Bill Generation Modal */}
      {showQuickBillModal && (
        <div className="adm-modal-overlay" onClick={() => setShowQuickBillModal(false)}>
          <div className="adm-modal adm-modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="adm-modal-header">
              <h2>➕ Create &amp; Print Custom GST Bill</h2>
              <button className="adm-modal-close" onClick={() => setShowQuickBillModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleGenerateQuickBill}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      required
                      value={quickBill.customerName}
                      onChange={e => setQuickBill({ ...quickBill, customerName: e.target.value })}
                      placeholder="e.g. Ramesh Saini"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Customer Phone</label>
                    <input
                      type="tel"
                      value={quickBill.customerPhone}
                      onChange={e => setQuickBill({ ...quickBill, customerPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Customer Address</label>
                    <input
                      type="text"
                      value={quickBill.customerAddress}
                      onChange={e => setQuickBill({ ...quickBill, customerAddress: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Customer GSTIN (Optional B2B)</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={quickBill.customerGstin}
                      onChange={e => setQuickBill({ ...quickBill, customerGstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 08BBBBB1111B1Z2"
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontWeight: 600, color: '#b8956a' }}>Bill Items</label>
                    <button type="button" className="adm-btn adm-btn-sm" onClick={addQuickBillItem}>+ Add Item</button>
                  </div>
                  {quickBill.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={it.productName}
                        onChange={e => updateQuickBillItem(idx, 'productName', e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={e => updateQuickBillItem(idx, 'quantity', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={it.unit}
                        onChange={e => updateQuickBillItem(idx, 'unit', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Rate ₹"
                        value={it.sellingPrice}
                        onChange={e => updateQuickBillItem(idx, 'sellingPrice', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-danger"
                        onClick={() => removeQuickBillItem(idx)}
                        disabled={quickBill.items.length === 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="adm-form-grid" style={{ marginTop: 14 }}>
                  <div className="adm-form-group">
                    <label>Discount (₹)</label>
                    <input
                      type="number"
                      value={quickBill.discount}
                      onChange={e => setQuickBill({ ...quickBill, discount: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Payment Method</label>
                    <select
                      value={quickBill.paymentMethod}
                      onChange={e => setQuickBill({ ...quickBill, paymentMethod: e.target.value })}
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI / Online</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setShowQuickBillModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ fontWeight: 700 }}>
                  🧾 Preview &amp; Print Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal for Printing & Download */}
      {selectedInvoiceData && (
        <InvoiceModal
          data={selectedInvoiceData}
          gstSettings={form}
          businessDetails={businessDetails}
          onClose={() => setSelectedInvoiceData(null)}
        />
      )}
    </div>
  );
}
