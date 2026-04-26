'use client';

import { useState } from 'react';
import { Button, Input, Modal } from './ui';
import { User, Phone, UserPlus } from 'lucide-react';
import { createPatient } from '@/actions/patient';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            setError('يرجى إدخال اسم المريض الرباعي');
            return;
        }

        const cleanPhone = phone.trim();
        if (cleanPhone && (!cleanPhone.startsWith('07') || cleanPhone.length !== 11)) {
            setError('رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 11 رقم');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await createPatient({ fullName: fullName.trim(), phone: phone.trim() });
            setFullName('');
            setPhone('');
            onSuccess();
        } catch (err) {
            setError('فشل في إضافة المريض. يرجى إعادة المحاولة.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="p-0">
            <div className="bg-gradient-to-r from-primary to-primary-light px-8 py-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl">
                        <UserPlus size={32} />
                    </div>
                    <div className="text-right">
                        <h3 className="text-2xl font-black">تسجيل مريض</h3>
                        <p className="text-white/80 font-medium text-sm">أدخل البيانات لفتح ملف طبي جديد.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in shake-in">
                        {error}
                    </div>
                )}

                <div className="space-y-6 text-right">
                    <div className="relative group">
                        <Input
                            label="اسم المريض الرباعي"
                            placeholder="اكتب اسم المريض هنا..."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pr-12 h-14"
                            disabled={loading}
                        />
                        <User size={20} className="absolute right-4 top-[46px] text-slate-300 group-focus-within:text-primary transition-colors" />
                    </div>

                    <div className="relative group">
                        <Input
                            type="tel"
                            maxLength={11}
                            label="رقم الهاتف"
                            placeholder="07XXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="pr-12 h-14"
                            disabled={loading}
                        />
                        <Phone size={20} className="absolute right-4 top-[46px] text-slate-300 group-focus-within:text-primary transition-colors" />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" isLoading={loading} className="flex-1 h-16 text-lg rounded-2.5xl shadow-xl shadow-primary/20">
                        حفظ البيانات
                    </Button>
                    <Button type="button" variant="secondary" onClick={onClose} className="h-16 px-8 rounded-2.5xl" disabled={loading}>
                        إلغاء
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
