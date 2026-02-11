const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return auth.getClient();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { sheetId, header, rows } = req.body;

    if (!sheetId || !rows || rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing sheetId or rows data',
      });
      return;
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
      range,
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

    res.status(200).json({
      success: true,
      message: `Data saved successfully. ${rows.length} row(s) added.`,
    });
  } catch (error) {
    console.error('Error saving to sheet (Vercel function):', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save data to Google Sheet',
    });
  }
};

