const PDFDocument = require('pdfkit');

const generatePaymentReceiptPDF = (payment, user, society, maintenance) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors & Styling
      const primaryColor = '#2563EB';
      const darkText = '#1E293B';
      const mutedText = '#64748B';
      const lightBg = '#F8FAFC';
      const borderLine = '#E2E8F0';

      // Society Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill('#1E3A8A');

      doc.fillColor('#FFFFFF')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(society.name.toUpperCase(), 50, 30);

      doc.fontSize(9)
        .font('Helvetica')
        .text(`${society.address}, ${society.city}, ${society.state} - ${society.pincode}`, 50, 58)
        .text(`Email: ${society.contactEmail} | Phone: ${society.contactPhone}`, 50, 72);

      // Receipt Title Box
      doc.rect(400, 25, 160, 50).fillAndStroke('#FFFFFF', '#3B82F6');
      doc.fillColor(primaryColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('PAYMENT RECEIPT', 415, 38, { width: 130, align: 'center' });
      doc.fillColor(darkText)
        .fontSize(9)
        .font('Helvetica')
        .text(payment.receiptNumber || 'REC-2026-001', 415, 55, { width: 130, align: 'center' });

      // Receipt Meta Info
      let yPos = 130;
      doc.rect(50, yPos, 500, 75).fill(lightBg).stroke(borderLine);

      doc.fillColor(mutedText).fontSize(8).font('Helvetica-Bold').text('ISSUED TO:', 65, yPos + 12);
      doc.fillColor(darkText).fontSize(11).font('Helvetica-Bold').text(user.fullName, 65, yPos + 25);
      doc.fillColor(mutedText).fontSize(9).font('Helvetica')
        .text(`Flat: ${user.memberDetails?.wing ? 'Wing ' + user.memberDetails.wing + '-' : ''}${user.memberDetails?.flatNumber || 'N/A'} | Mobile: ${user.mobileNumber}`, 65, yPos + 42)
        .text(`Email: ${user.email}`, 65, yPos + 56);

      doc.fillColor(mutedText).fontSize(8).font('Helvetica-Bold').text('RECEIPT DETAILS:', 340, yPos + 12);
      doc.fillColor(darkText).fontSize(9).font('Helvetica')
        .text(`Date: ${new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 340, yPos + 25)
        .text(`Transaction ID: ${payment.transactionId || 'TXN-ONLINE'}`, 340, yPos + 40)
        .text(`Payment Mode: ${(payment.paymentMethod || 'Online').toUpperCase()}`, 340, yPos + 55);

      // Table Header
      yPos = 230;
      doc.rect(50, yPos, 500, 24).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
        .text('#', 65, yPos + 7)
        .text('DESCRIPTION', 100, yPos + 7)
        .text('BILLING PERIOD', 320, yPos + 7)
        .text('AMOUNT (INR)', 440, yPos + 7, { align: 'right', width: 95 });

      // Line Items
      yPos += 24;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const billPeriod = maintenance ? `${monthNames[maintenance.month - 1]} ${maintenance.year}` : 'Monthly Maintenance';

      doc.rect(50, yPos, 500, 30).fill('#FFFFFF').stroke(borderLine);
      doc.fillColor(darkText).fontSize(9).font('Helvetica')
        .text('1', 65, yPos + 10)
        .text(maintenance?.title || 'Society Maintenance Assessment', 100, yPos + 10)
        .text(billPeriod, 320, yPos + 10)
        .text(`₹${(payment.amount || 0).toLocaleString('en-IN')}`, 440, yPos + 10, { align: 'right', width: 95 });

      yPos += 30;

      if (payment.penaltyAmount && payment.penaltyAmount > 0) {
        doc.rect(50, yPos, 500, 30).fill(lightBg).stroke(borderLine);
        doc.fillColor(darkText).fontSize(9).font('Helvetica')
          .text('2', 65, yPos + 10)
          .text('Late Payment Penalty / Overdue Charge', 100, yPos + 10)
          .text('Penalty Assessment', 320, yPos + 10)
          .text(`₹${(payment.penaltyAmount || 0).toLocaleString('en-IN')}`, 440, yPos + 10, { align: 'right', width: 95 });
        yPos += 30;
      }

      // Summary Box
      yPos += 15;
      doc.rect(320, yPos, 230, 80).fill(lightBg).stroke(borderLine);
      doc.fillColor(mutedText).fontSize(9).font('Helvetica').text('Subtotal:', 335, yPos + 12);
      doc.fillColor(darkText).text(`₹${(payment.amount || 0).toLocaleString('en-IN')}`, 440, yPos + 12, { align: 'right', width: 95 });

      doc.fillColor(mutedText).text('Late Fee / Penalty:', 335, yPos + 28);
      doc.fillColor(darkText).text(`₹${(payment.penaltyAmount || 0).toLocaleString('en-IN')}`, 440, yPos + 28, { align: 'right', width: 95 });

      doc.rect(320, yPos + 46, 230, 34).fill('#1E293B');
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('Total Paid:', 335, yPos + 57);
      doc.text(`₹${(payment.paidAmount || payment.amount || 0).toLocaleString('en-IN')}`, 440, yPos + 57, { align: 'right', width: 95 });

      // Notes / Status Stamp
      doc.rect(50, yPos, 250, 80).fill('#F0FDF4').stroke('#86EFAC');
      doc.fillColor('#15803D').fontSize(10).font('Helvetica-Bold').text('STATUS: PAYMENT COMPLETED', 65, yPos + 15);
      doc.fillColor('#166534').fontSize(8).font('Helvetica')
        .text('Thank you for making your payment promptly.', 65, yPos + 32)
        .text('This is an electronically verified and generated receipt.', 65, yPos + 46)
        .text('No physical signature required.', 65, yPos + 58);

      // Footer
      const footerY = 680;
      doc.moveTo(50, footerY).lineTo(550, footerY).stroke(borderLine);
      doc.fillColor(mutedText).fontSize(8).font('Helvetica')
        .text(`Generated by Society Management System on ${new Date().toLocaleString('en-IN')}`, 50, footerY + 12, { align: 'center', width: 500 })
        .text('For queries regarding this receipt, please contact your society administrative committee.', 50, footerY + 24, { align: 'center', width: 500 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePaymentReceiptPDF };
