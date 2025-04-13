# WBOT - WhatsApp Reminder Bot for Stock Statements 📊📱

**Developed by:** Vivek Mishra  
**Role:** Credit Support Officer, SBI Malegaon

## 🔍 About
WBOT is an automation tool designed to:
- Send scheduled WhatsApp reminders to customers whose monthly stock statements are pending.
- Track submission status with timestamps.
- Auto-email reports to the designated branch email.
- Maintain a live Excel tracker for follow-ups.

## 📦 Features
- Reads customer data from `customers.xlsx`
- Sends personalized WhatsApp messages with a sample PDF
- Tracks who submitted and when
- Sends scheduled messages on 7th, 14th, 21st, 25th
- Auto-emails Excel tracker on 1st and 25th
- Archives monthly stock tracker files
- Intelligent response handling ("sent", "submitted", etc.)

## 📁 File Structure
WBOT/ ├── index.js # Main bot logic ├── emailSender.js # Email automation logic ├── customers.xlsx # Customer contact list ├── stock_status.xlsx # Submission tracker (auto-updated) ├── sample_stock.pdf # Sample stock statement to send ├── submitted_customers.json ├── submission_times.json ├── backup/ # Archived monthly trackers └── .gitignore # node_modules excluded


## 🛠️ Tech Stack
- Node.js
- whatsapp-web.js
- XLSX for Excel handling
- nodemailer for email scheduling
- node-cron for automation

## ⚙️ How to Use
```bash
git clone https://github.com/viks142993/WBOT.git
cd WBOT
npm install
node index.js
---
---

### ✅ Final Step
Run this after saving the file:

```bash
git add README.md
git commit -m "Added complete project README"
git push origin main


