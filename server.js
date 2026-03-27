const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

// Database connection (⚠️ localhost only works on your PC, not Render)
const db = mysql.createConnection({
  host: 'localhost', // change this to a cloud DB later
  user: 'root',
  password: 'Priyalaxmi@2008',
  database: 'portfolio_db'
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS // your Gmail App Password
  }
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
  
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    // ✅ Send email with Nodemailer
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Message saved but email failed" });
      }
      res.json({ success: true, id: result.insertId, emailId: info.messageId });
    });
  });
});

// ✅ Only one app.listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});