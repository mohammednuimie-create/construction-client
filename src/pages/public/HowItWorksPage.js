import React from "react";
import { useNavigate } from "react-router-dom";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  secondary: '#264653',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  gradientLight: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 100%)',
  dark: '#0f172a',
  light: '#f8fafc',
  muted: '#64748b',
};

const howItWorks = [
  {
    step: 1,
    title: 'سجّل حسابك',
    desc: 'أنشئ حسابك كعميل أو مقاول في دقائق',
    icon: '👤'
  },
  {
    step: 2,
    title: 'أضف مشروعك',
    desc: 'أضف تفاصيل مشروعك وحدد المتطلبات',
    icon: '📝'
  },
  {
    step: 3,
    title: 'راقب التقدم',
    desc: 'تابع تقدم مشروعك في الوقت الفعلي',
    icon: '📊'
  },
  {
    step: 4,
    title: 'احصل على النتائج',
    desc: 'استلم مشروعك المكتمل بجودة عالية',
    icon: '✅'
  },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, system-ui, Arial', background: BRAND.light, minHeight: '100vh' }}>
      <section style={{
        background: BRAND.light,
        padding: '120px 32px 100px',
        position: 'relative',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 60
        }}>
          <h1 style={{
            fontSize: isMobile ? 36 : 56,
            fontWeight: 900,
            color: BRAND.primary,
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            كيف يعمل النظام؟
          </h1>
          <p style={{
            fontSize: isMobile ? 16 : 20,
            color: BRAND.muted,
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.8
          }}>
            خطوات بسيطة لبدء إدارة مشاريعك بكفاءة
          </p>
        </div>

        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? 32 : 24,
          padding: isMobile ? '0 20px' : '0'
        }}>
          {howItWorks.map((item, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: 40,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid transparent',
                transition: 'all 0.4s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = BRAND.accent;
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${BRAND.accent}30`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: BRAND.gradientLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                margin: '0 auto 24px',
                boxShadow: `0 8px 25px ${BRAND.accent}40`
              }}>
                {item.icon}
              </div>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: BRAND.accent,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 18,
                position: 'absolute',
                top: 20,
                right: 20
              }}>
                {item.step}
              </div>
              <h3 style={{
                fontSize: 22,
                fontWeight: 800,
                color: BRAND.primary,
                marginBottom: 12
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: 16,
                color: BRAND.muted,
                lineHeight: 1.7,
                marginBottom: 20
              }}>
                {item.desc}
              </p>
              {item.step === 1 && (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: BRAND.gradientLight,
                    color: '#fff',
                    border: 0,
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(42, 157, 143, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  ابدأ الآن →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

