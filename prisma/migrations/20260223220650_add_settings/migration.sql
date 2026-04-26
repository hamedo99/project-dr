-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "clinicName" TEXT NOT NULL DEFAULT 'عيادتي',
    "doctorName" TEXT NOT NULL DEFAULT 'دكتور متخصص',
    "specialization" TEXT NOT NULL DEFAULT 'أخصائي جراحة',
    "licenseNumber" TEXT,
    "clinicPhone" TEXT,
    "workingHours" TEXT NOT NULL DEFAULT '2:00 مساءً - 9:00 مساءً',
    "appointmentGap" INTEGER NOT NULL DEFAULT 20,
    "logoPath" TEXT,
    "directorateLogo" TEXT
);
