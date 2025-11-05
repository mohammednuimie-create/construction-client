import React, { useState, useEffect } from "react";
import { usersAPI, getUser } from "../../utils/api";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function ContractorProfile() {
  const notifications = useNotifications();
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const user = getUser();
        if (!user || !user.id) {
          notifications.error('خطأ', 'يرجى تسجيل الدخول أولاً');
          setIsLoading(false);
          return;
        }

        const userData = await usersAPI.getById(user.id || user._id);
        const profileData = {
          name: userData.name || '',
          companyName: userData.companyName || userData.company || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          website: userData.website || '',
          description: userData.description || userData.bio || ''
        };
        
        setForm(profileData);
        setOriginalForm(profileData);
      } catch (err) {
        console.error('Error loading profile:', err);
        notifications.error('خطأ', 'فشل تحميل بيانات الملف الشخصي');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [notifications]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    if (!form.name || !form.email) {
      notifications.warning('تحذير', 'يرجى ملء الحقول المطلوبة (الاسم والبريد الإلكتروني)');
      return;
    }

    setIsSaving(true);
    try {
      const user = getUser();
      const updateData = {
        name: form.name,
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        website: form.website,
        description: form.description
      };

      await usersAPI.update(user.id || user._id, updateData);
      
      // Update local storage
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setOriginalForm({ ...form });
      notifications.success('نجح', 'تم حفظ بيانات الملف الشخصي بنجاح');
    } catch (err) {
      console.error('Error saving profile:', err);
      notifications.error('خطأ', err.message || 'فشل حفظ بيانات الملف الشخصي');
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    if (originalForm) {
      setForm({ ...originalForm });
      notifications.info('معلومات', 'تم إلغاء التعديلات');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        direction: 'rtl', 
        fontFamily: 'Cairo, system-ui, Arial',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.muted }}>جاري تحميل البيانات...</div>
        </div>
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
        marginBottom: 24
      }}>
        <div>
          <h2 style={{
            fontWeight: 900,
            color: BRAND.primary,
            fontSize: 32,
            margin: '0 0 8px 0',
            letterSpacing: '-1px'
          }}>
            الملف الشخصي (مقاول)
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
            تحديث معلومات الشركة والبيانات الشخصية
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={cancel}
            disabled={!originalForm}
            style={{
              background: '#f1f5f9',
              color: BRAND.dark,
              border: 0,
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: 14,
              cursor: originalForm ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: originalForm ? 1 : 0.5
            }}
            onMouseOver={e => {
              if (originalForm) {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={e => {
              if (originalForm) {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            إلغاء
          </button>
          <button
            onClick={saveProfile}
            disabled={isSaving}
            style={{
              background: BRAND.gradient,
              color: '#fff',
              border: 0,
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: 14,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
              transition: 'all 0.3s ease',
              opacity: isSaving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseOver={e => {
              if (!isSaving) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
              }
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
            }}
          >
            {isSaving ? '⏳ جاري الحفظ...' : '✓ حفظ'}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
        padding: 32,
        border: '1px solid rgba(30,58,95,0.05)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 24
        }}>
          <div>
            <label style={{
              display: 'block',
              color: BRAND.dark,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 14
            }}>
              الاسم الكامل <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="اسمك الكامل"
              style={{
                width: '100%',
                padding: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                background: BRAND.light,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease'
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
              color: BRAND.dark,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 14
            }}>
              اسم الشركة
            </label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="شركة المقاولات"
              style={{
                width: '100%',
                padding: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                background: BRAND.light,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease'
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
              color: BRAND.dark,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 14
            }}>
              البريد الإلكتروني <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="company@mail.com"
              style={{
                width: '100%',
                padding: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                background: BRAND.light,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease'
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
              color: BRAND.dark,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 14
            }}>
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              style={{
                width: '100%',
                padding: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                background: BRAND.light,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease'
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
              color: BRAND.dark,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 14
            }}>
              العنوان
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="العنوان الكامل"
              style={{
                width: '100%',
                padding: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                background: BRAND.light,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease'
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
              color: BRAND.dark,
              marginBottom: 8,
              fontWeight: 600,
              fontSize: 14
            }}>
              الموقع الإلكتروني
            </label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                background: BRAND.light,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.3s ease'
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
        
        <div style={{ marginTop: 24 }}>
          <label style={{
            display: 'block',
            color: BRAND.dark,
            marginBottom: 8,
            fontWeight: 600,
            fontSize: 14
          }}>
            وصف الشركة
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="وصف مختصر عن الشركة..."
            rows={4}
            style={{
              width: '100%',
              padding: 14,
              border: '2px solid #e5e7eb',
              borderRadius: 12,
              background: BRAND.light,
              fontSize: 15,
              outline: 'none',
              transition: 'all 0.3s ease',
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
      </div>
    </div>
  );
}


