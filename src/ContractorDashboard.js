import React, { useState, useEffect } from "react";
import { projectsAPI, suppliersAPI, paymentsAPI, getUser } from "./utils/api";
import { useNotifications } from "./components/NotificationSystem";
import { ProjectsPieChart, PaymentsBarChart, BudgetLineChart, ProgressChart } from "./components/Charts";
import ProjectCalendar from "./components/ProjectCalendar";

// مكون ProgressBar
const ProgressBar = ({ progress, showLabel = true, size = 'medium' }) => {
  const progressValue = Math.min(Math.max(progress || 0, 0), 100);
  const isComplete = progressValue === 100;
  
  const getProgressColor = () => {
    if (isComplete) return '#10b981';
    if (progressValue >= 75) return '#2a9d8f';
    if (progressValue >= 50) return '#3b82f6';
    if (progressValue >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const height = size === 'small' ? 6 : size === 'large' ? 12 : 8;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        width: '100%',
        height: height,
        background: '#f1f5f9',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div
          style={{
            width: `${progressValue}%`,
            height: '100%',
            background: isComplete 
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              : `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}dd 100%)`,
            borderRadius: 20,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
      {showLabel && (
        <div style={{
          marginTop: 4,
          fontSize: 11,
          color: '#64748b',
          fontWeight: 600
        }}>
          {progressValue}%
        </div>
      )}
    </div>
  );
};

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function ContractorDashboard() {
  const notifications = useNotifications();
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, charts, calendar

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = getUser();
        const filters = {};
        if (user?.role === 'contractor') {
          filters.contractor = user.id;
        }
        
        // جلب جميع البيانات
        const [projectsData, suppliersData, paymentsData] = await Promise.all([
          projectsAPI.getAll(filters),
          suppliersAPI.getAll().catch(() => []),
          paymentsAPI.getAll().catch(() => [])
        ]);
        
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (e) {
        console.error('Failed to load data', e);
        setProjects([]);
        setSuppliers([]);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Statistics calculation
  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.status === 'pending' || p.status === 'جديد').length,
    inProgress: projects.filter(p => p.status === 'in-progress' || p.status === 'جاري').length,
    completed: projects.filter(p => p.status === 'completed' || p.status === 'مكتمل').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalCost: projects.reduce((sum, p) => sum + (p.totalCost || 0), 0),
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0,
    totalEngineers: projects.reduce((sum, p) => sum + (p.engineers?.length || 0), 0),
    totalImages: projects.reduce((sum, p) => sum + (p.images?.length || 0), 0),
    totalSuppliers: suppliers.length,
    totalPaid: suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0),
    totalRemaining: suppliers.reduce((sum, s) => sum + (s.totalRemaining || (s.totalPurchases || 0) - (s.totalPaid || 0)), 0),
    recentPayments: payments.length,
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, system-ui, Arial' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .stat-card {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>

      {/* Header */}
      <div style={{
        marginBottom: 30
      }}>
        <h1 style={{
          fontSize: 36,
          fontWeight: 900,
          color: BRAND.primary,
          margin: '0 0 8px 0',
          letterSpacing: '-1px'
        }}>
          👋 أهلاً بك، المقاول
        </h1>
        <p style={{ color: BRAND.muted, fontSize: 16, margin: 0 }}>
          إدارة مشاريعك ومراقبة التقدم من مكان واحد
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        background: '#fff',
        padding: 8,
        borderRadius: 12,
        boxShadow: '0 2px 10px rgba(30,58,95,0.05)',
        border: '1px solid rgba(30,58,95,0.05)'
      }}>
        {[
          { id: 'overview', label: '📊 نظرة عامة', icon: '📊' },
          { id: 'charts', label: '📈 الرسوم البيانية', icon: '📈' },
          { id: 'calendar', label: '📅 التقويم', icon: '📅' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 8,
              border: 0,
              background: activeTab === tab.id ? BRAND.gradient : 'transparent',
              color: activeTab === tab.id ? '#fff' : BRAND.muted,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseOver={e => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = BRAND.light;
                e.currentTarget.style.color = BRAND.primary;
              }
            }}
            onMouseOut={e => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = BRAND.muted;
              }
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
      {/* Statistics Cards - Row 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 20
      }}>
        {[
          { label: 'إجمالي المشاريع', value: stats.total, icon: '📊', color: BRAND.primary },
          { label: 'قيد الانتظار', value: stats.pending, icon: '⏳', color: '#6366f1' },
          { label: 'قيد التنفيذ', value: stats.inProgress, icon: '⚙️', color: '#f59e0b' },
          { label: 'مكتملة', value: stats.completed, icon: '✅', color: '#10b981' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
              border: '1px solid rgba(30,58,95,0.05)',
              transition: 'all 0.3s ease',
              animationDelay: `${i * 0.1}s`
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(30,58,95,0.12)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,58,95,0.08)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{stat.icon}</div>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: stat.color,
                boxShadow: `0 0 12px ${stat.color}40`
              }} />
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: stat.color,
              marginBottom: 6,
              background: stat.label.includes('الميزانية') ? BRAND.gradient : undefined,
              WebkitBackgroundClip: stat.label.includes('الميزانية') ? 'text' : undefined,
              WebkitTextFillColor: stat.label.includes('الميزانية') ? 'transparent' : undefined,
            }}>
              {stat.value}
            </div>
            <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Cards - Row 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 20
      }}>
        {[
          { label: 'إجمالي الميزانية', value: `$${stats.totalBudget.toLocaleString()}`, icon: '💰', color: BRAND.accent },
          { label: 'التكلفة الفعلية', value: `$${stats.totalCost.toLocaleString()}`, icon: '💵', color: '#8b5cf6' },
          { label: 'متوسط التقدم', value: `${stats.avgProgress}%`, icon: '📈', color: '#06b6d4' },
          { label: 'إجمالي المهندسين', value: stats.totalEngineers, icon: '👷', color: '#f97316' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
              border: '1px solid rgba(30,58,95,0.05)',
              transition: 'all 0.3s ease',
              animationDelay: `${(i + 4) * 0.1}s`
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(30,58,95,0.12)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,58,95,0.08)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{stat.icon}</div>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: stat.color,
                boxShadow: `0 0 12px ${stat.color}40`
              }} />
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: stat.color,
              marginBottom: 6,
              background: stat.label.includes('الميزانية') || stat.label.includes('التكلفة') ? BRAND.gradient : undefined,
              WebkitBackgroundClip: stat.label.includes('الميزانية') || stat.label.includes('التكلفة') ? 'text' : undefined,
              WebkitTextFillColor: stat.label.includes('الميزانية') || stat.label.includes('التكلفة') ? 'transparent' : undefined,
            }}>
              {stat.value}
            </div>
            <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Cards - Row 3 (Suppliers & Payments) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 30
      }}>
        {[
          { label: 'الموردين', value: stats.totalSuppliers, icon: '🏢', color: BRAND.primary },
          { label: 'إجمالي المدفوع', value: `$${stats.totalPaid.toLocaleString()}`, icon: '💳', color: '#10b981' },
          { label: 'المتبقي للموردين', value: `$${stats.totalRemaining.toLocaleString()}`, icon: '📊', color: '#ef4444' },
          { label: 'عمليات السداد', value: stats.recentPayments, icon: '💰', color: BRAND.accent },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
              border: '1px solid rgba(30,58,95,0.05)',
              transition: 'all 0.3s ease',
              animationDelay: `${(i + 8) * 0.1}s`
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(30,58,95,0.12)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,58,95,0.08)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{stat.icon}</div>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: stat.color,
                boxShadow: `0 0 12px ${stat.color}40`
              }} />
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: stat.color,
              marginBottom: 6,
              background: stat.label.includes('المدفوع') || stat.label.includes('المتبقي') ? BRAND.gradient : undefined,
              WebkitBackgroundClip: stat.label.includes('المدفوع') || stat.label.includes('المتبقي') ? 'text' : undefined,
              WebkitTextFillColor: stat.label.includes('المدفوع') || stat.label.includes('المتبقي') ? 'transparent' : undefined,
            }}>
              {stat.value}
            </div>
            <div style={{ color: BRAND.muted, fontSize: 14, fontWeight: 600 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

        </>
      )}

      {/* Charts Tab Content */}
      {activeTab === 'charts' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}>
          {/* Projects Status Pie Chart */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
            border: '1px solid rgba(30,58,95,0.05)'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 800,
              color: BRAND.primary,
              margin: '0 0 20px 0'
            }}>
              📊 توزيع حالة المشاريع
            </h3>
            <ProjectsPieChart data={{
              pending: stats.pending,
              inProgress: stats.inProgress,
              completed: stats.completed,
              cancelled: projects.filter(p => p.status === 'cancelled' || p.status === 'معلق').length
            }} />
          </div>

          {/* Payments Bar Chart */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
            border: '1px solid rgba(30,58,95,0.05)'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 800,
              color: BRAND.primary,
              margin: '0 0 20px 0'
            }}>
              💳 المدفوعات الشهرية
            </h3>
            {payments.length > 0 ? (
              <PaymentsBarChart data={payments} />
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: BRAND.muted
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14 }}>لا توجد بيانات للعرض</div>
              </div>
            )}
          </div>

          {/* Budget vs Cost Line Chart */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
            border: '1px solid rgba(30,58,95,0.05)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 800,
              color: BRAND.primary,
              margin: '0 0 20px 0'
            }}>
              💰 الميزانية مقابل التكلفة الفعلية
            </h3>
            {projects.filter(p => p.budget && p.totalCost).length > 0 ? (
              <BudgetLineChart projects={projects} />
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: BRAND.muted
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14 }}>لا توجد بيانات للعرض</div>
              </div>
            )}
          </div>

          {/* Progress Chart */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
            border: '1px solid rgba(30,58,95,0.05)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 800,
              color: BRAND.primary,
              margin: '0 0 20px 0'
            }}>
              📈 تقدم المشاريع
            </h3>
            {projects.filter(p => p.progress !== undefined).length > 0 ? (
              <ProgressChart projects={projects} />
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: BRAND.muted
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14 }}>لا توجد بيانات للعرض</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab Content */}
      {activeTab === 'calendar' && (
        <ProjectCalendar projects={projects} />
      )}
    </div>
  );
}
