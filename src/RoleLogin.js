import React, { useState, useEffect } from "react";
import { authAPI, setToken, setUser } from "./utils/api";

const BRAND = {
  primary: '#0f172a',
  accent: '#06b6d4',
  secondary: '#3b82f6',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #06b6d4 100%)',
  gradientLight: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  gradientContractor: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  gradientClient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  light: '#f1f5f9',
  dark: '#0a0f1c',
};

const icons = {
  مقاول: "🏗️",
  عميل: "💼",
  زائر: "👀"
};

export default function RoleLogin({ onLogin, onGuest, initialStep = 1, loading = false }) {
  const [step, setStep] = useState(initialStep);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChoice = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setErrors({});
    setTouched({});
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "البريد الإلكتروني مطلوب";
    if (!emailRegex.test(email)) return "البريد الإلكتروني غير صحيح";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "كلمة المرور مطلوبة";
    if (password.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    if (name === "email") {
      const error = validateEmail(value);
      if (error) setErrors({ ...errors, email: error });
    } else if (name === "password") {
      const error = validatePassword(value);
      if (error) setErrors({ ...errors, password: error });
    } else if (name === "confirmPassword" && isSignUp) {
      if (value !== form.password) {
        setErrors({ ...errors, confirmPassword: "كلمة المرور غير متطابقة" });
      }
    } else if (name === "name" && isSignUp) {
      if (!value.trim()) {
        setErrors({ ...errors, name: "الاسم مطلوب" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      const nameError = !form.name.trim() ? "الاسم مطلوب" : "";
      const emailError = validateEmail(form.email);
      const passwordError = validatePassword(form.password);
      const confirmError = form.password !== form.confirmPassword ? "كلمة المرور غير متطابقة" : "";
      
      const newErrors = {};
      if (nameError) newErrors.name = nameError;
      if (emailError) newErrors.email = emailError;
      if (passwordError) newErrors.password = passwordError;
      if (confirmError) newErrors.confirmPassword = confirmError;
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTouched({ name: true, email: true, password: true, confirmPassword: true });
        return;
      }
      
      setIsLoading(true);
      try {
        const roleMapping = {
          'مقاول': 'contractor',
          'عميل': 'client'
        };
        
        const response = await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: roleMapping[role] || 'client'
        });
        
        // Save token and user
        setToken(response.token);
        setUser(response.user);
        
        alert(`✅ تم إنشاء الحساب بنجاح! مرحباً ${form.name}`);
        setIsSignUp(false);
        setForm({ ...form, name: "", confirmPassword: "" });
        
        // Auto login after registration
        if (onLogin) {
          onLogin(role, form.email, form.password);
        }
      } catch (error) {
        alert(`❌ ${error.message || 'حدث خطأ أثناء إنشاء الحساب'}`);
        setErrors({ submit: error.message || 'حدث خطأ أثناء إنشاء الحساب' });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    
    const newErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login(form.email, form.password);
      
      // Save token and user
      setToken(response.token);
      setUser(response.user);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
        localStorage.setItem('rememberedRole', role);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedRole');
      }

      if (onLogin) {
        onLogin(role, form.email, form.password);
      }
    } catch (error) {
      alert(`❌ ${error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}`);
      setErrors({ submit: error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedRole = localStorage.getItem('rememberedRole');
    if (rememberedEmail && rememberedRole && step === 1) {
      setForm(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
      if (rememberedRole) {
        setRole(rememberedRole);
      }
    }
  }, [step]);

  return (
    <div style={{ animation: "fadeIn 0.6s", fontFamily: 'Cairo, system-ui, Arial' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .role-btn {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .role-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.8s, height 0.8s;
        }
        .role-btn:hover::before {
          width: 400px;
          height: 400px;
        }
        .role-btn:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 15px 40px rgba(0,0,0,0.25) !important;
        }
        .role-btn:active {
          transform: translateY(-2px) scale(1.02);
        }
        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.2) !important;
        }
        .submit-btn {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.8s, height 0.8s;
        }
        .submit-btn:hover::before {
          width: 500px;
          height: 500px;
        }
        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(6, 182, 212, 0.5) !important;
        }
        .card-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      {step === 1 && (
        <div style={{ animation: "fadeIn 0.8s" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="card-float" style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: BRAND.gradientLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              margin: '0 auto 24px',
              boxShadow: '0 10px 40px rgba(6, 182, 212, 0.3)'
            }}>
              🏗️
            </div>
            <div style={{ width: 60, height: 4, background: BRAND.gradientLight, margin: '0 auto 20px', borderRadius: 2 }} />
            <h2 style={{ 
              color: BRAND.primary, 
              fontWeight: 900, 
              fontSize: 32, 
              marginBottom: 12, 
              letterSpacing: '-1px',
              background: BRAND.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              المستقبل لإدارة المقاولات
            </h2>
            <p style={{ color: BRAND.muted, fontSize: 16, marginBottom: 32 }}>
              اختر نوع المستخدم للدخول
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 32, flexWrap: 'wrap' }}>
            {['مقاول', 'عميل'].map((choice, index) => (
              <button
                key={choice}
                onClick={() => handleRoleChoice(choice)}
                className="role-btn"
                style={{
                  background: choice === "مقاول" ? BRAND.gradientContractor : BRAND.gradientClient,
                  color: "#fff",
                  border: 0,
                  borderRadius: 20,
                  fontSize: 20,
                  padding: '28px 48px',
                  cursor: 'pointer',
                  minWidth: 180,
                  fontWeight: 700,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  animation: `slideUp 0.6s ease ${index * 0.1}s both`
                }}
              >
                <span style={{ fontSize: 36, animation: 'pulse 2s ease-in-out infinite' }}>{icons[choice]}</span>
                <span>{choice}</span>
              </button>
            ))}
          </div>
          {/* زر الزائر */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ 
                position: 'absolute', 
                inset: -2, 
                background: BRAND.light, 
                borderRadius: 16, 
                zIndex: 0,
                animation: 'pulse 3s ease-in-out infinite'
              }} />
              <button
                type="button"
                onClick={onGuest}
                className="role-btn"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  background: "#fff",
                  color: BRAND.primary,
                  padding: "18px 56px",
                  fontSize: 16,
                  border: `2px solid ${BRAND.accent}40`,
                  borderRadius: 16,
                  cursor: "pointer",
                  fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: '0 auto',
                }}
              >
                <span style={{ fontSize: 24 }}>{icons["زائر"]}</span>
                <span>الدخول كزائر</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <form onSubmit={handleSubmit} style={{ animation: "slideIn 0.6s", marginTop: 8 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 60, height: 4, background: BRAND.gradientLight, margin: '0 auto 20px', borderRadius: 2 }} />
            <div style={{ 
              fontSize: 48, 
              marginBottom: 12,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              {icons[role]}
            </div>
            <h2 style={{ 
              fontWeight: 900, 
              fontSize: 28, 
              color: BRAND.primary, 
              marginBottom: 8, 
              letterSpacing: '-0.5px' 
            }}>
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل دخول'} ({role})
            </h2>
            <p style={{ color: BRAND.muted, fontSize: 14 }}>
              {isSignUp ? 'أدخل بياناتك لإنشاء حساب جديد' : 'أدخل بياناتك للدخول'}
            </p>
          </div>

          {isSignUp && (
            <div style={{ marginBottom: 20, animation: "slideUp 0.4s" }}>
              <label htmlFor="name" style={{ display: "block", marginBottom: 8, color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
                الاسم الكامل *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={loading}
                  placeholder="أدخل اسمك الكامل"
                  onChange={handleInput}
                  value={form.name}
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: 16,
                    paddingRight: form.name && !errors.name && touched.name ? '40px' : '16px',
                    borderRadius: 12,
                    border: `2px solid ${errors.name && touched.name ? '#ef4444' : '#e5e7eb'}`,
                    fontSize: 15,
                    background: BRAND.light,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : BRAND.accent;
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                  }}
                  onBlur={e => {
                    handleBlur(e);
                    e.target.style.borderColor = errors.name && touched.name ? '#ef4444' : '#e5e7eb';
                    e.target.style.background = BRAND.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {form.name && !errors.name && touched.name && (
                  <div style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: BRAND.accent,
                    fontSize: 18
                  }}>✓</div>
                )}
              </div>
              {errors.name && touched.name && (
                <div style={{
                  color: '#ef4444',
                  fontSize: 13,
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>⚠️</span>
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}
          
          <div style={{ marginBottom: 20, animation: isSignUp ? "slideUp 0.5s" : "none" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 8, color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
              البريد الإلكتروني *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                placeholder="example@email.com"
                onChange={handleInput}
                value={form.email}
                className="input-field"
                style={{
                  width: "100%",
                  padding: 16,
                  paddingRight: form.email && !errors.email && touched.email ? '40px' : '16px',
                  borderRadius: 12,
                  border: `2px solid ${errors.email && touched.email ? '#ef4444' : '#e5e7eb'}`,
                  fontSize: 15,
                  background: BRAND.light,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : BRAND.accent;
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                }}
                onBlur={e => {
                  handleBlur(e);
                  e.target.style.borderColor = errors.email && touched.email ? '#ef4444' : '#e5e7eb';
                  e.target.style.background = BRAND.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {form.email && !errors.email && touched.email && (
                <div style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: BRAND.accent,
                  fontSize: 18
                }}>✓</div>
              )}
            </div>
            {errors.email && touched.email && (
              <div style={{
                color: '#ef4444',
                fontSize: 13,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚠️</span>
                <span>{errors.email}</span>
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: 20, animation: isSignUp ? "slideUp 0.6s" : "none" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label htmlFor="password" style={{ color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
                كلمة المرور *
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: BRAND.accent,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.target.style.background = BRAND.light}
                  onMouseOut={e => e.target.style.background = 'transparent'}
                >
                  {showPassword ? '👁️ إخفاء' : '👁️ إظهار'}
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="••••••••"
                onChange={handleInput}
                value={form.password}
                className="input-field"
                style={{
                  width: "100%",
                  padding: 16,
                  paddingLeft: form.password && !errors.password && touched.password ? '40px' : '16px',
                  borderRadius: 12,
                  border: `2px solid ${errors.password && touched.password ? '#ef4444' : '#e5e7eb'}`,
                  fontSize: 15,
                  background: BRAND.light,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : BRAND.accent;
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                }}
                onBlur={e => {
                  handleBlur(e);
                  e.target.style.borderColor = errors.password && touched.password ? '#ef4444' : '#e5e7eb';
                  e.target.style.background = BRAND.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {form.password && !errors.password && touched.password && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: BRAND.accent,
                  fontSize: 18
                }}>✓</div>
              )}
            </div>
            {errors.password && touched.password && (
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
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>📊</span>
                <span>{form.password.length}/6 أحرف</span>
              </div>
            )}
          </div>

          {isSignUp && (
            <div style={{ marginBottom: 20, animation: "slideUp 0.7s" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label htmlFor="confirmPassword" style={{ color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
                  تأكيد كلمة المرور *
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: BRAND.accent,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.target.style.background = BRAND.light}
                  onMouseOut={e => e.target.style.background = 'transparent'}
                >
                  {showConfirmPassword ? '👁️ إخفاء' : '👁️ إظهار'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="أعد إدخال كلمة المرور"
                  onChange={handleInput}
                  value={form.confirmPassword}
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: 16,
                    paddingLeft: form.confirmPassword && !errors.confirmPassword && touched.confirmPassword ? '40px' : '16px',
                    borderRadius: 12,
                    border: `2px solid ${errors.confirmPassword && touched.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                    fontSize: 15,
                    background: BRAND.light,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : BRAND.accent;
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                  }}
                  onBlur={e => {
                    handleBlur(e);
                    e.target.style.borderColor = errors.confirmPassword && touched.confirmPassword ? '#ef4444' : '#e5e7eb';
                    e.target.style.background = BRAND.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {form.confirmPassword && !errors.confirmPassword && touched.confirmPassword && form.password === form.confirmPassword && (
                  <div style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: BRAND.accent,
                    fontSize: 18
                  }}>✓</div>
                )}
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
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
            </div>
          )}
          
          {!isSignUp && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: BRAND.dark }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: BRAND.accent
                  }}
                />
                <span>تذكرني</span>
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: BRAND.accent,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.target.style.color = BRAND.primary}
                onMouseOut={e => e.target.style.color = BRAND.accent}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || isLoading}
            className="submit-btn"
            style={{
              width: "100%",
              background: BRAND.gradientLight,
              color: "#fff",
              padding: 18,
              border: "none",
              fontSize: 18,
              borderRadius: 14,
              cursor: (loading || isLoading) ? "not-allowed" : "pointer",
              marginBottom: 16,
              fontWeight: 700,
              boxShadow: '0 8px 30px rgba(6, 182, 212, 0.4)',
              opacity: (loading || isLoading) ? 0.7 : 1,
            }}
          >
            {(loading || isLoading) ? '⏳ جاري المعالجة...' : (isSignUp ? '✓ إنشاء الحساب' : '🚀 تسجيل الدخول')}
          </button>

          <div style={{ 
            textAlign: "center", 
            marginTop: 24,
            paddingTop: 24,
            borderTop: '2px solid ' + BRAND.light
          }}>
            <div style={{ 
              color: BRAND.muted, 
              fontSize: 14, 
              marginBottom: 12 
            }}>
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setTouched({});
                if (isSignUp) {
                  setForm({ ...form, name: "", confirmPassword: "" });
                }
              }}
              style={{
                background: BRAND.light,
                color: BRAND.primary,
                border: `2px solid ${BRAND.accent}40`,
                padding: '12px 32px',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = BRAND.accent;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = BRAND.accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = BRAND.light;
                e.currentTarget.style.color = BRAND.primary;
                e.currentTarget.style.borderColor = `${BRAND.accent}40`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{isSignUp ? '←' : '+'}</span>
              <span>{isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</span>
            </button>
          </div>
          
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setIsSignUp(false);
                setForm({ email: "", password: "", name: "", confirmPassword: "" });
                setErrors({});
                setTouched({});
              }}
              style={{
                background: 'none',
                color: BRAND.muted,
                border: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.target.style.background = BRAND.light;
                e.target.style.color = BRAND.primary;
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = BRAND.muted;
              }}
            >
              ← الرجوع لاختيار الدور
            </button>
          </div>
        </form>
      )}
      <style>{`
       @keyframes fadeIn {from{opacity: 0; transform: translateY(80px);} to {opacity: 1; transform: none;}}
      `}</style>
    </div>
  );
}

