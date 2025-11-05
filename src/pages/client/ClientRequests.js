import React, { useState, useEffect } from "react";
import { requestsAPI, projectsAPI, getUser } from "../../utils/api";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function ClientRequests() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allItems, setAllItems] = useState([]); // دمج Requests و Projects
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#fef3c7', color: '#92400e', text: 'قيد المراجعة', icon: '⏳' },
      approved: { background: '#d1fae5', color: '#065f46', text: 'مقبول', icon: '✓' },
      'in-progress': { background: '#dbeafe', color: '#1e40af', text: 'قيد التنفيذ', icon: '🔄' },
      completed: { background: '#d1fae5', color: '#065f46', text: 'مكتمل', icon: '✅' },
      rejected: { background: '#fee2e2', color: '#991b1b', text: 'مرفوض', icon: '✗' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: style.background,
        color: style.color
      }}>
        <span>{style.icon}</span>
        <span>{style.text}</span>
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = getUser();
        if (!user || !user.id) {
          setError('يرجى تسجيل الدخول أولاً');
          setIsLoading(false);
          return;
        }

        const clientId = user.id || user._id;
        console.log('🔍 Client ID:', clientId, 'User:', user);
        
        // جلب Requests
        const requestFilters = { client: clientId };
        if (filter !== 'all') {
          requestFilters.status = filter;
        }
        console.log('📋 Fetching requests with filters:', requestFilters);
        const requestsData = await requestsAPI.getAll(requestFilters);
        console.log('✅ Requests data:', requestsData);

        // جلب Projects (المشاريع التي أنشأها المقاول)
        const projectFilters = { client: clientId };
        if (filter !== 'all') {
          projectFilters.status = filter;
        }
        console.log('📁 Fetching projects with filters:', projectFilters);
        const projectsData = await projectsAPI.getAll(projectFilters);
        console.log('✅ Projects data:', projectsData);

        setRequests(Array.isArray(requestsData) ? requestsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        // دمج Requests و Projects مع إضافة نوع لكل عنصر
        const mergedItems = [
          ...(Array.isArray(requestsData) ? requestsData.map(r => ({ ...r, itemType: 'request' })) : []),
          ...(Array.isArray(projectsData) ? projectsData.map(p => ({ ...p, itemType: 'project' })) : [])
        ].sort((a, b) => {
          // ترتيب حسب التاريخ (الأحدث أولاً)
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });

        setAllItems(mergedItems);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const filteredRequests = allItems;

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
          طلباتي
        </h2>
        <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
          متابعة حالة طلبات المشاريع المقدمة للمتعاقدين
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'الكل', count: allItems.length },
          { key: 'pending', label: 'قيد المراجعة', count: allItems.filter(r => r.status === 'pending').length },
          { key: 'approved', label: 'مقبول', count: allItems.filter(r => r.status === 'approved').length },
          { key: 'in-progress', label: 'جاري التنفيذ', count: allItems.filter(r => r.status === 'in-progress').length },
          { key: 'completed', label: 'مكتمل', count: allItems.filter(r => r.status === 'completed').length },
          { key: 'rejected', label: 'مرفوض', count: allItems.filter(r => r.status === 'rejected').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? BRAND.gradient : '#fff',
              color: filter === f.key ? '#fff' : BRAND.dark,
              border: filter === f.key ? 'none' : '2px solid #e5e7eb',
              borderRadius: 12,
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: filter === f.key ? '0 4px 15px rgba(42,157,143,0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseOver={e => {
              if (filter !== f.key) {
                e.currentTarget.style.borderColor = BRAND.accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={e => {
              if (filter !== f.key) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            <span>{f.label}</span>
            <span style={{
              background: filter === f.key ? 'rgba(255,255,255,0.3)' : BRAND.light,
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
        overflow: 'hidden',
        border: '1px solid rgba(30,58,95,0.05)'
      }}>
        {isLoading ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: BRAND.muted
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>جاري التحميل...</div>
          </div>
        ) : error ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#ef4444'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{error}</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: BRAND.muted
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>لا توجد طلبات</div>
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
                  }}>المشروع</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>رقم الطلب</th>
                  <th style={{
                    textAlign: 'right',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>تاريخ الطلب</th>
                  <th style={{
                    textAlign: 'center',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>الحالة</th>
                  <th style={{
                    textAlign: 'center',
                    padding: 16,
                    fontWeight: 700,
                    fontSize: 14
                  }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r, i) => (
                  <tr
                    key={r._id || r.id}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {r.itemType === 'project' ? '📁' : '📋'}
                        <span>{r.title || r.name}</span>
                        {r.itemType === 'project' && (
                          <span style={{
                            background: BRAND.accent + '20',
                            color: BRAND.accent,
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            مشروع
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: 16,
                      color: BRAND.accent,
                      fontWeight: 700
                    }}>
                      {r.requestNumber || r.projectNumber || r._id || r.id}
                    </td>
                    <td style={{ padding: 16, color: BRAND.muted, fontSize: 14 }}>
                      📅 {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : (r.date || '-')}
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      {getStatusBadge(r.status)}
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedRequest(r)}
                        style={{
                          background: '#f1f5f9',
                          color: BRAND.dark,
                          border: 0,
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontWeight: 700,
                          fontSize: 13,
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          onClick={() => setSelectedRequest(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              maxWidth: 600,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(30,58,95,0.1)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <style>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '2px solid ' + BRAND.light
            }}>
              <h3 style={{
                margin: 0,
                color: BRAND.primary,
                fontSize: 24,
                fontWeight: 800
              }}>
                {selectedRequest.itemType === 'project' ? 'تفاصيل المشروع' : 'تفاصيل الطلب'}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: '#f1f5f9',
                  border: 0,
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 18,
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ lineHeight: 1.8 }}>
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>{selectedRequest.itemType === 'project' ? 'رقم المشروع:' : 'رقم الطلب:'}</strong>{' '}
                <span style={{ color: BRAND.muted }}>{selectedRequest.requestNumber || selectedRequest.projectNumber || selectedRequest._id || selectedRequest.id}</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>اسم المشروع:</strong>{' '}
                <span style={{ color: BRAND.muted }}>{selectedRequest.title || selectedRequest.name}</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>الموقع:</strong>{' '}
                <span style={{ color: BRAND.muted }}>{selectedRequest.location || '-'}</span>
              </div>
              {selectedRequest.itemType === 'project' && selectedRequest.budget && (
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: BRAND.dark }}>الميزانية:</strong>{' '}
                  <span style={{ color: BRAND.accent, fontWeight: 700 }}>${(selectedRequest.budget || 0).toLocaleString()}</span>
                </div>
              )}
              {selectedRequest.itemType === 'project' && selectedRequest.totalCost && (
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: BRAND.dark }}>التكلفة الإجمالية:</strong>{' '}
                  <span style={{ color: BRAND.primary, fontWeight: 700 }}>${(selectedRequest.totalCost || 0).toLocaleString()}</span>
                </div>
              )}
              {selectedRequest.itemType === 'project' && selectedRequest.progress !== undefined && (
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: BRAND.dark }}>التقدم:</strong>{' '}
                  <span style={{ color: BRAND.accent, fontWeight: 700 }}>{selectedRequest.progress || 0}%</span>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>تاريخ متوقع:</strong>{' '}
                <span style={{ color: BRAND.muted }}>{
                  selectedRequest.expectedDate ? new Date(selectedRequest.expectedDate).toLocaleDateString('ar-SA') :
                  selectedRequest.expectedEndDate ? new Date(selectedRequest.expectedEndDate).toLocaleDateString('ar-SA') :
                  '-'
                }</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>{selectedRequest.itemType === 'project' ? 'تاريخ الإنشاء:' : 'تاريخ الطلب:'}</strong>{' '}
                <span style={{ color: BRAND.muted }}>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString('ar-SA') : (selectedRequest.date || '-')}</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>الحالة:</strong>{' '}
                {getStatusBadge(selectedRequest.status)}
              </div>
              {selectedRequest.itemType === 'request' && (
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: BRAND.dark }}>الأولوية:</strong>{' '}
                  <span style={{ color: BRAND.muted }}>{selectedRequest.priority || 'medium'}</span>
                </div>
              )}
              {selectedRequest.response && (
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: BRAND.dark }}>الرد:</strong>{' '}
                  <span style={{ color: BRAND.muted }}>{selectedRequest.response}</span>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <strong style={{ color: BRAND.dark }}>التفاصيل:</strong>
                <div style={{
                  marginTop: 8,
                  padding: 12,
                  background: BRAND.light,
                  borderRadius: 8,
                  color: BRAND.muted
                }}>
                  {selectedRequest.description || selectedRequest.details || 'لا توجد تفاصيل'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



