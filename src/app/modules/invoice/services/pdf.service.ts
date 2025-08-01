import { Injectable } from '@angular/core';
import { Invoice } from './invoice.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private companyInfo = {
    name: 'Your Company Name',
    logo: 'https://images.pexels.com/photos/1476880/pexels-photo-1476880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    address: 'Your Company Address\nCity, State, ZIP\nCountry',
    phone: '+1 (555) 123-4567',
    email: 'info@yourcompany.com',
    website: 'www.yourcompany.com'
  };

  constructor() {}

  async generateInvoicePDF(invoice: Invoice): Promise<void> {
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check your popup blocker settings.');
    }

    const htmlContent = this.generateInvoiceHTML(invoice);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }

  private generateInvoiceHTML(invoice: Invoice): string {
    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 40px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .invoice-header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 15px;
            border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .company-details {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.5;
        }
        
        .invoice-title {
            text-align: right;
            flex: 1;
        }
        
        .invoice-title h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .invoice-id {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .invoice-date {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .invoice-body {
            padding: 30px;
        }
        
        .billing-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .bill-to, .invoice-details {
            flex: 1;
        }
        
        .bill-to {
            margin-right: 40px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .client-info {
            font-size: 14px;
            line-height: 1.6;
        }
        
        .client-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .invoice-meta {
            font-size: 14px;
        }
        
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .meta-label {
            font-weight: 600;
            color: #666;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background: linear-gradient(135deg, #f8faff 0%, #e0f2fe 100%);
            color: #2563eb;
            font-weight: bold;
            padding: 15px;
            text-align: left;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table tr:hover {
            background-color: #f8faff;
        }
        
        .amount-cell {
            text-align: right;
            font-weight: 600;
        }
        
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        
        .totals-table {
            width: 300px;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        
        .totals-row.subtotal {
            border-bottom: 1px solid #eee;
        }
        
        .totals-row.tax {
            color: #666;
            border-bottom: 1px solid #eee;
        }
        
        .totals-row.total {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-top: 2px solid #2563eb;
            padding-top: 15px;
            margin-top: 10px;
        }
        
        .notes-section {
            background: #f8faff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin-bottom: 30px;
        }
        
        .notes-title {
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        
        .notes-content {
            font-size: 14px;
            line-height: 1.6;
            color: #666;
        }
        
        .invoice-footer {
            background: #f8faff;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0f2fe;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-draft {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .status-sent {
            background: #dbeafe;
            color: #2563eb;
        }
        
        .status-paid {
            background: #d1fae5;
            color: #059669;
        }
        
        .status-overdue {
            background: #fee2e2;
            color: #dc2626;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .invoice-container {
                border: none;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-info">
                <img src="${this.companyInfo.logo}" alt="Company Logo" class="company-logo">
                <div class="company-name">${this.companyInfo.name}</div>
                <div class="company-details">
                    ${this.companyInfo.address.replace(/\n/g, '<br>')}<br>
                    Phone: ${this.companyInfo.phone}<br>
                    Email: ${this.companyInfo.email}<br>
                    Website: ${this.companyInfo.website}
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-id">${invoice.invoiceId}</div>
                <div class="invoice-date">${formatDate(invoice.issueDate)}</div>
                <div style="margin-top: 15px;">
                    <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
                </div>
            </div>
        </div>
        
        <div class="invoice-body">
            <div class="billing-info">
                <div class="bill-to">
                    <div class="section-title">Bill To</div>
                    <div class="client-info">
                        <div class="client-name">${invoice.clientName}</div>
                        <div>${invoice.clientAddress.replace(/\n/g, '<br>')}</div>
                        <div>${invoice.clientEmail}</div>
                    </div>
                </div>
                
                <div class="invoice-details">
                    <div class="section-title">Invoice Details</div>
                    <div class="invoice-meta">
                        <div class="meta-row">
                            <span class="meta-label">Invoice Date:</span>
                            <span>${formatDate(invoice.issueDate)}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Due Date:</span>
                            <span>${formatDate(invoice.dueDate)}</span>
                        </div>
                        ${invoice.paidDate ? `
                        <div class="meta-row">
                            <span class="meta-label">Paid Date:</span>
                            <span>${formatDate(invoice.paidDate)}</span>
                        </div>
                        ` : ''}
                        <div class="meta-row">
                            <span class="meta-label">Status:</span>
                            <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                    <tr>
                        <td>
                            <strong>${item.productName}</strong>
                            ${item.description ? `<br><small style="color: #666;">${item.description}</small>` : ''}
                        </td>
                        <td>${formatDate(item.dueDate)}</td>
                        <td class="amount-cell">${formatCurrency(item.amount)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals-section">
                <div class="totals-table">
                    <div class="totals-row subtotal">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(invoice.subtotal)}</span>
                    </div>
                    ${invoice.tax > 0 ? `
                    <div class="totals-row tax">
                        <span>Tax (${invoice.taxRate}%):</span>
                        <span>${formatCurrency(invoice.tax)}</span>
                    </div>
                    ` : ''}
                    <div class="totals-row total">
                        <span>Total:</span>
                        <span>${formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>
            
            ${invoice.notes ? `
            <div class="notes-section">
                <div class="notes-title">Notes</div>
                <div class="notes-content">${invoice.notes}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="invoice-footer">
            <p>Thank you for your business!</p>
            <p>This invoice was generated on ${formatDate(new Date())}</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Method to update company information
  updateCompanyInfo(companyInfo: Partial<typeof this.companyInfo>): void {
    this.companyInfo = { ...this.companyInfo, ...companyInfo };
  }

  getCompanyInfo() {
    return { ...this.companyInfo };
  }
}