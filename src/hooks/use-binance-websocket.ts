import { useState, useEffect } from 'react';

export function useBinanceTrades(symbol: string) {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    if (!symbol) return;

    // Binance pakai huruf kecil, contoh: btcusdt
    const binanceSymbol = `${symbol.toLowerCase()}usdt`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newTrade = {
        id: data.t,
        price: parseFloat(data.p).toLocaleString(),
        amount: parseFloat(data.q).toFixed(4),
        time: new Date(data.T).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        side: data.m ? 'SELL' : 'BUY', // m true berarti market maker (Sell)
      };

      setTrades((prev) => [newTrade, ...prev].slice(0, 5)); // Simpan 5 transaksi terakhir
    };

    return () => ws.close();
  }, [symbol]);

  return trades;
}