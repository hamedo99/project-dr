'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { Calendar, Printer, Trash2, ChevronDown, Stethoscope, ClipboardList, ImageIcon, FileText, AlertTriangle } from 'lucide-react';
import { Button, Card, Modal, Toast } from './ui';
import { deleteVisit } from '@/actions/visit';
import { RashitaPrint } from './RashitaPrint';
import { Visit, Patient, Settings } from '@/types';
import { useRouter } from 'next/navigation';
import { cn } from './ui';

interface VisitTimelineProps {
    visits: Visit[];
    patient: Patient;
    settings: Settings;
}

export function VisitTimeline({ visits: initialVisits, patient, settings }: VisitTimelineProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [expandedId, setExpandedId] = useState<string | null>(initialVisits[0]?.id || null);
    const [printingVisit, setPrintingVisit] = useState<Visit | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [visitToDelete, setVisitToDelete] = useState<string | null>(null);
    const { toast, showToast } = useToast();
    const [localVisits, setLocalVisits] = useState(initialVisits);

    useEffect(() => {
        setLocalVisits(initialVisits);
    }, [initialVisits]);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handlePrint = useCallback((visit: Visit) => {
        setPrintingVisit(visit);
        setTimeout(() => {
            window.print();
            setPrintingVisit(null);
        }, 100);
    }, []);

    const handleDelete = async (id: string | null) => {
        if (!id) return;
        setIsDeletingId(id);

        startTransition(async () => {
            try {
                const success = await deleteVisit(id, patient.id);
                if (success) {
                    setLocalVisits(prev => prev.filter(v => v.id !== id));
                    showToast('تم حذف سجل الزيارة بنجاح');
                    setVisitToDelete(null);
                    router.refresh();
                } else {
                    showToast('فشل عملية الحذف - حاول مرة أخرى', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                showToast('حدث خطأ فني أثناء المعالجة', 'error');
            } finally {
                setIsDeletingId(null);
            }
        });
    };

    return (
        <div className="space-y-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!visitToDelete}
                onClose={() => !isDeletingId && setVisitToDelete(null)}
                className="max-w-md p-10 text-center"
            >
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mb-6 shadow-inner">
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">تأكيد حذف الزيارة</h3>
                <p className="text-slate-500 leading-relaxed mb-10 font-bold">
                    سيتم مسح كافة تفاصيل الزيارة، الراشيتة الملحقة، <span className="text-red-600 underline">وصور والتقارير</span> الخاصة بهذه الزيارة من الجهاز نهائياً.
                </p>
                <div className="flex gap-4">
                    <Button variant="danger" isLoading={!!isDeletingId} className="flex-1 h-12" onClick={() => handleDelete(visitToDelete)}>تأكيد الحذف</Button>
                    <Button variant="secondary" disabled={!!isDeletingId} className="flex-1 h-12" onClick={() => setVisitToDelete(null)}>إلغاء</Button>
                </div>
            </Modal>

            <RashitaPrint visit={printingVisit!} patient={patient} settings={settings} />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <ClipboardList className="text-primary" size={24} />
                    التاريخ المرضي
                </h3>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{localVisits.length} زيارات</div>
            </div>

            {localVisits.map((visit, index) => {
                const isExpanded = expandedId === visit.id;
                return (
                    <div key={visit.id} className="relative group no-print">
                        {index < localVisits.length - 1 && (
                            <div className="absolute top-[90px] bottom-[-32px] right-11 w-0.5 bg-slate-200/50 -z-10 group-hover:bg-primary/20 transition-colors" />
                        )}

                        <div className={cn(
                            "bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden",
                            isExpanded ? "shadow-2xl border-primary/20" : "shadow-premium hover:shadow-premium-hover border-slate-100/50"
                        )}>
                            <div className="p-6 md:p-8 cursor-pointer flex items-center justify-between" onClick={() => toggleExpand(visit.id)}>
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all",
                                        isExpanded ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-50 text-slate-400"
                                    )}>
                                        #{localVisits.length - index}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-3 mb-1.5 justify-end">
                                            <span className="font-black text-slate-900 text-lg">
                                                {new Date(visit.visitDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                            <Calendar size={18} className="text-slate-300" />
                                        </div>
                                        <div className="text-slate-400 text-sm font-bold flex items-center gap-2 justify-end">
                                            {visit.diagnosis.substring(0, 60)}
                                            <Stethoscope size={14} className="opacity-50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-12 h-12 p-0 rounded-2xl flex items-center justify-center bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:text-primary shadow-none"
                                        onClick={(e) => { e.stopPropagation(); handlePrint(visit); }}
                                    >
                                        <Printer size={20} />
                                    </Button>
                                    <div className={cn("transition-transform duration-500 text-slate-300", isExpanded && "rotate-180 text-primary")}>
                                        <ChevronDown size={24} />
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500">
                                    <div className="h-px bg-slate-50 mb-8" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-8 text-right">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[11px] font-black uppercase mb-3">التشخيص</div>
                                                <p className="text-slate-800 text-lg leading-relaxed font-bold pr-4 border-r-4 border-primary/20">{visit.diagnosis}</p>
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[11px] font-black uppercase mb-3">الخطة العلاجية</div>
                                                <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                                                    <p className="text-slate-900 text-xl font-black font-arabic">{visit.treatment}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {visit.imagePath && (
                                                <div className="rounded-[2rem] border-4 border-slate-50 overflow-hidden bg-slate-100 group relative shadow-inner">
                                                    <img
                                                        src={visit.imagePath}
                                                        alt="Medical Attachment"
                                                        className="w-full h-auto max-h-96 object-contain hover:scale-105 transition-transform duration-700 cursor-pointer"
                                                        onClick={() => window.open(visit.imagePath || undefined, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-6 border-t border-slate-50 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            className="text-red-400 hover:bg-red-50 hover:text-red-600 gap-2 font-black px-6"
                                            onClick={(e) => { e.stopPropagation(); setVisitToDelete(visit.id); }}
                                        >
                                            <Trash2 size={18} />
                                            حذف الزيارة
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {localVisits.length === 0 && (
                <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black">لا توجد سجلات طبية</p>
                </div>
            )}
        </div>
    );
}
