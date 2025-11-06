import React from "react";

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

const testimonials = [
  {
    name: 'أحمد محمد',
    role: 'مدير مشروع',
    company: 'شركة البناء الحديث',
    image: 'https://i.pravatar.cc/150?img=12',
    text: 'نظام ممتاز ساعدنا في إدارة مشاريعنا بكفاءة عالية. التوصيات والمراقبة أصبحت أسهل بكثير.',
    rating: 5
  },
  {
    name: 'فاطمة علي',
    role: 'مالكة مشروع سكني',
    company: 'مجمع السكن الفاخر',
    image: 'https://i.pravatar.cc/150?img=47',
    text: 'خدمة احترافية ومتابعة دقيقة. فريق العمل متجاوب جداً وساعدنا في إنجاز المشروع في الوقت المحدد.',
    rating: 5
  },
  {
    name: 'خالد حسن',
    role: 'مستثمر',
    company: 'شركة الاستثمار العقاري',
    image: 'https://i.pravatar.cc/150?img=33',
    text: 'أفضل نظام إدارة مقاولات استخدمته. الشفافية والدقة في المتابعة ممتازة.',
    rating: 5
  },
];

export default function TestimonialsPage() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, system-ui, Arial', background: '#fff', minHeight: '100vh' }}>
      <section style={{
        background: '#fff',
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
            ماذا يقول عملاؤنا؟
          </h1>
          <p style={{
            fontSize: isMobile ? 16 : 20,
            color: BRAND.muted,
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.8
          }}>
            آراء حقيقية من عملائنا المميزين
          </p>
        </div>

        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 24 : 32,
          padding: isMobile ? '0 20px' : '0'
        }}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              style={{
                background: BRAND.light,
                borderRadius: 24,
                padding: 40,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.4s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 16
              }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} style={{ fontSize: 18, color: '#fbbf24' }}>⭐</span>
                ))}
              </div>
              <p style={{
                fontSize: 16,
                color: BRAND.muted,
                lineHeight: 1.8,
                marginBottom: 24,
                fontStyle: 'italic'
              }}>
                "{testimonial.text}"
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                paddingTop: 24,
                borderTop: '1px solid rgba(0,0,0,0.1)'
              }}>
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: BRAND.primary,
                    marginBottom: 4
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: BRAND.muted
                  }}>
                    {testimonial.role} - {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

