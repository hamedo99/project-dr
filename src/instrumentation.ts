export async function register() {
    // هذا الكود سيعمل فقط في بيئة Node.js (السيرفر)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { validateLicense } = await import('./lib/licensing');
        await validateLicense();
    }
}
