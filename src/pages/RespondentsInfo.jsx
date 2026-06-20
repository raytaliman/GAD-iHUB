import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronLeft, ChevronRight, X, User, Baby, Phone, Calendar, Building2, Download, Printer, Edit3, Save, Plus, Trash2, CheckCircle } from 'lucide-react';
import * as QRCode from 'qrcode';
import dostLogo from '../assets/dost_logo.png';
import gadLogo from '../assets/logo.png';
import { fetchAllRegistrations, updateRegistration, formatRespondents, deleteRegistration } from '../lib/data';




const formatOfficeUnit = (r) => {
  if (!r) return '–';
  const address = (r.office_unit_address || '').trim();
  const other = (r.office_unit_other || '').trim();
  
  if (!address && !other) return '–';
  if (address.toLowerCase() === 'others' || !address) return other || '–';
  if (!other || address.toLowerCase() === other.toLowerCase()) return address;
  return `${address} (${other})`;
};

/**
 * Modal component that displays detailed information about a specific respondent, 
 * including their contact details, office, and all registered children.
 * 
 * @param {Object} props
 * @param {Object} props.respondent - The formatted respondent object to display.
 * @param {Function} props.onClose - Callback to close the modal.
 */
function RespondentDetailsModal({ respondent: initialRespondent, allRespondents = [], onClose, onUpdated, onDelete }) {
  if (!initialRespondent) return null;

  const [respondent, setRespondent] = useState(initialRespondent);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (respondent) {
      QRCode.toDataURL(respondent.code || 'N/A', {
        width: 250, margin: 2,
        color: { dark: '#7030a0', light: '#ffffff' }
      }).then(setQrUrl).catch(() => {});
    }
  }, [respondent]);

  const toDateInput = (val) => {
    if (!val) return '';
    // Accept yyyy-MM-dd directly; strip time from ISO datetime strings
    const s = typeof val === 'string' ? val : String(val);
    return s.slice(0, 10); // "yyyy-MM-dd"
  };

  const openEdit = () => {
    setForm({
      parent_name: respondent.parent_name || '',
      sex: respondent.sex || '',
      contact_number: respondent.contact_number || '',
      country_code: respondent.country_code || '',
      email: respondent.email || '',
      birthdate: toDateInput(respondent.birthdate),
      client_type: respondent.client_type || '',
      office_unit_address: respondent.office_unit_address || '',
      office_unit_other: respondent.office_unit_other || '',
      barangay: respondent.barangay || '',
      city: respondent.city || '',
      province: respondent.province || '',
      children: Array.isArray(respondent.children) ? respondent.children.map(c => ({ ...c })) : [],
    });
    setSaveError('');
    setSaveSuccess(false);
    setEditMode(true);
  };

  const cancelEdit = () => { setEditMode(false); setSaveError(''); };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addChild = () => setForm(f => ({ ...f, children: [...f.children, { name: '', age: '', sex: '' }] }));
  const removeChild = (i) => setForm(f => ({ ...f, children: f.children.filter((_, idx) => idx !== i) }));
  const setChild = (i, key, val) => setForm(f => ({
    ...f,
    children: f.children.map((c, idx) => idx === i ? { ...c, [key]: val } : c),
  }));

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      const updated = await updateRegistration(respondent.id, {
        parent_name: form.parent_name,
        sex: form.sex,
        contact_number: form.contact_number,
        country_code: form.country_code,
        email: form.email,
        birthdate: form.birthdate || null,
        client_type: form.client_type,
        office_unit_address: form.office_unit_address,
        office_unit_other: form.office_unit_other,
        barangay: form.barangay,
        city: form.city,
        province: form.province,
        children: form.children.filter(c => c.name.trim()),
      });
      const merged = { ...respondent, ...updated, children: updated.children ?? form.children };
      setRespondent(merged);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onUpdated) onUpdated(merged);
    } catch (e) {
      setSaveError(e?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Visitation history
  const visits = useMemo(() => {
    return allRespondents
      .filter(r => {
        const matchPhone = respondent.contact_number && r.contact_number === respondent.contact_number;
        const matchEmail = respondent.email && r.email && r.email.toLowerCase() === respondent.email.toLowerCase();
        const matchName = respondent.parent_name && r.parent_name && r.parent_name.toLowerCase() === respondent.parent_name.toLowerCase();
        return matchPhone || matchEmail || matchName;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(r => ({
        date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        purpose: Array.isArray(r.children) && r.children.length > 0 ? 'Innovation Hub Access & GAD Childcare Support' : 'Innovation Hub Access',
        surveyAnswered: !!r.eval_id,
        children: Array.isArray(r.children) ? r.children.map(c => c.name).filter(Boolean) : [],
      }));
  }, [respondent, allRespondents]);

  const printIDCard = async () => {
    const toBase64 = (imgSrc) => new Promise((resolve) => {
      if (!imgSrc || imgSrc.startsWith('data:')) { resolve(imgSrc); return; }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; ctx.drawImage(image, 0, 0); resolve(canvas.toDataURL('image/png')); };
      image.onerror = () => resolve(imgSrc);
      image.src = imgSrc;
    });
    const cardEl = document.getElementById('gad-ihub-id-card-preview');
    const allImgs = cardEl ? Array.from(cardEl.querySelectorAll('img')) : [];
    const dostImg = allImgs.find(i => i.alt === 'DOST Logo');
    const qrImg   = allImgs.find(i => i.alt === 'ID QR code');
    const gadImg  = allImgs.find(i => i.alt === 'GAD iHUB Logo');
    const [dostSrc, qrSrc, gadSrc] = await Promise.all([
      dostImg ? toBase64(dostImg.src) : Promise.resolve(''),
      qrImg   ? toBase64(qrImg.src)   : Promise.resolve(''),
      gadImg  ? toBase64(gadImg.src)  : Promise.resolve(''),
    ]);
    const contactFull = `${respondent.country_code ? respondent.country_code + ' ' : ''}${respondent.contact_number || '–'}`;
    const email = respondent.email || '–';
    const name  = respondent.parent_name || '–';
    const code  = respondent.code || 'N/A';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>ID Card – ${code}</title><meta charset="utf-8"/>
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 20mm; box-sizing: border-box; }
  .card { width: 85.6mm; height: 54mm; box-sizing: border-box; border: 0.4mm solid #cbd5e1; border-radius: 3mm; background: #fff; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 2.5mm 3mm 2.5mm 7mm; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1e293b; }
  .accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4mm; background: #7030a0; }
  .hdr { display: flex; align-items: center; gap: 2mm; padding-bottom: 1.5mm; border-bottom: 0.25mm solid #e2e8f0; }
  .hdr img { width: 8mm; height: 8mm; object-fit: contain; flex-shrink: 0; }
  .hdr-txt { display: flex; flex-direction: column; gap: 0.3mm; }
  .hdr-txt .s { font-size: 4.2pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
  .hdr-txt .b { font-size: 5.5pt; font-weight: 900; color: #1e293b; text-transform: uppercase; }
  .hdr-txt .l { font-size: 3.8pt; font-weight: 600; color: #94a3b8; }
  .body { display: flex; align-items: center; gap: 2mm; flex: 1; padding: 1.5mm 0; }
  .fields { flex: 1; display: flex; flex-direction: column; gap: 1.4mm; min-width: 0; }
  .field label { display: block; font-size: 3.8pt; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3mm; }
  .field .v { display: block; font-size: 7pt; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 39mm; }
  .field .v.sm { font-size: 5pt; }
  .qr-box { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .qr-box img { width: 22mm; height: 22mm; object-fit: contain; display: block; }
  .qr-lbl { font-size: 3.5pt; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.5mm; text-align: center; }
  .qr-lbl span { color: #7030a0; }
  .ftr { display: flex; align-items: center; justify-content: space-between; padding-top: 1.5mm; border-top: 0.25mm solid #e2e8f0; }
  .ftr img { height: 6mm; object-fit: contain; }
  .ftr .scan { font-size: 3.5pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
</style></head>
<body><div class="page"><div class="card"><div class="accent"></div>
  <div class="hdr"><img src="${dostSrc}" alt="DOST"/><div class="hdr-txt"><span class="s">Republic of the Philippines</span><span class="b">Department of Science &amp; Technology</span><span class="s">Ilocos Region</span><span class="l">City of San Fernando, La Union</span></div></div>
  <div class="body"><div class="fields">
    <div class="field"><label>Parent / Guardian</label><span class="v">${name}</span></div>
    <div class="field"><label>Contact Number</label><span class="v">${contactFull}</span></div>
    <div class="field"><label>Email Address</label><span class="v sm">${email}</span></div>
  </div>
  <div class="qr-box">${qrSrc ? `<img src="${qrSrc}" alt="QR"/>` : '<div style="width:22mm;height:22mm;background:#f1f5f9;border-radius:2mm;"></div>'}<div class="qr-lbl">Code ID: <span>${code}</span></div></div>
  </div>
  <div class="ftr"><img src="${gadSrc}" alt="GAD iHUB"/><span class="scan">Scan to Check-In</span></div>
</div></div>
<script>window.onload=function(){setTimeout(function(){window.print();window.close();},600);};</script>
</body></html>`);
    printWindow.document.close();
  };

  const inputCls = 'w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-[#7030a0] transition-all';
  const labelCls = 'text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-slate-100 animate-scale-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-violet-100/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-100/50 flex items-center justify-center text-[#7030a0]">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg tracking-tight">Registration Details</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {editMode ? 'Edit Mode — make changes below' : 'Comprehensive Registration Information'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
                <CheckCircle size={13} /> Saved!
              </span>
            )}
            <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-[#7030a0] text-white px-4 py-2 rounded-2xl shadow-md shadow-violet-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-100">Code ID:</span>
              <span className="text-sm font-black tracking-widest leading-none">{respondent.code || 'N/A'}</span>
            </div>
            {!editMode ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(respondent.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold transition-all border border-red-200 hover:border-red-300 animate-in fade-in duration-200"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <button
                  type="button"
                  onClick={openEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-[#7030a0] text-xs font-bold transition-all border border-slate-200 hover:border-violet-200"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={cancelEdit} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all border border-slate-200">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-[#7030a0] text-white text-xs font-bold shadow-md shadow-violet-200 hover:from-violet-700 hover:to-[#60288c] disabled:opacity-60 transition-all"
                >
                  {saving ? <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Save size={13} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200">
              <X size={18} />
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold shrink-0">
            {saveError}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

            {/* Left Pane */}
            <div className="lg:col-span-3 p-6 space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Registration Details</h4>

                {editMode ? (
                  /* ── EDIT FORM ── */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Parent / Guardian</label>
                      <input className={inputCls} value={form.parent_name} onChange={e => setField('parent_name', e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className={labelCls}>Sex</label>
                      <select className={inputCls} value={form.sex} onChange={e => setField('sex', e.target.value)}>
                        <option value="">— Select —</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Country Code</label>
                      <input className={inputCls} value={form.country_code} onChange={e => setField('country_code', e.target.value)} placeholder="+63" />
                    </div>
                    <div>
                      <label className={labelCls}>Contact Number</label>
                      <input className={inputCls} value={form.contact_number} onChange={e => setField('contact_number', e.target.value)} placeholder="09xxxxxxxxx" />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Email Address</label>
                      <input className={inputCls} type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className={labelCls}>Birthdate</label>
                      <input className={inputCls} type="date" value={form.birthdate} onChange={e => setField('birthdate', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Client Type</label>
                      <input className={inputCls} value={form.client_type} onChange={e => setField('client_type', e.target.value)} placeholder="e.g. Student, Employee…" />
                    </div>
                    <div>
                      <label className={labelCls}>Office / Unit</label>
                      <input className={inputCls} value={form.office_unit_address} onChange={e => setField('office_unit_address', e.target.value)} placeholder="Office or unit name" />
                    </div>
                    <div>
                      <label className={labelCls}>Office (Other)</label>
                      <input className={inputCls} value={form.office_unit_other} onChange={e => setField('office_unit_other', e.target.value)} placeholder="If 'Others'" />
                    </div>
                    <div>
                      <label className={labelCls}>Barangay</label>
                      <input className={inputCls} value={form.barangay} onChange={e => setField('barangay', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>City / Municipality</label>
                      <input className={inputCls} value={form.city} onChange={e => setField('city', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Province</label>
                      <input className={inputCls} value={form.province} onChange={e => setField('province', e.target.value)} />
                    </div>
                  </div>
                ) : (
                  /* ── VIEW MODE ── */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: <User size={15} />, label: 'Parent / Guardian', value: respondent.parent_name },
                      { icon: <User size={15} />, label: 'Sex', value: respondent.sex },
                      { icon: <Phone size={15} />, label: 'Contact Details', value: `${respondent.country_code ? respondent.country_code + ' ' : ''}${respondent.contact_number || '–'}` },
                      { icon: <Calendar size={15} />, label: 'Email', value: respondent.email },
                      { icon: <Calendar size={15} />, label: 'Birthdate', value: respondent.birthdate ? new Date(respondent.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null },
                      { icon: <Calendar size={15} />, label: 'Date Registered', value: respondent.dateOfUseFormatted },
                      { icon: <Building2 size={15} />, label: 'Client Type', value: respondent.client_type },
                      { icon: <Building2 size={15} />, label: 'Office / Unit', value: formatOfficeUnit(respondent) },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#7030a0]">{icon}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{value || '–'}</p>
                      </div>
                    ))}
                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="text-[#7030a0]" size={15} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geographic Address</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {[respondent.barangay, respondent.city, respondent.province].filter(Boolean).join(', ') || '–'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Children Section */}
              <div className="bg-gradient-to-br from-violet-50/20 to-violet-100/10 rounded-2xl p-5 border border-violet-100/80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Baby className="text-[#7030a0]" size={20} />
                    <h4 className="font-bold text-slate-800 tracking-tight">Registered Children</h4>
                  </div>
                  {editMode && (
                    <button
                      type="button"
                      onClick={addChild}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-100/60 text-[#7030a0] text-[11px] font-bold hover:bg-violet-200/50 transition-all border border-violet-200/50"
                    >
                      <Plus size={12} /> Add Child
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {editMode ? (
                    form.children.length === 0 ? (
                      <div className="bg-white/50 border border-dashed border-violet-200 rounded-xl p-5 text-center">
                        <p className="text-slate-400 text-xs italic">No children added. Click "Add Child" to add one.</p>
                      </div>
                    ) : (
                      form.children.map((child, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-[#7030a0] uppercase tracking-wider">Child {idx + 1}</span>
                            <button type="button" onClick={() => removeChild(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3 sm:col-span-1">
                              <label className={labelCls}>Name</label>
                              <input className={inputCls} value={child.name} onChange={e => setChild(idx, 'name', e.target.value)} placeholder="Child's name" />
                            </div>
                            <div>
                              <label className={labelCls}>Age</label>
                              <input className={inputCls} type="number" min="0" max="17" value={child.age} onChange={e => setChild(idx, 'age', e.target.value)} placeholder="Age" />
                            </div>
                            <div>
                              <label className={labelCls}>Sex</label>
                              <select className={inputCls} value={child.sex} onChange={e => setChild(idx, 'sex', e.target.value)}>
                                <option value="">—</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    Array.isArray(respondent.children) && respondent.children.length > 0 ? (
                      respondent.children.map((child, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-50 text-[#7030a0] flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 flex flex-wrap items-baseline gap-1.5">
                                <span>{child.name || 'Untitled Child'}</span>
                                <span className="text-[10px] text-slate-400 font-semibold italic">({child.age} {parseInt(child.age) === 1 ? 'year old' : 'years old'})</span>
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100/80 uppercase">{child.sex}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white/50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                        <p className="text-slate-400 text-xs italic">No child information recorded</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Pane - ID Card & Visitation History */}
            <div className="lg:col-span-2 p-6 bg-slate-50/30 space-y-6">
              {/* ID Card Preview */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100/80 space-y-4 shadow-sm">
                <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Access Pass ID Preview</h5>
                <div id="gad-ihub-id-card-preview" className="relative w-[350px] max-w-full rounded-xl bg-white text-slate-800 pt-2.5 pb-2 pr-3 pl-6 shadow-md border border-slate-200 select-none flex flex-col gap-1.5 mx-auto">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-[#7030a0]" />
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 z-10">
                    <img src={dostLogo} alt="DOST Logo" className="w-7 h-7 object-contain shrink-0" />
                    <div className="space-y-0.5 text-slate-500 font-bold uppercase tracking-wider text-[6.5px] leading-tight">
                      <div>Republic of the Philippines</div>
                      <div className="text-slate-800 font-black text-[7.5px]">Department of Science and Technology</div>
                      <div>Ilocos Region</div>
                      <div className="normal-case text-[6px] font-semibold text-slate-400">City of San Fernando, La Union</div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start z-10">
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <div>
                        <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Parent / Guardian</span>
                        <span className="text-[10.5px] font-bold text-slate-800 truncate block">{respondent.parent_name || '–'}</span>
                      </div>
                      <div>
                        <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Contact Number</span>
                        <span className="text-[10.5px] font-bold text-slate-800 block truncate">{respondent.country_code ? `${respondent.country_code} ` : ''}{respondent.contact_number || '–'}</span>
                      </div>
                      <div>
                        <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider block">Email Address</span>
                        <span className="text-[9px] font-bold text-slate-800 block truncate">{respondent.email || '–'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      {qrUrl ? (
                        <img src={qrUrl} alt="ID QR code" className="w-24 h-24 object-contain" />
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 rounded-xl animate-pulse" />
                      )}
                      <div className="text-[6.5px] font-black text-slate-500 mt-0.5 uppercase tracking-wider text-center">
                        Code ID: <span className="text-[#7030a0]">{respondent.code || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 z-10">
                    <img src={gadLogo} alt="GAD iHUB Logo" className="h-6 object-contain shrink-0" />
                    <span className="text-[5.5px] text-slate-400 font-bold uppercase tracking-wider">Scan to Check-In</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button type="button" onClick={printIDCard} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-[#7030a0] hover:from-violet-700 hover:to-[#60288c] text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-violet-200">
                    <Printer size={14} /><span>Print ID Card</span>
                  </button>
                </div>
              </div>

              {/* Visitation History */}
              <div className="pt-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">Visitation History</h4>
                <div className="relative pl-6 border-l border-slate-200 space-y-8 ml-2.5">
                  {visits.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No visitation history found.</p>
                  ) : visits.map((v, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${i === 0 ? 'border-[#7030a0]' : 'border-slate-300'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#7030a0]' : 'bg-slate-300'}`} />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs font-black text-slate-800">{v.date}</span>
                          <span className="text-[10px] font-bold text-slate-400">{v.time}</span>
                          {v.surveyAnswered ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">Survey Answered</span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200/50">No Survey</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">{v.purpose}</p>
                        {v.children && v.children.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Children:</span>
                            {v.children.map((name, ci) => (
                              <span key={ci} className="text-[9.5px] font-bold text-[#7030a0] bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100/50">{name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}



/**
 * Searches across all searchable fields of a respondent record for a given query string.
 * Includes nested search into the children array.
 * 
 * @private
 * @param {Object} r - The respondent row to check.
 * @param {string} q - The search query.
 * @returns {boolean} True if a match is found.
 */
function matchRow(r, q) {
  if (!q || !q.trim()) return true;
  const s = q.trim().toLowerCase();
  const parent = (r.parent_name || '').toLowerCase();
  const contact = [r.country_code, r.contact_number].filter(Boolean).join(' ').toLowerCase();
  const office = [r.office_unit_address, r.office_unit_other].filter(Boolean).join(' ').toLowerCase();
  const dateUse = (r.dateOfUseFormatted || '').toLowerCase();
  const submitted = (r.submittedFormatted || '').toLowerCase();
  const code = (r.code || '').toLowerCase();

  // Also search through children
  const childrenMatch = Array.isArray(r.children) && r.children.some(c =>
    (c.name || '').toLowerCase().includes(s) ||
    (c.age || '').toString().toLowerCase().includes(s) ||
    (c.sex || '').toLowerCase().includes(s)
  );

  return (
    parent.includes(s) ||
    contact.includes(s) ||
    office.includes(s) ||
    dateUse.includes(s) ||
    submitted.includes(s) ||
    code.includes(s) ||
    childrenMatch
  );
}

/**
 * Page component that displays a searchable, paginated list of all respondents (Part I of the form).
 * 
 * @param {Object} props
 * @param {string} props.period - The time period for data fetching.
 * @param {Object} props.dateRange - Custom date range filters.
 */
export default function RespondentsInfo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [selectedRespondent, setSelectedRespondent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const target = list.find(item => item.id === id);
      await deleteRegistration(id);
      if (target) {
        setList(prev => prev.filter(item => {
          if (target.email && target.email.trim() && item.email && item.email.trim()) {
            return item.email.trim().toLowerCase() !== target.email.trim().toLowerCase();
          }
          return !(item.parent_name === target.parent_name && item.contact_number === target.contact_number);
        }));
      } else {
        setList(prev => prev.filter(item => item.id !== id));
      }
      setDeletingId(null);
    } catch (e) {
      alert('Failed to delete registration: ' + (e?.message || e));
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Fetches data on mount or when period/dateRange filters change.
   */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAllRegistrations()
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  /**
   * Real-time polling for new respondents every 10 seconds.
   */
  useEffect(() => {
    const id = setInterval(() => {
      fetchAllRegistrations()
        .then((data) => setList(data))
        .catch(() => { });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const allRespondents = useMemo(() => formatRespondents(list), [list]);
  const rows = useMemo(() => {
    const seen = new Set();
    const unique = [];
    const sorted = [...allRespondents].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    for (const r of sorted) {
      const key = r.email && r.email.trim()
        ? `email:${r.email.trim().toLowerCase()}`
        : `name:${(r.parent_name || '').trim().toLowerCase()}|phone:${(r.contact_number || '').trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }
    return unique;
  }, [allRespondents]);
  const filtered = useMemo(
    () => (search.trim() ? rows.filter((r) => matchRow(r, search)) : rows),
    [rows, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageRows = useMemo(
    () => filtered.slice(pageStart, pageStart + pageSize),
    [filtered, pageStart, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [search, filtered.length, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage === page) return;
    setIsPageTransitioning(true);
    setTimeout(() => {
      setPage(newPage);
      setTimeout(() => setIsPageTransitioning(false), 50);
    }, 150);
  };

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
        <p className="font-semibold">Could not load respondents</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <h3 className="font-black text-slate-800 text-lg tracking-tight">Registrations (Basic Information)</h3>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Demographics and registration records from Part I</p>
          </div>
          <div className="relative ml-auto flex-1 min-w-[300px] max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by parent, date, child details, or office..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-[#7030a0] bg-slate-50/40 focus:bg-white transition-all duration-200"
            />
          </div>
          {search.trim() && (
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shrink-0">
              {filtered.length} of {rows.length} matches
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-0">
            {/* Skeleton table header */}
            <div className="rounded-t-2xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50/50 border-b border-slate-100 grid grid-cols-5 px-5 py-3.5 gap-4">
                {['Code ID', 'Parent / Guardian', 'Office / Address', 'Contact Details', 'Date Registered'].map((h) => (
                  <div key={h} className="h-3 bg-slate-200/70 rounded-full animate-pulse" />
                ))}
              </div>
              {/* Skeleton rows */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 px-5 py-4 gap-4 border-b border-slate-50 last:border-0"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="h-6 bg-slate-100 rounded-lg animate-pulse w-20 self-center" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-1/2" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-2/3 self-center" />
                  <div className="space-y-1.5 self-center">
                    <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-1/2" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-2/3 self-center mx-auto" />
                  <div className="h-7 bg-slate-100 rounded-xl animate-pulse w-16 self-center mx-auto" />
                </div>
              ))}
            </div>
            {/* Loading label */}
            <div className="flex items-center justify-center gap-2.5 pt-5 pb-2">
              <svg className="animate-spin h-4 w-4 text-[#7030a0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading registrations…</span>
            </div>
          </div>
        ) : !rows.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-semibold">
            No respondents in this period
          </div>
        ) : !filtered.length ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-semibold">
            No matches found for &quot;{search.trim()}&quot;
          </div>
        ) : (
          <>
            <div
              key={page}
              className={`transition-opacity duration-300 ${isPageTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-slate-50/50 text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider">
                      <th className="py-3.5 px-5 font-semibold whitespace-nowrap">Code ID</th>
                      <th className="py-3.5 px-5 font-semibold">Parent / guardian</th>
                      <th className="py-3.5 px-5 font-semibold">Office / Address</th>
                      <th className="py-3.5 px-5 font-semibold">Contact Details</th>
                      <th className="py-3.5 px-5 font-semibold text-center whitespace-nowrap">Date Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pageRows.map((r, index) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRespondent(r)}
                        className="hover:bg-violet-50/40 cursor-pointer transition-colors animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <td className="py-3.5 px-5">
                          {r.code ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-[#7030a0] text-[10px] font-black tracking-widest whitespace-nowrap">
                              {r.code}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs font-semibold">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{r.parent_name || '–'}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">{r.sex || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-semibold text-xs">
                          {r.office_unit_other && String(r.office_unit_other).trim()
                            ? `${r.office_unit_address || 'Others'} (${r.office_unit_other})`
                            : r.office_unit_address || '–'}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-slate-600 font-semibold text-xs">
                            {r.country_code ? `${r.country_code} ` : ''}{r.contact_number || '–'}
                          </p>
                        </td>
                        <td className="py-3.5 px-5 text-center text-slate-500 font-medium text-xs whitespace-nowrap">{r.dateOfUseFormatted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-5">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-slate-400 text-xs font-semibold">
                    Showing {pageStart + 1}–{Math.min(pageStart + pageSize, filtered.length)} of {filtered.length} entries
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="text-xs font-bold text-[#7030a0] bg-violet-50/50 border border-violet-100 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-[#7030a0] transition-all"
                    >
                      <option value={2}>2</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">entries</span>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>
                    <div className="flex items-center gap-1 mx-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 7) return true;
                          if (p === 1 || p === totalPages) return true;
                          if (Math.abs(p - page) <= 1) return true;
                          return false;
                        })
                        .reduce((acc, p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === '…' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-bold">
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              type="button"
                              onClick={() => handlePageChange(p)}
                              className={`min-w-[2rem] h-8 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${page === p
                                ? 'bg-gradient-to-r from-violet-600 to-[#7030a0] text-white shadow-md shadow-violet-200'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {selectedRespondent && (
        <RespondentDetailsModal
          respondent={selectedRespondent}
          allRespondents={allRespondents}
          onClose={() => setSelectedRespondent(null)}
          onUpdated={(merged) => {
            setList(prev => prev.map(item => item.id === merged.id ? merged : item));
          }}
          onDelete={(id) => {
            setSelectedRespondent(null);
            setDeletingId(id);
          }}
        />
      )}
      {deletingId && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fade-in" onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full animate-scale-up text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mb-2">Delete Registration?</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Are you sure you want to delete this registration? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

