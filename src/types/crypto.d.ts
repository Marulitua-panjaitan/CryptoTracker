export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  // Tambahkan properti di bawah ini untuk memperbaiki error build:
  high_24h: number;          // Harga tertinggi dalam 24 jam
  low_24h: number;           // Harga terendah dalam 24 jam
  ath: number;               // All Time High (Harga tertinggi sepanjang masa)
  ath_date: string;          // Tanggal pencapaian harga tertinggi
  sparkline_in_7d?: {
    price: number[];
  };
}

export type Top50Response = CoinData[];