const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'responses.json');

function readResponses() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8') || '[]';
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading responses:', err);
    return [];
  }
}

function writeResponses(responses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing responses:', err);
  }
}

function setupApi(app) {
  // Add a new survey response
  app.post('/api/responses', (req, res) => {
    const payload = req.body || {};

    // Basic validation: ensure we have at least a name and one answer
    if (!payload.name || !payload.answers) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const responses = readResponses();
    const newEntry = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      ...payload
    };
    responses.push(newEntry);
    writeResponses(responses);

    res.status(201).json({ success: true, id: newEntry.id });
  });

  // Return all survey responses
  app.get('/api/responses', (req, res) => {
    const responses = readResponses();
    res.json(responses);
  });

  // Clear all survey responses
  app.post('/api/responses/reset', (req, res) => {
    writeResponses([]);
    res.status(200).json({ success: true });
  });
}

module.exports = { setupApi };

