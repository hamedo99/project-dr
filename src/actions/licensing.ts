'use server';

import { activateHardware } from '@/lib/licensing';
import { revalidatePath } from 'next/cache';

export async function handleActivation(formData: FormData) {
    const code = formData.get('code') as string;
    
    if (!code) {
        return { error: "يرجى إدخال كود التفعيل" };
    }

    const result = await activateHardware(code);
    
    if (result.success) {
        revalidatePath('/');
        return { success: true };
    } else {
        return { error: result.message };
    }
}
