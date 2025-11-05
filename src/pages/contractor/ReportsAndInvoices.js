import React, { useState } from "react";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

const reportCards = [
  {
    id: 1,
    title: 'تقرير المواد',
    description: 'تقرير شامل عن المواد والمخزون',
    icon: '📦',
    color: BRAND.gradient,
    action: 'materials'
  },
  {
    id: 2,
    title: 'تقرير التكاليف',
    description: 'تحليل تفصيلي للتكاليف والمصروفات',
    icon: '💰',
    color: BRAND.gradient,
    action: 'costs'
  },
  {
    id: 3,
    title: 'تقرير المشاريع',
    description: 'حالة وتقدم جميع المشاريع',
    icon: '📁',
    color: BRAND.gradient,
    action: 'projects'
  },
  {
    id: 4,
    title: 'إنشاء فاتورة',
    description: 'إنشاء فاتورة جديدة للعميل',
    icon: '🧾',
    color: 'linear-gradient(135deg, #f4a261 0%, #e76f51 100%)',
    action: 'invoice'
  },
];

export default function ReportsAndInvoices(){
  const notifications = useNotifications();
  const [isGenerating, setIsGenerating] = useState(null);

  function handleReport(action) {
    setIsGenerating(action);
    setTimeout(() => {
      notifications.success('نجح', `سيتم توليد ${action === 'invoice' ? 'الفاتورة' : 'التقرير'} وستظهر قريباً في القائمة`);
      setIsGenerating(null);
    }, 1500);
  }

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, system-ui, Arial' }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{
          fontWeight: 900,
          color: BRAND.primary,
          fontSize: 32,
          margin: '0 0 8px 0',
          letterSpacing: '-1px'
        }}>
          التقارير والفواتير
        </h2>
        <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
          إنشاء تقارير شاملة وفواتير للعملاء
        </p>
      </div>

      {/* Report Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {reportCards.map(card => (
          <div
            key={card.id}
            onClick={() => handleReport(card.action)}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
              border: '2px solid rgba(30,58,95,0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = BRAND.accent;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(42,157,143,0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'rgba(30,58,95,0.05)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,58,95,0.08)';
            }}
          >
            {isGenerating === card.action && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                zIndex: 10
              }}>
                <div style={{
                  fontSize: 24,
                  animation: 'spin 1s linear infinite'
                }}>
                  ⏳
                </div>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              marginBottom: 20,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              {card.icon}
            </div>
            
            <h3 style={{
              margin: '0 0 10px 0',
              color: BRAND.dark,
              fontSize: 22,
              fontWeight: 800
            }}>
              {card.title}
            </h3>
            
            <p style={{
              margin: 0,
              color: BRAND.muted,
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 20
            }}>
              {card.description}
            </p>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: BRAND.accent,
              fontWeight: 700,
              fontSize: 14
            }}>
              <span>إنشاء الآن</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div style={{
        background: BRAND.light,
        borderRadius: 16,
        padding: 24,
        border: '2px solid rgba(30,58,95,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          fontSize: 32,
          width: 50,
          height: 50,
          borderRadius: 12,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          ℹ️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700,
            color: BRAND.dark,
            marginBottom: 6,
            fontSize: 16
          }}>
            ملاحظة
          </div>
          <div style={{
            color: BRAND.muted,
            fontSize: 14,
            lineHeight: 1.6
          }}>
            سيتم ربط هذه الأزرار بالـ API لإنتاج تقارير PDF/CSV والفواتير لاحقاً. 
            يمكنك تصدير التقارير بجودة عالية وتحميلها أو طباعتها.
          </div>
        </div>
      </div>
    </div>
  );
}


