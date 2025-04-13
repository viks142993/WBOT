const nodemailer = require('nodemailer');
const path = require('path');


const sendEmail = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'stockstatementsbi@gmail.com',
      pass: 'aqvj rzkq etlj adol'
    }
  });

  const mailOptions = {
    from: '"Stock Reminder Bot" <stockstatementsbi@gmail.com>',
    to: 'stockstatementsbi@gmail.com',
    subject: '📊 Stock Statement Status - Auto Report',
    text: 'Please find attached the updated tracker for stock statement submission status.',
    attachments: [
      {
        filename: 'stock_status.xlsx',
        path: path.join(__dirname, 'submitted_customers.xlsx')
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to stockstatementsbi@gmail.com');
  } catch (err) {
    console.error('❌ Failed to send email:', err);
  }
};

module.exports = sendEmail;
