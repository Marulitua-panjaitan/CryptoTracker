"use client";

import { useTop50Coins } from "@/hooks/use-crypto-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { Search, Rocket, Zap, Filter, LayoutGrid, ChevronLeft, ChevronRight, BarChart3, Hash, Flame, Coins } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import Link from "next/link";
import { useState, useEffect, useMemo, useRef, memo } from "react";
import LoadingScreen from "@/components/loading-screen";

const CoinRow = memo(({ coin, liveData, isMobile, isCompact }: any) => {
  const currentDisplayPrice = liveData ? liveData.price : coin.current_price;
  const priceFlashClass = liveData?.change === 'up' ? 'price-up' : liveData?.change === 'down' ? 'price-down' : '';
  const isPump = (coin.price_change_percentage_24h ?? 0) > 5;
  const isDump = (coin.price_change_percentage_24h ?? 0) < -5;
  const rowClass = isPump ? "row-pump" : isDump ? "row-dump" : "";

  // 🛠️ FUNGSI RINGKAS ANGKA (Contoh: 20,000,000 -> 20M)
  const formatSupply = (supply: number) => {
    if (!supply) return "0";
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(1)}M`;
    return supply.toLocaleString();
  };

  return (
    <TableRow className={rowClass} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: '0.3s' }}>
      <TableCell style={{ textAlign: 'center', color: '#475569', fontWeight: 'bold', fontSize: '10px', fontFamily: 'monospace' }}>
        {coin.market_cap_rank}
      </TableCell>
      <TableCell style={{ padding: isMobile ? '12px 12px' : '12px 20px' }}>
        <Link href={`/coin/${coin.id}`} prefetch={true} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src={coin.image} alt="" style={{ width: '26px', height: '26px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 'bold', color: 'white', fontSize: isMobile ? '12px' : '13px' }}>{coin.name}</span>
            <span style={{ fontSize: '9px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 800 }}>{coin.symbol}</span>
          </div>
        </Link>
      </TableCell>
      <TableCell className={priceFlashClass} style={{ textAlign: 'right', color: 'white', fontWeight: 'bold', fontFamily: 'monospace', fontSize: isMobile ? '11px' : '13px' }}>
        ${currentDisplayPrice.toLocaleString()}
      </TableCell>
      <TableCell style={{ textAlign: 'right', padding: isMobile ? '12px 12px' : '12px 20px' }}>
        <span style={{ color: (coin.price_change_percentage_24h ?? 0) > 0 ? '#10b981' : '#f43f5e', fontWeight: 'bold', fontSize: isMobile ? '10px' : '12px' }}>
          {(coin.price_change_percentage_24h ?? 0).toFixed(1)}%
        </span>
      </TableCell>
      {!isCompact && (
        <TableCell style={{ textAlign: 'right', color: '#cbd5e1', fontSize: '11px' }}>
          ${(coin.market_cap / 1e9).toFixed(2)}B
        </TableCell>
      )}
      
      {/* 🛠️ SUPPLY YANG SUDAH DIRINGKAS */}
      {!isCompact && (
        <TableCell style={{ textAlign: 'right', color: '#cbd5e1', fontSize: '11px', fontFamily: 'monospace' }}>
          {formatSupply(coin.circulating_supply)} <span style={{ color: '#3b82f6', fontSize: '9px' }}>{coin.symbol.toUpperCase()}</span>
        </TableCell>
      )}

      {!isCompact && (
        <TableCell style={{ paddingRight: '30px', width: '130px' }}>
          <div style={{ width: '100px', height: '30px', marginLeft: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={coin.sparkline_in_7d?.price.map((p: number) => ({ p }))}>
                <Line type="monotone" dataKey="p" stroke={(coin.price_change_percentage_24h ?? 0) > 0 ? '#10b981' : '#f43f5e'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
});

CoinRow.displayName = "CoinRow";

export default function MarketPage() {
  const { data: coins, isLoading } = useTop50Coins();
  const [windowWidth, setWindowWidth] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [livePrices, setLivePrices] = useState<{ [key: string]: { price: number; change: 'up' | 'down' | null } }>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => setInitialLoading(false), 2500);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!coins || coins.length === 0) return;
    const symbols = coins.slice(0, 30).map(c => `${c.symbol.toLowerCase()}usdt@ticker`).join('/');
    wsRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols}`);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s.replace('USDT', '').toLowerCase();
      const newPrice = parseFloat(data.c);
      setLivePrices(prev => {
        const oldPrice = prev[symbol]?.price || 0;
        return {
          ...prev,
          [symbol]: {
            price: newPrice,
            change: newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : (prev[symbol]?.change || null)
          }
        };
      });
    };
    return () => wsRef.current?.close();
  }, [coins]);

  const isCompact = windowWidth < 1024; 
  const isMobile = windowWidth < 768;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredCoins = useMemo(() => {
    if (!coins) return [];
    return coins.filter((coin) => {
      const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeCategory === "All") return matchesSearch;
      if (activeCategory === "Layer 1") return matchesSearch && ["btc", "eth", "sol", "ada", "dot", "avax"].includes(coin.symbol.toLowerCase());
      if (activeCategory === "Meme") return matchesSearch && ["doge", "shib", "pepe", "bonk"].includes(coin.symbol.toLowerCase());
      if (activeCategory === "DeFi") return matchesSearch && ["uni", "aave", "link", "mkr"].includes(coin.symbol.toLowerCase());
      if (activeCategory === "Micin") return matchesSearch && coin.current_price < 1;
      return matchesSearch;
    });
  }, [searchQuery, activeCategory, coins]);

  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCoins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCoins, currentPage]);

  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);

  if (isLoading || initialLoading) return <LoadingScreen />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px', alignItems: 'center', padding: '10px 1%' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; overflow-x: hidden; }
        .glow-search:focus-within { border-color: #3b82f6 !important; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
        .filter-chip { padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03); color: #64748b; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .filter-chip.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
        .nav-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 900; font-size: 11px; transition: 0.3s; }
        .price-up { color: #10b981 !important; }
        .price-down { color: #f43f5e !important; }
        @keyframes pump-glow { 0%, 100% { background: rgba(16, 185, 129, 0.02); } 50% { background: rgba(16, 185, 129, 0.08); } }
        @keyframes dump-glow { 0%, 100% { background: rgba(244, 63, 94, 0.02); } 50% { background: rgba(244, 63, 94, 0.08); } }
        .row-pump { animation: pump-glow 2s infinite ease-in-out; }
        .row-dump { animation: dump-glow 2s infinite ease-in-out; }
      `}} />

      <div style={{ width: '98%', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)', padding: isCompact ? '25px 15px' : '40px 30px' }}>
          <h1 style={{ fontSize: isCompact ? '28px' : '52px', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
            Galaksi <span style={{ color: '#3b82f6' }}>Crypto.</span>
          </h1>
          <div className="glow-search" style={{ marginTop: '20px', position: 'relative', maxWidth: '400px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input 
              type="text" placeholder="Cari koordinat aset..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 15px 10px 45px', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '13px', fontWeight: 700 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '2px' }}>
          {[{ id: "All", icon: <LayoutGrid size={12}/> }, { id: "Layer 1", icon: <Zap size={12}/> }, { id: "DeFi", icon: <Filter size={12}/> }, { id: "Meme", icon: <Rocket size={12}/> }, { id: "Micin", icon: <Flame size={12}/> }].map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}>
              {cat.icon} {cat.id}
            </button>
          ))}
        </div>

        <div style={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', width: '100%' }}>
          <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.01)' }}>
                <TableHead style={{ width: isMobile ? '40px' : '60px', textAlign: 'center', color: '#64748b', fontSize: '10px', fontWeight: 900 }}><Hash size={12} /></TableHead>
                <TableHead style={{ padding: isMobile ? '16px 12px' : '20px 20px', color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Rocket size={14} className="text-blue-500" /> ASET</div>
                </TableHead>
                <TableHead style={{ textAlign: 'right', padding: isMobile ? '16px 12px' : '20px 20px', color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}><Zap size={14} className="text-blue-500" /> HARGA</div>
                </TableHead>
                <TableHead style={{ textAlign: 'right', padding: isMobile ? '16px 12px' : '20px 20px', color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <BarChart3 size={14} className="text-blue-500" /> 24H%
                  </div>
                </TableHead>
                {!isCompact && <TableHead style={{ textAlign: 'right', color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>MARKET CAP</TableHead>}
                
                {!isCompact && (
                  <TableHead style={{ textAlign: 'right', color: '#cbd5e1', fontWeight: 700, fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <Coins size={14} className="text-blue-500" /> SUPPLY
                    </div>
                  </TableHead>
                )}

                {!isCompact && (
                  <TableHead style={{ textAlign: 'right', color: '#cbd5e1', fontWeight: 700, fontSize: '11px', paddingRight: '30px', width: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <BarChart3 size={14} className="text-blue-500" /> 7D TREND
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCoins.map((coin) => (
                <CoinRow 
                  key={coin.id} 
                  coin={coin} 
                  liveData={livePrices[coin.symbol.toLowerCase()]} 
                  isMobile={isMobile} 
                  isCompact={isCompact} 
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
            <button className="nav-btn" disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ChevronLeft size={14} /></button>
            <span style={{ color: 'white', fontSize: '10px', fontWeight: 900 }}>HALAMAN {currentPage} / {totalPages}</span>
            <button className="nav-btn" disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}