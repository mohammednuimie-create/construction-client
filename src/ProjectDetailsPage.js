import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI } from './utils/api';

// Materials Component
function MaterialsSection({ setTotalMaterialsCost }) {
  const [materials, setMaterials] = useState([
    { id: 1, name: 'اسمنت', quantity: 10, unitCost: 7 },
    { id: 2, name: 'حديد تسليح', quantity: 5, unitCost: 50 },
  ]);
  const [materialForm, setMaterialForm] = useState({ name: '', quantity: '', unitCost: '' });
  const totalCost = materials.reduce((sum, m) => sum + m.quantity * m.unitCost, 0);
  
  useEffect(() => { 
    setTotalMaterialsCost(totalCost); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCost]);
  
  const handleMatChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm(prev => ({ ...prev, [name]: value }));
  };
  
  const addMaterial = (e) => {
    e.preventDefault();
    if (!materialForm.name || !materialForm.quantity || !materialForm.unitCost) return;
    const quantity = parseFloat(materialForm.quantity);
    const unitCost = parseFloat(materialForm.unitCost);
    if (Number.isNaN(quantity) || Number.isNaN(unitCost)) return;
    setMaterials(prev => ([...prev, { id: Date.now(), name: materialForm.name, quantity, unitCost }]));
    setMaterialForm({ name: '', quantity: '', unitCost: '' });
  };
  
  const removeMaterial = (id) => setMaterials(prev => prev.filter(m => m.id !== id));

  return (
    <div style={{
      background: '#fff', padding: '25px', borderRadius: 16, boxShadow: '0 4px 25px rgba(34, 70, 131, 0.08)'
    }}>
      <h3 style={{ marginTop: 0, color: '#224683' }}>تسجيل المواد</h3>
      <div style={{ overflowX: 'auto', marginBottom: 18 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#19364e' }}>
              <th style={{ textAlign: 'right', padding: 10 }}>المادة</th>
              <th style={{ textAlign: 'right', padding: 10 }}>الكمية</th>
              <th style={{ textAlign: 'right', padding: 10 }}>تكلفة الوحدة ($)</th>
              <th style={{ textAlign: 'right', padding: 10 }}>الإجمالي ($)</th>
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{m.name}</td>
                <td style={{ padding: 10 }}>{m.quantity}</td>
                <td style={{ padding: 10 }}>${m.unitCost.toLocaleString()}</td>
                <td style={{ padding: 10 }}>${(m.quantity * m.unitCost).toLocaleString()}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => removeMaterial(m.id)} style={{ background: '#e76f51', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'left', padding: 10, fontWeight: 700, color: '#19364e' }}>الإجمالي الكلي</td>
              <td style={{ padding: 10, fontWeight: 900, color: '#2a9d8f' }}>${totalCost.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <form onSubmit={addMaterial}>
        <h4 style={{ color: '#19364e' }}>إضافة مادة</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>اسم المادة</label>
            <input name="name" value={materialForm.name} onChange={handleMatChange} placeholder="مثال: اسمنت" required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>الكمية</label>
            <input type="number" step="0.01" name="quantity" value={materialForm.quantity} onChange={handleMatChange} placeholder="0" required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>تكلفة الوحدة ($)</label>
            <input type="number" step="0.01" name="unitCost" value={materialForm.unitCost} onChange={handleMatChange} placeholder="0" required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{ background: '#2a9d8f', color: '#fff', border: 0, padding: '11px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>إضافة</button>
        </div>
      </form>
    </div>
  );
}

// Timeline Component
function TimelineSection() {
  const [timeline, setTimeline] = useState({ startDate: "", endDate: "" });
  const [milestones, setMilestones] = useState([
    { id: 1, name: "تسليم المخططات", date: "" },
  ]);
  const [msForm, setMsForm] = useState({ name: "", date: "" });

  const saveDates = (e) => {
    e.preventDefault();
    alert("تم حفظ التواريخ بنجاح");
  };
  
  const addMilestone = (e) => {
    e.preventDefault();
    if (!msForm.name) return;
    setMilestones(prev => [...prev, { id: Date.now(), name: msForm.name, date: msForm.date }]);
    setMsForm({ name: "", date: "" });
  };
  
  const removeMs = (id) => setMilestones(prev => prev.filter(m => m.id !== id));

  return (
    <div style={{ background: "#fff", padding: 25, borderRadius: 16, boxShadow: "0 4px 25px rgba(34,70,131,.08)" }}>
      <h3 style={{ marginTop: 0, color: "#224683" }}>الجدول الزمني للمشروع</h3>
      <form onSubmit={saveDates} style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>تاريخ البدء</label>
            <input type="date" value={timeline.startDate} onChange={(e) => setTimeline({ ...timeline, startDate: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>تاريخ الانتهاء</label>
            <input type="date" value={timeline.endDate} onChange={(e) => setTimeline({ ...timeline, endDate: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          </div>
          <button type="submit" style={{ background: "#2a9d8f", color: "#fff", border: 0, padding: "11px 22px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>حفظ</button>
        </div>
      </form>
      <h4 style={{ color: "#19364e", marginBottom: 10 }}>المراحل الرئيسية</h4>
      <div style={{ marginBottom: 14 }}>
        {milestones.length === 0 && <div style={{ color: "#777" }}>لا توجد مراحل بعد.</div>}
        {milestones.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid #f0f0f0", borderRadius: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{m.name}</div>
              {m.date && <div style={{ fontSize: 13, color: "#666" }}>{m.date}</div>}
            </div>
            <button onClick={() => removeMs(m.id)} style={{ background: "#e76f51", color: "#fff", border: 0, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>إزالة</button>
          </div>
        ))}
      </div>
      <form onSubmit={addMilestone}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>اسم المرحلة</label>
            <input value={msForm.name} onChange={(e) => setMsForm({ ...msForm, name: e.target.value })} placeholder="مثال: صب الأساسات" required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>تاريخ متوقع</label>
            <input type="date" value={msForm.date} onChange={(e) => setMsForm({ ...msForm, date: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          </div>
          <button type="submit" style={{ background: "#264653", color: "#fff", border: 0, padding: "11px 18px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>إضافة مرحلة</button>
        </div>
      </form>
    </div>
  );
}

// Gallery Component
function GallerySection({ projectId }) {
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=60' },
    { id: 2, url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=60' },
    { id: 3, url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=60' },
    { id: 4, url: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1000&q=60' },
  ]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const addLocalImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map((f) => ({ id: Date.now() + Math.random(), url: URL.createObjectURL(f), local: true, temp: true }));
    setImages((prev) => [...previews, ...prev]);

    setUploading(true);
    try {
      for (const f of files) {
        const form = new FormData();
        form.append('file', f);
        const res = await fetch(`/api/projects/${projectId}/upload`, { method: 'POST', body: form });
        if (!res.ok) continue;
        const data = await res.json();
        // استبدل القائمة بالصور الفعلية (تحمل _id)
        const mapped = (data.images || []).map((it) => ({ id: it._id, serverId: it._id, url: it.url }));
        setImages(mapped);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = async (img) => {
    // حذف محلي للمعاينات
    if (img.temp || img.local) {
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      if (img.local && img.url) URL.revokeObjectURL(img.url);
      return;
    }
    // حذف من السيرفر إن وجد serverId
    if (img.serverId) {
      try {
        const res = await fetch(`/api/projects/${projectId}/images/${img.serverId}`, { method: 'DELETE' });
        if (res.ok) {
          const list = await res.json();
          const mapped = (list || []).map((it) => ({ id: it._id, serverId: it._id, url: it.url }));
          setImages(mapped);
          return;
        }
      } catch (e) {
        console.error('Delete failed', e);
      }
    }
    // fallback
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  return (
    <div style={{ background: '#fff', padding: 25, borderRadius: 16, boxShadow: '0 4px 25px rgba(34,70,131,.08)' }}>
      <h3 style={{ marginTop: 0, color: '#224683' }}>معرض صور المشروع {uploading && <span style={{color:'#2a9d8f', fontSize:14}}>— جاري الرفع...</span>}</h3>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={addLocalImages} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ background: '#2a9d8f', color: '#fff', border: 0, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
          رفع صور من جهازي
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 10 }}>
        {images.map(img => (
          <div key={img.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px #22468314' }}>
            <img src={img.url} alt="project" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', filter: img.temp ? 'grayscale(0.8)' : 'none', opacity: img.temp ? 0.7 : 1 }} />
            <button onClick={() => removeImage(img)} style={{ position: 'absolute', top: 8, left: 8, background: '#e76f51', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [newEngineer, setNewEngineer] = useState({ name: '', specialty: '' });
  const [crews, setCrews] = useState([]);
  const [newCrew, setNewCrew] = useState({ type: '', worker: '' });
  const [totalMaterialsCost, setTotalMaterialsCost] = useState(0);
  const [budget, setBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await projectsAPI.getById(id);
        setProject(data);
        setBudget(data.budget || 0);
        setEngineers(data.engineers || []);
        setCrews(data.crews || []);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب المشروع');
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>جاري التحميل...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
          {error || 'المشروع غير موجود'}
        </div>
      </div>
    );
  }

  const handleAddEngineer = (e) => {
    e.preventDefault();
    if (!newEngineer.name || !newEngineer.specialty) return;
    setEngineers(prev => [...prev, { ...newEngineer, id: Date.now() }]);
    setNewEngineer({ name: '', specialty: '' });
  };
  const handleAddCrew = (e) => {
    e.preventDefault();
    if (!newCrew.type || !newCrew.worker) return;
    setCrews(prev => [...prev, { ...newCrew, id: Date.now() }]);
    setNewCrew({ type: '', worker: '' });
  };
  const handleRemoveEngineer = (id) => setEngineers(engineers.filter(e => e.id !== id));
  const handleRemoveCrew = (id) => setCrews(crews.filter(c => c.id !== id));

  const remaining = Math.max(0, (Number(budget) || 0) - totalMaterialsCost);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/contractor" style={{ textDecoration: 'none', color: '#2a9d8f' }}>
          &larr; العودة إلى لوحة التحكم
        </Link>
      </div>
      <h2 style={{ fontWeight: 900, color: '#19364e', fontSize: 28 }}>
        تفاصيل المشروع: {project.name}
      </h2>
      <p style={{ color: '#555', fontSize: '16px', maxWidth: '700px' }}>{project.description}</p>

      {/* ملخص مالي سريع */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14,
        margin: '18px 0 28px'
      }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 4px 18px #22468314' }}>
          <div style={{ color: '#65708a', fontSize: 13 }}>عدد المهندسين</div>
          <div style={{ color: '#224683', fontWeight: 900, fontSize: 24 }}>{engineers.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 4px 18px #22468314' }}>
          <div style={{ color: '#65708a', fontSize: 13 }}>عدد الورش/العمال</div>
          <div style={{ color: '#224683', fontWeight: 900, fontSize: 24 }}>{crews.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 4px 18px #22468314' }}>
          <div style={{ color: '#65708a', fontSize: 13 }}>إجمالي تكلفة المواد</div>
          <div style={{ color: '#2a9d8f', fontWeight: 900, fontSize: 24 }}>${totalMaterialsCost.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 4px 18px #22468314' }}>
          <div style={{ color: '#65708a', fontSize: 13 }}>الميزانية المبدئية ($)</div>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', fontWeight: 700, color: '#224683' }}
          />
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 4px 18px #22468314' }}>
          <div style={{ color: '#65708a', fontSize: 13 }}>المتبقي من الميزانية ($)</div>
          <div style={{ color: remaining > 0 ? '#16a34a' : '#e11d48', fontWeight: 900, fontSize: 24 }}>
            ${remaining.toLocaleString()}
          </div>
        </div>
      </div>

      <hr style={{margin: '6px 0 24px', border: 'none', borderTop: '1px solid #eee'}} />

      {/* Engineers Section */}
      <div style={{
        background: '#fff',
        padding: '25px',
        borderRadius: 16,
        boxShadow: '0 4px 25px rgba(34, 70, 131, 0.08)',
        marginBottom: 40
      }}>
        <h3 style={{ marginTop: 0, color: '#224683' }}>إدارة المهندسين</h3>
        <div style={{ marginBottom: '25px' }}>
          {engineers.map(eng => (
            <div key={eng.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 8
            }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{eng.name}</div>
                <div style={{ fontSize: '14px', color: '#777' }}>{eng.specialty}</div>
              </div>
              <button onClick={() => handleRemoveEngineer(eng.id)} style={{background: '#e76f51', color: 'white', border: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer'}}>إزالة</button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddEngineer} style={{ marginBottom: 0 }}>
          <h4 style={{ color: '#19364e' }}>إضافة مهندس جديد</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'flex-end' }}>
            <input type="text" placeholder="اسم المهندس" value={newEngineer.name} onChange={(e) => setNewEngineer({...newEngineer, name: e.target.value})} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            <input type="text" placeholder="التخصص" value={newEngineer.specialty} onChange={(e) => setNewEngineer({...newEngineer, specialty: e.target.value})} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            <button type="submit" style={{ background: '#2a9d8f', color: 'white', border: 0, padding: '10px 25px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>إضافة</button>
          </div>
        </form>
      </div>

      {/* Crews/Workers Section */}
      <div style={{
        background: '#fff',
        padding: '25px',
        borderRadius: 16,
        boxShadow: '0 4px 25px rgba(34, 70, 131, 0.08)'
      }}>
        <h3 style={{ marginTop: 0, color: '#224683' }}>إدارة الورشات والعمال</h3>
        <div style={{ marginBottom: '25px' }}>
          {crews.map(crew => (
            <div key={crew.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px', border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 8
            }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{crew.type}</div>
                <div style={{ fontSize: '14px', color: '#777' }}>{crew.worker}</div>
              </div>
              <button onClick={() => handleRemoveCrew(crew.id)} style={{background: '#e76f51', color: 'white', border: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer'}}>إزالة</button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddCrew}>
          <h4 style={{ color: '#19364e' }}>إضافة ورشة/عامل جديد</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'flex-end' }}>
            <input type="text" placeholder="نوع الورشة (مثال: كهرباء)" value={newCrew.type} onChange={(e) => setNewCrew({...newCrew, type: e.target.value})} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            <input type="text" placeholder="اسم العامل/الفني" value={newCrew.worker} onChange={(e) => setNewCrew({...newCrew, worker: e.target.value})} required style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            <button type="submit" style={{ background: '#264653', color: 'white', border: 0, padding: '10px 25px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>إضافة</button>
          </div>
        </form>
      </div>

      <div style={{ height: 24 }} />

      {/* Materials Section */}
      <MaterialsSection setTotalMaterialsCost={setTotalMaterialsCost} />

      <div style={{ height: 24 }} />

      {/* Timeline Section */}
      <TimelineSection />

      <div style={{ height: 24 }} />

      {/* Gallery Section */}
      <GallerySection projectId={id} />
    </div>
  );
}

