import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import fs from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { deviceTypeLabels, reportStatusLabels } from "@/lib/labels";

type ReportWithRelations = Prisma.ReportGetPayload<{
  include: {
    patient: true;
    doctor: true;
    imagingStudy: {
      include: {
        device: true;
        appointment: true;
      };
    };
  };
}>;

const palette = {
  wine: "#7B1E3A",
  darkWine: "#4A0F24",
  champagne: "#F7E7CE",
  softChampagne: "#FFF6E8",
  gold: "#C8A96A",
  text: "#1E1B1B",
  muted: "#6B5F5F",
  success: "#2E8B57"
};

const pdfFonts = {
  regular: "PdfRegular",
  bold: "PdfBold"
};

function formatDate(date?: Date | null) {
  return date ? date.toLocaleString("tr-TR") : "-";
}

function registerPdfFonts(doc: PDFKit.PDFDocument) {
  const fontsDir = process.env.SystemRoot ? path.join(process.env.SystemRoot, "Fonts") : "C:\\Windows\\Fonts";
  const regularPath = path.join(fontsDir, "arial.ttf");
  const boldPath = path.join(fontsDir, "arialbd.ttf");

  if (fs.existsSync(regularPath)) {
    doc.registerFont(pdfFonts.regular, fs.readFileSync(regularPath));
  }

  if (fs.existsSync(boldPath)) {
    doc.registerFont(pdfFonts.bold, fs.readFileSync(boldPath));
  }
}

function regularFont(doc: PDFKit.PDFDocument) {
  return doc.font(pdfFonts.regular);
}

function boldFont(doc: PDFKit.PDFDocument) {
  return doc.font(pdfFonts.bold);
}

function drawField(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, width: number) {
  boldFont(doc).fillColor(palette.muted).fontSize(8).text(label.toLocaleUpperCase("tr-TR"), x, y, { width });
  regularFont(doc).fillColor(palette.text).fontSize(10).text(value || "-", x, y + 13, { width });
}

function drawSection(doc: PDFKit.PDFDocument, title: string, content: string) {
  const y = doc.y + 10;
  doc.roundedRect(48, y, 499, 28, 8).fill(palette.softChampagne);
  boldFont(doc).fillColor(palette.wine).fontSize(12).text(title, 62, y + 8, { width: 470 });
  doc.y += 38;
  regularFont(doc)
    .fillColor(palette.text)
    .fontSize(10.5)
    .text(content || "-", 62, doc.y, { width: 470, lineGap: 4 });
  doc.y += 8;
}

function drawPdfBrand(doc: PDFKit.PDFDocument) {
  const logoPath = path.join(process.cwd(), "public", "assets", "1.png");
  const logoX = 58;
  const logoY = 50;
  const logoWidth = 174;
  const logoHeight = 58;

  if (fs.existsSync(logoPath)) {
    const logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
    doc.save();
    doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 9).clip();
    doc.opacity(0.96).image(logoDataUri, logoX, logoY, {
      fit: [logoWidth, logoHeight],
      align: "center",
      valign: "center"
    });
    doc.restore();
    doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 9).strokeColor(palette.gold).lineWidth(0.8).stroke();
  } else {
    doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 10).fill(palette.wine);
    boldFont(doc).fillColor(palette.champagne).fontSize(12).text("HR", logoX, logoY + 20, { width: logoWidth, align: "center" });
  }

  doc.moveTo(252, 50).lineTo(252, 108).strokeColor(palette.gold).lineWidth(0.8).stroke();
  boldFont(doc).fillColor(palette.champagne).fontSize(15).text("Hastane Radyoloji", 268, 56, { width: 250, align: "left" });
  regularFont(doc).fillColor("#FFFFFF").fontSize(9.5).text("Otomasyon Sistemi", 268, 78, { width: 250, align: "left" });
  regularFont(doc).fillColor(palette.champagne).fontSize(9).text("Resmi Radyoloji Raporu", 268, 94, { width: 250, align: "left" });
}

export async function createReportPdf(report: ReportWithRelations) {
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  registerPdfFonts(doc);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.roundedRect(36, 32, 523, 96, 14).fill(palette.darkWine);
  doc.roundedRect(42, 38, 511, 84, 12).strokeColor(palette.gold).lineWidth(1).stroke();
  drawPdfBrand(doc);

  doc.y = 154;
  boldFont(doc).fillColor(palette.wine).fontSize(15).text("Rapor Özeti", 48, doc.y);

  const tableTop = doc.y + 14;
  doc.roundedRect(48, tableTop, 499, 150, 10).fill("#FFFFFF").strokeColor(palette.champagne).stroke();
  doc.rect(48, tableTop, 499, 34).fill(palette.softChampagne);

  const leftX = 64;
  const rightX = 310;
  drawField(doc, "Hasta Adı Soyadı", `${report.patient.firstName} ${report.patient.lastName}`, leftX, tableTop + 12, 210);
  drawField(doc, "Hasta Numarası", report.patient.patientNumber, rightX, tableTop + 12, 210);
  drawField(doc, "TC Kimlik No", report.patient.nationalId ?? "-", leftX, tableTop + 54, 210);
  drawField(doc, "Tetkik Türü", deviceTypeLabels[report.imagingStudy.appointment.examinationType], rightX, tableTop + 54, 210);
  drawField(doc, "Cihaz / Oda", `${report.imagingStudy.device.name} / ${report.imagingStudy.device.roomNumber}`, leftX, tableTop + 96, 210);
  drawField(doc, "Randevu Tarihi", formatDate(report.imagingStudy.appointment.startTime), rightX, tableTop + 96, 210);

  doc.y = tableTop + 170;
  doc.roundedRect(48, doc.y, 499, 124, 10).fill("#FFFFFF").strokeColor(palette.champagne).stroke();
  const metaTop = doc.y + 14;
  drawField(doc, "Çekim Tarihi", formatDate(report.imagingStudy.completedAt ?? report.imagingStudy.appointment.startTime), leftX, metaTop, 210);
  drawField(doc, "Doktor / Radyolog", `${report.doctor.name} ${report.doctor.surname}`, rightX, metaTop, 210);
  drawField(doc, "Rapor Durumu", reportStatusLabels[report.status], leftX, metaTop + 42, 210);
  drawField(doc, "Onay Tarihi", formatDate(report.approvedAt), rightX, metaTop + 42, 210);
  drawField(doc, "e-Nabız Mock", report.sentToENabiz ? "Gönderildi" : "Gönderilmedi", leftX, metaTop + 84, 210);
  drawField(doc, "Oluşturulma Tarihi", formatDate(report.createdAt), rightX, metaTop + 84, 210);

  doc.y = metaTop + 122;
  drawSection(doc, "Klinik Bilgi", report.clinicalInfo);
  drawSection(doc, "Bulgular", report.findings);
  drawSection(doc, "Sonuç / Kanaat", report.conclusion);

  const footerY = 770;
  doc.moveTo(48, footerY).lineTo(547, footerY).strokeColor(palette.champagne).stroke();
  regularFont(doc)
    .fillColor(palette.muted)
    .fontSize(8)
    .text("Bu rapor Hastane Radyoloji Otomasyon Sistemi demo ortamı tarafından oluşturulmuştur.", 48, footerY + 10, { width: 340 });
  boldFont(doc)
    .fillColor(report.sentToENabiz ? palette.success : palette.wine)
    .fontSize(9)
    .text(`e-Nabız: ${report.sentToENabiz ? "Gönderildi" : "Gönderilmedi"}`, 420, footerY + 10, { width: 127, align: "right" });

  doc.end();
  return done;
}
