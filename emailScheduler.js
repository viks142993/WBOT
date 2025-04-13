// 📦 Required modules
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');

// 📧 Email transport config (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'stockstatementsbi@gmail.com',
    pass: 'aqvj rzkq etlj adol', // App password
  },
});

// 📄 File to send
const filePath = './customers.xlsx';

// 📅 Schedule: 25th and 1st of every month at 10:00 AM
cron.schedule('0 10 1,25 * *', () => {
  if (fs.existsSync(filePath)) {
    const mailOptions = {
      from: 'stockstatementsbi@gmail.com',
      to: 'stockstatementsbi@gmail.com',
      subject: 'Monthly Stock Statement Submission Tracker',
      text: `Dear Officer,

Please find attached the latest customer stock statement submission tracker as on ${new Date().toLocaleDateString()}.

Regards,
Sasta GPT Bot`,
      attachments: [
        {
          filename: 'customers.xlsx',
          path: filePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Email failed:', error);
      } else {
        console.log('✅ Email sent:', info.response);
      }
    });
  } else {
    console.log('⚠️ Tracker file not found:', filePath);
  }
});


// 🔁 Force test email once immediately
if (fs.existsSync(filePath)) {
    const mailOptions = {
      from: 'stockstatementsbi@gmail.com',
      to: 'stockstatementsbi@gmail.com',
      subject: 'TEST: Monthly Stock Statement Submission Tracker',
      text: `Dear Officer,\n\nThis is a test email to confirm bot functionality.\n\nRegards,\nSasta GPT Bot`,
      attachments: [
        {
          filename: 'customers.xlsx',
          path: filePath,
        },
      ],
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Test email failed:', error);
      } else {
        console.log('✅ Test email sent:', info.response);
      }
    });
  }
  