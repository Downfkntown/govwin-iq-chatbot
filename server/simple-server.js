const express = require('express');
const cors = require('cors');
const SearchAssistanceFlow = require('../conversation-flows/search-assistance.js');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const searchFlow = new SearchAssistanceFlow();

app.get('/api/v1/system/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/v1/chat/message', (req, res) => {
  const { message } = req.body;
  const response = searchFlow.handleUserInput(message);
  res.json(response);
});

app.listen(port, () => {
  console.log(`Simple server running on http://localhost:${port}`);
});
