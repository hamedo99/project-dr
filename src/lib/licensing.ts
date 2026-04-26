import { machineIdSync } from 'node-machine-id';
import si from 'systeminformation';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * دالة لاستخراج بصمة الجهاز (Hardware Fingerprint) فريدة
 * تجمع بين Machine ID والـ Motherboard Serial لضمان الأمان.
 */
const SALT = process.env.LICENSE_SALT || "DR_HAHIDER_SECURE_SALT_2024";
const LICENSE_PATH = path.join(process.cwd(), '.lic');

export async function getFingerprint(): Promise<string> {
    try {
        const mid = machineIdSync();
        const baseboard = await si.baseboard();
        const system = await si.uuid();

        // نجمع المعرفات لعمل بصمة قوية
        const rawString = `${mid}-${baseboard.serial}-${system.os}`;

        return crypto
            .createHmac('sha256', SALT)
            .update(rawString)
            .digest('hex');
    } catch (error) {
        console.error("❌ فشل استخراج بصمة الجهاز:", error);
        return "UNKNOWN_DEVICE";
    }
}

let isLicenseValidCached: boolean | null = null;

export async function isLicenseValid(): Promise<boolean> {
    return true; // تم السماح بالتشغيل على جميع الأجهزة
}

/**
 * دالة لتفعيل الجهاز باستخدام كود خاص
 */
export async function activateHardware(code: string): Promise<{ success: boolean; message: string }> {
    const MASTER_CODE = process.env.MASTER_ACTIVATION_CODE || "NEXUS-2024-ADMIN";

    if (code !== MASTER_CODE) {
        return { success: false, message: "كود التفعيل غير صحيح" };
    }

    try {
        const currentFingerprint = await getFingerprint();
        fs.writeFileSync(LICENSE_PATH, currentFingerprint);
        isLicenseValidCached = true;
        return { success: true, message: "تم تفعيل الجهاز بنجاح" };
    } catch (error) {
        console.error("Activation error:", error);
        return { success: false, message: "حدث خطأ أثناء حفظ التفعيل" };
    }
}

/**
 * التحقق من رخصة الجهاز (Hard Check - Exits Process)
 */
export async function validateLicense() {
    const currentFingerprint = await getFingerprint();

    if (!fs.existsSync(LICENSE_PATH)) {
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  نظام الترخيص: لم يتم العثور على ملف تفعيل (.lic)");
        console.log(`بصمة جهازك الحالية: ${currentFingerprint}`);
        console.log("يرجى وضع هذه البصمة في ملف .lic لتفعيل النسخة.");
        console.log("=".repeat(60) + "\n");

        isLicenseValidCached = false;
        // الانتظار قليلاً لضمان ظهور الرسالة في الكونسول
        setTimeout(() => process.exit(1), 1000);
        return;
    }

    const storedLicense = fs.readFileSync(LICENSE_PATH, 'utf-8').trim();

    if (storedLicense !== currentFingerprint) {
        console.log("\n" + "!".repeat(60));
        console.log("🚫 خطأ في الترخيص (License Mismatch)");
        console.log("عذراً، هذه النسخة غير مرخصة لهذا الجهاز.");
        console.log("يرجى التواصل مع المطور للحصول على التفعيل.");
        console.log("!".repeat(60) + "\n");

        isLicenseValidCached = false;
        setTimeout(() => process.exit(1), 1000);
        return;
    }

    isLicenseValidCached = true;
    console.log("✅ تم التحقق من ترخيص الجهاز بنجاح.");
}

