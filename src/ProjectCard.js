import React from 'react';

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
};

export default function ProjectCard({ project }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 20px rgba(30,58,95,0.08)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(30,58,95,0.05)',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(30,58,95,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,58,95,0.08)';
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={project.imageUrl}
          alt={project.name}
          style={{
            width: '100%',
            height: 220,
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
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
          {project.category}
        </div>
      </div>
      
      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: 12,
          color: BRAND.primary,
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1.4
        }}>
          {project.name}
        </h3>
        <p style={{
          margin: 0,
          color: '#64748b',
          flexGrow: 1,
          lineHeight: 1.7,
          fontSize: 15,
          marginBottom: 20
        }}>
          {project.description}
        </p>
        
        <div style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            color: BRAND.accent,
            fontWeight: 700,
            fontSize: 14,
            background: BRAND.light,
            padding: '6px 12px',
            borderRadius: 8
          }}>
            📁 {project.category}
          </span>
          <button
            style={{
              background: BRAND.gradient,
              color: 'white',
              border: 'none',
              padding: '10px 22px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 4px 15px rgba(42,157,143,0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,157,143,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(42,157,143,0.3)';
            }}
          >
            عرض التفاصيل →
          </button>
        </div>
      </div>
    </div>
  );
}