import React, { useState, useEffect, createContext, useContext } from 'react';

// Notification Context
const NotificationContext = createContext();

// Notification Provider
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    // دائماً 5 ثوانٍ (5000ms) ما لم يتم تحديد مدة أخرى صريحة
    const duration = notification.duration !== undefined ? notification.duration : 5000;
    const newNotification = {
      id,
      type: notification.type || 'info', // success, error, warning, info
      title: notification.title || '',
      message: notification.message || '',
      duration: duration,
      ...notification
    };
    
    // تأكد من أن duration هو 5000 دائماً إذا لم يتم تحديده
    if (newNotification.duration === undefined || newNotification.duration === null) {
      newNotification.duration = 5000;
    }
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after duration (دائماً بعد 5 ثوانٍ)
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const success = (title, message, duration) => {
    return addNotification({ type: 'success', title, message, duration: duration !== undefined ? duration : 5000 });
  };

  const error = (title, message, duration) => {
    return addNotification({ type: 'error', title, message, duration: duration !== undefined ? duration : 5000 });
  };

  const warning = (title, message, duration) => {
    return addNotification({ type: 'warning', title, message, duration: duration !== undefined ? duration : 5000 });
  };

  const info = (title, message, duration) => {
    return addNotification({ type: 'info', title, message, duration: duration !== undefined ? duration : 5000 });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Notification Container Component
function NotificationContainer({ notifications, onRemove }) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 400,
      pointerEvents: 'none'
    }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// Individual Notification Item
function NotificationItem({ notification, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
    
    // شريط التقدم - يبدأ من 100% وينخفض إلى 0% خلال duration
    const duration = notification.duration || 5000;
    const interval = 50; // تحديث كل 50ms
    const steps = duration / interval;
    const decrement = 100 / steps;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(progressInterval);
  }, [notification.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getStyles = () => {
    const baseStyle = {
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      paddingBottom: '19px', // مساحة إضافية للشريط
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      minWidth: 300,
      maxWidth: 400,
      pointerEvents: 'auto',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isVisible && !isLeaving ? 'translateX(0)' : 'translateX(-120%)',
      opacity: isVisible && !isLeaving ? 1 : 0,
      position: 'relative',
      overflow: 'hidden'
    };

    const typeStyles = {
      success: {
        borderLeft: '4px solid #10b981',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
      },
      error: {
        borderLeft: '4px solid #ef4444',
        background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      },
      warning: {
        borderLeft: '4px solid #f59e0b',
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
      },
      info: {
        borderLeft: '4px solid #3b82f6',
        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
      },
    };

    return { ...baseStyle, ...typeStyles[notification.type] };
  };

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[notification.type] || 'ℹ️';
  };

  return (
    <div
      style={getStyles()}
      onClick={handleClose}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(0) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.16)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
      }}
    >
      <div style={{
        fontSize: 24,
        flexShrink: 0,
        marginTop: 2
      }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {notification.title && (
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 4
          }}>
            {notification.title}
          </div>
        )}
        <div style={{
          fontSize: 13,
          color: '#64748b',
          lineHeight: 1.5,
          wordBreak: 'break-word'
        }}>
          {notification.message}
        </div>
        {/* شريط التقدم */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: notification.type === 'success' ? '#10b981' :
                       notification.type === 'error' ? '#ef4444' :
                       notification.type === 'warning' ? '#f59e0b' : '#3b82f6',
            transition: 'width 0.05s linear',
            borderRadius: '0 0 12px 12px'
          }} />
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          background: 'transparent',
          border: 0,
          fontSize: 18,
          color: '#94a3b8',
          cursor: 'pointer',
          padding: 0,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          flexShrink: 0,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
          e.currentTarget.style.color = '#64748b';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }}
      >
        ×
      </button>
    </div>
  );
}

