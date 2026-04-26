export interface Patient {
    id: string;
    fullName: string;
    phone: string | null;
    createdAt: Date;
    visits?: Visit[];
}

export interface Visit {
    id: string;
    visitDate: Date;
    diagnosis: string;
    imagePath: string | null;
    treatment: string;
    notes: string | null;
    patientId: string;
    patient?: Patient;
}

export interface Settings {
    id: string;
    clinicName: string;
    doctorName: string;
    specialization: string;
    licenseNumber: string | null;
    clinicPhone: string | null;
    workingHours: string;
    appointmentGap: number;
    logoPath: string | null;
    directorateLogo: string | null;
    commonDiagnoses: string;
    commonTreatments: string;
}
