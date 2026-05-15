import { useQuery } from '@tanstack/react-query';
import { cryptoApi } from '@/lib/api-client';
import { CoinData } from '@/types/crypto';

export const useTop50Coins = () => {
  return useQuery<CoinData[]>({
    queryKey: ['topCoins'],
    // Kita panggil fungsi yang sudah ada (getTop50), 
    // tapi nanti kita atur di api-client agar menarik 100 koin
    queryFn: cryptoApi.getTop50, 
    staleTime: 1000 * 30, 
    refetchOnWindowFocus: true,
  });
};

export const useCoinDetail = (id: string) => {
  return useQuery({
    queryKey: ['coinDetail', id],
    queryFn: () => cryptoApi.getCoinDetail(id),
    enabled: !!id,
  });
};