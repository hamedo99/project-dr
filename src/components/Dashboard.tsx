'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { Button, Input, Card, Modal, Toast } from './ui';
import { useToast } from '@/hooks/useToast';
import { Search, Plus, User, Phone, Calendar, Download, Activity, Edit3, Trash2, AlertTriangle, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import { getPatients, updatePatient, deletePatient, getDashboardStats } from '@/actions/patient';
import AddPatientModal from './AddPatientModal';
import { Patient } from '@/types';

export function Dashboard() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [stats, setStats] = useState({ totalPatients: 0, todayVisitors: 0, totalProcedures: 0 });
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast, showToast } = useToast();

    // Edit State
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Delete State
    const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

    const fetchPatients = useCallback(async (query?: string) => {
        setLoading(true);
        try {
            const [data, dashboardStats] = await Promise.all([
                getPatients(query),
                getDashboardStats()
            ]);
            setPatients(data);
            setStats(dashboardStats);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            showToast('فشل في جلب البيانات', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPatients(search);
    };

    const handleBackup = () => {
        window.location.href = '/api/backup';
    };

    const handleEditSave = async () => {
        if (!editingPatient || !editName.trim()) return;

        const cleanPhone = editPhone.trim();
        if (cleanPhone && (!cleanPhone.startsWith('07') || cleanPhone.length !== 11)) {
            showToast('رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 11 رقم', 'error');
            return;
        }

        startTransition(async () => {
            try {
                await updatePatient(editingPatient.id, {
                    fullName: editName.trim(),
                    phone: editPhone.trim(),
                });
                showToast('تم تحديث بيانات المريض بنجاح');
                setEditingPatient(null);
                fetchPatients(search);
            } catch (error) {
                console.error('Failed to update patient:', error);
                showToast('حدث خطأ أثناء التحديث', 'error');
            }
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deletingPatient) return;

        startTransition(async () => {
            try {
                await deletePatient(deletingPatient.id);
                showToast('تم حذف المريض وجميع زياراته بنجاح');
                setDeletingPatient(null);
                fetchPatients(search);
            } catch (error) {
                console.error('Failed to delete patient:', error);
                showToast('حدث خطأ أثناء الحذف', 'error');
            }
        });
    };

    return (
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative min-h-screen">
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingPatient}
                onClose={() => !isPending && setEditingPatient(null)}
                title="تعديل بيانات المريض"
            >
                <div className="space-y-5 text-right font-bold">
                    <Input label="اسم المريض" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Input label="رقم الجوال" type="tel" maxLength={11} value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))} />
                </div>
                <div className="flex gap-4 mt-10">
                    <Button isLoading={isPending} className="flex-1 h-12" onClick={handleEditSave}>حفظ التغييرات</Button>
                    <Button variant="secondary" disabled={isPending} className="flex-1 h-12" onClick={() => setEditingPatient(null)}>إلغاء</Button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={!!deletingPatient}
                onClose={() => !isPending && setDeletingPatient(null)}
                className="max-w-md p-10 text-center"
            >
                <div className="mx-auto w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-600 mb-8 shadow-inner animate-pulse">
                    <AlertTriangle size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">حذف نهائي وشامل</h3>
                <p className="text-slate-500 leading-relaxed mb-10 font-bold text-lg">
                    انتبه! سيتم حذف ملف <span className="text-red-600 underline">"{deletingPatient?.fullName}"</span> وكل ما يتعلق به من:
                    <br />
                    <span className="text-slate-900 block mt-3">• جميع سجلات الزيارات المرضية</span>
                    <span className="text-slate-900 block">• كافة الصور والتقارير الطبية المرفقة</span>
                    <br />
                    هذا الإجراء <span className="text-red-700 underline">غير قابل للتراجع</span> وسيتم مسح البيانات والملفات من الجهاز نهائياً.
                </p>
                <div className="flex flex-col gap-4">
                    <Button variant="danger" isLoading={isPending} className="w-full h-14 text-lg" onClick={handleDeleteConfirm}>نعم، أحذف كل شيء نهائياً</Button>
                    <Button variant="secondary" disabled={isPending} className="w-full h-14" onClick={() => setDeletingPatient(null)}>تراجع عن الحذف</Button>
                </div>
            </Modal>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full font-bold text-xs mb-3 border border-teal-100">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                        النظام جاهز للعمل
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 leading-tight">سجل المرضى</h1>
                    <p className="text-slate-500 font-medium font-arabic">إدارة ملفات المرضى، الزيارات، والراشيتات الطبية.</p>
                </div>

                <div className="flex gap-4">
                    <Button onClick={handleBackup} variant="outline" className="h-12 px-6">
                        <Download size={20} />
                        تصدير البيانات
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 group">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        إضافة مريض جديد
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-right">
                <Card className="flex items-center justify-between border-l-4 border-l-teal-500 bg-gradient-to-br from-white to-teal-50/10">
                    <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">إجمالي المسجلين</p>
                        <h3 className="text-4xl font-black text-slate-900">{stats.totalPatients}</h3>
                    </div>
                    <div className="bg-teal-500/10 p-4 rounded-[1.5rem] text-teal-600">
                        <Users size={28} />
                    </div>
                </Card>
                <Card className="flex items-center justify-between border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/10">
                    <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">زوار اليوم</p>
                        <h3 className="text-4xl font-black text-slate-900">{stats.todayVisitors}</h3>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-[1.5rem] text-emerald-600">
                        <User size={28} />
                    </div>
                </Card>
                <Card className="flex items-center justify-between border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/10">
                    <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">إجمالي الإجراءات</p>
                        <h3 className="text-4xl font-black text-slate-900">{stats.totalProcedures}</h3>
                    </div>
                    <div className="bg-amber-500/10 p-4 rounded-[1.5rem] text-amber-600">
                        <Activity size={28} />
                    </div>
                </Card>
                <Card className="flex items-center justify-between border-l-4 border-l-slate-800">
                    <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">النظام</p>
                        <h3 className="text-4xl font-black text-slate-900">نشط</h3>
                    </div>
                    <div className="bg-slate-900/5 p-4 rounded-[1.5rem] text-slate-900">
                        <Activity size={28} />
                    </div>
                </Card>
            </div>

            {/* Modern Search */}
            <form onSubmit={handleSearch} className="mb-10 group max-w-2xl">
                <div className="relative">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن مريض بالاسم أو الهاتف..."
                        className="pr-14 h-16 text-xl rounded-3xl shadow-lg border-slate-100 placeholder:text-slate-300"
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300" size={24} />
                </div>
            </form>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100/50 overflow-hidden mb-20">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100/80">
                                <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[11px] tracking-[0.2em]">الاسم</th>
                                <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[11px] tracking-[0.2em]">رقم التواصل</th>
                                <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[11px] tracking-[0.2em]">التسجيل</th>
                                <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[11px] tracking-[0.2em] text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400">جاري التحميل...</td></tr>
                            ) : patients.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-slate-400">لا توجد بيانات</td></tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="font-extrabold text-slate-900">{patient.fullName}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-sm font-bold">
                                                <Phone size={14} className="text-slate-400" />
                                                {patient.phone || '—'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-medium text-sm">
                                            {new Date(patient.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3 transition-opacity">
                                                <Link href={`/patient/${patient.id}`}>
                                                    <Button variant="outline" className="text-[12px] font-bold px-4 py-2 rounded-xl h-auto">
                                                        الملف
                                                        <ExternalLink size={14} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl hover:bg-white border border-transparent hover:border-slate-200"
                                                    onClick={() => {
                                                        setEditingPatient(patient);
                                                        setEditName(patient.fullName);
                                                        setEditPhone(patient.phone || '');
                                                    }}
                                                >
                                                    <Edit3 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100"
                                                    onClick={() => setDeletingPatient(patient)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchPatients();
                    showToast('تم إضافة المريض بنجاح');
                }}
            />
        </div>
    );
}
