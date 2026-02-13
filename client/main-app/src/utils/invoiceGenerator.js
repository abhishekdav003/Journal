export const generateInvoice = (transaction, user) => {
  const invoiceWindow = window.open("", "_blank");

  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${transaction.razorpayOrderId || "N/A"}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          background: #f5f5f5;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #6D28D9;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #6D28D9;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 5px;
        }
        .invoice-number {
          color: #666;
          font-size: 14px;
        }
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        .info-box h3 {
          color: #6D28D9;
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .info-box p {
          color: #333;
          margin: 5px 0;
          line-height: 1.6;
        }
        .course-details {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .course-details h3 {
          color: #6D28D9;
          margin-bottom: 15px;
          font-size: 16px;
        }
        .course-item {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .course-item:last-child {
          border-bottom: none;
        }
        .course-name {
          color: #333;
          font-weight: 500;
        }
        .course-price {
          color: #666;
          font-weight: 600;
        }
        .totals {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 16px;
        }
        .total-row.grand-total {
          font-size: 24px;
          font-weight: bold;
          color: #6D28D9;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #6D28D9;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-completed {
          background: #D1FAE5;
          color: #065F46;
        }
        .status-pending {
          background: #FEF3C7;
          color: #92400E;
        }
        .status-failed {
          background: #FEE2E2;
          color: #991B1B;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .print-button {
          background: #6D28D9;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 20px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .print-button:hover {
          background: #5B21B6;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .invoice-container {
            box-shadow: none;
            padding: 20px;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <button class="print-button" onclick="window.print()">🖨️ Print Invoice</button>
        
        <div class="header">
          <div class="logo">📚 Journal Academy</div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p class="invoice-number">#${transaction.razorpayOrderId?.slice(-8) || "N/A"}</p>
          </div>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Billed To:</h3>
            <p><strong>${user?.name || "N/A"}</strong></p>
            <p>${user?.email || "N/A"}</p>
          </div>
          <div class="info-box">
            <h3>Invoice Details:</h3>
            <p><strong>Date:</strong> ${new Date(
              transaction.createdAt,
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
            <p><strong>Status:</strong> 
              <span class="status-badge status-${transaction.status}">
                ${transaction.status.toUpperCase()}
              </span>
            </p>
            ${transaction.razorpayPaymentId ? `<p><strong>Payment ID:</strong> ${transaction.razorpayPaymentId}</p>` : ""}
          </div>
        </div>

        <div class="course-details">
          <h3>Course Details</h3>
          <div class="course-item">
            <div>
              <div class="course-name">${transaction.course?.title || "Course"}</div>
              <div style="color: #666; font-size: 14px; margin-top: 5px;">Online Course Access</div>
            </div>
            <div class="course-price">₹${transaction.amount.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${transaction.amount.toLocaleString("en-IN")}</span>
          </div>
          <div class="total-row">
            <span>Tax (GST 18%):</span>
            <span>₹${(transaction.amount * 0.18).toLocaleString("en-IN")}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>₹${(transaction.amount * 1.18).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for your purchase!</strong></p>
          <p>For any queries, please contact support@journalacademy.com</p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} Journal Academy. All rights reserved.</p>
        </div>
      </div>

      <script>
        // Auto-focus for better print experience
        window.addEventListener('load', () => {
          document.querySelector('.print-button').focus();
        });
      </script>
    </body>
    </html>
  `;

  invoiceWindow.document.write(invoiceHTML);
  invoiceWindow.document.close();
};
