import React, { useState, useEffect } from "react";
import Modal from "../../Modal";
import { usersAPI, projectsAPI } from "../../utils/api";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function ClientsAndContractors(){
  const notifications = useNotifications();
  const [clients, setClients] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const [isContractorModalOpen, setContractorModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' });
  const [contractorForm, setContractorForm] = useState({ name: '', phone: '', email: '', specialization: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', specialization: '' });
  const [editingPerson, setEditingPerson] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personType, setPersonType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newClientPassword, setNewClientPassword] = useState(null);
  const [newClientEmail, setNewClientEmail] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [clientsData, contractorsData, projectsData] = await Promise.all([
          usersAPI.getAll({ role: 'client' }),
          usersAPI.getAll({ role: 'contractor' }),
          projectsAPI.getAll()
        ]);
        setClients(clientsData || []);
        setContractors(contractorsData || []);
        setProjects(projectsData || []);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClientInput = (e) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleContractorInput = (e) => {
    setContractorForm({ ...contractorForm, [e.target.name]: e.target.value });
  };

  // توليد كلمة مرور عشوائية
  const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const addClient = async (e) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone || !clientForm.email) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      // توليد كلمة مرور عشوائية
      const tempPassword = generatePassword();
      
      await usersAPI.create({
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        role: 'client',
        password: tempPassword
      });
      
      // حفظ كلمة المرور والبريد الإلكتروني لإظهارها للمقاول
      const clientEmail = clientForm.email;
      setNewClientPassword(tempPassword);
      setNewClientEmail(clientEmail);
      setShowPasswordModal(true);
      
      notifications.success('نجح', `تم إضافة العميل ${clientForm.name} بنجاح`);
      setClientForm({ name: '', phone: '', email: '' });
      setClientModalOpen(false);
      
      // إعادة جلب البيانات
      const clientsData = await usersAPI.getAll({ role: 'client' });
      setClients(clientsData || []);
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء إضافة العميل');
      console.error('Error adding client:', err);
    }
  };

  const addContractor = async (e) => {
    e.preventDefault();
    if (!contractorForm.name || !contractorForm.phone || !contractorForm.email) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      await usersAPI.create({
        name: contractorForm.name,
        email: contractorForm.email,
        phone: contractorForm.phone,
        role: 'contractor',
        password: 'temp123' // يجب تغييره لاحقاً
      });
      notifications.success('نجح', `تم إضافة المتعاقد ${contractorForm.name} بنجاح`);
      setContractorForm({ name: '', phone: '', email: '', specialization: '' });
      setContractorModalOpen(false);
      // إعادة جلب البيانات
      const contractorsData = await usersAPI.getAll({ role: 'contractor' });
      setContractors(contractorsData || []);
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء إضافة المتعاقد');
      console.error('Error adding contractor:', err);
    }
  };

  const showDetails = async (person, type) => {
    setSelectedPerson(person);
    setPersonType(type);
    
    // جلب معلومات المشاريع للعميل/المتعاقد
    try {
      let filteredProjects = [];
      
      if (type === 'client') {
        // للعملاء: البحث عن client كـ String (اسم) أو ObjectId
        const personId = person._id || person.id;
        const personName = person.name;
        
        // جلب جميع المشاريع ثم فلترتها
        const allProjects = await projectsAPI.getAll();
        filteredProjects = (allProjects || []).filter(p => {
          const clientId = p.client?._id || p.client?.id || p.client;
          return clientId === personId || 
                 clientId === personName || 
                 p.client === personId || 
                 p.client === personName ||
                 (typeof p.client === 'string' && p.client.toLowerCase() === personName?.toLowerCase());
        });
      } else if (type === 'contractor') {
        // للمتعاقدين: البحث عن contractor كـ ObjectId
        const personId = person._id || person.id;
        const filters = { contractor: personId };
        filteredProjects = await projectsAPI.getAll(filters);
      }
      
      const projectsCount = filteredProjects?.length || 0;
      const totalValue = filteredProjects?.reduce((sum, p) => sum + (p.budget || p.totalCost || 0), 0) || 0;
      
      console.log(`📊 ${type === 'client' ? 'العميل' : 'المتعاقد'}: ${person.name}`);
      console.log(`   - عدد المشاريع: ${projectsCount}`);
      console.log(`   - القيمة الإجمالية: $${totalValue.toLocaleString()}`);
      console.log(`   - المشاريع:`, filteredProjects.map(p => p.name));
      
      setSelectedPerson({
        ...person,
        projectsCount,
        totalValue
      });
    } catch (err) {
      console.error('Error fetching projects:', err);
      setSelectedPerson({
        ...person,
        projectsCount: 0,
        totalValue: 0
      });
    }
  };

  const showEditModal = (person, type) => {
    setEditingPerson(person);
    setEditingType(type);
    setEditForm({
      name: person.name || '',
      phone: person.phone || '',
      email: person.email || '',
      specialization: person.specialization || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditInput = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const updatePerson = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.phone) {
      notifications.warning('تحذير', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    try {
      const personId = editingPerson._id || editingPerson.id;
      await usersAPI.update(personId, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        ...(editingType === 'contractor' && { specialization: editForm.specialization })
      });
      
      notifications.success('نجح', `تم تحديث ${editingType === 'client' ? 'العميل' : 'المتعاقد'} بنجاح`);
      setIsEditModalOpen(false);
      setEditingPerson(null);
      setEditingType(null);
      
      // إعادة جلب البيانات
      const [clientsData, contractorsData] = await Promise.all([
        usersAPI.getAll({ role: 'client' }),
        usersAPI.getAll({ role: 'contractor' })
      ]);
      setClients(clientsData || []);
      setContractors(contractorsData || []);
    } catch (err) {
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء التحديث');
      console.error('Error updating person:', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{error}</div>
      </div>
    );
  }

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
            العملاء والمتعاقدون
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
            إدارة قائمة العملاء والمتعاقدين
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setClientModalOpen(true)}
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
            <span>إضافة عميل</span>
          </button>
          <button
            onClick={() => setContractorModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
              color: '#fff',
              border: 0,
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(244,162,97,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(244,162,97,0.4)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(244,162,97,0.3)';
            }}
          >
            <span>➕</span>
            <span>إضافة متعاقد</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
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
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.primary, marginBottom: 6 }}>
            {clients.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>إجمالي العملاء</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#f4a261', marginBottom: 6 }}>
            {contractors.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>إجمالي المتعاقدين</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.accent, marginBottom: 6 }}>
            {projects.length}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>إجمالي المشاريع</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
          border: '1px solid rgba(30,58,95,0.05)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginBottom: 6 }}>
            ${projects.reduce((sum, p) => sum + (p.budget || p.totalCost || 0), 0).toLocaleString()}
          </div>
          <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>القيمة الإجمالية</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: 24
      }}>
        {/* Clients */}
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
              👥
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              العملاء ({clients.length})
            </h3>
          </div>
          
          {clients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16 }}>لا توجد عملاء</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {clients.map(c => (
                <div
                  key={c._id || c.id}
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
                        {c.name}
                      </div>
                      <div style={{
                        color: BRAND.muted,
                        fontSize: 14,
                        marginBottom: 6
                      }}>
                        📞 {c.phone}
                      </div>
                      {c.email && (
                        <div style={{
                          color: BRAND.muted,
                          fontSize: 13,
                          marginBottom: 6
                        }}>
                          ✉️ {c.email}
                        </div>
                      )}
                      {(() => {
                        const clientProjects = projects.filter(p => {
                          const clientId = p.client?._id || p.client?.id || p.client;
                          const clientName = p.client?.name || p.client;
                          const personId = c._id || c.id;
                          const personName = c.name;
                          
                          // مطابقة بعدة طرق لأن client في Project قد يكون String أو ObjectId
                          return clientId === personId || 
                                 clientId === personName ||
                                 clientName === personId ||
                                 clientName === personName ||
                                 (typeof p.client === 'string' && p.client.toLowerCase() === personName?.toLowerCase());
                        });
                        const projectsCount = clientProjects.length;
                        const totalValue = clientProjects.reduce((sum, p) => sum + (p.budget || p.totalCost || 0), 0);
                        return (
                          <div style={{
                            display: 'flex',
                            gap: 16,
                            marginTop: 12,
                            fontSize: 13
                          }}>
                            <span style={{ color: BRAND.muted }}>
                              📁 مشاريع: <strong style={{ color: BRAND.dark }}>{projectsCount}</strong>
                            </span>
                            <span style={{ color: BRAND.muted }}>
                              💰 إجمالي: <strong style={{ color: BRAND.accent }}>${totalValue.toLocaleString()}</strong>
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12
                  }}>
                    <button
                      onClick={() => showDetails(c, 'client')}
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
                    <button
                      onClick={() => showEditModal(c, 'client')}
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: 0,
                        borderRadius: 10,
                        padding: '12px 16px',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minWidth: '50px'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#fbbf24';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = '#fef3c7';
                        e.currentTarget.style.color = '#92400e';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      ✏️ تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contractors */}
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
              🔧
            </div>
            <h3 style={{
              margin: 0,
              color: BRAND.primary,
              fontSize: 22,
              fontWeight: 800
            }}>
              المتعاقدون ({contractors.length})
            </h3>
          </div>
          
          {contractors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: BRAND.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16 }}>لا توجد متعاقدين</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {contractors.map(c => (
                <div
                  key={c._id || c.id}
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
                        {c.name}
                      </div>
                      <div style={{
                        color: BRAND.muted,
                        fontSize: 13,
                        marginBottom: 6,
                        padding: '4px 10px',
                        background: '#fff',
                        borderRadius: 8,
                        display: 'inline-block'
                      }}>
                        🏷️ {c.specialization}
                      </div>
                      <div style={{
                        color: BRAND.muted,
                        fontSize: 14,
                        marginTop: 8,
                        marginBottom: 6
                      }}>
                        📞 {c.phone}
                      </div>
                      {c.email && (
                        <div style={{
                          color: BRAND.muted,
                          fontSize: 13,
                          marginBottom: 6
                        }}>
                          ✉️ {c.email}
                        </div>
                      )}
                      {(() => {
                        const contractorProjects = projects.filter(p => {
                          const contractorId = p.contractor?._id || p.contractor?.id || p.contractor;
                          return contractorId === (c._id || c.id);
                        });
                        const projectsCount = contractorProjects.length;
                        return (
                          <div style={{
                            marginTop: 12,
                            fontSize: 13,
                            color: BRAND.muted
                          }}>
                            📁 مشاريع: <strong style={{ color: BRAND.dark }}>{projectsCount}</strong>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12
                  }}>
                    <button
                      onClick={() => showDetails(c, 'contractor')}
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
                    <button
                      onClick={() => showEditModal(c, 'contractor')}
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: 0,
                        borderRadius: 10,
                        padding: '12px 16px',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minWidth: '50px'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#fbbf24';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = '#fef3c7';
                        e.currentTarget.style.color = '#92400e';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      ✏️ تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setClientModalOpen(false)} title="إضافة عميل جديد">
        <form onSubmit={addClient}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              اسم العميل *
            </label>
            <input
              type="text"
              name="name"
              value={clientForm.name}
              onChange={handleClientInput}
              placeholder="اسم العميل أو الشركة"
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
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phone"
                value={clientForm.phone}
                onChange={handleClientInput}
                placeholder="0500000000"
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
                type="email"
                name="email"
                value={clientForm.email}
                onChange={handleClientInput}
                placeholder="email@example.com"
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
              onClick={() => setClientModalOpen(false)}
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
              إضافة العميل ✓
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Contractor Modal */}
      <Modal isOpen={isContractorModalOpen} onClose={() => setContractorModalOpen(false)} title="إضافة متعاقد جديد">
        <form onSubmit={addContractor}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              اسم المتعاقد *
            </label>
            <input
              type="text"
              name="name"
              value={contractorForm.name}
              onChange={handleContractorInput}
              placeholder="اسم المتعاقد"
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
          
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              التخصص *
            </label>
            <input
              type="text"
              name="specialization"
              value={contractorForm.specialization}
              onChange={handleContractorInput}
              placeholder="مثال: كهرباء، حدادة، سباكة"
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
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phone"
                value={contractorForm.phone}
                onChange={handleContractorInput}
                placeholder="0500000000"
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
                type="email"
                name="email"
                value={contractorForm.email}
                onChange={handleContractorInput}
                placeholder="email@example.com"
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
              onClick={() => setContractorModalOpen(false)}
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
                background: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
                color: '#fff',
                border: 0,
                padding: '12px 28px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 15px rgba(244,162,97,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(244,162,97,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(244,162,97,0.3)';
              }}
            >
              إضافة المتعاقد ✓
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPerson(null);
          setEditingType(null);
        }} 
        title={editingPerson ? `تعديل ${editingType === 'client' ? 'العميل' : 'المتعاقد'}: ${editingPerson.name}` : ''}
      >
        <form onSubmit={updatePerson}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              الاسم *
            </label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditInput}
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
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditInput}
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
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditInput}
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

          {editingType === 'contractor' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                color: BRAND.dark,
                fontWeight: 600,
                fontSize: 14
              }}>
                التخصص
              </label>
              <input
                type="text"
                name="specialization"
                value={editForm.specialization}
                onChange={handleEditInput}
                placeholder="مثال: بناء، كهرباء، سباكة..."
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
          )}

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
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPerson(null);
                setEditingType(null);
              }}
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
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#fff',
                border: 0,
                padding: '12px 28px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 15px rgba(251,191,36,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(251,191,36,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(251,191,36,0.3)';
              }}
            >
              حفظ التعديلات ✓
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal 
        isOpen={!!selectedPerson} 
        onClose={() => setSelectedPerson(null)} 
        title={selectedPerson ? `تفاصيل ${personType === 'client' ? 'العميل' : 'المتعاقد'}: ${selectedPerson.name}` : ''}
      >
        {selectedPerson && (
          <div style={{ lineHeight: 2 }}>
            <div style={{
              background: BRAND.light,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 6 }}>الاسم الكامل</div>
                <div style={{ color: BRAND.dark, fontSize: 18, fontWeight: 700 }}>
                  {selectedPerson.name}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 6 }}>📞 رقم الهاتف</div>
                <div style={{ color: BRAND.dark, fontSize: 16 }}>
                  {selectedPerson.phone}
                </div>
              </div>
              {selectedPerson.email && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 6 }}>✉️ البريد الإلكتروني</div>
                  <div style={{ color: BRAND.dark, fontSize: 16 }}>
                    {selectedPerson.email}
                  </div>
                </div>
              )}
              {selectedPerson.specialization && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: BRAND.muted, fontSize: 13, marginBottom: 6 }}>🔧 التخصص</div>
                  <div style={{ color: BRAND.dark, fontSize: 16 }}>
                    {selectedPerson.specialization}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              background: BRAND.light,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                color: BRAND.primary,
                fontSize: 16,
                fontWeight: 700
              }}>
                📊 الإحصائيات
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16
              }}>
                <div>
                  <div style={{ color: BRAND.muted, fontSize: 12, marginBottom: 4 }}>عدد المشاريع</div>
                  <div style={{ color: BRAND.dark, fontSize: 20, fontWeight: 700 }}>
                    {selectedPerson.projectsCount || 0}
                  </div>
                </div>
                <div>
                  <div style={{ color: BRAND.muted, fontSize: 12, marginBottom: 4 }}>القيمة الإجمالية</div>
                  <div style={{ color: BRAND.accent, fontSize: 20, fontWeight: 700 }}>
                    ${(selectedPerson.totalValue || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#fff',
                borderRadius: 8,
                border: '1px solid rgba(30,58,95,0.1)',
                fontSize: 11,
                color: BRAND.muted,
                lineHeight: 1.6
              }}>
                <strong style={{ color: BRAND.dark }}>📊 كيفية الحساب:</strong><br/>
                • <strong>عدد المشاريع:</strong> يتم حساب عدد المشاريع المرتبطة بهذا {personType === 'client' ? 'العميل' : 'المتعاقد'}<br/>
                • <strong>القيمة الإجمالية:</strong> مجموع (الميزانية أو التكلفة الإجمالية) لكل مشروع مرتبط<br/>
                • يتم البحث عن المشاريع بناءً على {personType === 'client' ? 'اسم العميل أو رقمه' : 'رقم المتعاقد'}
              </div>
            </div>

            {(() => {
              const personProjects = projects.filter(p => {
                if (personType === 'client') {
                  const clientId = p.client?._id || p.client?.id || p.client;
                  const clientName = p.client?.name || p.client;
                  const personId = selectedPerson._id || selectedPerson.id;
                  const personName = selectedPerson.name;
                  
                  // مطابقة بعدة طرق لأن client في Project قد يكون String أو ObjectId
                  return clientId === personId || 
                         clientId === personName ||
                         clientName === personId ||
                         clientName === personName ||
                         (typeof p.client === 'string' && p.client.toLowerCase() === personName?.toLowerCase());
                } else {
                  const contractorId = p.contractor?._id || p.contractor?.id || p.contractor;
                  const personId = selectedPerson._id || selectedPerson.id;
                  return contractorId === personId ||
                         (typeof contractorId === 'string' && contractorId === personId);
                }
              });

              if (personProjects.length > 0) {
                return (
                  <div style={{
                    background: BRAND.light,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20
                  }}>
                    <h4 style={{
                      margin: '0 0 16px 0',
                      color: BRAND.primary,
                      fontSize: 16,
                      fontWeight: 700
                    }}>
                      📁 المشاريع ({personProjects.length})
                    </h4>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {personProjects.map(p => (
                        <div key={p._id || p.id} style={{
                          background: '#fff',
                          padding: 16,
                          borderRadius: 10,
                          border: '1px solid rgba(30,58,95,0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 8
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: BRAND.dark, fontSize: 15, marginBottom: 6 }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>
                                {p.description || 'لا يوجد وصف'}
                              </div>
                            </div>
                            <div style={{
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: p.status === 'completed' || p.status === 'مكتمل' ? '#d1fae5' :
                                         p.status === 'in-progress' || p.status === 'جاري' ? '#dbeafe' :
                                         '#fef3c7',
                              color: p.status === 'completed' || p.status === 'مكتمل' ? '#065f46' :
                                    p.status === 'in-progress' || p.status === 'جاري' ? '#1e40af' :
                                    '#92400e'
                            }}>
                              {p.status === 'completed' || p.status === 'مكتمل' ? 'مكتمل' :
                               p.status === 'in-progress' || p.status === 'جاري' ? 'جاري' :
                               p.status === 'cancelled' || p.status === 'ملغي' ? 'ملغي' : 'قيد الانتظار'}
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: 16,
                            fontSize: 12,
                            color: BRAND.muted,
                            marginTop: 8
                          }}>
                            <span>💰 ${(p.budget || p.totalCost || 0).toLocaleString()}</span>
                            {p.progress !== undefined && (
                              <span>📊 {p.progress || 0}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {selectedPerson.createdAt && (
              <div style={{
                color: BRAND.muted,
                fontSize: 12,
                textAlign: 'center',
                paddingTop: 16,
                borderTop: '1px solid ' + BRAND.light
              }}>
                تاريخ التسجيل: {new Date(selectedPerson.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Password Modal - إظهار كلمة المرور المؤقتة */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setNewClientPassword(null);
          setNewClientEmail(null);
        }}
        title="🔑 كلمة المرور المؤقتة للعميل"
      >
        <div style={{ lineHeight: 2 }}>
          <div style={{
            background: BRAND.light,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            <div style={{ color: BRAND.muted, fontSize: 14, marginBottom: 12 }}>
              تم إنشاء حساب للعميل بنجاح! يمكنه تسجيل الدخول باستخدام:
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: BRAND.muted, fontSize: 12, marginBottom: 8 }}>البريد الإلكتروني:</div>
              <div style={{
                background: '#fff',
                padding: 12,
                borderRadius: 8,
                border: '2px solid ' + BRAND.accent,
                fontSize: 16,
                fontWeight: 700,
                color: BRAND.dark,
                fontFamily: 'monospace'
              }}>
                {newClientEmail || 'N/A'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: BRAND.muted, fontSize: 12, marginBottom: 8 }}>كلمة المرور المؤقتة:</div>
              <div style={{
                background: '#fff',
                padding: 12,
                borderRadius: 8,
                border: '2px solid ' + BRAND.accent,
                fontSize: 20,
                fontWeight: 900,
                color: BRAND.primary,
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {newClientPassword}
              </div>
            </div>
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: 8,
              padding: 12,
              fontSize: 12,
              color: '#92400e',
              marginTop: 16
            }}>
              ⚠️ <strong>مهم:</strong> يرجى إرسال هذه المعلومات للعميل. يجب تغيير كلمة المرور عند أول تسجيل دخول.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                // نسخ كلمة المرور
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(newClientPassword);
                  notifications.success('نجح', 'تم نسخ كلمة المرور');
                }
              }}
              style={{
                background: BRAND.light,
                color: BRAND.dark,
                border: '2px solid ' + BRAND.accent,
                padding: '12px 24px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = BRAND.accent;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = BRAND.light;
                e.currentTarget.style.color = BRAND.dark;
              }}
            >
              📋 نسخ كلمة المرور
            </button>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setNewClientPassword(null);
                setNewClientEmail(null);
              }}
              style={{
                background: BRAND.gradient,
                color: '#fff',
                border: 0,
                padding: '12px 28px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 15px rgba(30,58,95,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,58,95,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(30,58,95,0.3)';
              }}
            >
              تم ✓
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


