import React, { useEffect } from "react";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
};

export default function SplashScreen({ logo, splashBg, onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2100);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: `url(${splashBg}) center/cover no-repeat`,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Overlay with gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(30,58,95,0.85) 0%, rgba(42,157,143,0.75) 50%, rgba(38,70,83,0.85) 100%)",
        zIndex: 0
      }} />
      
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        top: "-50%",
        right: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
        animation: "pulse 4s ease-in-out infinite",
        zIndex: 0
      }} />
      
      <div style={{
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative"
      }}>
        {/* Logo with enhanced styling */}
        <div style={{
          width: 140,
          height: 140,
          borderRadius: 24,
          background: "rgba(255,255,255,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          border: "4px solid rgba(255,255,255,0.5)",
          animation: "floatUp 2s ease-in-out infinite alternate",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: BRAND.gradient,
            opacity: 0.1,
            zIndex: 0
          }} />
          <img
            src={logo}
            alt="شعار الشركة"
            style={{
              width: "85%",
              height: "85%",
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
              borderRadius: 16
            }}
          />
        </div>
        
        {/* Title */}
        <h1 style={{
          color: "#fff",
          fontWeight: 900,
          fontSize: 36,
          letterSpacing: "-0.5px",
          marginBottom: 16,
          textShadow: "0 4px 20px rgba(0,0,0,0.4)",
          animation: "fadeInUp 1s ease-out"
        }}>
          إدارة المقاولات
        </h1>
        
        {/* Subtitle */}
        <p style={{
          color: "rgba(255,255,255,0.9)",
          fontSize: 16,
          fontWeight: 500,
          marginBottom: 32,
          textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          animation: "fadeInUp 1.2s ease-out"
        }}>
          حلول متكاملة للمقاولات والبناء
        </p>
        
        {/* Enhanced loader */}
        <div style={{
          width: 200,
          height: 6,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
          marginTop: 8
        }}>
          <div className="loader-bar" style={{
            height: "100%",
            borderRadius: 10,
            background: BRAND.gradient,
            boxShadow: "0 0 20px rgba(42,157,143,0.5)",
            animation: "moveBar 1.8s ease-in-out infinite"
          }} />
        </div>
      </div>
      
      <style>{`
        @keyframes floatUp {
          from {
            transform: translateY(0px) scale(1);
          }
          to {
            transform: translateY(-10px) scale(1.02);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        @keyframes moveBar {
          0% {
            width: 0%;
            margin-left: 0;
          }
          50% {
            width: 60%;
            margin-left: 10%;
          }
          100% {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}

