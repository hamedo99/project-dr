import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'نظام إدارة العيادة',
  description: 'نظام إدارة عيادة ذكي وسريع',
};

import { isLicenseValid } from '@/lib/licensing';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const valid = await isLicenseValid();

  if (!valid) {
    return (
      <html lang="ar" dir="rtl">
        <body className={`${cairo.variable} font-sans antialiased bg-slate-900 text-white`}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 border border-red-500/30 p-8 rounded-2xl shadow-2xl text-center">
              <div className="text-red-500 text-6xl mb-6">🚫</div>
              <h1 className="text-2xl font-bold mb-4">خطأ في الترخيص</h1>
              <p className="text-slate-300 leading-relaxed mb-6">
                عذراً، هذه النسخة غير مرخصة لهذا الجهاز.
                يرجى التواصل مع المطور للحصول على التفعيل.
              </p>
              <div className="text-xs text-slate-500 border-t border-slate-700 pt-4">
                Hardware ID Verification System
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

