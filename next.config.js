/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hapus output: 'export' karena Vercel akan menangani build secara otomatis
  // Hapus basePath karena Vercel menggunakan root domain
  images: {
    unoptimized: true,
  },
};

export default nextConfig;