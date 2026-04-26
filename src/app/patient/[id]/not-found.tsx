import Link from 'next/link';
import { Button } from '@/components/ui';
import { UserX, ArrowRight, Home } from 'lucide-react';

export default function PatientNotFound() {
    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-12 text-center border border-slate-100/50">
                <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner">
                    <UserX size={48} />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">ملف غير موجود</h1>
                <p className="text-slate-500 leading-relaxed mb-10 font-bold text-lg">
                    عذراً، يبدو أن سجل المريض الذي تحاول الوصول إليه تم حذفه نهائياً أو أن الرابط غير صحيح.
                </p>

                <div className="flex flex-col gap-4">
                    <Link href="/" className="w-full">
                        <Button className="w-full h-14 text-lg">
                            <Home size={20} />
                            العودة للوحة التحكم
                        </Button>
                    </Link>

                    <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full h-14">
                            الذهاب لسجل المرضى
                            <ArrowRight size={20} className="mr-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
