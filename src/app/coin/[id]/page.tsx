"use client";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useParams } from "next/navigation";
import { useTop50Coins } from "@/hooks/use-crypto-data";
import { ArrowLeft, TrendingUp, TrendingDown, History, Bell, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";

export default function CoinDetailPage() {
  const params = useParams();
  const { data: coins, isLoading } = useTop50Coins();
  const [timeRange, setTimeRange] = useState("all"); 
  const [liveTrades, setLiveTrades] = useState<any[]>([]); 
  
  // 🚀 STATE UNTUK LIVE PRICE SOCKET
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const wsPriceRef = useRef<WebSocket | null>(null);

  const coin = coins?.find((c) => c.id === params.id);

  // 📡 WebSocket Binance (Live Trades) - TETAP DIJAGA
  useEffect(() => {
    if (!coin?.symbol) return;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.symbol.toLowerCase()}usdt@trade`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setLiveTrades(prev => [{
        id: d.t,
        amount: parseFloat(d.q).toFixed(4),
        price: parseFloat(d.p).toLocaleString(),
        side: d.m ? 'SELL' : 'BUY'
      }, ...prev].slice(0, 5));
    };
    return () => ws.close();
  }, [coin?.symbol]);

  // 📡 WEBSOCKET UNTUK HARGA UTAMA (FITUR BARU)
  useEffect(() => {
    if (!coin?.symbol) return;
    const symbol = `${coin.symbol.toLowerCase()}usdt`;
    wsPriceRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`);

    wsPriceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.c);

      setLivePrice((prev) => {
        if (prev !== null) {
          if (newPrice > prev) setPriceChange('up');
          else if (newPrice < prev) setPriceChange('down');
        }
        return newPrice;
      });

      // Reset efek warna setelah 500ms
      setTimeout(() => setPriceChange(null), 500);
    };

    return () => wsPriceRef.current?.close();
  }, [coin?.symbol]);

  // 📈 Logika Data & Label Sumbu X yang Dinamis
  const chartData = useMemo(() => {
    if (!coin) return [];
    
    const config = {
      "24h": { points: 12, label: "jam" },
      "1w":  { points: 7,  label: "hari" },
      "1m":  { points: 15, label: "tgl" },
      "1y":  { points: 12, label: "bulan" },
      "all": { points: 10, label: "tahun" }
    }[timeRange] || { points: 10, label: "tahun" };

    const currentYear = 2026;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    return Array.from({ length: config.points }).map((_, i) => {
      let xLabel = "";
      if (timeRange === "all") xLabel = (currentYear - (config.points - 1) + i).toString();
      else if (timeRange === "1y") xLabel = months[i];
      else if (timeRange === "1m") xLabel = `${i * 2 + 1}/05`;
      else if (timeRange === "1w") xLabel = `Day ${i + 1}`;
      else xLabel = `${i * 2}:00`;

      return {
        date: xLabel,
        price: coin.current_price * (0.88 + Math.random() * 0.25) 
      };
    });
  }, [coin, timeRange]);

  if (isLoading) return <div style={{ color: '#3b82f6', textAlign: 'center', paddingTop: '100px', fontWeight: '900' }}>SINKRONISASI TRANSMISI...</div>;
  if (!coin) return <div style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>SINYAL TERPUTUS</div>;

  const isProfit = coin.price_change_percentage_24h > 0;
  const mainColor = isProfit ? "#10b981" : "#f43f5e";

  // Gunakan harga live jika tersedia, jika tidak gunakan harga awal
  const currentPriceDisplay = livePrice !== null ? livePrice : coin.current_price;

  return (
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; }
        .pulse-logo { animation: pulse-glow 3s infinite; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0px ${mainColor}; } 50% { box-shadow: 0 0 20px ${mainColor}44; } }
        
        .main-container { display: flex; flex-direction: column; gap: 25px; }
        .stats-trades-wrapper { display: flex; flex-direction: column; gap: 25px; }

        /* 🚀 CSS UNTUK EFEK HARGA BERKEDIP */
        .price-up-flash { color: #10b981 !important; transition: 0.3s; text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
        .price-down-flash { color: #f43f5e !important; transition: 0.3s; text-shadow: 0 0 10px rgba(244, 63, 94, 0.5); }

        @media (min-width: 1024px) {
          .main-container { display: grid; grid-template-columns: 1fr; gap: 30px; }
          .stats-trades-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        }
      `}} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '900', fontSize: '10px', letterSpacing: '0.2em' }}>
            <ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> KEMBALI
          </Link>
          <div style={{ display: 'flex', gap: '15px', color: '#64748b' }}><Globe size={18}/><Bell size={18}/></div>
        </div>

        <div className="glass-card" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src={coin.image} alt={coin.name} className="pulse-logo" style={{ width: '55px', borderRadius: '50%' }} />
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: 0 }}>{coin.name}</h1>
              <span style={{ color: mainColor, fontSize: '9px', fontWeight: '900', letterSpacing: '0.1em' }}>{isProfit ? 'STABLE ORBIT' : 'VOLATILE TRANSMISSION'}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {/* 🚀 HARGA UTAMA DENGAN LOGIKA SOCKET & FLASH */}
            <div className={priceChange === 'up' ? 'price-up-flash' : priceChange === 'down' ? 'price-down-flash' : ''} style={{ fontSize: '32px', fontWeight: '900', color: 'white', fontFamily: 'monospace', transition: '0.3s' }}>
              ${currentPriceDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
            <div style={{ color: mainColor, fontWeight: '900', fontSize: '16px' }}>{coin.price_change_percentage_24h.toFixed(2)}%</div>
          </div>
        </div>

        <div className="main-container">
          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <span style={{ color: 'white', fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em' }}>PRICE HISTORY</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {["24h", "1w", "1m", "1y", "all"].map(r => (
                  <button key={r} onClick={() => setTimeRange(r)} style={{ 
                    padding: '6px 12px', borderRadius: '8px', border: 'none', 
                    background: timeRange === r ? mainColor : 'rgba(255,255,255,0.05)', 
                    color: 'white', fontSize: '9px', fontWeight: '900', cursor: 'pointer', transition: '0.3s'
                  }}>{r.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={mainColor} stopOpacity={0.2}/><stop offset="95%" stopColor={mainColor} stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: mainColor, fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', fontSize: '10px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke={mainColor} strokeWidth={3} fill="url(#g)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stats-trades-wrapper">
            <div className="glass-card" style={{ padding: '30px' }}>
              <h3 style={{ color: 'white', fontSize: '12px', fontWeight: '900', marginBottom: '25px', letterSpacing: '0.1em' }}>GLOBAL STATISTICS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {[
                  { label: "MARKET CAP", val: `$${(coin.market_cap / 1e9).toFixed(2)}B` },
                  { label: "ALL TIME HIGH", val: `$${coin.ath?.toLocaleString()}`, color: '#3b82f6' },
                  { label: "24H HIGH", val: `$${coin.high_24h?.toLocaleString()}`, color: '#10b981' },
                  { label: "24H LOW", val: `$${coin.low_24h?.toLocaleString()}`, color: '#f43f5e' },
                  { label: "ATH YEAR", val: new Date(coin.ath_date).getFullYear() },
                  { label: "RANK", val: `#${coin.market_cap_rank}` }
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ color: '#475569', fontSize: '8px', fontWeight: '900' }}>{item.label}</div>
                    <div style={{ color: item.color || 'white', fontSize: '18px', fontWeight: '900', fontFamily: 'monospace' }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <History size={16} style={{ color: '#3b82f6' }} />
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '900' }}>LIVE BINANCE TRADES</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {liveTrades.map((t, i) => (
                  <div key={i} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '15px',
                    borderLeft: `4px solid ${t.side === 'BUY' ? '#10b981' : '#f43f5e'}`
                  }}>
                    <span style={{ color: t.side === 'BUY' ? '#10b981' : '#f43f5e', fontWeight: '900' }}>{t.side}</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{t.amount} {coin.symbol.toUpperCase()}</span>
                    <span style={{ color: '#475569' }}>${t.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}