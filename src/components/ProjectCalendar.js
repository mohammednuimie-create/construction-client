import React, { useState } from 'react';

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

export default function ProjectCalendar({ projects = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Arabic day names
  const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  // Get projects for a specific date
  const getProjectsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projects.filter(p => {
      const startDate = p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : null;
      const endDate = p.expectedEndDate ? new Date(p.expectedEndDate).toISOString().split('T')[0] : null;
      const actualEndDate = p.actualEndDate ? new Date(p.actualEndDate).toISOString().split('T')[0] : null;
      
      return (startDate === dateStr) || 
             (endDate === dateStr) || 
             (actualEndDate === dateStr) ||
             (startDate && endDate && dateStr >= startDate && dateStr <= endDate);
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const projectsForDate = getProjectsForDate(date);
    setSelectedProjects(projectsForDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }
    
    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      days.push({ date, isCurrentMonth: true, isToday });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': '#3b82f6',
      'جديد': '#3b82f6',
      'in-progress': '#f59e0b',
      'جاري': '#f59e0b',
      'completed': '#10b981',
      'مكتمل': '#10b981',
      'cancelled': '#ef4444',
      'معلق': '#ef4444',
    };
    return colors[status] || BRAND.muted;
  };

  // Arabic month names
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Cairo, system-ui, Arial' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .calendar-day {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
        border: '1px solid rgba(30,58,95,0.05)',
      }}>
        {/* Calendar Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <h3 style={{
              fontSize: 24,
              fontWeight: 800,
              color: BRAND.primary,
              margin: '0 0 4px 0'
            }}>
              {monthNames[month]} {year}
            </h3>
            <p style={{ color: BRAND.muted, fontSize: 14, margin: 0 }}>
              تقويم المشاريع والمواعيد
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={goToPreviousMonth}
              style={{
                background: BRAND.light,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: BRAND.dark,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = BRAND.light;
                e.currentTarget.style.transform = 'none';
              }}
            >
              ← السابق
            </button>
            <button
              onClick={goToToday}
              style={{
                background: BRAND.gradient,
                border: 0,
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              اليوم
            </button>
            <button
              onClick={goToNextMonth}
              style={{
                background: BRAND.light,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: BRAND.dark,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = BRAND.light;
                e.currentTarget.style.transform = 'none';
              }}
            >
              التالي →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
          marginBottom: 20
        }}>
          {/* Day Headers */}
          {dayNames.map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                padding: 12,
                fontWeight: 700,
                fontSize: 13,
                color: BRAND.primary,
                background: BRAND.light,
                borderRadius: 8
              }}
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((dayObj, index) => {
            const projectsForDay = dayObj.isCurrentMonth ? getProjectsForDate(dayObj.date) : [];
            const isSelected = selectedDate && dayObj.date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                className="calendar-day"
                onClick={() => dayObj.isCurrentMonth && handleDateClick(dayObj.date)}
                style={{
                  minHeight: 100,
                  padding: 8,
                  border: isSelected ? `2px solid ${BRAND.accent}` : '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: dayObj.isCurrentMonth ? '#fff' : BRAND.light,
                  cursor: dayObj.isCurrentMonth ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  opacity: dayObj.isCurrentMonth ? 1 : 0.4
                }}
                onMouseEnter={e => {
                  if (dayObj.isCurrentMonth) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={e => {
                  if (dayObj.isCurrentMonth) {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {/* Day Number */}
                <div style={{
                  fontSize: 14,
                  fontWeight: dayObj.isToday ? 800 : 600,
                  color: dayObj.isToday ? BRAND.accent : dayObj.isCurrentMonth ? BRAND.dark : BRAND.muted,
                  marginBottom: 4,
                  textAlign: 'center'
                }}>
                  {dayObj.date.getDate()}
                </div>

                {/* Project Indicators */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {projectsForDay.slice(0, 3).map((project, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: getStatusColor(project.status),
                        color: '#fff',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      title={project.name}
                    >
                      {project.name?.length > 12 ? project.name.substring(0, 12) + '...' : project.name}
                    </div>
                  ))}
                  {projectsForDay.length > 3 && (
                    <div style={{
                      fontSize: 10,
                      color: BRAND.muted,
                      fontWeight: 600,
                      textAlign: 'center',
                      padding: '2px 0'
                    }}>
                      +{projectsForDay.length - 3} أكثر
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Projects */}
        {selectedDate && selectedProjects.length > 0 && (
          <div style={{
            marginTop: 20,
            padding: 16,
            background: BRAND.light,
            borderRadius: 12,
            border: `2px solid ${BRAND.accent}`
          }}>
            <h4 style={{
              fontSize: 16,
              fontWeight: 700,
              color: BRAND.primary,
              margin: '0 0 12px 0'
            }}>
              المشاريع في {selectedDate.toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedProjects.map((project, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    background: '#fff',
                    borderRadius: 8,
                    border: `1px solid ${getStatusColor(project.status)}40`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: BRAND.dark,
                      marginBottom: 4
                    }}>
                      {project.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: BRAND.muted
                    }}>
                      الميزانية: ${project.budget?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: `${getStatusColor(project.status)}20`,
                    color: getStatusColor(project.status),
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {project.status === 'pending' ? 'قيد الانتظار' :
                     project.status === 'in-progress' ? 'قيد التنفيذ' :
                     project.status === 'completed' ? 'مكتمل' :
                     project.status === 'cancelled' ? 'ملغي' : project.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



