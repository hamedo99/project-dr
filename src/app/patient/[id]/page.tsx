import { getPatientById } from '@/actions/patient';
import { getSettings } from '@/actions/settings';
import { notFound } from 'next/navigation';
import { PatientProfileHeader } from '@/components/PatientProfileHeader';
import { VisitTimeline } from '@/components/VisitTimeline';
import { AddVisitForm } from '@/components/AddVisitForm';
import { Nav } from '@/components/Nav';

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [patient, settings] = await Promise.all([
        getPatientById(id),
        getSettings(),
    ]);

    if (!patient) {
        notFound();
    }

    return (
        <div className="flex-1">
            <Nav pageTitle="ملف المريض" />
            <main className="max-w-7xl mx-auto p-6 md:p-10">
                <PatientProfileHeader patient={patient} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
                    <div className="lg:col-span-2 space-y-10">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full" />
                                سجل الزيارات
                            </h2>
                            <VisitTimeline visits={patient.visits || []} patient={patient} settings={settings} />
                        </section>
                    </div>

                    <aside className="space-y-10">
                        <section className="sticky top-10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-accent rounded-full" />
                                إضافة زيارة
                            </h2>
                            <AddVisitForm patientId={patient.id} settings={settings} />
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
