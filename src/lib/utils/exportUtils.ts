/**
 * Utility functions for exporting data in different formats
 */

/**
 * Convert data to CSV format and trigger download
 * @param data Array of objects to export
 * @param filename Filename for the downloaded file
 */
export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first item
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(item => 
      headers.map(header => {
        // Handle special cases (null, undefined, objects, etc.)
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Create and trigger download
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Convert data to JSON format and trigger download
 * @param data Data to export
 * @param filename Filename for the downloaded file
 */
export function exportToJSON<T>(data: T, filename: string): void {
  if (!data) {
    console.error('No data to export');
    return;
  }
  
  // Create JSON content
  const jsonContent = JSON.stringify(data, null, 2);
  
  // Create and trigger download
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Helper function to create and trigger a file download
 * @param content File content
 * @param filename Filename for the downloaded file
 * @param mimeType MIME type of the file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  // Create a Blob with the content
  const blob = new Blob([content], { type: mimeType });
  
  // Create a download URL
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to the document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  URL.revokeObjectURL(url);
}
