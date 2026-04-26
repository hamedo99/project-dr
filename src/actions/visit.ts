'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Visit } from '@/types';

export interface CreateVisitData {
    patientId: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    imagePath?: string;
}

export async function createVisit(data: CreateVisitData): Promise<Visit> {
    const visit = await prisma.visit.create({
        data: {
            patientId: data.patientId,
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            notes: data.notes,
            imagePath: data.imagePath,
        },
    });
    revalidatePath(`/patient/${data.patientId}`);
    return visit as Visit;
}

import fs from 'fs/promises';
import path from 'path';

export async function deleteVisit(id: string, patientId: string): Promise<boolean> {
    try {
        // 1. Find the visit to get the image path
        const visit = await prisma.visit.findUnique({
            where: { id },
        });

        if (!visit) {
            console.error('Visit not found for deletion:', id);
            return false;
        }

        // 2. Delete physical file if it exists
        if (visit.imagePath) {
            try {
                const absolutePath = path.join(process.cwd(), 'public', visit.imagePath);
                await fs.unlink(absolutePath);
            } catch (fileError) {
                console.error(`Failed to delete individual visit file: ${visit.imagePath}`, fileError);
            }
        }

        // 3. Delete from DB
        await prisma.visit.delete({
            where: { id },
        });

        revalidatePath(`/patient/${patientId}`);
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error('CRITICAL: Delete visit error:', error);
        return false;
    }
}
