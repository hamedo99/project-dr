'use client';

import { useState } from 'react';
import { handleActivation } from '@/actions/licensing';

export default function ActivationForm() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('code', code);

        const result = await handleActivation(formData);

        if (result.success) {
            window.location.reload();
        } else {
            setError(result.error || 'حدث خطأ غير متوقع');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="أدخل كود التفعيل هنا..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest placeholder:text-slate-500 placeholder:tracking-normal"
                    disabled={loading}
                    required
                />
            </div>
            
            {error && (
                <div className="text-red-400 text-sm bg-red-400/10 py-2 px-4 rounded-lg border border-red-400/20">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
                {loading ? 'جاري التحقق...' : 'تفعيل النسخة الآن'}
            </button>
        </form>
    );
}
