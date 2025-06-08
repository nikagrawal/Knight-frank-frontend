# NPS Survey - Frontend

This is the React frontend for the NPS Survey Web Application. It allows users to register/login, create survey links, share them, collect one-time feedback (without storing personal data), and view personalized NPS dashboards.

## Features

* User registration and login using JWT
* Create unique survey links with optional campaign name and expiry date
* Share links via Email, WhatsApp, SMS, LinkedIn, Twitter/X, or system share
* One response per link (score 0–10 and optional comment)
* Dashboard with:

  * NPS Score
  * Promoters / Passives / Detractors counts
  * Filters by campaign and date
  * Bar and Line charts (Chart.js)

## Tech Stack

* React.js
* Axios for API calls
* Bootstrap for UI
* Chart.js for visualizations

## Setup Instructions

1. Open a terminal and go to the frontend folder:

   ```bash
   cd frontend/nps-survey-frontend
   ```

2. Install all required packages:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root folder and add this line:

   ```env
   REACT_APP_API_URL=http://127.0.0.1:8000/api/
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Visit the app in your browser:

   ```
   http://localhost:3000
   ```

## Build for Production

```bash
npm run build
```

## Notes

* Make sure the Django backend is running at the API URL.
* JWT is stored in `localStorage` and added to requests via `api.js`.
* Only active, unresponded links can be shared.
* All data is user-specific; no customer personal info is stored.
