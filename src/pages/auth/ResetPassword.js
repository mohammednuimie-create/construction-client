import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, setToken, setUser } from '../../utils/api';

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  secondary: '#264653',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  gradientLight: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      alert('⚠️ رابط إعادة التعيين غير صحيح');
      navigate('/login');
    }
  }, [token, email, navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validatePassword = (password) => {
    if (!password) return 'كلمة المرور مطلوبة';
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(form.password);
    const confirmError = form.password !== form.confirmPassword ? 'كلمة المرور غير متطابقة' : '';

    if (passwordError || confirmError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmError
      });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, email, form.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      alert(`❌ ${error.message || 'فشل إعادة تعيين كلمة المرور'}`);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND.gradient,
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: 48,
          maxWidth: 450,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
          <h2 style={{ color: BRAND.primary, marginBottom: 16, fontSize: 28, fontWeight: 700 }}>
            تم إعادة تعيين كلمة المرور بنجاح!
          </h2>
          <p style={{ color: BRAND.muted, marginBottom: 32 }}>
            سيتم توجيهك إلى صفحة تسجيل الدخول...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: BRAND.gradient,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        padding: '48px 40px',
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: BRAND.gradientLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 24px',
            boxShadow: '0 10px 40px rgba(42, 157, 143, 0.3)'
          }}>
            🔒
          </div>
          <h2 style={{
            color: BRAND.primary,
            fontWeight: 900,
            fontSize: 32,
            marginBottom: 12,
            letterSpacing: '-1px'
          }}>
            إعادة تعيين كلمة المرور
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 16 }}>
            أدخل كلمة المرور الجديدة
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              كلمة المرور الجديدة *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              onChange={handleInput}
              value={form.password}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                fontSize: 15,
                background: BRAND.light,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease'
              }}
              onFocus={e => {
                e.target.style.borderColor = errors.password ? '#ef4444' : BRAND.accent;
                e.target.style.background = '#fff';
                e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                e.target.style.background = BRAND.light;
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.password && (
              <div style={{
                color: '#ef4444',
                fontSize: 13,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚠️</span>
                <span>{errors.password}</span>
              </div>
            )}
            {form.password.length > 0 && form.password.length < 6 && (
              <div style={{
                color: '#f59e0b',
                fontSize: 12,
                marginTop: 4
              }}>
                {form.password.length}/6 أحرف
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: 8,
              color: BRAND.dark,
              fontWeight: 600,
              fontSize: 14
            }}>
              تأكيد كلمة المرور *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="أعد إدخال كلمة المرور"
              onChange={handleInput}
              value={form.confirmPassword}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                fontSize: 15,
                background: BRAND.light,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease'
              }}
              onFocus={e => {
                e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : BRAND.accent;
                e.target.style.background = '#fff';
                e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
              }}
              onBlur={e => {
                e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e5e7eb';
                e.target.style.background = BRAND.light;
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.confirmPassword && (
              <div style={{
                color: '#ef4444',
                fontSize: 13,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚠️</span>
                <span>{errors.confirmPassword}</span>
              </div>
            )}
            {form.confirmPassword && form.password === form.confirmPassword && (
              <div style={{
                color: BRAND.accent,
                fontSize: 13,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>✓</span>
                <span>كلمة المرور متطابقة</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: BRAND.gradientLight,
              color: '#fff',
              padding: 18,
              border: 'none',
              fontSize: 18,
              borderRadius: 14,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              fontWeight: 700,
              boxShadow: '0 8px 30px rgba(42, 157, 143, 0.4)',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(42, 157, 143, 0.5)';
              }
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 30px rgba(42, 157, 143, 0.4)';
            }}
          >
            {isLoading ? '⏳ جاري المعالجة...' : '✓ إعادة تعيين كلمة المرور'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                color: BRAND.muted,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'underline',
                padding: '8px 16px'
              }}
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

