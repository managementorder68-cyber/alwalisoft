'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
          <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-md">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">الصفحة غير موجودة</h2>
            <p className="text-gray-300 mb-6">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>
            <Link
              href="/mini-app"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              <Home className="w-5 h-5" />
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
