const express = require('express');
const path = require('path');
const { setupApi } = require('./app');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files (survey + analyst views)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// API routes
setupApi(app);

// Default route -> survey
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir,'..', 'index.html'));
});

// Analyst view route
app.get('/analyst', (req, res) => {
  res.sendFile(path.join(publicDir, '..', 'analyst.html'));
});

app.listen(PORT, () => {
  console.log(`Lab 6 server running on http://localhost:${PORT}`);
});

