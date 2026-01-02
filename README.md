# Wedding Gallery

This is a Next.js application that displays a wedding gallery populated by data from a Google Sheet (via Google Forms).

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration

You need to set up a Google Form and Google Apps Script to serve as the backend.

**👉 Please read [GOOGLE_SETUP.md](GOOGLE_SETUP.md) for detailed instructions.**

Once you have your Web App URL, update `app/page.js`:

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';
```

## Features

-   **Real-time updates**: Auto-refreshes every 10 seconds.
-   **Gallery Grid**: responsive layout for photos and messages.
-   **Modal View**: Click on images to view them in full screen.
-   **Loading State**: Elegant loading spinner.
