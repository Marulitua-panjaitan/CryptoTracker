"use client";

export default function LoadingScreen() {
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: '#020617', gap: '25px', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 🛠️ OPERASI SENYAP: Lenyapkan Header & Footer Layout Utama */
        header, footer, nav, aside { 
          display: none !important; 
        }
        
        /* Pastikan body tidak bisa di-scroll saat loading */
        body {
          overflow: hidden !important;
        }

        @keyframes rotate-coin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes pulse-moon {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .btc-logo {
          width: 80px; height: 80px;
          animation: rotate-coin 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          filter: drop-shadow(0 0 20px #f7931a66);
        }
        .moon-text {
          color: #3b82f6; font-weight: 900; font-size: 14px; letter-spacing: 0.4em;
          animation: pulse-moon 2s ease-in-out infinite;
          text-transform: uppercase;
        }
      `}} />
      <img 
        src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025" 
        className="btc-logo" 
        alt="BTC" 
      />
      <div className="moon-text">TO THE MOON . . .</div>
    </div>
  );
}