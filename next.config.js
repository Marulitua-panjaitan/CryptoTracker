/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Wajib: Memberitahu Next.js untuk menghasilkan file statis (folder 'out')
  output: 'export', 
  
  // 2. Wajib: GitHub Pages tidak mendukung optimasi gambar otomatis Next.js
  images: {
    unoptimized: true, 
  },

}

module.exports = nextConfig