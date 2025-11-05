import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./company-logo.jpeg";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

const baseMenu = [
  { to: "/showcase", label: "الأعمال المنجزة", icon: "📋" },
  { to: "/login", label: "تسجيل الدخول", icon: "🔑" },
];

const contractorMenu = [
  { to: "/contractor/projects/add", label: "إضافة مشروع + طلبات العملاء", icon: "➕" },
  { to: "/contractor/projects/list", label: "المشاريع الجاهزة", icon: "📋" },
  { to: "/contractor/inventory", label: "المخازن والمواد", icon: "📦" },
  { to: "/contractor/purchases-issue", label: "مشتريات وصرف المواد", icon: "🛒" },
  { to: "/contractor/clients-contractors", label: "العملاء والمتعاقدون", icon: "🤝" },
  { to: "/contractor/contracts-supplies", label: "التعاقدات والتوريدات", icon: "📝" },
  { to: "/contractor/suppliers-payments", label: "الموردون والسداد", icon: "💰" },
  { to: "/contractor/reports-invoices", label: "التقارير والفواتير", icon: "📊" },
  { to: "/contractor/profile", label: "الملف الشخصي", icon: "👤" },
];

const clientMenu = [
  { to: "/client/profile", label: "الملف الشخصي", icon: "👤" },
  { to: "/client/projects", label: "استعراض المشاريع", icon: "👀" },
  { to: "/client/projects/add", label: "إضافة مشروع", icon: "📝" },
  { to: "/client/requests", label: "طلباتي", icon: "✉️" },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isContractor = location.pathname.startsWith('/contractor');
  const isClient = location.pathname.startsWith('/client');
  const menu = isClient ? clientMenu : isContractor ? contractorMenu : baseMenu;
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarContent = (
    <>
      <div style={{
        width: 80,
        height: 80,
        background: BRAND.gradient,
        borderRadius: 20,
        overflow: 'hidden',
        margin: '32px 0 16px',
        boxShadow: '0 6px 25px rgba(30,58,95,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid rgba(255,255,255,0.2)'
      }}>
        <img src={logo} alt="الشعار" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
      </div>
      <div style={{
        fontWeight: 900,
        fontSize: 19,
        letterSpacing: '-0.5px',
        marginBottom: 32,
        color: '#fff',
        userSelect: 'none',
        textAlign: 'center'
      }}>
        شركة المقاولات
      </div>
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '92%',
        alignItems: 'center',
        marginTop: 10
      }}>
        {menu.map((item) => {
          // Improved active state detection - supports nested routes
          const isActive = location.pathname === item.to || 
            (item.to !== '/contractor' && item.to !== '/client/profile' && 
             item.to !== '/client/projects' && item.to !== '/showcase' && 
             location.pathname.startsWith(item.to + '/'));
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              style={{
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                padding: '14px 16px',
                borderRadius: 14,
                background: isActive
                  ? BRAND.gradient
                  : 'transparent',
                fontWeight: 700,
                fontSize: 15,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive
                  ? '0 4px 15px rgba(42,157,143,0.3)'
                  : 'none',
                position: 'relative',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}
              onMouseOver={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateX(-4px)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseOut={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
            >
              <span style={{
                fontSize: 22,
                width: 28,
                textAlign: 'center',
                display: 'inline-block'
              }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, lineHeight: 1.3 }}>{item.label}</span>
              {isActive && (
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 0 8px rgba(255,255,255,0.8)'
                }} />
              )}
            </Link>
          );
        })}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          width: '100%',
          margin: '20px 0 12px'
        }} />
        <Link
          to="/"
          onClick={() => setOpen(false)}
          style={{
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 700,
            fontSize: 15,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 14,
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(220,38,38,0.1)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(220,38,38,0.2)';
            e.currentTarget.style.transform = 'translateX(-4px)';
            e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          <span style={{ fontSize: 20 }}>🚪</span>
          <span style={{ flex: 1 }}>تسجيل الخروج</span>
        </Link>
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 16,
        textAlign: 'center',
        padding: '0 12px'
      }}>
        © {new Date().getFullYear()} جميع الحقوق محفوظة
      </div>
    </>
  );

  return (
    <>
      {/* هذا الزر يختفي عندما تكون القائمة مفتوحة */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 21,
            background: BRAND.gradient,
            color: '#fff',
            border: 0,
            borderRadius: 14,
            fontSize: 24,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 25px rgba(42,157,143,0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(42,157,143,0.5)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(42,157,143,0.4)';
          }}
          aria-label="القائمة الجانبية"
        >
          ☰
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30,58,95,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 30,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              height: '100vh',
              width: isMobile ? '100%' : 280,
              background: BRAND.gradient,
              borderRadius: '0 24px 24px 0',
              boxShadow: '8px 0 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInDrawer 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: -100,
              left: -100,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Fixed Header with Close Button */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'rgba(30,58,95,0.3)',
              backdropFilter: 'blur(10px)',
              padding: '20px 0 12px',
              display: 'flex',
              justifyContent: 'flex-end',
              paddingRight: 20
            }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: 24,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  fontWeight: 700,
                  flexShrink: 0
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(220,38,38,0.3)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,0.5)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                aria-label="إغلاق القائمة"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              position: 'relative',
              zIndex: 1,
              paddingBottom: 24,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.3) transparent'
            }}>
              <style>{`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(255,255,255,0.3);
                  border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(255,255,255,0.5);
                }
              `}</style>
              {sidebarContent}
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInDrawer {
              from {
                opacity: 0;
                transform: translateX(200px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}