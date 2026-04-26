import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Button({
    className,
    variant = 'primary',
    isLoading = false,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    isLoading?: boolean;
}) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm border border-slate-200/50',
        outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
        danger: 'bg-red-600 !text-white font-black hover:bg-red-700 shadow-md shadow-red-200',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
    };

    return (
        <button
            className={cn(
                'px-5 py-2.5 rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer',
                variants[variant],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}

export function Input({
    className,
    label,
    error,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-bold text-slate-700 mr-1">{label}</label>}
            <input
                className={cn(
                    'px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 focus:bg-white transition-all shadow-sm placeholder:text-slate-400',
                    error && 'border-red-500 focus:ring-red-50 focus:border-red-500 bg-red-50/10',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-500 font-medium mr-1">{error}</span>}
        </div>
    );
}

export function Textarea({
    className,
    label,
    error,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && <label className="text-sm font-bold text-slate-700 mr-1">{label}</label>}
            <textarea
                className={cn(
                    'px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 focus:bg-white transition-all shadow-sm placeholder:text-slate-400 min-h-[100px]',
                    error && 'border-red-500 focus:ring-red-50 focus:border-red-500 bg-red-50/10',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-500 font-medium mr-1">{error}</span>}
        </div>
    );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("bg-white p-6 md:p-8 rounded-[2rem] shadow-premium border border-slate-100/50 hover:shadow-premium-hover transition-all duration-300", className)}>
            {children}
        </div>
    );
}

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse bg-slate-100 rounded-2xl", className)} />
    );
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    className,
    showClose = true
}: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    showClose?: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={onClose}
            />
            <Card className={cn("relative w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-300 border-none", className)}>
                {title && (
                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        {showClose && (
                            <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-8">
                    {children}
                </div>
            </Card>
        </div>
    );
}

export function Toast({
    message,
    type = 'success',
    onClose
}: {
    message: string;
    type?: 'success' | 'error';
    onClose?: () => void;
}) {
    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={cn(
                "px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md font-bold text-white",
                type === 'success' ? 'bg-slate-900/95 border-white/10' : 'bg-red-600/95 border-white/10'
            )}>
                <span className={cn("w-2 h-2 rounded-full", type === 'success' ? "bg-emerald-400 animate-pulse" : "bg-white")} />
                <span>{message}</span>
            </div>
        </div>
    );
}
