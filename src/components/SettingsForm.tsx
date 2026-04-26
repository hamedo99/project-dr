'use client';

import { useState } from 'react';
import { Button, Input, Card, Toast, Textarea } from './ui';
import { useToast } from '@/hooks/useToast';
import { Save, Building, Stethoscope, Image as ImageIcon, BookOpen } from 'lucide-react';
import { updateSettings } from '@/actions/settings';
import { Settings } from '@/types';

interface SettingsFormProps {
    initialSettings: Settings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast, showToast } = useToast();
    const [formData, setFormData] = useState({
        clinicName: initialSettings?.clinicName || '',
        doctorName: initialSettings?.doctorName || '',
        specialization: initialSettings?.specialization || '',
        clinicPhone: initialSettings?.clinicPhone || '',
        workingHours: initialSettings?.workingHours || '',
        commonDiagnoses: initialSettings?.commonDiagnoses || '',
        commonTreatments: initialSettings?.commonTreatments || '',
    });
    const [logo, setLogo] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            if (logo) {
                data.append('logo', logo);
            }

            await updateSettings(data);
            showToast('تم حفظ الإعدادات بنجاح');
        } catch (err) {
            console.error('Settings error:', err);
            showToast('حدث خطأ أثناء حفظ الإعدادات', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Basic Info */}
            <Card className="border-r-4 border-r-primary">
                <h3 className="text-xl font-black mb-8 text-slate-900 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <Building size={24} />
                    </div>
                    المعلومات الأساسية للعيادة
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                    <Input
                        label="اسم العيادة الرسمي"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        placeholder="أدخل اسم العيادة..."
                        disabled={loading}
                    />
                    <Input
                        label="اسم الطبيب المسؤول"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        placeholder="د. ..."
                        disabled={loading}
                    />
                    <Input
                        label="التخصص الطبي"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="أخصائي ..."
                        disabled={loading}
                    />
                    <Input
                        label="رقم هاتف العيادة"
                        name="clinicPhone"
                        value={formData.clinicPhone || ''}
                        onChange={handleChange}
                        placeholder="07XXXXXXXX"
                        disabled={loading}
                    />
                    <div className="flex flex-col gap-2 w-full group">
                        <label className="text-sm font-bold text-slate-700 mr-1">شعار العيادة (اختياري)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                disabled={loading}
                            />
                            <div className="px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 text-slate-500 group-hover:border-primary/50 group-hover:bg-white transition-all shadow-sm">
                                <div className="bg-white p-1 rounded-lg">
                                    <ImageIcon size={20} className="text-primary" />
                                </div>
                                <span className="text-sm font-bold truncate">
                                    {logo ? logo.name : 'اختر صورة الشعار...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Rashita Settings */}
            <Card className="border-r-4 border-r-emerald-500">
                <h3 className="text-xl font-black mb-8 text-slate-900 flex items-center gap-3">
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                        <Stethoscope size={24} />
                    </div>
                    بيانات الراشيتة المطبوعة
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                    <Input
                        label="أوقات العمل"
                        name="workingHours"
                        value={formData.workingHours}
                        onChange={handleChange}
                        placeholder="9:00 ص - 5:00 م"
                        disabled={loading}
                    />
                </div>
            </Card>

            {/* Presets Management */}
            <Card className="border-r-4 border-r-amber-500">
                <h3 className="text-xl font-black mb-8 text-slate-900 flex items-center gap-3">
                    <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                        <BookOpen size={24} />
                    </div>
                    إدارة القوائم السريعة (المكتبة)
                </h3>

                <p className="text-sm text-slate-500 mb-6 font-bold -mt-4 mr-1">
                    أدخل كل خيار في سطر جديد ليظهر كزر سريع أثناء كتابة الزيارة.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                    <Textarea
                        label="قائمة التشخيصات الشائعة"
                        name="commonDiagnoses"
                        value={formData.commonDiagnoses}
                        onChange={handleChange}
                        placeholder="أدخل كل تشخيص في سطر..."
                        className="min-h-[200px]"
                        disabled={loading}
                    />
                    <Textarea
                        label="قائمة الأدوية/العلاجات الشائعة"
                        name="commonTreatments"
                        value={formData.commonTreatments}
                        onChange={handleChange}
                        placeholder="أدخل كل دواء في سطر..."
                        className="min-h-[200px]"
                        disabled={loading}
                    />
                </div>
            </Card>

            <div className="flex justify-end">
                <Button isLoading={loading} className="h-16 px-12 text-xl rounded-2.5xl shadow-xl shadow-primary/20">
                    <Save size={24} />
                    حفظ كافة الإعدادات
                </Button>
            </div>
        </form>
    );
}
