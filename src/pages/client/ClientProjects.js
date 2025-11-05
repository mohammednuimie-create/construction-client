import React, { useState, useEffect } from "react";
import { projectsAPI } from "../../utils/api";
import Modal from "../../Modal";
import { useNotifications } from "../../components/NotificationSystem";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

// مكون ProgressBar مميز
const ProgressBar = ({ progress, showLabel = true, size = 'medium' }) => {
  const progressValue = Math.min(Math.max(progress || 0, 0), 100);
  const isComplete = progressValue === 100;
  
  const getProgressColor = () => {
    if (isComplete) return '#10b981'; // أخضر
    if (progressValue >= 75) return '#2a9d8f'; // أخضر فاتح
    if (progressValue >= 50) return '#3b82f6'; // أزرق
    if (progressValue >= 25) return '#f59e0b'; // برتقالي
    return '#ef4444'; // أحمر
  };

  const heightMap = {
    small: 8,
    medium: 12,
    large: 16
  };

  const height = heightMap[size] || 12;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        width: '100%',
        height: height,
        background: BRAND.light,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div
          style={{
            width: `${progressValue}%`,
            height: '100%',
            background: isComplete 
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              : `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}dd 100%)`,
            borderRadius: 20,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: progressValue > 0 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
          }}
        >
          {progressValue > 0 && progressValue < 100 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite'
            }} />
          )}
        </div>
      </div>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          fontSize: size === 'small' ? 11 : 13
        }}>
          <span style={{
            color: BRAND.dark,
            fontWeight: 700,
            fontSize: size === 'small' ? 12 : 14
          }}>
            {isComplete ? '✅' : '📊'} {progressValue}%
          </span>
          {isComplete && (
            <span style={{
              color: '#10b981',
              fontWeight: 700,
              fontSize: size === 'small' ? 11 : 12
            }}>
              مكتمل
            </span>
          )}
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default function ClientProjects() {
  const notifications = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // جلب جميع مشاريع المقاولين (بدون فلترة حسب العميل)
        // أي عميل يقدر يشوف جميع المشاريع التي أنشأها أي مقاول
        const filters = {}; // لا نفلتر حسب العميل، نعرض جميع المشاريع
        console.log('📋 جلب جميع مشاريع المقاولين');
        const data = await projectsAPI.getAll(filters);
        console.log('✅ Projects data:', data);
        
        // فلترة فقط المشاريع التي لها مقاول (contractor)
        const projectsWithContractor = Array.isArray(data) 
          ? data.filter(p => p.contractor) 
          : [];
        
        console.log('✅ المشاريع مع المقاولين:', projectsWithContractor.length);
        setProjects(projectsWithContractor);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب المشاريع');
        console.error('❌ Error fetching projects:', err);
        notifications.error('خطأ', err.message || 'حدث خطأ أثناء جلب المشاريع');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [notifications]);
  
  const categories = ['الكل', 'سكني', 'تجاري'];
  const filteredProjects = selectedCategory === 'الكل' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const showProjectDetails = async (projectId) => {
    if (!projectId) {
      notifications.error('خطأ', 'معرف المشروع غير موجود');
      return;
    }
    
    setIsDetailsLoading(true);
    try {
      const projectData = await projectsAPI.getById(projectId);
      setSelectedProject(projectData);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching project details:', err);
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء جلب تفاصيل المشروع');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': { bg: '#fef3c7', color: '#92400e', text: 'قيد الانتظار', icon: '⏳' },
      'in-progress': { bg: '#dbeafe', color: '#1e40af', text: 'قيد التنفيذ', icon: '🔄' },
      'completed': { bg: '#d1fae5', color: '#065f46', text: 'مكتمل', icon: '✅' },
      'cancelled': { bg: '#fee2e2', color: '#991b1b', text: 'ملغي', icon: '❌' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  // حساب مدة التنفيذ بالأيام
  const calculateDuration = (project) => {
    if (!project.startDate) return null;
    const start = new Date(project.startDate);
    const end = project.actualEndDate 
      ? new Date(project.actualEndDate) 
      : project.expectedEndDate 
        ? new Date(project.expectedEndDate) 
        : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // مكون النجوم للتقييم (للعرض فقط)
  const RatingStars = ({ rating, size = 16 }) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} style={{ fontSize: size, color: '#fbbf24' }}>⭐</span>
        ))}
        {hasHalfStar && (
          <span style={{ fontSize: size, color: '#fbbf24' }}>⭐</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} style={{ fontSize: size, color: '#d1d5db' }}>☆</span>
        ))}
        {rating > 0 && (
          <span style={{ 
            marginLeft: 6, 
            fontSize: size - 2, 
            color: BRAND.muted, 
            fontWeight: 600 
          }}>
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  };

  // مكون النجوم للتقييم (قابل للنقر)
  const RatingInput = ({ value, onChange, size = 24 }) => {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              padding: 4,
              fontSize: size,
              transition: 'all 0.2s ease'
            }}
          >
            {star <= value ? '⭐' : '☆'}
          </button>
        ))}
        {value > 0 && (
          <span style={{
            marginLeft: 12,
            fontSize: 18,
            fontWeight: 700,
            color: BRAND.primary
          }}>
            {value} / 5
          </span>
        )}
      </div>
    );
  };

  const handleRateProject = async () => {
    console.log('📝 handleRateProject called', { selectedProject, rating });
    
    if (!selectedProject) {
      notifications.error('خطأ', 'المشروع غير محدد');
      return;
    }
    
    if (rating === 0) {
      notifications.warning('تحذير', 'يرجى اختيار تقييم من 1 إلى 5');
      return;
    }

    setIsSubmittingRating(true);
    try {
      // حساب مدة التنفيذ إذا لم تكن موجودة
      const duration = calculateDuration(selectedProject);
      
      console.log('📤 Updating project with:', { rating, duration });
      
      const updatedProject = await projectsAPI.update(selectedProject._id || selectedProject.id, {
        rating: rating,
        duration: duration
      });

      console.log('✅ Project updated:', updatedProject);

      // تحديث المشروع في القائمة
      setProjects(prev => prev.map(p => 
        (p._id || p.id) === (selectedProject._id || selectedProject.id)
          ? { ...p, rating, duration, contractor: updatedProject.contractor || p.contractor }
          : p
      ));

      // تحديث المشروع المحدد مع بيانات المقاول المحدثة
      setSelectedProject(prev => ({ 
        ...prev, 
        rating, 
        duration,
        contractor: updatedProject.contractor || prev.contractor
      }));

      setIsRatingModalOpen(false);
      setRating(0);
      notifications.success('نجح', `تم تقييم المشروع بنجاح! ${rating} نجوم`);
    } catch (err) {
      console.error('❌ Error rating project:', err);
      notifications.error('خطأ', err.message || 'حدث خطأ أثناء حفظ التقييم');
    } finally {
      setIsSubmittingRating(false);
    }
  };

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
          استعراض جميع مشاريع المقاولين
        </h2>
        <p style={{ color: BRAND.muted, fontSize: 15, margin: 0 }}>
          استعرض وقيّم جميع المشاريع التي أنشأها المقاولون في النظام
        </p>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background: selectedCategory === cat ? BRAND.gradient : '#fff',
              color: selectedCategory === cat ? '#fff' : BRAND.dark,
              border: `2px solid ${selectedCategory === cat ? 'transparent' : '#e5e7eb'}`,
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedCategory === cat ? '0 4px 15px rgba(42,157,143,0.3)' : '0 2px 8px rgba(30,58,95,0.05)'
            }}
            onMouseOver={e => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.borderColor = BRAND.accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={e => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: BRAND.light,
          borderRadius: 16
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.muted }}>
            جاري تحميل المشاريع...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fee2e2',
          borderRadius: 16,
          color: '#991b1b'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {error}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24
        }}>
          {filteredProjects.map(p => (
          <div
            key={p._id || p.id}
            style={{
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
              overflow: 'hidden',
              border: '1px solid rgba(30,58,95,0.05)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(30,58,95,0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,58,95,0.08)';
            }}
          >
            {/* Image */}
            <div style={{
              height: 180,
              overflow: 'hidden',
              position: 'relative',
              background: BRAND.light
            }}>
              {p.images && p.images.length > 0 ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.muted,
                  fontSize: 48
                }}>
                  🏗️
                </div>
              )}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: BRAND.primary,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                {p.location || 'مشروع'}
              </div>
            </div>
            
            {/* Content */}
            <div style={{ padding: 24 }}>
              <div style={{
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 12,
                color: BRAND.dark
              }}>
                {p.name}
              </div>
              
              {/* Contractor Info */}
              {p.contractor && (
                <div style={{
                  marginBottom: 12,
                  padding: 10,
                  background: BRAND.light,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ fontSize: 18 }}>👷</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 2 }}>
                      المقاول المنفذ:
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 700, 
                      color: BRAND.primary 
                    }}>
                      {typeof p.contractor === 'object' 
                        ? (p.contractor.name || p.contractor.companyName || 'مقاول')
                        : 'مقاول'}
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Display */}
              {p.rating > 0 && (
                <div style={{
                  marginBottom: 12,
                  padding: 10,
                  background: '#fef3c7',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ fontSize: 18 }}>⭐</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 2 }}>
                      التقييم:
                    </div>
                    <RatingStars rating={p.rating} size={16} />
                  </div>
                </div>
              )}

              {/* Duration */}
              {calculateDuration(p) && (
                <div style={{
                  marginBottom: 12,
                  padding: 10,
                  background: BRAND.light,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ fontSize: 18 }}>📅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 2 }}>
                      مدة التنفيذ:
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 700, 
                      color: BRAND.accent 
                    }}>
                      {calculateDuration(p)} يوم
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Section */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ color: BRAND.dark, fontSize: 13 }}>📊 التقدم:</strong>
                </div>
                <ProgressBar progress={p.progress || 0} size="medium" />
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: BRAND.light,
                  padding: '8px 14px',
                  borderRadius: 10
                }}>
                  <span style={{ fontSize: 18 }}>💰</span>
                  <span style={{
                    color: BRAND.dark,
                    fontWeight: 700,
                    fontSize: 16
                  }}>
                    ${(p.budget || 0).toLocaleString()}
                  </span>
                </div>
                
                <button
                  onClick={() => showProjectDetails(p._id || p.id)}
                  disabled={isDetailsLoading}
                  style={{
                    background: isDetailsLoading ? BRAND.muted : BRAND.gradient,
                    color: '#fff',
                    border: 0,
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: isDetailsLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
                    transition: 'all 0.3s ease',
                    opacity: isDetailsLoading ? 0.6 : 1
                  }}
                  onMouseOver={e => {
                    if (!isDetailsLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!isDetailsLoading) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
                    }
                  }}
                >
                  {isDetailsLoading ? '⏳ جاري التحميل...' : 'عرض التفاصيل'}
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: BRAND.light,
          borderRadius: 16,
          marginTop: 40
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.muted }}>
            لا توجد مشاريع في هذا التصنيف
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProject(null);
          }}
          title={`تفاصيل المشروع: ${selectedProject.name || 'غير محدد'}`}
          size="large"
        >
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '0 8px' }}>
            {/* Project Header */}
            <div style={{
              marginBottom: 24,
              padding: 20,
              background: BRAND.light,
              borderRadius: 12,
              border: `2px solid ${BRAND.accent}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: 8,
                    color: BRAND.primary,
                    fontSize: 24,
                    fontWeight: 800
                  }}>
                    {selectedProject.name}
                  </h3>
                  {selectedProject.description && (
                    <p style={{
                      color: BRAND.muted,
                      fontSize: 15,
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      {selectedProject.description}
                    </p>
                  )}
                </div>
                <div>
                  {(() => {
                    const statusInfo = getStatusColor(selectedProject.status);
                    return (
                      <span style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        background: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Progress Section */}
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: BRAND.dark, fontSize: 14 }}>📊 التقدم:</strong>
                </div>
                <ProgressBar progress={selectedProject.progress || 0} size="large" />
              </div>
            </div>

            {/* Contractor, Duration & Rating */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              {/* Contractor */}
              {selectedProject.contractor && (
                <div style={{
                  padding: 16,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: 24 }}>👷</span>
                    <strong style={{ color: BRAND.dark, fontSize: 13 }}>المقاول المنفذ</strong>
                  </div>
                  <div style={{
                    color: BRAND.primary,
                    fontSize: 16,
                    fontWeight: 700,
                    marginTop: 4
                  }}>
                    {typeof selectedProject.contractor === 'object' 
                      ? (selectedProject.contractor.name || selectedProject.contractor.companyName || 'مقاول')
                      : 'مقاول'}
                  </div>
                  {typeof selectedProject.contractor === 'object' && selectedProject.contractor.email && (
                    <div style={{
                      color: BRAND.muted,
                      fontSize: 12,
                      marginTop: 4
                    }}>
                      {selectedProject.contractor.email}
                    </div>
                  )}
                </div>
              )}

              {/* Duration */}
              {calculateDuration(selectedProject) && (
                <div style={{
                  padding: 16,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: 24 }}>📅</span>
                    <strong style={{ color: BRAND.dark, fontSize: 13 }}>مدة التنفيذ</strong>
                  </div>
                  <div style={{
                    color: BRAND.accent,
                    fontSize: 20,
                    fontWeight: 800
                  }}>
                    {calculateDuration(selectedProject)} يوم
                  </div>
                  {selectedProject.startDate && selectedProject.actualEndDate && (
                    <div style={{
                      fontSize: 11,
                      color: BRAND.muted,
                      marginTop: 4
                    }}>
                      {new Date(selectedProject.startDate).toLocaleDateString('ar-SA')} - {new Date(selectedProject.actualEndDate).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
              )}

              {/* Rating */}
              {selectedProject.rating > 0 && (
                <div style={{
                  padding: 16,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: 24 }}>⭐</span>
                    <strong style={{ color: BRAND.dark, fontSize: 13 }}>التقييم</strong>
                  </div>
                  <RatingStars rating={selectedProject.rating} size={20} />
                </div>
              )}
            </div>

            {/* Project Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}>
              {/* Budget */}
              <div style={{
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 24 }}>💰</span>
                  <strong style={{ color: BRAND.dark, fontSize: 13 }}>الميزانية</strong>
                </div>
                <div style={{
                  color: BRAND.accent,
                  fontSize: 20,
                  fontWeight: 800
                }}>
                  ${(selectedProject.budget || 0).toLocaleString()}
                </div>
              </div>

              {/* Total Cost */}
              <div style={{
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 24 }}>💵</span>
                  <strong style={{ color: BRAND.dark, fontSize: 13 }}>التكلفة الإجمالية</strong>
                </div>
                <div style={{
                  color: BRAND.primary,
                  fontSize: 20,
                  fontWeight: 800
                }}>
                  ${(selectedProject.totalCost || 0).toLocaleString()}
                </div>
              </div>

              {/* Engineers Count */}
              <div style={{
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 24 }}>👷</span>
                  <strong style={{ color: BRAND.dark, fontSize: 13 }}>المهندسين</strong>
                </div>
                <div style={{
                  color: BRAND.dark,
                  fontSize: 20,
                  fontWeight: 800
                }}>
                  {selectedProject.engineers?.length || 0}
                </div>
              </div>

              {/* Images Count */}
              <div style={{
                padding: 16,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 24 }}>📷</span>
                  <strong style={{ color: BRAND.dark, fontSize: 13 }}>الصور</strong>
                </div>
                <div style={{
                  color: BRAND.dark,
                  fontSize: 20,
                  fontWeight: 800
                }}>
                  {selectedProject.images?.length || 0}
                </div>
              </div>
            </div>

            {/* Location & Dates */}
            {(selectedProject.location || selectedProject.startDate || selectedProject.expectedEndDate) && (
              <div style={{
                padding: 16,
                background: BRAND.light,
                borderRadius: 12,
                marginBottom: 24
              }}>
                <h4 style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: BRAND.primary,
                  fontSize: 16,
                  fontWeight: 700
                }}>
                  📍 الموقع والتواريخ
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12
                }}>
                  {selectedProject.location && (
                    <div>
                      <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>الموقع</div>
                      <div style={{ color: BRAND.dark, fontWeight: 600 }}>📍 {selectedProject.location}</div>
                    </div>
                  )}
                  {selectedProject.startDate && (
                    <div>
                      <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>تاريخ البدء</div>
                      <div style={{ color: BRAND.dark, fontWeight: 600 }}>
                        📅 {new Date(selectedProject.startDate).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  )}
                  {selectedProject.expectedEndDate && (
                    <div>
                      <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>تاريخ الانتهاء المتوقع</div>
                      <div style={{ color: BRAND.dark, fontWeight: 600 }}>
                        📅 {new Date(selectedProject.expectedEndDate).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Engineers Section */}
            {selectedProject.engineers && selectedProject.engineers.length > 0 && (
              <div style={{
                padding: 16,
                background: BRAND.light,
                borderRadius: 12,
                marginBottom: 24
              }}>
                <h4 style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: BRAND.primary,
                  fontSize: 16,
                  fontWeight: 700
                }}>
                  👷 فريق المهندسين
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12
                }}>
                  {selectedProject.engineers.map((eng, idx) => (
                    <div
                      key={eng._id || eng.id || idx}
                      style={{
                        padding: 12,
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        fontWeight: 700,
                        color: BRAND.dark,
                        marginBottom: 6,
                        fontSize: 14
                      }}>
                        {eng.name || 'مهندس'}
                      </div>
                      {eng.specialty && (
                        <div style={{
                          fontSize: 12,
                          color: BRAND.muted,
                          marginBottom: 4
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            background: BRAND.accent,
                            color: '#fff',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            {eng.specialty}
                          </span>
                        </div>
                      )}
                      {eng.salary && (
                        <div style={{
                          fontSize: 12,
                          color: BRAND.accent,
                          fontWeight: 600
                        }}>
                          💰 ${eng.salary.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Gallery */}
            {selectedProject.images && selectedProject.images.length > 0 && (
              <div style={{
                padding: 16,
                background: BRAND.light,
                borderRadius: 12,
                marginBottom: 24
              }}>
                <h4 style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: BRAND.primary,
                  fontSize: 16,
                  fontWeight: 700
                }}>
                  📷 معرض الصور ({selectedProject.images.length})
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 12
                }}>
                  {selectedProject.images.slice(0, 6).map((img, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(typeof img === 'string' ? img : img.url || img, '_blank')}
                    >
                      <img
                        src={typeof img === 'string' ? img : img.url || img}
                        alt={`Project ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                  ))}
                </div>
                {selectedProject.images.length > 6 && (
                  <div style={{
                    marginTop: 12,
                    textAlign: 'center',
                    color: BRAND.muted,
                    fontSize: 13
                  }}>
                    + {selectedProject.images.length - 6} صورة إضافية
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {selectedProject.notes && (
              <div style={{
                padding: 16,
                background: BRAND.light,
                borderRadius: 12,
                marginBottom: 24
              }}>
                <h4 style={{
                  marginTop: 0,
                  marginBottom: 12,
                  color: BRAND.primary,
                  fontSize: 16,
                  fontWeight: 700
                }}>
                  📝 ملاحظات
                </h4>
                <div style={{
                  padding: 12,
                  background: '#fff',
                  borderRadius: 8,
                  color: BRAND.muted,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedProject.notes}
                </div>
              </div>
            )}

            {/* Rating Section - Only for completed projects */}
            {selectedProject.status === 'completed' && (
              <div style={{
                padding: 24,
                background: BRAND.light,
                borderRadius: 16,
                marginBottom: 24,
                border: `2px solid ${BRAND.accent}`,
                boxShadow: '0 4px 20px rgba(42,157,143,0.15)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <h3 style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: BRAND.primary,
                      margin: 0,
                      marginBottom: 4
                    }}>
                      {selectedProject.rating > 0 ? '⭐ تقييم المشروع' : '💬 قيّم هذا المشروع'}
                    </h3>
                    {selectedProject.rating > 0 && (
                      <p style={{
                        fontSize: 13,
                        color: BRAND.muted,
                        margin: 0
                      }}>
                        شكراً لك على تقييمك!
                      </p>
                    )}
                  </div>
                  {selectedProject.rating > 0 && (
                    <RatingStars rating={selectedProject.rating} size={28} />
                  )}
                </div>
                
                {(!selectedProject.rating || selectedProject.rating === 0) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('⭐ Rating button clicked');
                      setIsRatingModalOpen(true);
                      setRating(0);
                    }}
                    style={{
                      background: BRAND.gradient,
                      color: '#fff',
                      border: 0,
                      padding: '14px 40px',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
                      transition: 'all 0.3s ease',
                      width: '100%'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
                    }}
                  >
                    ⭐ قيّم المشروع الآن
                  </button>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div style={{
              padding: 12,
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              color: BRAND.muted,
              textAlign: 'center'
            }}>
              {selectedProject.createdAt && (
                <span>تم الإنشاء: {new Date(selectedProject.createdAt).toLocaleDateString('ar-SA')}</span>
              )}
              {selectedProject.createdAt && selectedProject.updatedAt && <span> • </span>}
              {selectedProject.updatedAt && (
                <span>آخر تحديث: {new Date(selectedProject.updatedAt).toLocaleDateString('ar-SA')}</span>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setRating(0);
        }}
        title="⭐ قيّم المشروع"
      >
        <div style={{ padding: 20 }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 30
          }}>
            <h3 style={{
              color: BRAND.primary,
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8
            }}>
              {selectedProject?.name}
            </h3>
            <p style={{
              color: BRAND.muted,
              fontSize: 14,
              margin: 0
            }}>
              كم تقيّم هذا المشروع؟
            </p>
          </div>

          <div style={{
            marginBottom: 30,
            padding: '30px 20px',
            background: BRAND.light,
            borderRadius: 16
          }}>
            <RatingInput
              value={rating}
              onChange={setRating}
              size={40}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => {
                setIsRatingModalOpen(false);
                setRating(0);
              }}
              style={{
                background: '#f1f5f9',
                color: BRAND.dark,
                border: 0,
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#f1f5f9';
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('💾 Save rating button clicked', { rating, selectedProject });
                handleRateProject();
              }}
              disabled={isSubmittingRating || rating === 0}
              style={{
                background: rating === 0 ? BRAND.muted : BRAND.gradient,
                color: '#fff',
                border: 0,
                padding: '12px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: rating === 0 || isSubmittingRating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
                transition: 'all 0.3s ease',
                opacity: rating === 0 ? 0.6 : 1
              }}
              onMouseOver={e => {
                if (rating > 0 && !isSubmittingRating) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
                }
              }}
              onMouseOut={e => {
                if (rating > 0 && !isSubmittingRating) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
                }
              }}
            >
              {isSubmittingRating ? '⏳ جاري الحفظ...' : '✓ حفظ التقييم'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}



