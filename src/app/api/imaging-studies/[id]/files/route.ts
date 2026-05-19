import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { AppointmentStatus, ImagingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { registerStudyFileForPacs } from "@/lib/pacs";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "application/dicom", "application/octet-stream"]);
const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".dicom"]);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["TECHNICIAN"]);
  if (error) return error;
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(ext) || (file.type && !allowedTypes.has(file.type))) {
    return NextResponse.json({ error: "Yalnızca PDF, JPG, PNG veya DICOM simülasyon dosyası yüklenebilir" }, { status: 400 });
  }
  const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
  const studyDir = path.join(process.cwd(), uploadDir, params.id);
  await mkdir(studyDir, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const target = path.join(studyDir, safeName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(target, bytes);
  const publicPath = `/${uploadDir.replace(/^public[\\/]/, "").replace(/\\/g, "/")}/${params.id}/${safeName}`;
  const studyFile = await prisma.studyFile.create({
    data: {
      imagingStudyId: params.id,
      fileName: file.name,
      filePath: publicPath,
      fileType: file.type || ext.replace(".", ""),
      fileSize: bytes.length,
      uploadedById: user.id
    }
  });
  const study = await prisma.imagingStudy.update({
    where: { id: params.id },
    data: { status: ImagingStatus.REPORT_PENDING, appointment: { update: { status: AppointmentStatus.REPORT_PENDING } } }
  });
  await registerStudyFileForPacs(params.id, { fileName: file.name, filePath: publicPath, fileType: file.type, fileSize: bytes.length });
  await writeAuditLog({ userId: user.id, action: "FILE_UPLOADED", entityType: "StudyFile", entityId: studyFile.id, description: "Görüntü/dosya yüklendi." });
  return NextResponse.json({ file: studyFile, study }, { status: 201 });
}
