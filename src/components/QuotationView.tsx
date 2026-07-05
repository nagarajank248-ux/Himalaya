'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Calendar, 
  User, 
  MapPin, 
  Hash,
  Sparkles,
  Undo,
  PenTool,
  X,
  CheckCircle,
  Eraser,
  Upload,
  Phone
} from 'lucide-react';

interface QuotationItem {
  id: string;
  description: string;
  amount: number;
}

export const QuotationView: React.FC = () => {
  const { logActivity, addNotification } = useCRM();

  // Quote Metadata States
  const [clientName, setClientName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [quoteNumber, setQuoteNumber] = useState(`HVD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);

  // Quotation Items List State
  const [items, setItems] = useState<QuotationItem[]>([
    { id: '1', description: 'Living room Vasthu Consultation', amount: 1800 },
    { id: '2', description: 'Kitchen Design & Layout', amount: 1500 },
    { id: '3', description: 'Work Area Planning', amount: 1500 },
    { id: '4', description: 'M.Bedroom Design Layout', amount: 1500 },
    { id: '5', description: 'Bedroom 1 Consultation', amount: 1500 },
    { id: '6', description: 'Bedroom 2 Consultation', amount: 1500 },
    { id: '7', description: 'Bedroom 3 Consultation', amount: 1500 }
  ]);

  // Terms and Conditions State
  const [terms, setTerms] = useState(
    "1. Payments should be made directly to the specified account details.\n" +
    "2. Vasthu plan adjustments after design sign-off will incur additional design charges.\n" +
    "3. This quotation is valid for 30 days from the date of issuance."
  );

  // Signature States
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sigType, setSigType] = useState<'draw' | 'upload' | 'type' | null>(null);
  const [typedSignature, setTypedSignature] = useState('');

  // Company Contact Details (Header) States
  const [companyAddress, setCompanyAddress] = useState('Coimbatore, Tamil Nadu, India');
  const [companyPhone, setCompanyPhone] = useState('+91 98765 43210');
  
  // Canvas Ref and Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Add a new row to the table
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      amount: 0
    };
    setItems([...items, newItem]);
  };

  // Update item field value
  const handleUpdateItem = (id: string, field: 'description' | 'amount', value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'amount' ? (Number(value) || 0) : value
          };
        }
        return item;
      })
    );
  };

  // Delete item from list
  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      addNotification('error', 'Quotation must have at least one item.');
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  // Reset form to example
  const handleResetForm = () => {
    setItems([
      { id: '1', description: 'Living room', amount: 1800 },
      { id: '2', description: 'Kitchen', amount: 1500 },
      { id: '3', description: 'Work area', amount: 1500 },
      { id: '4', description: 'M.Bedroom', amount: 1500 },
      { id: '5', description: 'Bedroom 1', amount: 1500 },
      { id: '6', description: 'Bedroom 2', amount: 1500 },
      { id: '7', description: 'Bedroom 3', amount: 1500 }
    ]);
    setClientName('');
    setProjectLocation('');
    setSignatureImage(null);
    setSigType(null);
    setTypedSignature('');
    setCompanyAddress('Coimbatore, Tamil Nadu, India');
    setCompanyPhone('+91 98765 43210');
    setTerms(
      "1. Payments should be made directly to the specified account details.\n" +
      "2. Vasthu plan adjustments after design sign-off will incur additional design charges.\n" +
      "3. This quotation is valid for 30 days from the date of issuance."
    );
    setQuoteNumber(`HVD-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Calculate sum of all rows
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // --- DRAWING CANVAS HANDLERS ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e293b'; // Navy Slate
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // Touch Event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse Event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // Touch Event
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevents page scrolling when drawing on mobile
    } else {
      // Mouse Event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is empty (we can check by pixel data)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isCanvasEmpty = !Array.from(buffer.data).some(color => color !== 0);

    if (isCanvasEmpty) {
      addNotification('error', 'Please draw a signature before saving.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setSigType('draw');
    setIsSigModalOpen(false);
    addNotification('success', 'Digital signature saved successfully.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result as string);
        setSigType('upload');
        addNotification('success', 'Signature image uploaded successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- PDF EXPORT GENERATION ---
  const handleDownloadPDF = () => {
    if (!clientName.trim()) {
      addNotification('error', 'Please enter a Client Name before exporting.');
      return;
    }

    const doc = new jsPDF();

    // 1. Decorative Colors (Theme: Deep Space Blue & Princeton Orange accents)
    doc.setFillColor(2, 48, 71); // Deep Space Blue background
    doc.rect(0, 0, 210, 42, 'F');

    // Title Font
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('HIMALAYA VASTHU DESIGNER', 14, 18);

    // Subtext
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text('Vaastu Consulting, Plan Designs & Interior Space Layouts', 14, 25);
    
    const contactSubtext = [companyAddress.trim(), companyPhone.trim()].filter(Boolean).join(' | ');
    if (contactSubtext) {
      doc.text(contactSubtext, 14, 31);
    }

    // Princeton Orange decorative bar
    doc.setFillColor(251, 133, 0); // Princeton Orange accent
    doc.rect(0, 42, 210, 2.5, 'F');

    // 2. Metadata Grid
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('QUOTATION FOR:', 14, 58);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Client Name: ${clientName}`, 14, 65);
    doc.text(`Location: ${projectLocation || 'Not Specified'}`, 14, 71);

    // Right Side Metadata
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('QUOTATION DETAILS:', 130, 58);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Quote No: ${quoteNumber}`, 130, 65);
    doc.text(`Date: ${new Date(quoteDate).toLocaleDateString()}`, 130, 71);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 78, 196, 78);

    // 3. Items Table Mapping
    const tableColumn = ['S.No', 'Particulars / Description', 'Amount (INR)'];
    const tableRows = items.map((item, idx) => [
      idx + 1,
      item.description || 'Custom consultation service',
      `Rs. ${item.amount.toLocaleString('en-IN')}.00`
    ]);

    // Grand Total row
    tableRows.push([
      '',
      'GRAND TOTAL',
      `Rs. ${totalAmount.toLocaleString('en-IN')}.00`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      headStyles: { 
        fillColor: [33, 158, 188], // Blue Green header 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 130 },
        2: { cellWidth: 37, fontStyle: 'bold', halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [248, 250, 252];
          data.cell.styles.textColor = [15, 23, 42];
          if (data.column.index === 1) {
            data.cell.styles.halign = 'right';
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // 4. Terms and Signature Footers
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Terms & Conditions block
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Terms & Conditions:', 14, finalY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    
    const termsLines = terms.split('\n').filter(line => line.trim() !== '');
    termsLines.forEach((line, index) => {
      doc.text(line, 14, finalY + 6 + (index * 5));
    });

    const sigStartY = finalY + 6 + (termsLines.length * 5) + 12;

    // --- Embed Digital Signature ---
    if (sigType === 'type' && typedSignature.trim() !== '') {
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(typedSignature, 145, sigStartY - 3);
    } else if (signatureImage && (sigType === 'draw' || sigType === 'upload')) {
      doc.addImage(signatureImage, 'PNG', 145, sigStartY - 9, 38, 14); // Positioned above signature line
    }

    // Authorized Signature line
    doc.setDrawColor(148, 163, 184);
    doc.line(140, sigStartY, 190, sigStartY);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Authorized Signature', 148, sigStartY + 5);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Himalaya Vasthu Designer', 147, sigStartY + 9);

    // Save PDF
    doc.save(`Quotation_${quoteNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
    
    logActivity('Generated Quotation', `${quoteNumber} for ${clientName} (Total: Rs. ${totalAmount})`);
    addNotification('success', `Quotation ${quoteNumber} exported with digital signature.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quotation Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate custom interior and Vasthu quotations, sign digitally on-screen, and export professional PDFs.
          </p>
        </div>
        <button
          onClick={handleResetForm}
          className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Undo className="h-4 w-4" />
          Reset Form
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Builder inputs Form (Col-Span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
          
          {/* Metadata Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">
              Quotation Metadata
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Client Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Project Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="e.g. Ramanathapuram, Coimbatore"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Quote ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Company Header Info Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-1">
                Company Details (Header Info)
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Company Address (Header)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="e.g. Coimbatore, Tamil Nadu, India"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Company Phone (Header)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Table items list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Quotation Items
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 animate-in fade-in duration-150"
                >
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">
                    {idx + 1}
                  </span>
                  
                  {/* Particulars Description */}
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Enter room name / design consultancy..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-955 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {/* Amount */}
                  <div className="w-28">
                    <input
                      type="number"
                      required
                      value={item.amount || ''}
                      onChange={(e) => handleUpdateItem(item.id, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-955 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-semibold text-right"
                    />
                  </div>

                  {/* Delete row */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Signature Pad Trigger */}
            {/* Signature Trigger & Inputs */}
            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Digital Authentication Signature</p>
                  <p className="text-[10px] text-slate-400">Choose to draw, upload, or type your authorized signature.</p>
                </div>

                {sigType ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-1.5 h-10 w-24 flex items-center justify-center overflow-hidden">
                      {sigType === 'type' ? (
                        <span className="font-serif italic font-bold text-slate-800 text-[10px] truncate max-w-full text-center">
                          {typedSignature || 'Signature'}
                        </span>
                      ) : (
                        <img src={signatureImage || ''} alt="Saved sign" className="max-h-full object-contain" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSigType(null);
                        setSignatureImage(null);
                        setTypedSignature('');
                      }}
                      className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSigModalOpen(true)}
                      className="flex items-center gap-1.5 border border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Draw Sign
                    </button>
                    
                    <label className="flex items-center gap-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:bg-slate-900 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-blue-500" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setSigType('type');
                        setTypedSignature(clientName || 'Himalaya Vasthu');
                      }}
                      className="flex items-center gap-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:bg-slate-900 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-emerald-500" />
                      Type Sign
                    </button>
                  </div>
                )}
              </div>

              {sigType === 'type' && (
                <div className="animate-in slide-in-from-top-2 duration-150">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Type Your Name as Signature
                  </label>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Enter signature text..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white font-serif italic text-base"
                  />
                </div>
              )}
            </div>

            {/* Terms & Conditions Textarea */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Terms & Conditions (One per line)
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Enter quotation terms and validity rules..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white resize-none"
              />
            </div>

            {/* Subtotal Row */}
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150/40 dark:border-slate-850">
              <span className="text-xs font-bold text-slate-500 uppercase">Grand Total:</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                Rs. {totalAmount.toLocaleString('en-IN')}.00
              </span>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full py-3.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              Download & Export PDF
            </button>
          </div>
        </div>

        {/* Right Side: Real-time visual document preview (Col-Span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Live Quotation Preview
          </h2>

          {/* Letterhead Design Wrapper */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-inner bg-slate-50/50 dark:bg-slate-950/30 font-mono text-[9px] text-slate-700 dark:text-slate-350 space-y-4">
            
            {/* Header branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-250 dark:border-slate-800">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                Himalaya Vasthu Designer
              </h3>
              <p className="text-[8px] text-slate-400">
                Vaastu Plan & Interior Designs
                {(companyAddress || companyPhone) ? ' | ' : ''}
                {[companyAddress.trim(), companyPhone.trim()].filter(Boolean).join(' | ')}
              </p>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-2 text-[9px] border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <p><span className="text-slate-400">Client:</span> {clientName || '_______________'}</p>
                <p><span className="text-slate-400">Loc:</span> {projectLocation || '_______________'}</p>
              </div>
              <div className="text-right">
                <p><span className="text-slate-400">Quote ID:</span> {quoteNumber}</p>
                <p><span className="text-slate-400">Date:</span> {quoteDate}</p>
              </div>
            </div>

            {/* Item listing */}
            <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800/80 max-h-[180px] overflow-y-auto pr-1">
              <div className="flex justify-between font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-1">
                <span>Particulars</span>
                <span>Amount (Rs)</span>
              </div>
              
              {items.map((item, i) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <span className="truncate">{i+1}. {item.description || 'Consultation Service'}</span>
                  <span className="shrink-0 font-semibold">{item.amount.toLocaleString('en-IN')}.00</span>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-850 p-2 rounded-lg">
              <span>Grand Total:</span>
              <span>Rs. {totalAmount.toLocaleString('en-IN')}.00</span>
            </div>

            {/* Digital Sign Preview above line */}
            <div className="flex flex-col items-end pt-3">
              <div className="h-10 w-24 flex items-center justify-center overflow-hidden border border-slate-200/50 bg-white rounded p-0.5 relative">
                {sigType === 'type' ? (
                  <span className="font-serif italic font-bold text-slate-800 text-[10px] tracking-wide truncate w-full text-center">
                    {typedSignature || 'Signature'}
                  </span>
                ) : signatureImage ? (
                  <img src={signatureImage} alt="Live Signature" className="max-h-full object-contain" />
                ) : (
                  <span className="text-[7px] text-slate-350 italic">No signature</span>
                )}
              </div>
              <span className="h-0.5 w-24 bg-slate-300 dark:bg-slate-700 mt-1" />
              <span className="text-[7.5px] font-bold text-slate-500 uppercase mt-1">Authorized Sign</span>
            </div>

            {/* Notes */}
            <div className="text-[7.5px] text-slate-400 space-y-0.5 leading-relaxed">
              <p className="font-bold uppercase tracking-wider">Terms & Conditions:</p>
              {terms.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* --- DIGITAL SIGNATURE CANVAS MODAL --- */}
      {isSigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex h-14 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <PenTool className="h-4 w-4 text-blue-500" />
                Draw Digital Signature
              </h3>
              <button
                onClick={() => setIsSigModalOpen(false)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-450 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Canvas Area */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                Use your mouse cursor or touch finger to draw your signature inside the white board below:
              </p>

              <div className="border border-slate-200 dark:border-slate-800 bg-white rounded-xl overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full cursor-crosshair h-[200px]"
                />
              </div>

              {/* Action Buttons clear / save */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Eraser className="h-4 w-4 text-rose-500" />
                  Clear Drawing
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSigModalOpen(false)}
                    className="border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Save Signature
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
