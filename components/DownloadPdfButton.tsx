'use client'

export interface PdfRow {
  label: string  // empty string → full-width value, no label column
  value: string
}

export interface PdfSection {
  heading: string
  rows: PdfRow[]
}

export interface PdfDoc {
  title: string
  subtitle: string
  sections: PdfSection[]
}

export default function DownloadPdfButton({ pdf }: { pdf: PdfDoc }) {
  async function handleDownload() {
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageW = 210
    const pageH = 297
    const mL = 20       // left margin
    const mR = 20       // right margin
    const mB = 18       // bottom margin (for footer)
    const usableW = pageW - mL - mR   // 170mm
    const labelW = 52
    const valueX = mL + labelW + 4
    const valueW = usableW - labelW - 4
    const lineH = 5     // mm per line at 8.5pt
    const bottom = pageH - mB

    let y = mL

    const newPage = () => {
      doc.addPage()
      y = mL
    }

    const guard = (needed: number) => {
      if (y + needed > bottom) newPage()
    }

    // ── WXDA wordmark ──────────────────────────────────────────────────────
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160)
    doc.text('Waterloo Cross-Dressing Archive (WXDA)', mL, y)
    y += 7

    // ── Title ──────────────────────────────────────────────────────────────
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20)
    const titleLines = doc.splitTextToSize(pdf.title, usableW) as string[]
    doc.text(titleLines, mL, y)
    y += titleLines.length * 7

    // ── Subtitle ───────────────────────────────────────────────────────────
    if (pdf.subtitle) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(110)
      doc.text(pdf.subtitle, mL, y)
      y += 6
    }

    // Rule under header
    doc.setDrawColor(180)
    doc.line(mL, y, pageW - mR, y)
    y += 7

    // ── Sections ───────────────────────────────────────────────────────────
    for (const section of pdf.sections) {
      if (section.rows.length === 0) continue

      guard(14)

      // Section heading
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(130)
      doc.text(section.heading.toUpperCase(), mL, y)
      y += 4
      doc.setDrawColor(210)
      doc.line(mL, y, pageW - mR, y)
      y += 4

      for (const row of section.rows) {
        const fullWidth = row.label === ''

        if (fullWidth) {
          const lines = doc.splitTextToSize(row.value, usableW) as string[]
          const rowH = lines.length * lineH
          guard(rowH + 2)
          doc.setFontSize(8.5)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(20)
          doc.text(lines, mL, y)
          y += rowH + 2
        } else {
          const valueLines = doc.splitTextToSize(row.value, valueW) as string[]
          const labelLines = doc.splitTextToSize(row.label, labelW - 2) as string[]
          const rowH = Math.max(valueLines.length, labelLines.length) * lineH
          guard(rowH + 2)

          doc.setFontSize(8.5)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(90)
          doc.text(labelLines, mL, y)

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(20)
          doc.text(valueLines, valueX, y)

          y += rowH + 2
        }
      }

      y += 5
    }

    // ── Page footers ───────────────────────────────────────────────────────
    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      doc.setPage(p)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(160)
      const footerY = pageH - 9
      doc.text('Waterloo Cross-Dressing Archive · University of Waterloo', mL, footerY)
      doc.text(`${p} / ${total}`, pageW - mR, footerY, { align: 'right' })
    }

    const slug = pdf.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50)
    doc.save(`wxda-${slug}.pdf`)
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="no-print flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border bg-paper text-muted hover:text-ink hover:border-muted transition-colors cursor-pointer shrink-0"
      aria-label="Download this record as a PDF"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF
    </button>
  )
}
