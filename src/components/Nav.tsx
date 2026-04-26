'use client';

import Link from 'next/link';
import { ChevronRight, Home, Settings, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from './ui';

export function Nav({ pageTitle }: { pageTitle?: string }) {
    const pathname = usePathname();

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100/50 px-6 py-4 sticky top-0 z-40 no-print flex justify-center">
            <div className="max-w-7xl w-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className={cn(
                            "p-2.5 rounded-2xl transition-all duration-300",
                            pathname === '/'
                                ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        )}
                        title="الرئيسية"
                    >
                        <LayoutDashboard size={22} />
                    </Link>

                    {pageTitle && (
                        <div className="flex items-center gap-3">
                            <ChevronRight size={18} className="text-slate-300 rotate-180" />
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{pageTitle}</h2>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 group",
                            pathname === '/settings'
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                                : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                        )}
                    >
                        <span className="hidden md:inline">الإعدادات</span>
                        <Settings
                            size={20}
                            className={cn(
                                "transition-transform duration-500",
                                pathname !== '/settings' && "group-hover:rotate-90"
                            )}
                        />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
