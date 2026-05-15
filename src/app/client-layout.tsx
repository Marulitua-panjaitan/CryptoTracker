"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { DollarSign, Gem, RefreshCcw } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [exchangeRate, setExchangeRate] = useState<number>(17609);
  const [goldPriceAntam, setGoldPriceAntam] = useState<number>(2759600);
  const [isOnline, setIsOnline] = useState(true); // State deteksi koneksi
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Logika Pantau Koneksi Internet
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // 2. Logika WebSocket Harga Live
    const connectMarketWS = () => {
      wsRef.current = new WebSocket("wss://stream.binance.com:9443/ws/usdtidr@ticker");
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.c) {
          const liveRate = parseFloat(data.c);
          setExchangeRate(Math.round(liveRate));
          const baseAntamPrice = 2759600; 
          const baseRate = 17609; 
          const liveGold = baseAntamPrice * (liveRate / baseRate);
          setGoldPriceAntam(Math.round(liveGold));
        }
      };
      wsRef.current.onclose = () => setTimeout(connectMarketWS, 2000);
    };
    
    connectMarketWS();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      wsRef.current?.close();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes neon-blink { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 12px #3b82f6); } 50% { opacity: 0.5; } }
        @keyframes text-flash { 0%, 100% { color: #10b981; } 50% { color: #fff; } }
        @keyframes spin-sync { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rugpull-anim { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        .blinking-logo { animation: neon-blink 2s infinite ease-in-out; }
        .live-price-flash { animation: text-flash 2s infinite ease-in-out; }
        .icon-spin { animation: spin-sync 4s linear infinite; }
        .gold-glow { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }
        .rugpull-path { stroke-dasharray: 100; animation: rugpull-anim 1.5s ease-in-out forwards; }
        @media (max-width: 640px) {
          .header-inner { padding: 0 10px !important; gap: 5px !important; }
          .logo-text { font-size: 14px !important; }
          .stats-wrapper { gap: 8px !important; }
          .stat-value { font-size: 11px !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}} />

      {/* OVERLAY OFFLINE (MODE RUGPULL) */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.98)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '20px'
        }}>
          <div style={{ width: '300px', height: '150px', position: 'relative', marginBottom: '30px' }}>
            <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%' }}>
              <path 
                className="rugpull-path"
                d="M0 10 L20 15 L40 5 L60 25 L80 10 L100 45" 
                fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
              />
              <circle cx="100" cy="45" r="3" fill="#ef4444" className="blinking-logo" />
            </svg>
          </div>
          <h1 style={{ color: '#ef4444', fontWeight: '900', fontSize: '28px', marginBottom: '10px', letterSpacing: '2px' }}>
            RUGPULL DETECTED!
          </h1>
          <p style={{ color: '#f8fafc', fontSize: '16px', maxWidth: '400px', lineHeight: '1.5' }}>
            Koneksi internet terputus. <br/> Segera hubungkan kembali untuk memantau harga.
          </p>
          <div style={{ marginTop: '30px', padding: '10px 20px', borderRadius: '20px', border: '1px solid #3b82f6', color: '#3b82f6', fontSize: '12px' }}>
            MENUNGGU SINYAL...
          </div>
        </div>
      )}
      
      <header style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, width: '100%'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center' }}>
          <div className="header-inner" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>rC</span>
              </div>
              <span className="logo-text" style={{ fontSize: '17px', fontWeight: '900', color: 'white' }}>ruliCrypto</span>
            </Link>

            <div className="stats-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '9px', fontWeight: '900', color: '#fbbf24' }}><Gem size={10} /> ANTAM</span>
                <span className="gold-glow stat-value" style={{ fontSize: '12px', fontWeight: 'bold' }}>{goldPriceAntam.toLocaleString('id-ID')}</span>
              </div>
              <div className="stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '9px', fontWeight: '900', color: '#10b981' }}><RefreshCcw size={10} className="icon-spin" /> USD/IDR</span>
                <span className="live-price-flash stat-value" style={{ fontSize: '12px', fontWeight: 'bold' }}>{exchangeRate.toLocaleString('id-ID')}</span>
              </div>
              <div className="blinking-logo hide-on-mobile" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <DollarSign size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '60px', padding: '40px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#64748b' }}>&copy; 2026 ruliCrypto. Developed by Maruli Tua Panjaitan.</p>
      </footer>
    </>
  );
}