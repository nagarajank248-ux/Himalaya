import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead } from '../types/crm';

export const exportToExcel = (leads: Lead[]) => {
  const data = leads.map(l => ({
    Name: l.name,
    Company: l.company,
    Phone: l.phone,
    Address: l.address,
    City: l.city,
    State: l.state,
    Status: l.status.toUpperCase(),
    Priority: l.priority.toUpperCase(),
    'Follow Up Date': l.followUpDate || 'N/A',
    Tags: l.tags.join(', '),
    Favorite: l.favorite ? 'Yes' : 'No',
    'Created At': new Date(l.createdAt).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  
  // Auto-fit column widths
  const maxProps = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(...data.map(row => String(row[key as keyof typeof row]).length), key.length) + 2
  }));
  worksheet['!cols'] = maxProps;

  XLSX.writeFile(workbook, `CRM_Leads_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToCSV = (leads: Lead[]) => {
  const data = leads.map(l => ({
    Name: l.name,
    Company: l.company,
    Phone: l.phone,
    Address: l.address,
    City: l.city,
    State: l.state,
    Status: l.status,
    Priority: l.priority,
    FollowUpDate: l.followUpDate || '',
    Tags: l.tags.join(';'),
    Favorite: l.favorite ? 'true' : 'false',
    CreatedAt: l.createdAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CRM_Leads_Export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (leads: Lead[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(15, 32, 67); // Navy blue header
  doc.text('Construction Builder Lead Management CRM', 14, 20);
  
  // Subtitle / Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()} | Total Leads: ${leads.length}`, 14, 26);
  
  // Table columns
  const tableColumn = ['Name', 'Company', 'Phone', 'City', 'Status', 'Priority', 'Follow-up'];
  
  // Table rows
  const tableRows = leads.map(l => [
    l.name,
    l.company,
    l.phone,
    l.city,
    l.status.toUpperCase(),
    l.priority.toUpperCase(),
    l.followUpDate || 'None'
  ]);

  // Generate table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 32,
    theme: 'striped',
    headStyles: { fillColor: [14, 116, 144] }, // Teal/Blue header color matching theme
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 32 },
  });

  doc.save(`CRM_Leads_Export_${new Date().toISOString().split('T')[0]}.pdf`);
};
