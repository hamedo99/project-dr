import { getSettings } from '@/actions/settings';
import { Nav } from '@/components/Nav';
import { SettingsForm } from '@/components/SettingsForm';

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <div className="flex-1">
            <Nav pageTitle="الإعدادات" />
            <main className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">إعدادات العيادة</h1>
                    <p className="text-slate-500">قم بتخصيص معلومات العيادة، الطبيب، والراشيتة المطبوعة.</p>
                </div>

                <SettingsForm initialSettings={settings} />
            </main>
        </div>
    );
}
