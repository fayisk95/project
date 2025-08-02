import { Injectable } from '@angular/core';
import { ClientStatement } from '../client-statement/client-statement.component';

@Injectable({
    providedIn: 'root'
})
export class StatementPdfService {
    private companyInfo = {
        name: 'Your Company Name',
        logo: 'https://images.pexels.com/photos/1476880/pexels-photo-1476880.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        address: 'Your Company Address\nCity, State, ZIP\nCountry',
        phone: '+1 (555) 123-4567',
        email: 'info@yourcompany.com',
        website: 'www.yourcompany.com'
    };

    constructor() { }

    async generateStatementPDF(statement: ClientStatement): Promise<void> {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            throw new Error('Unable to open print window. Please check your popup blocker settings.');
        }

        const htmlContent = this.generateStatementHTML(statement);

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };
    }

    private generateStatementHTML(statement: ClientStatement): string {
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
    <title>Client Statement - ${statement.client.nameEn}</title>
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
        
        .statement-container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .statement-header {
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
        
        .statement-title {
            text-align: right;
            flex: 1;
        }
        
        .statement-title h1 {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .client-name {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .statement-date {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .statement-body {
            padding: 30px;
        }
        
        .client-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .client-details, .summary-details {
            flex: 1;
        }
        
        .client-details {
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
        
        .client-info-content {
            font-size: 14px;
            line-height: 1.6;
        }
        
        .client-info-content .client-name-display {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 14px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .summary-item.total {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            border-top: 2px solid #2563eb;
            border-bottom: none;
            padding-top: 15px;
            margin-top: 10px;
        }
        
        .products-section, .dues-section, .payments-section {
            margin-bottom: 40px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
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
            padding: 12px 15px;
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
        
        .status-cell {
            text-align: center;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-paid {
            background: #d1fae5;
            color: #059669;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #d97706;
        }
        
        .status-overdue {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .status-active {
            background: #d1fae5;
            color: #059669;
        }
        
        .status-inactive {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .statement-footer {
            background: #f8faff;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0f2fe;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .statement-container {
                border: none;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="statement-container">
        <div class="statement-header">
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
            <div class="statement-title">
                <h1>CLIENT STATEMENT</h1>
                <div class="client-name">${statement.client.nameEn}</div>
                <div class="statement-date">${formatDate(new Date())}</div>
            </div>
        </div>
        
        <div class="statement-body">
            <div class="client-info">
                <div class="client-details">
                    <div class="section-title">Client Information</div>
                    <div class="client-info-content">
                        <div class="client-name-display">${statement.client.nameEn}</div>
                        ${statement.client.nameAr ? `<div>${statement.client.nameAr}</div>` : ''}
                        <div>ID: ${statement.client.clientId}</div>
                        <div>${statement.client.address.replace(/\n/g, '<br>')}</div>
                        <div>Email: ${statement.client.email}</div>
                        <div>Phone: ${statement.client.contactNumber}</div>
                    </div>
                </div>
                
                <div class="summary-details">
                    <div class="section-title">Account Summary</div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>Total Dues:</span>
                            <span>${statement.summary.totalDues}</span>
                        </div>
                        <div class="summary-item">
                            <span>Active Dues:</span>
                            <span>${statement.summary.activeDues}</span>
                        </div>
                        <div class="summary-item">
                            <span>Paid Dues:</span>
                            <span>${statement.summary.paidDues}</span>
                        </div>
                        <div class="summary-item">
                            <span>Overdue:</span>
                            <span>${statement.summary.expiredDues}</span>
                        </div>
                        <div class="summary-item">
                            <span>Total Paid:</span>
                            <span>${formatCurrency(statement.summary.totalPaid)}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Outstanding Balance:</span>
                            <span>${formatCurrency(statement.summary.totalOutstanding)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="products-section">
                <div class="section-title">Subscribed Products & Services</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Product Name</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${statement.products.map(product => `
                        <tr>
                            <td>${product.productId}</td>
                            <td>${product.name}</td>
                            <td>${product.isRecurring ? `Recurring (${product.recurringFrequency})` : 'One-time'}</td>
                            <td class="amount-cell">${formatCurrency(product.paymentAmount)}</td>
                            <td class="status-cell">
                                <span class="status-badge status-${product.isActive ? 'active' : 'inactive'}">
                                    ${product.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="dues-section">
                <div class="section-title">Payment Dues</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Due ID</th>
                            <th>Product</th>
                            <th>Due Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${statement.dues.map(due => `
                        <tr>
                            <td>${due.dueId}</td>
                            <td>${due.productName}</td>
                            <td>${formatDate(due.dueDate)}</td>
                            <td class="amount-cell">${formatCurrency(due.amount)}</td>
                            <td class="status-cell">
                                <span class="status-badge status-${due.status}">
                                    ${due.status.charAt(0).toUpperCase() + due.status.slice(1)}
                                </span>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="payments-section">
                <div class="section-title">Payment History</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Reference</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${statement.payments.map(payment => `
                        <tr>
                            <td>${payment.paymentId}</td>
                            <td>${formatDate(payment.paymentDate)}</td>
                            <td>${payment.paymentMethod.replace('_', ' ')}</td>
                            <td>${payment.reference || '-'}</td>
                            <td class="amount-cell">${formatCurrency(payment.amount)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="statement-footer">
            <p>This statement was generated on ${formatDate(new Date())}</p>
            <p>For any queries, please contact us at ${this.companyInfo.email} or ${this.companyInfo.phone}</p>
        </div>
    </div>
</body>
</html>`;
    }

    updateCompanyInfo(companyInfo: Partial<typeof this.companyInfo>): void {
        this.companyInfo = { ...this.companyInfo, ...companyInfo };
    }

    getCompanyInfo() {
        return { ...this.companyInfo };
    }
}