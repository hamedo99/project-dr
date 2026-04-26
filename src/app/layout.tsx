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
import ActivationForm from '@/components/ActivationForm';

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
          <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-white/5 shadow-inner">
                  🔑
                </div>
                
                <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  تفعيل النظام
                </h1>
                
                <p className="text-slate-400 leading-relaxed mb-8 text-sm">
                  هذا الجهاز غير مسجل في النظام حالياً. يرجى إدخال كود التفعيل الخاص بك لفتح النسخة.
                </p>

                <ActivationForm />

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                    Hardware ID Verification System
                  </span>
                  <p className="text-[10px] text-slate-600">
                    تواصل مع المطور للحصول على كود التفعيل الخاص بك
                  </p>
                </div>
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

