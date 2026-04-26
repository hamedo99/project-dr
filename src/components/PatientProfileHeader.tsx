'use client';

import { User, Phone, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Patient } from '@/types';
import Link from 'next/link';
import { Button } from './ui';

interface PatientProfileHeaderProps {
    patient: Patient;
}

export function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100/50 overflow-hidden mb-10">
            {/* Premium Gradient Banner */}
            <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-400 h-32 md:h-40 relative">
                <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:16px_16px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="px-8 pb-10">
                <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 md:-mt-20 relative z-10">
                    {/* Avatar with offset shadow */}
                    <div className="bg-white p-3 rounded-[2rem] shadow-2xl">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] flex items-center justify-center text-primary border border-slate-100">
                            <User size={56} className="opacity-80" />
                        </div>
                    </div>

                    <div className="flex-1 pb-2 text-right pt-14 md:pt-24">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{patient.fullName}</h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 justify-end md:justify-start flex-row-reverse mt-2">
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50">
                                <span className="font-bold text-sm tracking-wide">{patient.phone || 'غير مسجل'}</span>
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <Phone size={16} className="text-teal-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50">
                                <span className="font-bold text-sm tracking-wide">
                                    {new Date(patient.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <Calendar size={16} className="text-teal-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50">
                                <span className="font-bold text-sm tracking-wide">الزيارات: {patient.visits?.length || 0}</span>
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <Clock size={16} className="text-teal-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
