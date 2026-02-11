const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Google Sheets API setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'),
    scopes: SCOPES,
  });
  return auth.getClient();
}

// Save data to Google Sheet
app.post('/api/save-to-sheet', async (req, res) => {
  try {
    const { sheetId, header, rows } = req.body;

    if (!sheetId || !rows || rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing sheetId or rows data' 
      });
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Get the sheet
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetName = spreadsheet.data.sheets[0].properties.title;

    // Get current last row
    const range = `${sheetName}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const existingRows = response.data.values || [];
    const lastRow = existingRows.length;

    // If sheet is empty, add header first
    if (lastRow === 0 && header && header.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [header],
        },
      });
    }

    // Append rows
    const startRow = lastRow === 0 ? 2 : lastRow + 1;
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A${startRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });

    res.json({ 
      success: true, 
      message: `Data saved successfully. ${rows.length} row(s) added.` 
    });

  } catch (error) {
    console.error('Error saving to sheet:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to save data to Google Sheet' 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HRM Server is running' });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 HRM Server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure credentials.json is in the project folder`);
});
