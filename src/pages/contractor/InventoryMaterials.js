import React, { useState, useEffect } from "react";
import Modal from "../../Modal";
import { materialsAPI } from "../../utils/api";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function InventoryMaterials(){
  const notifications = useNotifications();
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: '', minStock: '', location: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // eslint-disable-line no-unused-vars

  const filteredMaterials = materials.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMaterials = materials.filter(m => (m.quantity || 0) < (m.minStock || 0));

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await materialsAPI.getAll();
      setMaterials(data || []);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء جلب المواد');
      console.error('Error fetching materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.name || !newMaterial.unit) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      await materialsAPI.create({
        name: newMaterial.name,
        unit: newMaterial.unit,
        quantity: 0,
        minStock: parseFloat(newMaterial.minStock) || 0,
        location: newMaterial.location || 'المخزن الرئيسي'
      });
      setNewMaterial({ name: '', unit: '', minStock: '', location: '' });
      setModalOpen(false);
      notifications.success('نجح', 'تم إضافة المادة بنجاح');
      fetchMaterials();
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء إضافة المادة');
      console.error('Error adding material:', err);
    }
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, system-ui, Arial' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 30
      }}>
        <div>
          <h2 style={{
            fontWeight: 900,
            color: BRAND.primary,
            fontSize: 32,
            margin: '0 0 8px 0',
            letterSpacing: '-1px'
          }}>
            المخازن والمواد
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
            إدارة المواد والمخزون في جميع المواقع
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: BRAND.gradient,
            color: '#fff',
            border: 0,
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
          }}
        >
          <span>➕</span>
          <span>إضافة مادة</span>
        </button>
      </div>

      {/* Stats Cards */}
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
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.primary, marginBottom: 6 }}>
            {materials.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>إجمالي المواد</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b', marginBottom: 6 }}>
            {lowStockMaterials.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>مواد منخفضة المخزون</div>
        </div>
      </div>

      {/* Search */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
        border: '1px solid rgba(30,58,95,0.05)'
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 18,
            color: BRAND.muted
          }}>🔍</span>
          <input
            placeholder="ابحث عن مادة أو موقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 45px',
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

      {/* Materials Table */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
        overflow: 'hidden',
        border: '1px solid rgba(30,58,95,0.05)'
      }}>
        {filteredMaterials.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: BRAND.muted
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>لا توجد مواد</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: BRAND.gradient,
                  color: '#fff'
                }}>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>#</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>المادة</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>الوحدة</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>المتوفر</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>الحد الأدنى</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>الموقع</th>
                  <th style={{
                    textAlign: 'center',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((r, i) => {
                  const isLowStock = r.stock < r.minStock;
                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = BRAND.light}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: 16, color: BRAND.muted, fontWeight: 600 }}>
                        {i + 1}
                      </td>
                      <td style={{
                        padding: 16,
                        fontWeight: 700,
                        color: BRAND.dark
                      }}>
                        {r.name}
                      </td>
                      <td style={{ padding: 16, color: BRAND.muted, fontWeight: 600 }}>
                        {r.unit}
                      </td>
                      <td style={{
                        padding: 16,
                        fontWeight: 700,
                        color: isLowStock ? '#ef4444' : BRAND.accent
                      }}>
                        {r.stock}
                      </td>
                      <td style={{ padding: 16, color: BRAND.muted, fontWeight: 600 }}>
                        {r.minStock}
                      </td>
                      <td style={{ padding: 16, color: BRAND.muted, fontSize: 14 }}>
                        📍 {r.location}
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        {isLowStock ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            background: '#fee2e2',
                            color: '#991b1b'
                          }}>
                            ⚠️ منخفض
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            background: '#d1fae5',
                            color: '#065f46'
                          }}>
                            ✓ كافٍ
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="إضافة مادة جديدة">
        <form onSubmit={handleAddMaterial}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              اسم المادة *
            </label>
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              placeholder="مثال: حديد تسليح"
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
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 20
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                الوحدة *
              </label>
              <input
                type="text"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                placeholder="مثال: طن"
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
                الحد الأدنى
              </label>
              <input
                type="number"
                value={newMaterial.minStock}
                onChange={(e) => setNewMaterial({ ...newMaterial, minStock: e.target.value })}
                placeholder="0"
                min="0"
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
          
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              الموقع
            </label>
            <input
              type="text"
              value={newMaterial.location}
              onChange={(e) => setNewMaterial({ ...newMaterial, location: e.target.value })}
              placeholder="المخزن الرئيسي"
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
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            paddingTop: 20,
            borderTop: '2px solid ' + BRAND.light,
            marginTop: 24
          }}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{
                background: '#f1f5f9',
                color: BRAND.dark,
                border: 0,
                padding: '12px 28px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.transform = 'none';
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              style={{
                background: BRAND.gradient,
                color: '#fff',
                border: 0,
                padding: '12px 28px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
              }}
            >
              إضافة المادة ✓
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


