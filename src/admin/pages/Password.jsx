import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function generateRandomPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const nums = '23456789';
  const special = '@#$&*!';
  let pass = 'StarHome@';
  for (let i = 0; i < 4; i++) {
    pass += nums[Math.floor(Math.random() * nums.length)];
  }
  pass += special[Math.floor(Math.random() * special.length)];
  return pass;
}

export default function Password() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('authority'); // 'authority' | 'change' | 'generator'
  
  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminName, setAdminName] = useState(user?.name || 'Admin');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@starhomeinterior.in');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Users & Authority management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', email: '', password: '', role: 'admin', isAuthorized: true });
  const [addingUser, setAddingUser] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetPassInput, setResetPassInput] = useState('');
  const [savingReset, setSavingReset] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  // Generator state
  const [generatedPass, setGeneratedPass] = useState(generateRandomPassword());
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'authority') {
      fetchUsers();
    }
  }, [activeTab]);

  // Password strength calculation
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '#444' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 25, text: 'Kamzor (Weak)', color: '#ef4444' };
    if (score === 3) return { score: 50, text: 'Theek-thaak (Medium)', color: '#f59e0b' };
    if (score === 4) return { score: 75, text: 'Achha (Good)', color: '#3b82f6' };
    return { score: 100, text: 'Bahut Majboot (Strong)', color: '#10b981' };
  };

  const strength = getStrength(newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Naya password kam se kam 4 akshar ka hona chahiye.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New Password aur Confirm Password aapas me match nahi ho rahe hain.' });
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: currentPassword || undefined,
        newPassword,
        name: adminName,
        email: adminEmail,
      });

      if (res.data?.success) {
        setMessage({ type: 'success', text: '✅ Password safalta-purvak update ho gaya hai! Agli baar isi naye password se login karein.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.data?.message || 'Password change karne me samasya aayi.' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Server error: Password update nahi ho saka.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Login Authority (Allow or Revoke access for an email)
  const handleToggleAuthority = async (targetUser) => {
    const isCurrentlyAuth = targetUser.isAuthorized !== false && targetUser.status !== 'suspended';
    const newAuthState = !isCurrentlyAuth;

    if (targetUser._id === user?.id && !newAuthState) {
      alert('Aap apna khud ka account Block / Unauthorized nahi kar sakte.');
      return;
    }

    setTogglingId(targetUser._id);
    setActionAlert(null);

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) =>
        u._id === targetUser._id
          ? { ...u, isAuthorized: newAuthState, status: newAuthState ? 'active' : 'suspended' }
          : u
      )
    );

    try {
      const res = await api.put(`/auth/users/${targetUser._id}/authority`, {
        isAuthorized: newAuthState,
      });
      if (res.data?.success) {
        setActionAlert({
          type: 'success',
          text: `✅ ${targetUser.email} ki Login Authority ab ${newAuthState ? 'ALLOWED (Authorized)' : 'BLOCKED (Suspended)'} hai!`,
        });
      }
    } catch (err) {
      fetchUsers(); // Revert
      setActionAlert({
        type: 'error',
        text: err.response?.data?.message || 'Authority update nahi ho saki.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setActionAlert(null);
    try {
      const res = await api.post('/auth/users', newAccount);
      if (res.data?.success) {
        setShowAddModal(false);
        setNewAccount({ name: '', email: '', password: '', role: 'admin', isAuthorized: true });
        fetchUsers();
        setActionAlert({
          type: 'success',
          text: `✅ Naya account ${newAccount.email} kamyabi se add aur authorize ho gaya!`,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Account banane me error aayi');
    } finally {
      setAddingUser(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassInput || resetPassInput.length < 4) {
      alert('Password kam se kam 4 akshar ka hona chahiye');
      return;
    }
    setSavingReset(true);
    try {
      const res = await api.put(`/auth/users/${resetTargetUser._id}/password`, {
        password: resetPassInput,
      });
      if (res.data?.success) {
        setResetTargetUser(null);
        setResetPassInput('');
        setActionAlert({
          type: 'success',
          text: `✅ ${resetTargetUser.name} (${resetTargetUser.email}) ka password safalta-purvak update ho gaya!`,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Password update nahi ho saka');
    } finally {
      setSavingReset(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!confirm(`Kya aap sach me ${u.name} (${u.email}) ka account delete karna chahte hain?`)) return;
    try {
      const res = await api.delete(`/auth/users/${u._id}`);
      if (res.data?.success) {
        fetchUsers();
        setActionAlert({
          type: 'success',
          text: `Account ${u.email} delete ho gaya.`,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete nahi ho saka');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const authorizedCount = users.filter((u) => u.isAuthorized !== false && u.status !== 'suspended').length;
  const blockedCount = users.filter((u) => u.isAuthorized === false || u.status === 'suspended').length;

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', paddingBottom: 50 }}>
      {/* Page Header */}
      <div className="adm-page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🛡️</span> Authority Control & Login Security
          </h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
            Tay karein kaun si email admin panel me login kar sakti hai. 1-click me kisi bhi email ka login access band ya shuru karein.
          </p>
        </div>
      </div>

      {actionAlert && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 13,
          fontWeight: 600,
          background: actionAlert.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${actionAlert.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: actionAlert.type === 'success' ? '#34d399' : '#f87171',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{actionAlert.text}</span>
          <button
            onClick={() => setActionAlert(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 14 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="adm-tabs" style={{ marginBottom: 24, borderBottom: '1px solid #222', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          className={`adm-tab-btn ${activeTab === 'authority' ? 'active' : ''}`}
          onClick={() => { setActiveTab('authority'); setMessage(null); }}
        >
          🛡️ Authority Control System (लॉगिन अनुमति नियंत्रण)
        </button>
        <button
          className={`adm-tab-btn ${activeTab === 'change' ? 'active' : ''}`}
          onClick={() => { setActiveTab('change'); setMessage(null); }}
        >
          🔑 Change Password (पासवर्ड बदलें)
        </button>
        <button
          className={`adm-tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => { setActiveTab('generator'); setMessage(null); }}
        >
          🎲 Strong Password Generator
        </button>
      </div>

      {/* ================= TAB 1: AUTHORITY CONTROL SYSTEM ================= */}
      {activeTab === 'authority' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            <div style={{ background: '#121212', border: '1px solid #262626', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Total Registered Accounts</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f3f4f6' }}>{users.length}</div>
              <div style={{ fontSize: 11, color: '#b8956a', marginTop: 4 }}>Admin & Staff users</div>
            </div>
            <div style={{ background: '#121212', border: '1px solid #10b98133', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Authorized for Login (सक्रिय)</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>{authorizedCount}</div>
              <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>🟢 Sirf ye emails login kar sakti hain</div>
            </div>
            <div style={{ background: '#121212', border: '1px solid #ef444433', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Blocked / Suspended (अवरुद्ध)</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444' }}>{blockedCount}</div>
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>🔴 Login permission denied</div>
            </div>
          </div>

          {/* Authority Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(217,119,6,0.1), rgba(180,83,9,0.05))',
            border: '1px solid rgba(217,119,6,0.3)',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 14, marginBottom: 4 }}>
                Authority Control Feature (लॉगिन अनुमति नियंत्रण)
              </div>
              <div style={{ color: '#d1d5db', fontSize: 12, lineHeight: 1.6 }}>
                Aap jis email ko chahein keval vahi email Star Home Interior Admin Portal me login kar sakegi. 
                Kisi bhi email ka switch <strong>OFF (🔴 Blocked)</strong> karne par vo sahi password dalne par bhi login nahi kar sakega.
              </div>
            </div>
          </div>

          {/* Top Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f5f0eb', margin: 0 }}>
              Authorized Emails & Access Permissions
            </h2>
            <button
              className="adm-btn"
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
              }}
            >
              <span>➕</span> Authorize New Email (नया ईमेल जोड़ें)
            </button>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Users & Permissions load ho rahe hain...</div>
          ) : (
            <div className="adm-table-wrapper" style={{ background: '#121212', borderRadius: 10, border: '1px solid #262626', overflowX: 'auto' }}>
              <table className="adm-data-table">
                <thead>
                  <tr>
                    <th>Name & Email</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th style={{ textAlign: 'center' }}>Login Authority</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isAuth = u.isAuthorized !== false && u.status !== 'suspended';
                    const isSelf = u._id === user?.id;

                    return (
                      <tr key={u._id} style={{ background: !isAuth ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{u.name}</span>
                            {isSelf && (
                              <span style={{ fontSize: 10, background: '#374151', color: '#9ca3af', padding: '1px 6px', borderRadius: 4 }}>
                                You (Master)
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#b8956a', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>{u.email}</div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: u.role === 'admin' ? 'rgba(184,149,106,0.2)' : 'rgba(99,102,241,0.2)',
                            color: u.role === 'admin' ? '#b8956a' : '#818cf8',
                          }}>
                            {u.role || 'admin'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#9ca3af' }}>
                          {u.lastLogin ? (
                            <div>
                              <div>{new Date(u.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                              <div style={{ fontSize: 10, color: '#6b7280' }}>
                                {new Date(u.lastLogin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({u.loginCount || 1} logins)
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#6b7280' }}>Never logged in</span>
                          )}
                        </td>
                        {/* 1-Click Authority Toggle */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleToggleAuthority(u)}
                              disabled={isSelf || togglingId === u._id}
                              title={isSelf ? 'Apna account self-block nahi kar sakte' : isAuth ? 'Click karke Login Block karein' : 'Click karke Login Allow karein'}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                borderRadius: 20,
                                border: 'none',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                background: isAuth ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: isAuth ? '#10b981' : '#f87171',
                                border: `1px solid ${isAuth ? '#10b981' : '#ef4444'}`,
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <span style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: isAuth ? '#10b981' : '#ef4444',
                                display: 'inline-block',
                              }} />
                              {isAuth ? '🟢 AUTHORIZED (Login ON)' : '🔴 BLOCKED (Login OFF)'}
                            </button>
                            <span style={{ fontSize: 10, color: '#6b7280' }}>
                              {isAuth ? 'Login allowed' : 'Login denied'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="adm-btn adm-btn-sm"
                              style={{ background: '#1f2937', color: '#fbbf24', border: '1px solid #374151', fontSize: 11 }}
                              onClick={() => { setResetTargetUser(u); setResetPassInput(''); }}
                              title="Password badlein"
                            >
                              🔑 Reset Pass
                            </button>
                            {users.length > 1 && !isSelf && (
                              <button
                                className="adm-btn adm-btn-sm adm-btn-danger"
                                style={{ fontSize: 11 }}
                                onClick={() => handleDeleteUser(u)}
                                title="Account delete karein"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                        Default Admin Account Active hai (`admin@starhomeinterior.in`). Naya account add karne ke liye upar button dabayein.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: CHANGE MY PASSWORD ================= */}
      {activeTab === 'change' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Main Form Card */}
          <div style={{ background: '#121212', border: '1px solid #262626', borderRadius: 12, padding: '24px 20px' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f5f0eb', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔒</span> Apna Admin Password Badlein
            </h2>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              Naya password set karne ke baad aap usi se login kar sakenge.
            </p>

            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                fontWeight: 600,
                background: message.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                color: message.type === 'success' ? '#10b981' : '#f87171',
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="adm-form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#bbb', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Password (Purana Password)</span>
                  <span style={{ color: '#666', fontSize: 11 }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Pehle wala password daalein (agar pata ho)"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer' }}
                  >
                    {showCurrent ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="adm-form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#bbb' }}>Naya Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Naya password likhein (min 4 akshar)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer' }}
                  >
                    {showNew ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                {newPassword && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: '#888' }}>Password Strength:</span>
                      <span style={{ color: strength.color, fontWeight: 700 }}>{strength.text}</span>
                    </div>
                    <div style={{ height: 4, background: '#222', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${strength.score}%`, background: strength.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="adm-form-group" style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: '#bbb' }}>Confirm Naya Password *</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Upar wala naya password dobara likhein"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ borderTop: '1px solid #222', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#eee', marginBottom: 12 }}>
                  Admin Details (Profile Info)
                </div>
                <div className="adm-form-group" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: '#888' }}>Admin Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Star Home Admin"
                  />
                </div>
                <div className="adm-form-group">
                  <label style={{ fontSize: 12, color: '#888' }}>Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. admin@starhomeinterior.in"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="adm-btn adm-btn-primary adm-btn-full"
                disabled={saving}
                style={{ padding: '12px', fontWeight: 700 }}
              >
                {saving ? 'Saving...' : '💾 Naya Password Save Karein'}
              </button>
            </form>
          </div>

          {/* Quick tips card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#121212', border: '1px solid #262626', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#b8956a', marginBottom: 10 }}>
                💡 Suraksha Niyam (Security Tips)
              </h3>
              <ul style={{ fontSize: 12, color: '#999', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
                <li>Password me kam se kam ek bada akshar (A-Z) aur ek number (0-9) shamil karein.</li>
                <li>Star Home Interior admin panel me kabhi aam passwords jaise 123456 ya password na rakhein.</li>
                <li>Resend Email OTP feature se aap kisi bhi waqt apna password login page par recover kar sakte hain.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PASSWORD GENERATOR ================= */}
      {activeTab === 'generator' && (
        <div style={{ background: '#121212', border: '1px solid #262626', borderRadius: 12, padding: 24, maxWidth: 550 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f5f0eb', marginBottom: 8 }}>
            🎲 Instant Strong Password Generator
          </h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
            Ek-click me naya strong password banayein aur copy karke istemal karein.
          </p>

          <div style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: 8,
            padding: '16px 20px',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2,
            color: '#10b981',
            textAlign: 'center',
            marginBottom: 16,
            wordBreak: 'break-all',
          }}>
            {generatedPass}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="adm-btn"
              onClick={() => copyToClipboard(generatedPass)}
              style={{ background: copied ? '#10b981' : '#b8956a', color: '#000', fontWeight: 700, flex: 1, padding: 12 }}
            >
              {copied ? '✅ Copied to Clipboard!' : '📋 Copy Password'}
            </button>
            <button
              className="adm-btn"
              onClick={() => setGeneratedPass(generateRandomPassword())}
              style={{ background: '#262626', color: '#fff', padding: 12 }}
            >
              🔄 Naya Banayein
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUTHORIZE NEW EMAIL ================= */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, background: '#111827', border: '1px solid #374151' }}>
            <div className="adm-modal-header" style={{ borderBottom: '1px solid #374151' }}>
              <h2 style={{ color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>➕</span> Authorize New Email (नया खाता अधिकृत करें)
              </h2>
              <button className="adm-modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="adm-modal-body">
                <div className="adm-form-group" style={{ marginBottom: 12 }}>
                  <label style={{ color: '#d1d5db' }}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahesh Kumar"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    required
                  />
                </div>
                <div className="adm-form-group" style={{ marginBottom: 12 }}>
                  <label style={{ color: '#d1d5db' }}>Email / Login Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. mahesh@starhomeinterior.in"
                    value={newAccount.email}
                    onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                    Is email ko admin panel me login karne ki anumati di jayegi.
                  </span>
                </div>
                <div className="adm-form-group" style={{ marginBottom: 12 }}>
                  <label style={{ color: '#d1d5db' }}>Initial Password *</label>
                  <input
                    type="text"
                    placeholder="Kam se kam 4 akshar"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    required
                  />
                </div>
                <div className="adm-form-group" style={{ marginBottom: 14 }}>
                  <label style={{ color: '#d1d5db' }}>Role</label>
                  <select
                    value={newAccount.role}
                    onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
                  >
                    <option value="admin">Admin (Full Control)</option>
                    <option value="manager">Manager (Orders & Sales)</option>
                  </select>
                </div>
                <div style={{ background: '#1f2937', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="authCheck"
                    checked={newAccount.isAuthorized}
                    onChange={(e) => setNewAccount({ ...newAccount, isAuthorized: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="authCheck" style={{ margin: 0, fontSize: 12, color: '#f3f4f6', cursor: 'pointer' }}>
                    <strong>Immediate Login Permission Allow Karein</strong> (Authorized)
                  </label>
                </div>
              </div>
              <div className="adm-modal-footer" style={{ borderTop: '1px solid #374151' }}>
                <button type="button" className="adm-btn" onClick={() => setShowAddModal(false)} style={{ background: '#262626', color: '#fff' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingUser} className="adm-btn" style={{ background: '#10b981', color: '#fff', fontWeight: 700 }}>
                  {addingUser ? 'Authorizing...' : 'Authorize & Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET PASSWORD FOR USER ================= */}
      {resetTargetUser && (
        <div className="adm-modal-overlay" onClick={() => setResetTargetUser(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="adm-modal-header">
              <h2>🔑 Password Reset: {resetTargetUser.name}</h2>
              <button className="adm-modal-close" onClick={() => setResetTargetUser(null)}>&times;</button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="adm-modal-body">
                <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                  User <b>{resetTargetUser.email}</b> ke liye naya password daalein:
                </p>
                <div className="adm-form-group">
                  <label>Naya Password *</label>
                  <input
                    type="text"
                    placeholder="Naya password likhein"
                    value={resetPassInput}
                    onChange={(e) => setResetPassInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn" onClick={() => setResetTargetUser(null)} style={{ background: '#262626', color: '#fff' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingReset} className="adm-btn" style={{ background: '#b8956a', color: '#000', fontWeight: 700 }}>
                  {savingReset ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
