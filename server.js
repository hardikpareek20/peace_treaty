require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/peace_treaty_v3';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose schema definition
const responseSchema = new mongoose.Schema({
  page_visited: { type: String, default: null },
  bribe_selected: { type: String, default: null },
  anger_slider_value: { type: Number, default: null },
  final_forgiveness_status: { type: Boolean, default: null },
  timestamp: { type: Date, default: Date.now }
});

const Response = mongoose.model('Response', responseSchema);

let mongoConnected = false;
const fallbackFilePath = path.join(__dirname, 'db_fallback.json');

// Helper to write to JSON fallback file
function saveToFallback(data) {
  try {
    let logs = [];
    if (fs.existsSync(fallbackFilePath)) {
      const content = fs.readFileSync(fallbackFilePath, 'utf8');
      logs = JSON.parse(content || '[]');
    }
    logs.push({ ...data, timestamp: new Date() });
    fs.writeFileSync(fallbackFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB ERROR] Failed to save:', err);
  }
}

// Helper to read from JSON fallback file
function getFromFallback() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const content = fs.readFileSync(fallbackFilePath, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error('[Fallback DB ERROR] Failed to read:', err);
  }
  return [];
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    mongoConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('MongoDB server offline or unreachable. Falling back to local JSON database (db_fallback.json)...');
    mongoConnected = false;
  });

// API endpoint to log interactions
app.post('/api/log-interaction', async (req, res) => {
  const { page_visited, bribe_selected, anger_slider_value, final_forgiveness_status } = req.body;
  const logData = { page_visited, bribe_selected, anger_slider_value, final_forgiveness_status };

  console.log('[API Log] Received interaction data:', logData);

  if (mongoConnected) {
    try {
      const newResponse = new Response(logData);
      await newResponse.save();
      return res.status(201).json({ success: true, db: 'mongodb', data: newResponse });
    } catch (err) {
      console.error('Error saving to MongoDB:', err);
      // fallback if mongo fails during save
      saveToFallback(logData);
      return res.status(201).json({ success: true, db: 'fallback', data: logData });
    }
  } else {
    saveToFallback(logData);
    return res.status(201).json({ success: true, db: 'fallback', data: logData });
  }
});

// API endpoint to retrieve all interactions (for live dashboard display)
app.get('/api/interactions', async (req, res) => {
  if (mongoConnected) {
    try {
      const data = await Response.find().sort({ timestamp: -1 }).limit(100);
      return res.json(data);
    } catch (err) {
      console.error('Error fetching from MongoDB:', err);
      const data = getFromFallback();
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.json(data.slice(0, 100));
    }
  } else {
    const data = getFromFallback();
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.json(data.slice(0, 100));
  }
});

app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`🚀 Project: Peace Treaty v3.0 server running on http://localhost:${PORT}`);
  console.log(`🔧 Live cybersecurity logs available via /api/interactions`);
  console.log(`=============================================================`);
});
