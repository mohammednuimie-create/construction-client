import React, { useState, useEffect } from "react";
import Modal from "../../Modal";
import { suppliersAPI, paymentsAPI } from "../../utils/api";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function SuppliersAndPayments(){
  const notifications = useNotifications();
  const [paymentForm, setPaymentForm] = useState({ supplier: '', amount: '', date: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', companyName: '', phone: '', email: '', address: '', totalPurchases: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [suppliersData, paymentsData] = await Promise.all([
        suppliersAPI.getAll(),
        paymentsAPI.getAll()
      ]);
      const suppliersList = suppliersData || [];
      const paymentsList = paymentsData || [];
      
      console.log('✅ تم جلب البيانات:', {
        suppliers: suppliersList.length,
        payments: paymentsList.length
      });
      console.log('📋 قائمة الموردين:', suppliersList);
      console.log('💳 قائمة المدفوعات:', paymentsList);
      
      setSuppliers(suppliersList);
      // Get recent payments (last 10) - sort by date descending
      const sortedPayments = paymentsList.sort((a, b) => {
        const dateA = new Date(a.paymentDate || a.createdAt || 0);
        const dateB = new Date(b.paymentDate || b.createdAt || 0);
        return dateB - dateA;
      });
      const recentPaymentsList = sortedPayments.slice(0, 10);
      console.log('📊 آخر 10 مدفوعات:', recentPaymentsList);
      setRecentPayments(recentPaymentsList);
    } catch (err) {
      const errorMessage = err.message || 'حدث خطأ أثناء جلب البيانات';
      setError(errorMessage);
      console.error('❌ خطأ في جلب البيانات:', err);
      
      // عرض رسالة أوضح في حالة خطأ معين
      if (errorMessage.includes('Supplier.find')) {
        console.error('⚠️  السيرفر يحتاج إلى إعادة تشغيل!');
        console.error('💡 قم بإعادة تشغيل السيرفر: cd server && npm run dev');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePaymentInput = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleSupplierInput = (e) => {
    setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value });
  };

  const addSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.phone) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة (الاسم والهاتف)');
      return;
    }
    setIsSubmitting(true);
    try {
      const totalPurchases = parseFloat(supplierForm.totalPurchases) || 0;
      const supplierData = {
        name: supplierForm.name,
        companyName: supplierForm.companyName || '',
        phone: supplierForm.phone,
        email: supplierForm.email || '',
        address: supplierForm.address || '',
        totalPurchases: totalPurchases,
        totalPaid: 0,
        totalRemaining: totalPurchases,
        status: 'active'
      };
      
      console.log('📤 إضافة مورد جديد:', supplierData);
      const result = await suppliersAPI.create(supplierData);
      console.log('✅ تم إضافة المورد:', result);
      
      notifications.success('نجح', `تم إضافة المورد ${supplierForm.name} بنجاح`);
      setSupplierForm({ name: '', companyName: '', phone: '', email: '', address: '', totalPurchases: '' });
      setSupplierModalOpen(false);
      
      // Refresh data - force reload
      console.log('🔄 تحديث البيانات بعد إضافة المورد...');
      setIsLoading(true);
      try {
        const [suppliersData, paymentsData] = await Promise.all([
          suppliersAPI.getAll(),
          paymentsAPI.getAll()
        ]);
        const suppliersList = suppliersData || [];
        console.log('✅ تم تحديث البيانات - عدد الموردين:', suppliersList.length);
        setSuppliers(suppliersList);
        
        const sortedPayments = (paymentsData || []).sort((a, b) => 
          new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt)
        );
        setRecentPayments(sortedPayments.slice(0, 10));
      } catch (refreshErr) {
        console.error('❌ خطأ في تحديث البيانات:', refreshErr);
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('❌ خطأ في إضافة المورد:', err);
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء إضافة المورد');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pay = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('💰 بدء تسجيل السداد...', paymentForm);
    
    if (!paymentForm.supplier || !paymentForm.amount) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      notifications.warning('تحذير', 'يرجى إدخال مبلغ صحيح أكبر من صفر');
      return;
    }
    
    const selectedSup = suppliers.find(s => (s._id || s.id) === paymentForm.supplier);
    if (!selectedSup) {
      notifications.warning('تحذير', 'يرجى اختيار مورد صحيح');
      console.error('المورد المحدد غير موجود:', paymentForm.supplier, suppliers);
      return;
    }
    
    const confirmMessage = `هل أنت متأكد من سداد $${parseFloat(paymentForm.amount).toLocaleString()} لـ ${selectedSup.name || selectedSup.companyName}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const paymentData = {
        supplier: selectedSup._id || selectedSup.id,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.date || new Date().toISOString().split('T')[0],
        paymentMethod: 'cash'
      };
      
      console.log('📤 إرسال بيانات السداد:', paymentData);
      
      const result = await paymentsAPI.create(paymentData);
      
      console.log('✅ تم تسجيل السداد بنجاح:', result);
      notifications.success('نجح', 'تم تسجيل عملية السداد بنجاح');
      
      setPaymentForm({ supplier: '', amount: '', date: '' });
      
      // Refresh data - force reload with delay to ensure backend has updated
      console.log('🔄 تحديث البيانات بعد السداد...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms for backend to update
      await fetchData();
    } catch (err) {
      console.error('❌ خطأ في تسجيل السداد:', err);
      const errorMessage = err.message || 'حدث خطأ أثناء تسجيل السداد';
      notifications.error('خطأ', errorMessage);
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
          الموردون والسداد
        </h2>
        <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
          إدارة الموردين وتسجيل عمليات السداد
        </p>
        <button
          onClick={fetchData}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: BRAND.accent,
            color: '#fff',
            border: 0,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#238f83';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = BRAND.accent;
            e.currentTarget.style.transform = 'none';
          }}
        >
          🔄 تحديث البيانات
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.primary, marginBottom: 6 }}>
            {suppliers.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>إجمالي الموردين</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.accent, marginBottom: 6 }}>
            ${suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0).toLocaleString()}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>إجمالي المدفوع</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444', marginBottom: 6 }}>
            ${suppliers.reduce((sum, s) => sum + (s.totalRemaining || (s.totalPurchases || 0) - (s.totalPaid || 0)), 0).toLocaleString()}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>المتبقي</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#8b5cf6', marginBottom: 6 }}>
            {recentPayments.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>عمليات السداد</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: 24,
        marginBottom: 24
      }}>
        {/* Suppliers */}
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
              🏢
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              الموردون ({suppliers.length})
            </h3>
            <button
              onClick={() => setSupplierModalOpen(true)}
              style={{
                marginRight: 'auto',
                padding: '10px 20px',
                background: BRAND.gradient,
                color: '#fff',
                border: 0,
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(30,58,95,0.3)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,95,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,95,0.3)';
              }}
            >
              ➕ إضافة مورد
            </button>
          </div>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 16 }}>جاري التحميل...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
              <div style={{ fontSize: 16 }}>{error}</div>
            </div>
          ) : suppliers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16 }}>لا توجد موردين</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {suppliers.map(s => {
                const totalDebt = s.totalPurchases || 0;
                const paid = s.totalPaid || 0;
                const remaining = s.totalRemaining || (totalDebt - paid);
                return (
                  <div
                    key={s._id || s.id}
                    style={{
                      background: BRAND.light,
                      borderRadius: 16,
                      padding: 20,
                      border: '2px solid rgba(30,58,95,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = BRAND.accent;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.15)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(30,58,95,0.05)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 12
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: 18,
                          color: BRAND.dark,
                          marginBottom: 8
                        }}>
                          {s.name || s.companyName}
                        </div>
                        <div style={{
                          color: BRAND.muted,
                          fontSize: 14,
                          marginBottom: 6
                        }}>
                          📞 {s.phone}
                        </div>
                        {s.email && (
                          <div style={{
                            color: BRAND.muted,
                            fontSize: 13,
                            marginBottom: 12
                          }}>
                            ✉️ {s.email}
                          </div>
                        )}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 12,
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: '1px solid rgba(30,58,95,0.1)'
                        }}>
                          <div>
                            <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>المستحق</div>
                            <div style={{ fontWeight: 700, color: BRAND.dark }}>
                              ${totalDebt.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>المدفوع</div>
                            <div style={{ fontWeight: 700, color: BRAND.accent }}>
                              ${paid.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {remaining > 0 && (
                          <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            background: '#fee2e2',
                            borderRadius: 8,
                            fontSize: 13,
                            color: '#991b1b',
                            fontWeight: 700
                          }}>
                            ⚠️ متبقي: ${remaining.toLocaleString()}
                          </div>
                        )}
                        {remaining === 0 && totalDebt > 0 && (
                          <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            background: '#d1fae5',
                            borderRadius: 8,
                            fontSize: 13,
                            color: '#065f46',
                            fontWeight: 700
                          }}>
                            ✓ تم السداد بالكامل
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button
                        onClick={() => {
                          setPaymentForm({ 
                            ...paymentForm, 
                            supplier: s._id || s.id,
                            amount: '',
                            date: ''
                          });
                          // Scroll to payment form
                          setTimeout(() => {
                            const paymentSection = document.querySelector('[data-payment-form]');
                            if (paymentSection) {
                              paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                        style={{
                          flex: 1,
                          background: BRAND.gradient,
                          color: '#fff',
                          border: 0,
                          borderRadius: 10,
                          padding: '12px',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(42,157,143,0.3)'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(42,157,143,0.4)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(42,157,143,0.3)';
                        }}
                      >
                        💳 سداد
                      </button>
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        style={{
                          flex: 1,
                          background: '#f1f5f9',
                          color: BRAND.dark,
                          border: 0,
                          borderRadius: 10,
                          padding: '12px',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = BRAND.accent;
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = BRAND.dark;
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Form */}
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
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              💳
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              سداد المدفوعات
            </h3>
          </div>
          
          <form onSubmit={pay} data-payment-form style={{ display: 'grid', gap: 16 }}>
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
                value={paymentForm.supplier}
                onChange={handlePaymentInput}
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
                {suppliers.length === 0 ? (
                  <option value="" disabled>لا توجد موردين - أضف مورد أولاً</option>
                ) : (
                  suppliers.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name || s.companyName} {s.phone ? `(${s.phone})` : ''}
                    </option>
                  ))
                )}
              </select>
              {suppliers.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                  ⚠️ لا توجد موردين. يرجى إضافة مورد أولاً من زر "➕ إضافة مورد"
                </div>
              )}
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
                  المبلغ ($) *
                </label>
                <input
                  name="amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={handlePaymentInput}
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
                  تاريخ السداد
                </label>
                <input
                  name="date"
                  type="date"
                  value={paymentForm.date}
                  onChange={handlePaymentInput}
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
              onClick={(e) => {
                if (!paymentForm.supplier || !paymentForm.amount) {
                  e.preventDefault();
                  notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
                }
              }}
              disabled={isSubmitting || suppliers.length === 0}
              style={{
                background: suppliers.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                border: 0,
                borderRadius: 12,
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: 16,
                cursor: (isSubmitting || suppliers.length === 0) ? 'not-allowed' : 'pointer',
                boxShadow: suppliers.length === 0 ? 'none' : '0 4px 15px rgba(34,197,94,0.3)',
                transition: 'all 0.3s ease',
                opacity: (isSubmitting || suppliers.length === 0) ? 0.7 : 1
              }}
              onMouseOver={e => {
                if (!isSubmitting && suppliers.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = suppliers.length === 0 ? 'none' : '0 4px 15px rgba(34,197,94,0.3)';
              }}
            >
              {isSubmitting ? '⏳ جاري السداد...' : suppliers.length === 0 ? '⚠️ لا توجد موردين' : '✓ تسجيل السداد'}
            </button>
          </form>

          {/* Recent Payments */}
          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: '2px solid ' + BRAND.light
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              color: BRAND.primary,
              fontSize: 18,
              fontWeight: 700
            }}>
              آخر عمليات السداد
            </h4>
            {recentPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: BRAND.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14 }}>لا توجد عمليات سداد حديثة</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {recentPayments.length > 0 ? recentPayments.map(p => {
                const supplierName = typeof p.supplier === 'object' ? 
                  (p.supplier?.name || p.supplier?.companyName || 'غير محدد') : 
                  (suppliers.find(s => (s._id || s.id) === p.supplier)?.name || suppliers.find(s => (s._id || s.id) === p.supplier)?.companyName || 'غير محدد');
                const paymentMethod = p.paymentMethod || 'cash';
                const methodLabels = {
                  'cash': '💵 نقدي',
                  'bank-transfer': '🏦 تحويل بنكي',
                  'check': '📝 شيك',
                  'credit-card': '💳 بطاقة ائتمانية'
                };
                return (
                  <div
                    key={p._id || p.id}
                    style={{
                      background: BRAND.light,
                      borderRadius: 12,
                      padding: 16,
                      border: '1px solid rgba(30,58,95,0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = BRAND.accent;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(42,157,143,0.15)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(30,58,95,0.05)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: BRAND.dark, 
                          fontSize: 15,
                          marginBottom: 8
                        }}>
                          {supplierName}
                        </div>
                        <div style={{ 
                          fontSize: 12, 
                          color: BRAND.muted,
                          marginBottom: 4
                        }}>
                          📅 {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : (p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar-SA') : '-')}
                        </div>
                        <div style={{ 
                          fontSize: 12, 
                          color: BRAND.muted,
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <span>{methodLabels[paymentMethod] || '💵 نقدي'}</span>
                          {p.paymentNumber && (
                            <span>📋 رقم: {p.paymentNumber}</span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        background: BRAND.accent,
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 16,
                        minWidth: '80px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(42,157,143,0.3)'
                      }}>
                        ${(p.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '20px', color: BRAND.muted }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 14 }}>لا توجد عمليات سداد</div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal isOpen={isSupplierModalOpen} onClose={() => setSupplierModalOpen(false)} title="إضافة مورد جديد">
          <form onSubmit={addSupplier} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                اسم المورد *
              </label>
              <input
                name="name"
                type="text"
                value={supplierForm.name}
                onChange={handleSupplierInput}
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
                اسم الشركة
              </label>
              <input
                name="companyName"
                type="text"
                value={supplierForm.companyName}
                onChange={handleSupplierInput}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 8,
                  color: BRAND.dark,
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  الهاتف *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={supplierForm.phone}
                  onChange={handleSupplierInput}
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
                  البريد الإلكتروني
                </label>
                <input
                  name="email"
                  type="email"
                  value={supplierForm.email}
                  onChange={handleSupplierInput}
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                المبلغ المستحق ($)
              </label>
              <input
                name="totalPurchases"
                type="number"
                value={supplierForm.totalPurchases}
                onChange={handleSupplierInput}
                placeholder="0"
                min="0"
                step="0.01"
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
              <div style={{ marginTop: 6, fontSize: 12, color: BRAND.muted }}>
                💡 المبلغ الإجمالي المستحق على المورد (اختياري)
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                العنوان
              </label>
              <textarea
                name="address"
                value={supplierForm.address}
                onChange={handleSupplierInput}
                rows={3}
                style={{
                  width: '100%',
                  padding: 14,
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: BRAND.light,
                  resize: 'vertical',
                  fontFamily: 'inherit'
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

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: BRAND.gradient,
                  color: '#fff',
                  border: 0,
                  borderRadius: 12,
                  padding: '14px 24px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(30,58,95,0.3)',
                  transition: 'all 0.3s ease',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onMouseOver={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,58,95,0.4)';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(30,58,95,0.3)';
                }}
              >
                {isSubmitting ? '⏳ جاري الإضافة...' : '✓ إضافة المورد'}
              </button>
              <button
                type="button"
                onClick={() => setSupplierModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  padding: '14px 24px',
                  background: '#f1f5f9',
                  color: BRAND.dark,
                  border: 0,
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = '#e2e8f0';
                  }
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#f1f5f9';
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
      </Modal>

      {/* Supplier Details Modal */}
      <Modal isOpen={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} title={selectedSupplier ? `تفاصيل ${selectedSupplier.name || selectedSupplier.companyName}` : ''}>
          {selectedSupplier && (
          <div style={{ lineHeight: 1.8 }}>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ color: BRAND.dark }}>الاسم:</strong> {selectedSupplier.name || selectedSupplier.companyName}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ color: BRAND.dark }}>الهاتف:</strong> {selectedSupplier.phone}
            </div>
            {selectedSupplier.email && (
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>البريد:</strong> {selectedSupplier.email}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <strong style={{ color: BRAND.dark }}>المستحق:</strong> ${(selectedSupplier.totalPurchases || 0).toLocaleString()}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ color: BRAND.dark }}>المدفوع:</strong> ${(selectedSupplier.totalPaid || 0).toLocaleString()}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong style={{ color: BRAND.dark }}>المتبقي:</strong> ${((selectedSupplier.totalPurchases || 0) - (selectedSupplier.totalPaid || 0)).toLocaleString()}
            </div>
          </div>
          )}
      </Modal>
    </div>
  );
}


