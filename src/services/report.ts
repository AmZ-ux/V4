import { formatBRL, formatMonthYearTitle } from "@/utils/currency";

interface ReportRow {
  nome: string;
  rota: string;
  valor: number;
  status: string;
}

export interface ReportPayload {
  month: number;
  year: number;
  rows: ReportRow[];
  received: number;
  expected: number;
}

function sanitizePdfText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createSimplePdf(lines: string[]): string {
  const streamLines = [
    "BT",
    "/F1 11 Tf",
    "36 800 Td",
    "14 TL",
    ...lines.map((line, index) => `${index === 0 ? "" : "T* "}(${sanitizePdfText(line)}) Tj`),
    "ET",
  ];

  const contentStream = streamLines.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj");
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push(`5 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function downloadMonthlyReportCsv(payload: ReportPayload): void {
  const header = [
    "Relatorio Van Ease Pay",
    `Mes: ${formatMonthYearTitle(payload.month, payload.year)}`,
    `Recebido: ${payload.received.toFixed(2)}`,
    `Esperado: ${payload.expected.toFixed(2)}`,
    "",
    "Nome;Rota;Valor;Status",
  ];

  const lines = payload.rows.map((row) => `${row.nome};${row.rota};${row.valor.toFixed(2)};${row.status}`);
  const content = [...header, ...lines].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-${payload.year}-${String(payload.month).padStart(2, "0")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadMonthlyReportPdf(payload: ReportPayload): void {
  const lines = [
    "Relatorio Van Ease Pay",
    `Mes: ${formatMonthYearTitle(payload.month, payload.year)}`,
    `Recebido: ${formatBRL(payload.received)}`,
    `Esperado: ${formatBRL(payload.expected)}`,
    "",
    "Nome | Rota | Valor | Status",
    ...payload.rows.map((row) => `${row.nome} | ${row.rota} | ${formatBRL(row.valor)} | ${row.status}`),
  ];

  const pdf = createSimplePdf(lines);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio-${payload.year}-${String(payload.month).padStart(2, "0")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
