import React, { useState, useEffect, useRef } from "react";
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
  success: '#10b981',
  warning: '#f59e0b',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const statsRef = useRef(null);
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const stats = [
    { value: 250, suffix: '+', label: 'مشروع منجز', icon: '🏗️' },
    { value: 98, suffix: '%', label: 'رضا العملاء', icon: '⭐' },
    { value: 20, suffix: '+', label: 'سنوات خبرة', icon: '🎯' },
    { value: 500, suffix: '+', label: 'عميل سعيد', icon: '👥' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((stat, index) => {
              let current = 0;
              const increment = stat.value / 60;
              const timer = setInterval(() => {
                current += increment;
                if (current >= stat.value) {
                  current = stat.value;
                  clearInterval(timer);
                }
                setAnimatedStats((prev) => {
                  const newStats = [...prev];
                  newStats[index] = Math.floor(current);
                  return newStats;
                });
              }, 16);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: '⚡',
      title: 'سرعة التنفيذ',
      desc: 'نوفر حلول سريعة مع الحفاظ على أعلى معايير الجودة',
      color: '#1e3a5f'
    },
    {
      icon: '🔒',
      title: 'ضمان الجودة',
      desc: 'معايير عالمية وضمان شامل على جميع المشاريع',
      color: '#10b981'
    },
    {
      icon: '💎',
      title: 'مواد عالية الجودة',
      desc: 'نستخدم أفضل المواد والتقنيات الحديثة',
      color: '#f59e0b'
    },
    {
      icon: '📊',
      title: 'إدارة متطورة',
      desc: 'نظام إدارة متكامل لمتابعة المشاريع',
      color: '#2a9d8f'
    },
  ];

  const projects = [
    {
      title: 'برج إداري متطور',
      category: 'مباني إدارية',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&h=900&fit=crop&q=85',
      stats: { area: '5000 م²', floors: '20 طابق', duration: '18 شهر' }
    },
    {
      title: 'مجمع سكني فاخر',
      category: 'مباني سكنية',
      image: 'https://images.unsplash.com/photo-1600585154526-990dac4d53ef?w=1400&h=900&fit=crop&q=85',
      stats: { area: '8000 م²', floors: '15 طابق', duration: '24 شهر' }
    },
    {
      title: 'مركز تجاري',
      category: 'مراكز تجارية',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&h=900&fit=crop&q=85',
      stats: { area: '12000 م²', floors: '5 طابق', duration: '30 شهر' }
    },
  ];

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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, system-ui, Arial', background: '#fff', minHeight: '100vh' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-glow {
          position: relative;
          overflow: hidden;
        }
        .btn-glow::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .btn-glow:hover::before {
          width: 300px;
          height: 300px;
        }
        @media (max-width: 768px) {
          header nav a {
            display: none !important;
          }
          header nav button {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled ? 'rgba(30, 58, 95, 0.95)' : 'transparent',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? '16px 20px' : '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer'
          }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: BRAND.gradientLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 8px 25px rgba(42, 157, 143, 0.4)'
            }}>🏗️</div>
            <div>
              <div style={{
                color: isScrolled ? '#fff' : BRAND.primary,
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: '-0.5px',
                transition: 'color 0.3s ease'
              }}>المستقبل لإدارة المقاولات</div>
              <div style={{
                color: isScrolled ? '#94a3b8' : BRAND.muted,
                fontSize: 12,
                fontWeight: 600,
                transition: 'color 0.3s ease'
              }}>بناء المستقبل</div>
            </div>
          </div>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 12 : 24
          }}>
            {!isMobile && ['من نحن', 'خدماتنا', 'مشاريعنا', 'اتصل بنا'].map((item, idx) => (
              <a
                key={idx}
                href={`#section-${idx + 1}`}
                style={{
                  textDecoration: 'none',
                  color: isScrolled ? '#e2e8f0' : BRAND.primary,
                  fontWeight: 600,
                  fontSize: 15,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  padding: '8px 0'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = BRAND.accent;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = isScrolled ? '#e2e8f0' : BRAND.primary;
                }}
              >
                {item}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent',
                  color: isScrolled ? '#e2e8f0' : BRAND.primary,
                  border: `2px solid ${isScrolled ? 'rgba(255,255,255,0.3)' : BRAND.accent}`,
                  padding: '10px 24px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  transition: 'all 0.3s ease',
                  backdropFilter: isScrolled ? 'blur(10px)' : 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isScrolled ? 'rgba(255,255,255,0.1)' : BRAND.light;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                إنشاء حساب
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-glow"
                style={{
                  background: BRAND.gradientLight,
                  color: '#fff',
                  border: 0,
                  padding: '12px 28px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 4px 20px rgba(42, 157, 143, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(42, 157, 143, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(42, 157, 143, 0.4)';
                }}
              >
                تسجيل الدخول
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: BRAND.gradient,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 80
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(42, 157, 143, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 80% 80%, rgba(30, 58, 95, 0.2) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? '100px 20px 60px' : '80px 32px',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
            gap: isMobile ? 40 : 60,
            alignItems: 'center'
          }}>
            <div style={{ animation: 'fadeInUp 0.8s ease' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '8px 20px',
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 24,
                backdropFilter: 'blur(10px)'
              }}>
                🚀 رائدون في مجال البناء والتشييد
              </div>
              <h1 style={{
                fontSize: isMobile ? 36 : 64,
                fontWeight: 900,
                lineHeight: 1.2,
                color: '#fff',
                margin: '0 0 24px 0',
                letterSpacing: '-2px',
                textShadow: '0 4px 30px rgba(0,0,0,0.2)'
              }}>
                نحن نبني<br />
                <span style={{
                  background: 'linear-gradient(135deg, #2a9d8f 0%, #1e3a5f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>المستقبل</span>
              </h1>
              <p style={{
                fontSize: isMobile ? 16 : 20,
                lineHeight: 1.8,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 40,
                maxWidth: 600
              }}>
                نقدم حلول بناء متكاملة ومتطورة تجمع بين الجودة العالية والسرعة في التنفيذ. 
                خبرة أكثر من 20 عاماً في إنشاء المباني والبنية التحتية.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-glow"
                  style={{
                    background: '#fff',
                    color: BRAND.primary,
                    border: 0,
                    padding: '18px 36px',
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 17,
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                  }}
                >
                  ابدأ الآن ✨
                </button>
                <button
                  onClick={() => document.getElementById('section-2')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    padding: '18px 36px',
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 17,
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  استكشف خدماتنا
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: 32,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  width: '100%',
                  height: 400,
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#000'
                }}>
                  <img
                    src={projects[currentSlide].image}
                    alt={projects[currentSlide].title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'opacity 0.5s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
                    padding: 24,
                    color: '#fff'
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                      {projects[currentSlide].title}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>
                      {projects[currentSlide].category}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                  marginTop: 16
                }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      style={{
                        width: i === currentSlide ? 32 : 8,
                        height: 8,
                        borderRadius: 50,
                        background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
          </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} style={{
        background: BRAND.light,
        padding: '80px 32px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 32
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 40,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
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
                fontSize: 48,
                marginBottom: 16,
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {stat.icon}
          </div>
              <div style={{
                fontSize: 48,
                fontWeight: 900,
                background: BRAND.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 12
              }}>
                {animatedStats[index]}{stat.suffix}
        </div>
              <div style={{
                fontSize: 16,
                color: BRAND.muted,
                fontWeight: 600
              }}>
                {stat.label}
          </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="section-2" style={{
        background: '#fff',
        padding: '100px 32px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 60
        }}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            color: BRAND.primary,
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            لماذا نحن؟
          </h2>
          <p style={{
            fontSize: 20,
            color: BRAND.muted,
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.8
          }}>
            نقدم حلول بناء متكاملة تجمع بين الجودة والسرعة والابتكار
          </p>
        </div>

        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: isMobile ? 24 : 32,
          padding: isMobile ? '0 20px' : '0'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: 40,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid transparent',
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = feature.color;
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${feature.color}30`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                width: 70,
                height: 70,
                borderRadius: 18,
                background: `${feature.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                marginBottom: 24
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 24,
                fontWeight: 800,
                color: BRAND.primary,
                marginBottom: 12
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 16,
                color: BRAND.muted,
                lineHeight: 1.7
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        background: BRAND.light,
        padding: '100px 32px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 60
        }}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            color: BRAND.primary,
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            كيف يعمل النظام؟
          </h2>
          <p style={{
            fontSize: 20,
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
                lineHeight: 1.7
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="section-3" style={{
        background: BRAND.dark,
        padding: '100px 32px',
        color: '#fff'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 60
        }}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            مشاريعنا المميزة
          </h2>
          <p style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 700,
            margin: '0 auto'
          }}>
            نفتخر بمشاريعنا الناجحة التي تجسد رؤيتنا في التميز
          </p>
        </div>

        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 32
        }}>
          {projects.map((project, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                height: 280,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: BRAND.gradientLight,
                  padding: '8px 16px',
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: 700
                }}>
                  {project.category}
                </div>
              </div>
              <div style={{ padding: 32 }}>
                <h3 style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 16
                }}>
                  {project.title}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  paddingTop: 20,
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {Object.entries(project.stats).map(([key, value]) => (
                    <div key={key}>
                      <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: BRAND.accent,
                        marginBottom: 4
                      }}>
                        {value}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.6)'
                      }}>
                        {key === 'area' ? 'المساحة' : key === 'floors' ? 'الطوابق' : 'المدة'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        background: '#fff',
        padding: '100px 32px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 60
        }}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            color: BRAND.primary,
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            ماذا يقول عملاؤنا؟
          </h2>
          <p style={{
            fontSize: 20,
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

      {/* CTA Section */}
      <section style={{
        background: BRAND.gradient,
        padding: '100px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 24,
            letterSpacing: '-1px'
          }}>
            جاهز لبدء مشروعك؟
          </h2>
          <p style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 40,
            lineHeight: 1.8
          }}>
            تواصل معنا اليوم واحصل على استشارة مجانية لمشروعك
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-glow"
            style={{
              background: '#fff',
              color: BRAND.primary,
              border: 0,
              padding: '20px 48px',
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
            }}
          >
            ابدأ الآن مجاناً 🚀
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="section-4" style={{
        background: '#fff',
        padding: '100px 32px'
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          background: BRAND.light,
          borderRadius: 32,
          padding: 60,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{
              fontSize: 42,
              fontWeight: 900,
              color: BRAND.primary,
              marginBottom: 16
            }}>
              تواصل معنا
            </h2>
            <p style={{
              fontSize: 18,
              color: BRAND.muted
            }}>
              نحن هنا للإجابة على جميع استفساراتك
            </p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            alert('✅ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
          }} style={{
            display: 'grid',
            gap: 24
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 24
            }}>
              <input
                required
                placeholder="اسمك الكامل"
                style={{
                  padding: 18,
                  border: '2px solid #e5e7eb',
                  borderRadius: 14,
                  fontSize: 16,
                  outline: 'none',
                  background: '#fff',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = BRAND.accent;
                  e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                required
                type="email"
                placeholder="بريدك الإلكتروني"
                style={{
                  padding: 18,
                  border: '2px solid #e5e7eb',
                  borderRadius: 14,
                  fontSize: 16,
                  outline: 'none',
                  background: '#fff',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = BRAND.accent;
                  e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <textarea
              required
              placeholder="رسالتك"
              rows={6}
              style={{
                padding: 18,
                border: '2px solid #e5e7eb',
                borderRadius: 14,
                fontSize: 16,
                outline: 'none',
                background: '#fff',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BRAND.accent;
                e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              className="btn-glow"
              style={{
                background: BRAND.gradientLight,
                color: '#fff',
                border: 0,
                padding: '20px 48px',
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(42, 157, 143, 0.4)',
                transition: 'all 0.3s ease',
                justifySelf: 'center',
                minWidth: 250
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(42, 157, 143, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(42, 157, 143, 0.4)';
              }}
            >
              إرسال الرسالة ✉️
            </button>
        </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        background: BRAND.light,
        padding: '100px 32px'
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 60
        }}>
          <h2 style={{
            fontSize: 48,
            fontWeight: 900,
            color: BRAND.primary,
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            الأسئلة الشائعة
          </h2>
          <p style={{
            fontSize: 20,
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

      {/* Footer */}
      <footer style={{
        background: BRAND.dark,
        color: 'rgba(255,255,255,0.7)',
        padding: '60px 32px 40px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 24
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: BRAND.gradientLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>🏗️</div>
            <div style={{
              fontSize: 24,
              fontWeight: 900,
              color: '#fff'
            }}>المستقبل لإدارة المقاولات</div>
          </div>
          <p style={{
            fontSize: 16,
            marginBottom: 32,
            color: 'rgba(255,255,255,0.6)'
          }}>
            بناء المستقبل بكل ثقة واحترافية
          </p>
          
          {/* Social Media Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginBottom: 32
          }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📘
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              📷
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              💼
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🐦
            </a>
          </div>

          <div style={{
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)'
          }}>
            <div style={{ marginBottom: 8 }}>
              🎓 مشروع تخرج أكاديمي - للأغراض التعليمية فقط
            </div>
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: 30,
            left: 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: BRAND.gradientLight,
            color: '#fff',
            border: 0,
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(42, 157, 143, 0.4)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animation: 'fadeInUp 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(42, 157, 143, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(42, 157, 143, 0.4)';
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

