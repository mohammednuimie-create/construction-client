import React, { useState, useEffect } from "react";
import { purchasesAPI, issuesAPI, projectsAPI, materialsAPI, suppliersAPI } from "../../utils/api";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function PurchasesAndIssue(){
  const notifications = useNotifications();
  const [purchaseForm, setPurchaseForm] = useState({ material: '', quantity: '', unitPrice: '', supplier: '' });
  const [issueForm, setIssueForm] = useState({ project: '', material: '', quantity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [purchasesData, issuesData, projectsData, materialsData, suppliersData] = await Promise.all([
          purchasesAPI.getAll(),
          issuesAPI.getAll(),
          projectsAPI.getAll(),
          materialsAPI.getAll(),
          suppliersAPI.getAll()
        ]);
        
        // Sort and get recent purchases
        const sortedPurchases = (purchasesData || []).sort((a, b) => 
          new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt)
        );
        setRecentPurchases(sortedPurchases.slice(0, 10));
        
        // Sort and get recent issues
        const sortedIssues = (issuesData || []).sort((a, b) => 
          new Date(b.issueDate || b.createdAt) - new Date(a.issueDate || a.createdAt)
        );
        setRecentIssues(sortedIssues.slice(0, 10));
        
        setProjects(projectsData || []);
        setMaterials(materialsData || []);
        setSuppliers(suppliersData || []);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePurchaseInput = (e) => {
    setPurchaseForm({ ...purchaseForm, [e.target.name]: e.target.value });
  };

  const handleIssueInput = (e) => {
    setIssueForm({ ...issueForm, [e.target.name]: e.target.value });
  };

  const addPurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.material || !purchaseForm.quantity || !purchaseForm.unitPrice || !purchaseForm.supplier) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedMaterial = materials.find(m => (m._id || m.id) === purchaseForm.material);
      const selectedSupplier = suppliers.find(s => (s._id || s.id) === purchaseForm.supplier);
      
      if (!selectedMaterial || !selectedSupplier) {
        notifications.warning('تحذير', 'يرجى اختيار مادة ومورد صحيحين');
        setIsSubmitting(false);
        return;
      }

      await purchasesAPI.create({
        supplier: selectedSupplier._id || selectedSupplier.id,
        items: [{
          material: selectedMaterial._id || selectedMaterial.id,
          quantity: parseFloat(purchaseForm.quantity),
          unit: selectedMaterial.unit || 'وحدة',
          unitPrice: parseFloat(purchaseForm.unitPrice)
        }],
        purchaseDate: new Date(),
        status: 'pending'
      });
      
      notifications.success('نجح', `تم تسجيل عملية شراء: ${selectedMaterial.name} - ${purchaseForm.quantity} ${selectedMaterial.unit || 'وحدة'}`);
      setPurchaseForm({ material: '', quantity: '', unitPrice: '', supplier: '' });
      
      // Refresh purchases
      const purchasesData = await purchasesAPI.getAll();
      const sortedPurchases = (purchasesData || []).sort((a, b) => 
        new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt)
      );
      setRecentPurchases(sortedPurchases.slice(0, 10));
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء تسجيل الشراء');
      console.error('Error adding purchase:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const issueMaterial = async (e) => {
    e.preventDefault();
    if (!issueForm.project || !issueForm.material || !issueForm.quantity) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedProject = projects.find(p => (p._id || p.id) === issueForm.project);
      const selectedMaterial = materials.find(m => (m._id || m.id) === issueForm.material);
      
      if (!selectedProject || !selectedMaterial) {
        notifications.warning('تحذير', 'يرجى اختيار مشروع ومادة صحيحين');
        setIsSubmitting(false);
        return;
      }

      if ((selectedMaterial.quantity || 0) < parseFloat(issueForm.quantity)) {
        notifications.warning('تحذير', `الكمية المتوفرة (${selectedMaterial.quantity || 0}) أقل من الكمية المطلوبة (${issueForm.quantity})`);
        setIsSubmitting(false);
        return;
      }

      await issuesAPI.create({
        project: selectedProject._id || selectedProject.id,
        items: [{
          material: selectedMaterial._id || selectedMaterial.id,
          quantity: parseFloat(issueForm.quantity),
          unit: selectedMaterial.unit || 'وحدة',
          unitPrice: selectedMaterial.pricePerUnit || 0
        }],
        issueDate: new Date()
      });
      
      notifications.success('نجح', `تم صرف ${issueForm.quantity} ${selectedMaterial.unit || 'وحدة'} من ${selectedMaterial.name} لمشروع ${selectedProject.name}`);
      setIssueForm({ project: '', material: '', quantity: '' });
      
      // Refresh issues and materials
      const [issuesData, materialsData] = await Promise.all([
        issuesAPI.getAll(),
        materialsAPI.getAll()
      ]);
      const sortedIssues = (issuesData || []).sort((a, b) => 
        new Date(b.issueDate || b.createdAt) - new Date(a.issueDate || a.createdAt)
      );
      setRecentIssues(sortedIssues.slice(0, 10));
      setMaterials(materialsData || []);
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء صرف المواد');
      console.error('Error issuing material:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, system-ui, Arial' }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{
          fontWeight: 900,
          color: BRAND.primary,
          fontSize: 32,
          margin: '0 0 8px 0',
          letterSpacing: '-1px'
        }}>
          مشتريات وصرف المواد
        </h2>
        <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
          إدارة مشتريات المواد وصرفها للمشاريع
        </p>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: 24,
        marginBottom: 24
      }}>
        {/* Purchases */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          padding: 28,
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '2px solid ' + BRAND.light
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: BRAND.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              🛒
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              مشتريات المواد
            </h3>
          </div>
          
          <form onSubmit={addPurchase} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                المورد *
              </label>
              <select
                name="supplier"
                value={purchaseForm.supplier}
                onChange={handlePurchaseInput}
                required
                style={{
                  width: '100%',
                  padding: 14,
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: BRAND.light
                }}
                onFocus={e => {
                  e.target.style.borderColor = BRAND.accent;
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = BRAND.light;
                }}
              >
                <option value="">اختر المورد</option>
                {suppliers.map(s => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.name || s.companyName}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                المادة *
              </label>
              <select
                name="material"
                value={purchaseForm.material}
                onChange={handlePurchaseInput}
                required
                style={{
                  width: '100%',
                  padding: 14,
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: BRAND.light
                }}
                onFocus={e => {
                  e.target.style.borderColor = BRAND.accent;
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = BRAND.light;
                }}
              >
                <option value="">اختر المادة</option>
                {materials.map(m => (
                  <option key={m._id || m.id} value={m._id || m.id}>
                    {m.name} ({m.unit || 'وحدة'})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  color: BRAND.dark,
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  الكمية *
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={purchaseForm.quantity}
                  onChange={handlePurchaseInput}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: BRAND.light
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = BRAND.accent;
                    e.target.style.background = '#fff';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = BRAND.light;
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  color: BRAND.dark,
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  سعر الوحدة ($) *
                </label>
                <input
                  name="unitPrice"
                  type="number"
                  value={purchaseForm.unitPrice}
                  onChange={handlePurchaseInput}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: BRAND.light
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = BRAND.accent;
                    e.target.style.background = '#fff';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = BRAND.light;
                  }}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: BRAND.gradient,
                color: '#fff',
                border: 0,
                borderRadius: 12,
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: 16,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
                transition: 'all 0.3s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onMouseOver={e => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
              }}
            >
              {isSubmitting ? '⏳ جاري الحفظ...' : '✓ تسجيل الشراء'}
            </button>
          </form>
        </div>

        {/* Issue Materials */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          padding: 28,
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '2px solid ' + BRAND.light
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              📤
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              صرف مواد لمشروع
            </h3>
          </div>
          
          <form onSubmit={issueMaterial} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                اسم المشروع *
              </label>
              <select
                name="project"
                value={issueForm.project}
                onChange={handleIssueInput}
                required
                style={{
                  width: '100%',
                  padding: 14,
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: BRAND.light
                }}
                onFocus={e => {
                  e.target.style.borderColor = BRAND.accent;
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = BRAND.light;
                }}
              >
                <option value="">اختر المشروع</option>
                {projects.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  color: BRAND.dark,
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  المادة *
                </label>
                <select
                  name="material"
                  value={issueForm.material}
                  onChange={handleIssueInput}
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: BRAND.light
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = BRAND.accent;
                    e.target.style.background = '#fff';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = BRAND.light;
                  }}
                >
                  <option value="">اختر المادة</option>
                  {materials.map(m => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.name} ({m.quantity || 0} متوفر - {m.unit || 'وحدة'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  color: BRAND.dark,
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  الكمية *
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={issueForm.quantity}
                  onChange={handleIssueInput}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: BRAND.light
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = BRAND.accent;
                    e.target.style.background = '#fff';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = BRAND.light;
                  }}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
                color: '#fff',
                border: 0,
                borderRadius: 12,
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: 16,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(244,162,97,0.3)',
                transition: 'all 0.3s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onMouseOver={e => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(244,162,97,0.4)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(244,162,97,0.3)';
              }}
            >
              {isSubmitting ? '⏳ جاري الصرف...' : '✓ صرف المواد'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: 24
      }}>
        {/* Recent Purchases */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          padding: 28,
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: BRAND.primary,
            fontSize: 20,
            fontWeight: 800
          }}>
            آخر المشتريات
          </h3>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 14 }}>جاري التحميل...</div>
            </div>
          ) : recentPurchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 14 }}>لا توجد مشتريات حديثة</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {recentPurchases.map(p => {
                const firstItem = p.items && p.items.length > 0 ? p.items[0] : null;
                const materialName = firstItem && typeof firstItem.material === 'object' ? firstItem.material?.name : 'غير محدد';
                const supplierName = typeof p.supplier === 'object' ? p.supplier?.name || p.supplier?.companyName : 'غير محدد';
                const quantity = firstItem ? firstItem.quantity : 0;
                return (
                  <div
                    key={p._id || p.id}
                    style={{
                      background: BRAND.light,
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid rgba(30,58,95,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = BRAND.accent;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(30,58,95,0.05)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: BRAND.dark, marginBottom: 6 }}>
                          {materialName}
                        </div>
                        <div style={{ fontSize: 13, color: BRAND.muted, marginBottom: 4 }}>
                          📦 الكمية: {quantity} | 👤 المورد: {supplierName}
                        </div>
                        <div style={{ fontSize: 13, color: BRAND.muted }}>
                          📅 {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('ar-SA') : (p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-SA') : '-')}
                        </div>
                      </div>
                      <div style={{
                        background: BRAND.accent,
                        color: '#fff',
                        padding: '8px 14px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 15
                      }}>
                        ${(p.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Issues */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          padding: 28,
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: BRAND.primary,
            fontSize: 20,
            fontWeight: 800
          }}>
            آخر عمليات الصرف
          </h3>
          {recentIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 14 }}>لا توجد عمليات صرف حديثة</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {recentIssues.map(i => {
                const projectName = typeof i.project === 'object' ? i.project?.name : 'غير محدد';
                const firstItem = i.items && i.items.length > 0 ? i.items[0] : null;
                const materialName = firstItem && typeof firstItem.material === 'object' ? firstItem.material?.name : 'غير محدد';
                const quantity = firstItem ? firstItem.quantity : 0;
                return (
                  <div
                    key={i._id || i.id}
                    style={{
                      background: BRAND.light,
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid rgba(30,58,95,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = BRAND.accent;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(30,58,95,0.05)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: BRAND.dark, marginBottom: 6 }}>
                          {projectName}
                        </div>
                        <div style={{ fontSize: 13, color: BRAND.muted, marginBottom: 4 }}>
                          📦 {materialName} × {quantity}
                        </div>
                        <div style={{ fontSize: 13, color: BRAND.muted }}>
                          📅 {i.issueDate ? new Date(i.issueDate).toLocaleDateString('ar-SA') : (i.createdAt ? new Date(i.createdAt).toLocaleDateString('ar-SA') : '-')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


