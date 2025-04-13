const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const xlsx = require('xlsx');
const cron = require('node-cron');
const path = require('path');
const sendEmail = require('./emailSender');

const workbook = xlsx.readFile('customers.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const customers = xlsx.utils.sheet_to_json(sheet);

const submittedPath = './submitted_customers.json';
const timeLogPath = './submission_times.json';
const trackerPath = './stock_status.xlsx';
const backupDir = './backup';

if (!fs.existsSync(submittedPath)) fs.writeFileSync(submittedPath, '[]');
if (!fs.existsSync(timeLogPath)) fs.writeFileSync(timeLogPath, '{}');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

let submittedCustomers = JSON.parse(fs.readFileSync(submittedPath));
let timeLog = JSON.parse(fs.readFileSync(timeLogPath));

const media = MessageMedia.fromFilePath('sample_stock.pdf');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: ['--start-maximized']
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ Bot is now connected to WhatsApp');
  await sendReminders();
});

cron.schedule('59 9 1 * *', () => {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'short' });
  const year = now.getFullYear();
  const backupName = `stock_status-${month}-${year}.xlsx`;
  const backupPath = path.join(backupDir, backupName);

  if (fs.existsSync(trackerPath)) {
    fs.copyFileSync(trackerPath, backupPath);
    console.log(`📁 Archived tracker to ${backupName}`);
  }
});

cron.schedule('0 10 1 * *', () => {
  fs.writeFileSync(submittedPath, JSON.stringify([]), 'utf-8');
  fs.writeFileSync(timeLogPath, '{}', 'utf-8');
  console.log('🧹 Cleared submitted list and timestamps for new month');
});

async function sendReminders() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const statusList = [];

  for (const customer of customers) {
    const number = customer.Number.toString().replace(/\D/g, '');
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
    const name = customer.Name || 'Unnamed';

    const isSubmitted = submittedCustomers.includes(chatId);
    const lastResponse = timeLog[chatId] || '—';

    statusList.push({
      Name: name,
      Number: number,
      Status: isSubmitted ? 'Submitted' : 'Pending',
      'Last Response Date': isSubmitted ? lastResponse : '—'
    });

    if (isSubmitted) continue;

    const msg = `Dear Sir,\n\nThis is a gentle reminder to kindly submit your stock statement for the previous month, if not already submitted.\n\nIn case you have already submitted the same, please disregard this message.\n\nPlease note that non-submission of stock statements within the stipulated timeframe may attract penal charges and could impact the operative status of your cash credit facility.\n\nThank you for your cooperation.\n\n— RM-SME, SBI Malegaon`;

    try {
      await client.sendMessage(chatId, msg);
      await client.sendMessage(chatId, media);
      console.log(`📩 Reminder sent to ${name}`);
    } catch (err) {
      console.log(`❌ Could not send to ${name} (${chatId})`);
    }
  }

  const newWb = xlsx.utils.book_new();
  const newWs = xlsx.utils.json_to_sheet(statusList);
  xlsx.utils.book_append_sheet(newWb, newWs, 'Status');
  xlsx.writeFile(newWb, trackerPath);
  console.log('📊 Excel tracker updated: stock_status.xlsx');
}

cron.schedule('0 10 7,14,21,25 * *', () => {
  console.log('⏰ Scheduled reminder running...');
  sendReminders();
});

client.on('message', async msg => {
  const text = msg.body.toLowerCase();
  const sender = msg.from;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const hardConfirm = ['sent', 'submitted', 'uploaded', 'mail done'];
  const softConfirm = ['will send', 'kal', 'bhej', 'ready', 'doing', 'soon', 'by evening'];
  const recheckPhrases = ['already sent', 'check once', 'i sent before', 'mail kiya', 'recheck'];

  if (hardConfirm.some(word => text.includes(word))) {
    if (!submittedCustomers.includes(sender)) {
      submittedCustomers.push(sender);
      fs.writeFileSync(submittedPath, JSON.stringify(submittedCustomers), 'utf-8');
    }
    timeLog[sender] = timestamp;
    fs.writeFileSync(timeLogPath, JSON.stringify(timeLog, null, 2), 'utf-8');

    await msg.reply("Thank you. We've noted your submission. You will not receive further reminders.");
    console.log(`✅ Hard confirmation from ${sender}`);
  } else if (recheckPhrases.some(phrase => text.includes(phrase))) {
    await msg.reply("Thank you. We’ll recheck and update our records accordingly if found.");
    console.log(`🔁 Recheck request from ${sender}`);
  } else if (softConfirm.some(word => text.includes(word))) {
    await msg.reply("Thank you for the update. Kindly ensure timely submission to avoid penal charges.");
    console.log(`🟡 Soft confirmation from ${sender}`);
  } else {
    console.log(`📨 Unknown message from ${sender}: ${text}`);
  }
});

client.initialize();

cron.schedule('1 10 1,25 * *', () => {
  console.log('📤 Sending scheduled email report...');
  sendEmail();
});