'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Settings } from '@/types';

export async function getSettings(): Promise<Settings> {
    try {
        let settings = await prisma.settings.findUnique({
            where: { id: 'default' },
        });

        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'default',
                    clinicName: 'عيادة الدكتور حيدر',
                    doctorName: 'دكتور حيدر',
                    specialization: 'أخصائي الجراحة العامة والباطنية',
                    workingHours: '2:00 مساءً - 9:00 مساءً',
                },
            });
        }
        return settings as Settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {
            id: 'default',
            clinicName: 'عيادة الدكتور حيدر',
            doctorName: 'دكتور حيدر',
            specialization: 'أخصائي الجراحة العامة والباطنية',
            workingHours: '2:00 مساءً - 9:00 مساءً',
            appointmentGap: 20,
            licenseNumber: null,
            clinicPhone: null,
            logoPath: null,
            directorateLogo: null,
            commonDiagnoses: 'مراجعة دورية\nالتهاب القولون\nنزلة برد\nآلام مفاصل',
            commonTreatments: 'بندول 500 ملغ (عند الحاجة)\nراحة تامة مع سوائل دافئة',
        } as Settings;
    }
}

export async function updateSettings(formData: FormData): Promise<Settings> {
    const data: Partial<Settings> = {
        clinicName: formData.get('clinicName') as string,
        doctorName: formData.get('doctorName') as string,
        specialization: formData.get('specialization') as string,
        clinicPhone: formData.get('clinicPhone') as string,
        workingHours: formData.get('workingHours') as string,
        commonDiagnoses: formData.get('commonDiagnoses') as string,
        commonTreatments: formData.get('commonTreatments') as string,
    };

    const logoFile = formData.get('logo') as File | null;

    if (logoFile && logoFile.size > 0) {
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const filename = `logo_${Date.now()}_${logoFile.name.replace(/\s+/g, '_')}`;
        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        data.logoPath = `/uploads/${filename}`;
    }

    const settings = await prisma.settings.upsert({
        where: { id: 'default' },
        update: data as any, // Cast to any because Prisma types can be tricky with Partial
        create: {
            ...(data as any),
            id: 'default',
        },
    });

    revalidatePath('/settings');
    revalidatePath('/');
    return settings as Settings;
}
