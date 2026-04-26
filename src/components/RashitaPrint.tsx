'use client';

import { Visit, Patient, Settings } from '@/types';

interface RashitaPrintProps {
    visit: Visit;
    patient: Patient;
    settings: Settings;
}

export function RashitaPrint({ visit, patient, settings }: RashitaPrintProps) {
    if (!visit) return null;

    return (
        <div className="hidden print:block fixed inset-0 z-[100] bg-white text-right p-8" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-primary pb-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                        {settings?.doctorName || 'دكتور'}
                    </h1>
                    <p className="text-xl text-slate-600 font-medium">
                        {settings?.specialization || 'أخصائي'}
                    </p>
                    <div className="text-sm text-slate-500 mt-2 space-y-1">
                        {settings?.clinicPhone && <p>الهاتف: {settings.clinicPhone}</p>}
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Logo */}
                    <div className="w-24 h-24 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs text-center p-2 font-bold bg-slate-50 overflow-hidden">
                        {settings?.logoPath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={settings.logoPath} alt="Clinic Logo" className="w-full h-full object-contain" />
                        ) : (
                            settings?.clinicName || 'شعار العيادة'
                        )}
                    </div>
                </div>
            </div>

            {/* Patient Info Bar Header */}
            <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-3 gap-4 mb-8 border border-slate-100">
                <div>
                    <span className="text-slate-400 text-xs block mb-1">اسم المريض</span>
                    <span className="font-bold">{patient.fullName}</span>
                </div>
                <div>
                    <span className="text-slate-400 text-xs block mb-1">رقم الهاتف</span>
                    <span className="font-bold">{patient.phone || 'غير مسجل'}</span>
                </div>
                <div>
                    <span className="text-slate-400 text-xs block mb-1">تاريخ الزيارة</span>
                    <span className="font-bold">{new Date(visit.visitDate).toLocaleDateString('ar-EG')}</span>
                </div>
            </div>

            {/* Medical Content */}
            <div className="space-y-10 min-h-[500px]">
                {/* Diagnosis SECTION */}
                <div className="relative">
                    <h2 className="text-lg font-bold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4 inline-block">التشخيص (Diagnosis):</h2>
                    <div className="text-lg leading-relaxed text-slate-800 whitespace-pre-wrap mr-4">
                        {visit.diagnosis}
                    </div>
                </div>

                {/* Treatment SECTION */}
                <div className="relative pt-6">
                    <h2 className="text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2 mb-6 inline-block">Rx:</h2>
                    <div className="text-xl leading-loose font-medium text-slate-900 whitespace-pre-wrap mr-6">
                        {visit.treatment}
                    </div>
                </div>

                {/* Notes */}
                {visit.notes && (
                    <div className="border-r-4 border-slate-200 pr-4 mt-10">
                        <h3 className="text-xs font-bold text-slate-400 mb-1">ملاحظات إضافية:</h3>
                        <p className="text-sm text-slate-500 whitespace-pre-wrap">{visit.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-10 border-t-2 border-slate-100 flex justify-between items-end">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 px-3 py-1 rounded text-xs font-bold text-slate-600">ساعات العمل</div>
                        <span className="text-sm text-slate-600">{settings?.workingHours || 'غير محدد'}</span>
                    </div>
                </div>
                <div className="text-center space-y-4">
                    <div className="h-10 border-b-2 border-slate-200 w-40 mx-auto"></div>
                    <p className="text-xs text-slate-400">توقيع وختم الطبيب</p>
                </div>
            </div>
        </div>
    );
}
