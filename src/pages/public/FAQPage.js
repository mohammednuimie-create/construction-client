import React, { useState } from "react";

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

const faqs = [
  {
    question: 'كيف يمكنني التسجيل في النظام؟',
    answer: 'يمكنك التسجيل بسهولة من خلال الضغط على زر "إنشاء حساب" في الصفحة الرئيسية واختيار نوع الحساب (عميل أو مقاول) ثم ملء البيانات المطلوبة.'
  },
  {
    question: 'ما هي أنواع المشاريع التي يمكن إدارتها؟',
    answer: 'يمكن إدارة جميع أنواع المشاريع الإنشائية مثل المباني السكنية والإدارية، المراكز التجارية، البنية التحتية، وغيرها من المشاريع.'
  },
  {
    question: 'هل النظام مجاني؟',
    answer: 'نعم، النظام مجاني للاستخدام. يمكنك إنشاء حساب والبدء في إدارة مشاريعك فوراً دون أي رسوم.'
  },
  {
    question: 'كيف يمكنني التواصل مع الدعم الفني؟',
    answer: 'يمكنك التواصل معنا من خلال نموذج التواصل في الصفحة الرئيسية، أو عبر البريد الإلكتروني. فريقنا متاح لمساعدتك في أي وقت.'
  },
  {
    question: 'هل يمكن للمقاولين إدارة عدة مشاريع في نفس الوقت؟',
    answer: 'نعم، يمكن للمقاولين إدارة عدد غير محدود من المشاريع في نفس الوقت. النظام يوفر لوحة تحكم شاملة لمتابعة جميع المشاريع.'
  },
  {
    question: 'كيف يتم ضمان أمان البيانات؟',
    answer: 'نستخدم أحدث تقنيات الأمان والتشفير لحماية بياناتك. جميع المعلومات محمية ومشفرة وفق أعلى المعايير الأمنية.'
  },
];

export default function FAQPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
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
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: 900,
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
            الأسئلة الشائعة
          </h1>
          <p style={{
            fontSize: isMobile ? 16 : 20,
            color: BRAND.muted,
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.8
          }}>
            إجابات على أكثر الأسئلة شيوعاً
          </p>
        </div>

        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gap: 16
        }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
              }}
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                style={{
                  width: '100%',
                  padding: '24px 32px',
                  background: 'transparent',
                  border: 0,
                  textAlign: 'right',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: BRAND.primary,
                  margin: 0,
                  flex: 1
                }}>
                  {faq.question}
                </h3>
                <span style={{
                  fontSize: 24,
                  color: BRAND.accent,
                  transition: 'transform 0.3s ease',
                  transform: openFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              {openFaqIndex === index && (
                <div style={{
                  padding: '0 32px 24px',
                  fontSize: 16,
                  color: BRAND.muted,
                  lineHeight: 1.8,
                  animation: 'fadeInUp 0.3s ease'
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

