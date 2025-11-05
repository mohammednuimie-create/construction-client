import React, { useState, useEffect } from "react";
import { projectsAPI, requestsAPI, usersAPI, getUser } from "../../utils/api";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function AddProjectAndRequests(){
  const notifications = useNotifications();
  const [projectForm, setProjectForm] = useState({ 
    name: '', 
    client: '',
    budget: '', 
    description: '',
    location: '',
    startDate: '',
    expectedEndDate: '',
    notes: ''
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [clientRequests, setClientRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = getUser();
        const contractorId = user?.id || user?._id;
        
        // جلب الطلبات المرسلة للمقاول الحالي أو المعلقة (بدون مقاول محدد)
        const [requestsData, clientsData] = await Promise.all([
          requestsAPI.getAll({ status: 'pending' }),
          usersAPI.getAll({ role: 'client' })
        ]);
        
        // تصفية الطلبات: إما بدون مقاول محدد أو مرسلة للمقاول الحالي
        const filteredRequests = Array.isArray(requestsData) 
          ? requestsData.filter(req => 
              !req.contractor || 
              (req.contractor && (req.contractor._id || req.contractor) === contractorId) ||
              (typeof req.contractor === 'string' && req.contractor === contractorId)
            )
          : [];
        
        setClientRequests(filteredRequests);
        setClients(clientsData || []);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debug: Log advanced mode changes
  useEffect(() => {
    console.log('🔍 isAdvancedMode changed:', isAdvancedMode);
  }, [isAdvancedMode]);

  const handleProjectInput = (e) => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  };

  const saveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.budget) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = getUser();
      const projectData = {
        name: projectForm.name,
        client: projectForm.client || undefined, // ObjectId للعميل
        budget: parseFloat(projectForm.budget),
        description: projectForm.description || '',
        location: isAdvancedMode ? (projectForm.location || '') : '',
        startDate: isAdvancedMode && projectForm.startDate ? new Date(projectForm.startDate) : undefined,
        expectedEndDate: isAdvancedMode && projectForm.expectedEndDate ? new Date(projectForm.expectedEndDate) : undefined,
        notes: isAdvancedMode ? (projectForm.notes || '') : '',
        status: 'pending',
        contractor: user?.id || user?._id,
        createdBy: user?.id || user?._id,
        engineers: [],
        crews: [],
        materials: [],
        images: []
      };
      
      console.log('📤 إرسال بيانات المشروع:', projectData);
      const result = await projectsAPI.create(projectData);
      console.log('✅ تم حفظ المشروع:', result);
      notifications.success('نجح', `تم حفظ المشروع "${projectForm.name}" بنجاح`);
      setProjectForm({ 
        name: '', 
        client: '',
        budget: '', 
        description: '',
        location: '',
        startDate: '',
        expectedEndDate: '',
        notes: ''
      });
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء حفظ المشروع');
      console.error('Error creating project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accept = async (id) => {
    const request = clientRequests.find(r => (r._id || r.id) === id);
    if (!request) return;
    
    if (window.confirm(`هل أنت متأكد من قبول طلب "${request.title || request.name}"?`)) {
      try {
        const user = getUser();
        await requestsAPI.update(id, { 
          status: 'approved',
          contractor: user?.id || user?._id,
          responseDate: new Date()
        });
        
        // Create project from approved request
        const projectData = {
          name: request.title || request.name,
          budget: request.budget || 0,
          description: request.description || '',
          location: request.location || '',
          client: request.client || request.clientId || (typeof request.client === 'object' ? request.client._id || request.client.id : request.client),
          contractor: user?.id || user?._id,
          status: 'pending',
          engineers: [],
          crews: [],
          materials: [],
          images: []
        };
        await projectsAPI.create(projectData);
        
        // Refresh requests list
        const updatedRequests = await requestsAPI.getAll({ status: 'pending' });
        setClientRequests(Array.isArray(updatedRequests) ? updatedRequests : []);
        
        notifications.success('نجح', `تم قبول الطلب وإنشاء مشروع جديد بنجاح`);
      } catch (err) {
        notifications.error('خطأ', err.message || 'حدث خطأ أثناء قبول الطلب');
        console.error('Error accepting request:', err);
      }
    }
  };

  const reject = async (id) => {
    const request = clientRequests.find(r => (r._id || r.id) === id);
    if (!request) return;
    
    if (window.confirm(`هل أنت متأكد من رفض طلب "${request.title || request.name}"?`)) {
      try {
        const user = getUser();
        await requestsAPI.update(id, { 
          status: 'rejected',
          contractor: user?.id || user?._id,
          responseDate: new Date()
        });
        
        // Refresh requests list
        const updatedRequests = await requestsAPI.getAll({ status: 'pending' });
        setClientRequests(Array.isArray(updatedRequests) ? updatedRequests : []);
        
        notifications.warning('تم', 'تم رفض الطلب');
      } catch (err) {
        notifications.error('خطأ', err.message || 'حدث خطأ أثناء رفض الطلب');
        console.error('Error rejecting request:', err);
      }
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
            إضافة مشروع + طلبات العملاء
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
            إضافة مشروع جديد أو إدارة طلبات العملاء المعلقة
          </p>
        </div>
        <button
          onClick={() => {
            console.log('🔄 تبديل النموذج:', !isAdvancedMode);
            setIsAdvancedMode(!isAdvancedMode);
          }}
          style={{
            background: isAdvancedMode ? BRAND.gradient : BRAND.light,
            color: isAdvancedMode ? '#fff' : BRAND.dark,
            border: 0,
            borderRadius: 12,
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: isAdvancedMode ? '0 4px 12px rgba(30,58,95,0.3)' : 'none'
          }}
          onMouseOver={e => {
            if (!isAdvancedMode) {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={e => {
            if (!isAdvancedMode) {
              e.currentTarget.style.background = BRAND.light;
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          <span>⚙️</span>
          <span>{isAdvancedMode ? 'نموذج بسيط' : 'نموذج متقدم'}</span>
        </button>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 24
      }}>
        {/* Add Project Form */}
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
              ➕
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              إضافة مشروع جديد
            </h3>
          </div>
          
          <form onSubmit={saveProject} style={{ display: 'grid', gap: 16 }}>
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
              <input
                name="name"
                value={projectForm.name}
                onChange={handleProjectInput}
                placeholder="أدخل اسم المشروع"
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
                العميل *
              </label>
              <select
                name="client"
                value={projectForm.client}
                onChange={handleProjectInput}
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
                <option value="">اختر العميل</option>
                {clients.length === 0 ? (
                  <option value="" disabled>لا توجد عملاء - أضف عميل أولاً من صفحة العملاء والمتعاقدين</option>
                ) : (
                  clients.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} {c.email ? `(${c.email})` : ''}
                    </option>
                  ))
                )}
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
                الميزانية ($) *
              </label>
              <input
                name="budget"
                type="number"
                value={projectForm.budget}
                onChange={handleProjectInput}
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
                الوصف
              </label>
              <textarea
                name="description"
                value={projectForm.description}
                onChange={handleProjectInput}
                placeholder="وصف مختصر عن المشروع"
                rows={4}
                style={{
                  width: '100%',
                  padding: 14,
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: BRAND.light,
                  fontFamily: 'inherit',
                  resize: 'vertical'
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

            {/* Advanced Mode Fields */}
            {isAdvancedMode ? (
              <>
                <div style={{
                  padding: '16px',
                  background: '#f0f9ff',
                  borderRadius: 12,
                  border: `2px solid ${BRAND.accent}`,
                  marginBottom: 16
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    marginBottom: 8,
                    color: BRAND.primary,
                    fontWeight: 700
                  }}>
                    <span>⚙️</span>
                    <span>النموذج المتقدم مفعّل</span>
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: BRAND.muted 
                  }}>
                    يمكنك إضافة معلومات إضافية عن المشروع
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
                    الموقع
                  </label>
                  <input
                    name="location"
                    type="text"
                    value={projectForm.location}
                    onChange={handleProjectInput}
                    placeholder="موقع المشروع"
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
                      تاريخ البدء
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={projectForm.startDate}
                      onChange={handleProjectInput}
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
                      تاريخ الانتهاء المتوقع
                    </label>
                    <input
                      name="expectedEndDate"
                      type="date"
                      value={projectForm.expectedEndDate}
                      onChange={handleProjectInput}
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
                    ملاحظات
                  </label>
                  <textarea
                    name="notes"
                    value={projectForm.notes}
                    onChange={handleProjectInput}
                    placeholder="ملاحظات إضافية عن المشروع"
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
              </>
            ) : (
              <div style={{
                padding: '12px',
                background: '#fef3c7',
                borderRadius: 8,
                border: '1px solid #fbbf24',
                textAlign: 'center',
                color: '#92400e',
                fontSize: 13
              }}>
                💡 انقر على "⚙️ نموذج متقدم" أعلاه لإظهار الحقول الإضافية
              </div>
            )}
            
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
              {isSubmitting ? '⏳ جاري الحفظ...' : '✓ حفظ المشروع'}
            </button>
          </form>
        </div>

        {/* Client Requests */}
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
              📥
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              طلبات العملاء ({clientRequests.length})
            </h3>
          </div>
          
          {clientRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: BRAND.muted
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16 }}>لا توجد طلبات جديدة</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                  <div style={{ fontSize: 16 }}>جاري تحميل الطلبات...</div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ef4444' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
                  <div style={{ fontSize: 16 }}>{error}</div>
                </div>
              ) : (
                clientRequests.map(r => (
                  <div
                    key={r._id || r.id}
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
                        marginBottom: 6
                      }}>
                        {r.title || r.name}
                      </div>
                      {r.description && (
                        <div style={{
                          color: BRAND.muted,
                          fontSize: 13,
                          marginBottom: 8,
                          lineHeight: 1.5
                        }}>
                          {r.description}
                        </div>
                      )}
                      <div style={{
                        color: BRAND.muted,
                        fontSize: 13,
                        marginBottom: 4
                      }}>
                        📋 رقم الطلب: {r.requestNumber || r._id || r.id}
                      </div>
                      <div style={{
                        color: BRAND.accent,
                        fontWeight: 700,
                        fontSize: 16,
                        marginTop: 4
                      }}>
                        💰 {r.budget ? `$${r.budget.toLocaleString()}` : 'غير محدد'}
                      </div>
                      <div style={{
                        color: BRAND.muted,
                        fontSize: 12,
                        marginTop: 6
                      }}>
                        📅 {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : (r.date || '-')}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid rgba(30,58,95,0.1)'
                  }}>
                    <button
                      onClick={() => accept(r._id || r.id)}
                      style={{
                        flex: 1,
                        background: '#22c55e',
                        color: '#fff',
                        border: 0,
                        borderRadius: 10,
                        padding: '12px',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.4)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(34,197,94,0.3)';
                      }}
                    >
                      ✓ قبول
                    </button>
                    <button
                      onClick={() => reject(r._id || r.id)}
                      style={{
                        flex: 1,
                        background: '#ef4444',
                        color: '#fff',
                        border: 0,
                        borderRadius: 10,
                        padding: '12px',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)';
                      }}
                    >
                      ✗ رفض
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


