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

const projects = [
  {
    id: 1,
    title: 'برج إداري متطور',
    category: 'مباني إدارية',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&h=900&fit=crop&q=85',
    stats: { area: '5000 م²', floors: '20 طابق', duration: '18 شهر' }
  },
  {
    id: 2,
    title: 'مجمع سكني فاخر',
    category: 'مباني سكنية',
    image: 'https://images.unsplash.com/photo-1600585154526-990dac4d53ef?w=1400&h=900&fit=crop&q=85',
    stats: { area: '8000 م²', floors: '15 طابق', duration: '24 شهر' }
  },
  {
    id: 3,
    title: 'مركز تجاري',
    category: 'مراكز تجارية',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&h=900&fit=crop&q=85',
    stats: { area: '12000 م²', floors: '5 طابق', duration: '30 شهر' }
  },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, system-ui, Arial', background: '#fff', minHeight: '100vh' }}>
      {/* Projects Section */}
      <section style={{
        background: BRAND.dark,
        padding: '120px 32px 100px',
        color: '#fff',
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
            marginBottom: 16,
            letterSpacing: '-1px'
          }}>
            مشاريعنا المميزة
          </h1>
          <p style={{
            fontSize: isMobile ? 16 : 20,
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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 32
        }}>
          {projects.map((project, index) => (
            <div
              key={index}
              onClick={() => navigate('/showcase')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s ease',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
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
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: 20
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/showcase');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: BRAND.gradientLight,
                    color: '#fff',
                    border: 0,
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginTop: 8
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
                  عرض التفاصيل →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

