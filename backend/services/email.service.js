const nodemailer = require('nodemailer');

exports.sendInvoiceEmail = async (to, invoiceNumber, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'shubhamjoshi.ce@gmail.com',
      pass: 'paxkplfpvsvcobtx'
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Invoice ${invoiceNumber} from VendorBridge`,
    text: `Please find attached your invoice ${invoiceNumber}.`,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};
