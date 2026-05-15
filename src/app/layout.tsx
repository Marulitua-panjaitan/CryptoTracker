import { Inter } from "next/font/google";
import "./globals.css"; 
import Providers from "./providers";
import ClientLayout from "./client-layout"; // Ini file baru yang akan kita buat

const inter = Inter({ subsets: ["latin"] });

// METADATA - Pakai icon Bitcoin warna biru
export const metadata = {
  title: "ruliCrypto",
  description: "Real-time Crypto & Gold Tracker by Maruli",
  icons: {
    icon: "https://cdn-icons-png.flaticon.com/512/5968/5968260.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={inter.className} style={{ 
        backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', margin: 0,
        WebkitFontSmoothing: 'antialiased', position: 'relative', overflowX: 'hidden'
      }}>
        <Providers>
          {/* Semua logika header dan live price pindah ke sini */}
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}