//
// Utilities for exporting data in CSV/PDF formats.
// Designed to avoid external dependencies and be easy to replace with a service/API later.
//

/**
 * PUBLIC_INTERFACE
 * exportToCSV
 * Convert an array of objects to CSV and trigger a download.
 * @param {Array<object>} rows - Array of data objects
 * @param {string} filename - File name (default 'export.csv')
 */
export function exportToCSV(rows, filename = 'export.csv') {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('exportToCSV: no data to export');
    return;
  }
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const escape = (val) => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csv = [headers.join(',')]
    .concat(rows.map((row) => headers.map((h) => escape(row[h])).join(',')))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * PUBLIC_INTERFACE
 * exportToPDF
 * Basic PDF export via print dialog fallback (prints a formatted HTML view).
 * Replace with a real PDF generation (e.g., server-side or jsPDF) in future integration.
 * @param {string} title
 * @param {string} htmlContent
 */
export function exportToPDF(title, htmlContent) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title || 'FitTrack Export'}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #222; padding: 16px; }
          h1 { font-size: 22px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function(){ window.print(); setTimeout(()=>window.close(), 200); }
        </script>
      </body>
    </html>
  `);
  win.document.close();
}
