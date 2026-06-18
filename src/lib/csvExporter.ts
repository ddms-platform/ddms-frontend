export class CsvExporter {
  /**
   * Exports data to a CSV file and triggers a browser download.
   * Supports escaping cells containing quotes, commas, or newlines,
   * and prepends a UTF-8 BOM character for Excel compatibility.
   *
   * @param headers List of column headers
   * @param rows Two-dimensional array of row data
   * @param fileName Name of the downloaded file (e.g. 'export.csv')
   */
  static export(
    headers: string[],
    rows: (string | number)[][],
    fileName: string,
  ) {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            // Escape double quotes and wrap in double quotes if it contains delimiters
            if (
              str.includes(',') ||
              str.includes('"') ||
              str.includes('\n') ||
              str.includes('\r')
            ) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
