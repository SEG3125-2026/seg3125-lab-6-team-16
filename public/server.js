const express = require('express');
const path = require('path');
const { setupApi } = require('./app');

const app = express();
const PORT = process.env.PORT || 3000;

// Project root (one level up from public/) – index.html & analyst.html live here so the link works
const projectRoot = path.join(__dirname, '..');
// Static assets (css, js) live in public/
const publicDir = path.join(projectRoot, 'public');

app.use(express.json());
app.use(express.static(publicDir));

setupApi(app);

// Serve index.html from project root (required for assignment link)
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/analyst', (req, res) => {
  res.sendFile(path.join(projectRoot, 'analyst.html'));
});

app.listen(PORT, () => {
  console.log(`Lab 6 server running on http://localhost:${PORT}`);
});

