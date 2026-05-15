import axios from 'axios';

// Kita menggunakan CoinGecko sebagai sumber data (Free Tier)
const BASE_URL = 'https://api.coingecko.com/api/v3';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cryptoApi = {
  // 🚀 UPDATE: Mengambil 100 koin agar bisa dibagi menjadi 2 halaman (50 koin per halaman)
  getTop50: async () => {
    const response = await apiClient.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100, // DIUBAH DARI 50 MENJADI 100
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      },
    });
    return response.data;
  },

  // Mengambil detail spesifik untuk satu koin
  getCoinDetail: async (id: string) => {
    const response = await apiClient.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true,
      },
    });
    return response.data;
  },
};