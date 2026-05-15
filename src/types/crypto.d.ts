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
  sparkline_in_7d?: {
    price: number[];
  };
}

export type Top50Response = CoinData[];