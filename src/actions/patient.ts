'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Patient } from '@/types';

export async function createPatient(data: { fullName: string; phone?: string }): Promise<Patient> {
    if (data.phone) {
        const cleanPhone = data.phone.trim();
        if (!cleanPhone.startsWith('07') || cleanPhone.length !== 11) {
            throw new Error('رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 11 رقم');
        }
    }

    const patient = await prisma.patient.create({
        data: {
            fullName: data.fullName,
            phone: data.phone?.trim(),
        },
    });
    revalidatePath('/');
    return patient as Patient;
}

export async function getPatients(query?: string): Promise<Patient[]> {
    const patients = await prisma.patient.findMany({
        where: query
            ? {
                OR: [
                    { fullName: { contains: query } },
                    { phone: { contains: query } },
                ],
            }
            : undefined,
        orderBy: { createdAt: 'desc' },
    });
    return patients as Patient[];
}

export async function getPatientById(id: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            visits: {
                orderBy: { visitDate: 'desc' },
            },
        },
    });
    return patient as Patient | null;
}

export async function updatePatient(id: string, data: { fullName: string; phone?: string }): Promise<Patient> {
    if (data.phone) {
        const cleanPhone = data.phone.trim();
        if (!cleanPhone.startsWith('07') || cleanPhone.length !== 11) {
            throw new Error('رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من 11 رقم');
        }
    }

    const patient = await prisma.patient.update({
        where: { id },
        data: {
            fullName: data.fullName,
            phone: data.phone?.trim(),
        },
    });
    revalidatePath('/');
    revalidatePath(`/patient/${id}`);
    return patient as Patient;
}

import fs from 'fs/promises';
import path from 'path';

export async function deletePatient(id: string): Promise<void> {
    try {
        // 1. Find all visits to get image paths before deleting the patient
        const patientWithVisits = await prisma.patient.findUnique({
            where: { id },
            include: { visits: { select: { imagePath: true } } }
        });

        if (patientWithVisits && patientWithVisits.visits.length > 0) {
            // 2. Loop through visits and delete physical files
            for (const visit of patientWithVisits.visits) {
                if (visit.imagePath) {
                    try {
                        const absolutePath = path.join(process.cwd(), 'public', visit.imagePath);
                        await fs.unlink(absolutePath);
                        console.log(`Deleted file: ${absolutePath}`);
                    } catch (fileError) {
                        // Log error but continue with DB deletion
                        console.error(`Failed to delete file: ${visit.imagePath}`, fileError);
                    }
                }
            }
        }

        // 3. Delete the patient from DB (Cascading delete will handle visit records)
        await prisma.patient.delete({
            where: { id },
        });

        revalidatePath('/');
    } catch (error) {
        console.error('CRITICAL: Failed to delete patient:', error);
        throw new Error('فشل حذف ملف المريض والبيانات المرتبطة به');
    }
}

export async function getDashboardStats() {
    // Get the current time in the local system (Baghdad time if set correctly on the PC)
    const now = new Date();

    // Start of the current day: 12:00:00.000 AM
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // End of the current day: 11:59:59.999 PM
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [totalPatients, todayVisitsCount, visitorsFromVisits, todayNewPatients] = await Promise.all([
        prisma.patient.count(), // "الإجمالي العام" keeps counting and never resets
        prisma.visit.count({
            where: {
                visitDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        }),
        prisma.visit.findMany({
            where: {
                visitDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                patientId: true,
            },
            distinct: ['patientId'],
        }),
        prisma.patient.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                id: true,
            },
        }),
    ]);

    // Unique visitors are those who registered today OR visited today
    const uniqueVisitorIds = new Set([
        ...visitorsFromVisits.map((v) => v.patientId),
        ...todayNewPatients.map((p) => p.id),
    ]);

    return {
        totalPatients,
        todayVisitors: uniqueVisitorIds.size,
        totalProcedures: todayVisitsCount,
    };
}
