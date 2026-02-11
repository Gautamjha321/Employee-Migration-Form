# HRM Employee Form - Node.js Server Setup

## Step 1: Install Node.js
1. Download Node.js from https://nodejs.org/ (LTS version)
2. Install it
3. Open terminal/command prompt and verify:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Install Dependencies
Open terminal in your project folder and run:
```bash
npm install
```

## Step 3: Setup Google Sheets API

### A. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable **Google Sheets API**:
   - APIs & Services → Library
   - Search "Google Sheets API"
   - Click Enable

### B. Create Service Account
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Name: `hrm-sheets-service`
4. Click **Create and Continue**
5. Skip role (optional), click **Done**

### C. Create Key
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key → Create new key**
4. Choose **JSON**
5. Download the JSON file
6. **Rename it to `credentials.json`**
7. **Move it to your project folder** (same folder as server.js)

### D. Share Google Sheet with Service Account
1. Open your Google Sheet
2. Click **Share** button
3. Copy the **email** from `credentials.json` (look for `"client_email"` field)
   - Example: `hrm-sheets-service@your-project.iam.gserviceaccount.com`
4. Paste this email in the Share dialog
5. Give **Editor** permission
6. Click **Send**

## Step 4: Update Sheet ID in Your Form
1. Open your Google Sheet
2. Copy the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. In your webpage, open **Google Sheet Setup**
4. Paste the Sheet ID
5. **Server URL** will be: `http://localhost:3000/api/save-to-sheet` (already set)

## Step 5: Start the Server
```bash
npm start
```

Or for auto-restart on changes:
```bash
npm run dev
```

You should see:
```
🚀 HRM Server running on http://localhost:3000
📝 Make sure credentials.json is in the project folder
```

## Step 6: Open Your Form
Open `index.html` in browser or go to `http://localhost:3000`

## Troubleshooting

### "Cannot find module"
- Run `npm install` again

### "credentials.json not found"
- Make sure `credentials.json` is in the same folder as `server.js`
- Check the filename is exactly `credentials.json` (not `credentials.json.json`)

### "Permission denied" error
- Make sure you shared the Google Sheet with the service account email
- Check the service account has Editor access

### Port 3000 already in use
- Change PORT in `server.js`: `const PORT = process.env.PORT || 3001;`
- Or kill the process using port 3000

## Production Deployment
For production, deploy to:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **Vercel/Netlify**: For serverless (needs different setup)

Update the Server URL in your form to the deployed URL.
