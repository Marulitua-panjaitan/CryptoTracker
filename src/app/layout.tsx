"use client";

import { Inter } from "next/font/google";
import "./globals.css"; 
import Providers from "./providers";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { DollarSign, Gem, RefreshCcw } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [exchangeRate, setExchangeRate] = useState<number>(17609);
  const [goldPriceAntam, setGoldPriceAntam] = useState<number>(2759600);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
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
    return () => wsRef.current?.close();
  }, []);

  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.className}`} style={{ 
        backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', margin: 0,
        WebkitFontSmoothing: 'antialiased', position: 'relative', overflowX: 'hidden'
      }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes neon-blink {
            0%, 100% { opacity: 1; filter: drop-shadow(0 0 12px #3b82f6); transform: scale(1); }
            50% { opacity: 0.5; filter: drop-shadow(0 0 2px #3b82f6); transform: scale(0.95); }
          }
          @keyframes text-flash {
            0%, 100% { color: #10b981; text-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
            50% { color: #fff; text-shadow: none; }
          }
          @keyframes spin-sync {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .blinking-logo { animation: neon-blink 2s infinite ease-in-out; }
          .live-price-flash { animation: text-flash 2s infinite ease-in-out; }
          .icon-spin { animation: spin-sync 4s linear infinite; }
          .gold-glow { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }

          /* OPTIMASI TETAP SAMPINGAN (ROW) DI MOBILE */
          @media (max-width: 640px) {
            .header-inner { padding: 0 10px !important; gap: 5px !important; }
            .logo-text { font-size: 14px !important; }
            .logo-box { width: 28px !important; height: 28px !important; }
            .logo-box span { font-size: 14px !important; }
            .stats-wrapper { gap: 8px !important; }
            .stat-item { padding-right: 8px !important; }
            .stat-label { font-size: 8px !important; }
            .stat-value { font-size: 11px !important; }
            .hide-on-mobile { display: none !important; }
          }
        `}} />
        
        <div className="starfield-container">
          <div className="stars-slow"></div>
          <div className="stars-medium"></div>
          <div className="stars-fast"></div>
        </div>

        <Providers>
          <header style={{ 
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, width: '100%'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center' }}>
              <div className="header-inner" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                
                {/* LOGO SECTION */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <div className="logo-box" style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
                  }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>C</span>
                  </div>
                  <span className="logo-text" style={{ fontSize: '17px', fontWeight: '900', color: 'white' }}>CryptoTracker<span style={{ color: '#3b82f6' }}>.</span></span>
                </Link>

                {/* STATS SECTION (TETAP ROW) */}
                <div className="stats-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  
                  {/* ANTAM */}
                  <div className="stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="stat-label" style={{ fontSize: '9px', fontWeight: '900', color: '#fbbf24', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Gem size={10} /> ANTAM
                    </span>
                    <span className="gold-glow stat-value" style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {goldPriceAntam.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* USD/IDR */}
                  <div className="stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="stat-label" style={{ fontSize: '9px', fontWeight: '900', color: '#10b981', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <RefreshCcw size={10} className="icon-spin" /> USD/IDR
                    </span>
                    <span className="live-price-flash stat-value" style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {exchangeRate.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  {/* DOLAR LOGO (Dihapus di Mobile agar tidak sumpek) */}
                  <div className="blinking-logo hide-on-mobile" style={{ 
                    width: '34px', height: '34px', borderRadius: '50%', 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1.5px solid #3b82f6', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' 
                  }}>
                    <DollarSign size={18} strokeWidth={3} />
                  </div>
                </div>

              </div>
            </div>
          </header>
          
          <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
            {children}
          </main>

          <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '60px', padding: '40px 0', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: 'linear-gradient(to right, #3b82f6, #1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '14px', fontWeight: '900' }}>
                CryptoTracker
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>&copy; 2026 Developed by Maruli Tua Panjaitan.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}