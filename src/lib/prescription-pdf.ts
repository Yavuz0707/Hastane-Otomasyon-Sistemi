import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import fs from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";

type PrescriptionWithRelations = Prisma.PrescriptionGetPayload<{
  include: { patient: true; doctor: true };
}>;

type Medication = { name: string; dose: string; frequency: string; duration: string };

const palette = {
  wine: "#7B1E3A",
  darkWine: "#4A0F24",
  champagne: "#F7E7CE",
  softChampagne: "#FFF6E8",
  gold: "#C8A96A",
  text: "#1E1B1B",
  muted: "#6B5F5F"
};

function registerFonts(doc: PDFKit.PDFDocument) {
  const fontsDir = process.env.SystemRoot ? path.join(process.env.SystemRoot, "Fonts") : "C:\\Windows\\Fonts";
  const r = path.join(fontsDir, "arial.ttf");
  const b = path.join(fontsDir, "arialbd.ttf");
  if (fs.existsSync(r)) doc.registerFont("Reg", fs.readFileSync(r));
  if (fs.existsSync(b)) doc.registerFont("Bold", fs.readFileSync(b));
}

function reg(doc: PDFKit.PDFDocument) { return doc.font("Reg"); }
function bold(doc: PDFKit.PDFDocument) { return doc.font("Bold"); }

function drawField(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, w: number) {
  bold(doc).fillColor(palette.muted).fontSize(8).text(label.toLocaleUpperCase("tr-TR"), x, y, { width: w });
  reg(doc).fillColor(palette.text).fontSize(10).text(value || "-", x, y + 13, { width: w });
}

export async function createPrescriptionPdf(prescription: PrescriptionWithRelations): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  registerFonts(doc);

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.roundedRect(36, 32, 523, 96, 14).fill(palette.darkWine);
  doc.roundedRect(42, 38, 511, 84, 12).strokeColor(palette.gold).lineWidth(1).stroke();

  const logoPath = path.join(process.cwd(), "public", "assets", "1.png");
  if (fs.existsSync(logoPath)) {
    const logoData = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
    doc.save();
    doc.roundedRect(58, 50, 174, 58, 9).clip();
    doc.opacity(0.96).image(logoData, 58, 50, { fit: [174, 58], align: "center", valign: "center" });
    doc.restore();
    doc.roundedRect(58, 50, 174, 58, 9).strokeColor(palette.gold).lineWidth(0.8).stroke();
  }
  doc.moveTo(242, 50).lineTo(242, 108).strokeColor(palette.gold).lineWidth(0.8).stroke();
  bold(doc).fillColor(palette.champagne).fontSize(15).text("Hastane Radyoloji", 258, 56, { width: 270, align: "left" });
  reg(doc).fillColor("#FFFFFF").fontSize(9.5).text("Otomasyon Sistemi", 258, 78, { width: 270, align: "left" });
  reg(doc).fillColor(palette.champagne).fontSize(9).text("Dijital Reçete", 258, 94, { width: 270, align: "left" });

  doc.y = 154;
  bold(doc).fillColor(palette.wine).fontSize(15).text("Reçete", 48, doc.y);

  const tableTop = doc.y + 14;
  doc.roundedRect(48, tableTop, 499, 110, 10).fill("#FFFFFF").strokeColor(palette.champagne).stroke();
  doc.rect(48, tableTop, 499, 34).fill(palette.softChampagne);

  const lx = 64, rx = 310;
  drawField(doc, "Hasta Adı Soyadı", `${prescription.patient.firstName} ${prescription.patient.lastName}`, lx, tableTop + 12, 210);
  drawField(doc, "Hasta No", prescription.patient.patientNumber, rx, tableTop + 12, 210);
  drawField(doc, "TC Kimlik No", prescription.patient.nationalId, lx, tableTop + 54, 210);
  drawField(doc, "Doktor", `Dr. ${prescription.doctor.name} ${prescription.doctor.surname}`, rx, tableTop + 54, 210);
  drawField(doc, "Reçete No", prescription.prescriptionNo, lx, tableTop + 78, 210);
  drawField(doc, "Tarih", new Date(prescription.createdAt).toLocaleDateString("tr-TR"), rx, tableTop + 78, 210);

  doc.y = tableTop + 130;

  let medications: Medication[] = [];
  try { medications = JSON.parse(prescription.medications); } catch { medications = []; }

  bold(doc).fillColor(palette.wine).fontSize(12).text("İlaçlar", 48, doc.y);
  doc.y += 16;

  medications.forEach((med, i) => {
    const rowY = doc.y;
    doc.roundedRect(48, rowY, 499, 48, 6).fill(i % 2 === 0 ? palette.softChampagne : "#FFFFFF").strokeColor(palette.champagne).stroke();
    bold(doc).fillColor(palette.text).fontSize(10).text(`${i + 1}. ${med.name}`, 62, rowY + 8, { width: 200 });
    reg(doc).fillColor(palette.muted).fontSize(9)
      .text(`Doz: ${med.dose}`, 62, rowY + 26, { width: 120 })
      .text(`Günde: ${med.frequency}`, 190, rowY + 26, { width: 120 })
      .text(`Süre: ${med.duration}`, 318, rowY + 26, { width: 120 });
    doc.y = rowY + 56;
  });

  if (prescription.instructions) {
    doc.y += 8;
    bold(doc).fillColor(palette.wine).fontSize(11).text("Genel Talimatlar", 48, doc.y);
    doc.y += 14;
    reg(doc).fillColor(palette.text).fontSize(10).text(prescription.instructions, 62, doc.y, { width: 470, lineGap: 4 });
    doc.y += 8;
  }

  const footerY = 770;
  doc.moveTo(48, footerY).lineTo(547, footerY).strokeColor(palette.champagne).stroke();
  reg(doc).fillColor(palette.muted).fontSize(8).text("Bu reçete Hastane Radyoloji Otomasyon Sistemi tarafından oluşturulmuştur.", 48, footerY + 10, { width: 340 });
  bold(doc).fillColor(palette.wine).fontSize(9).text(`Reçete No: ${prescription.prescriptionNo}`, 420, footerY + 10, { width: 127, align: "right" });

  doc.end();
  return done;
}
