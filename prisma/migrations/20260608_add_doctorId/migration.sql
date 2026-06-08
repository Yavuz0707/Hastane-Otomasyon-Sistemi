BEGIN TRANSACTION;

-- Add nullable doctorId column to Appointment
ALTER TABLE "Appointment" ADD COLUMN "doctorId" TEXT;

-- Optional index to speed up doctor availability queries
CREATE INDEX IF NOT EXISTS "idx_appointment_doctor_start_end" ON "Appointment" ("doctorId", "startTime", "endTime");

COMMIT;
