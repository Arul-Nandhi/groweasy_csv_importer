# GrowEasy CRM CSV Importer Submission

This repository contains my submission for the Software Developer assignment at GrowEasy. It is a web application designed to import and map lead data from any CSV layout into the standardized GrowEasy CRM leads schema using AI mapping.

## Project Overview

The project consists of:
1. A Next.js frontend that allows uploading CSV files via drag-and-drop or browsing, parses the headers to display a local preview, and posts them to the backend API.
2. A Next.js Serverless API Route (`/api/import`) that communicates with the Google Gemini API (model `gemini-2.0-flash`, `gemini-1.5-flash`, or `gemini-1.5-flash-8b`) in JSON mode to map and sanitize name capitalizations and phone formats.
3. A Mock AI fallback mapping mechanism in the API route that preserves original values if the Gemini API Key is not set or if Gemini quota is exceeded, allowing the application to be tested immediately without key configuration or quota errors.

## Folder Structure

* `backend/` - Node.js Express server code, backend env file, and unit tests.
* `frontend/` - Next.js client, pages, components, and global styling.
* `sample_dataset/` - Contains `sample_file.csv` with 12 sample lead rows (8 valid, 4 invalid missing contacts) to verify status flows.
* `docker-compose.yml` - File to run both services together using Docker.

## Installation and Setup

### Running Locally

To run this project on your local machine, follow these steps:

#### 1. Setup the Backend
1. Open the terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend` folder and add your Gemini API Key:
   ```env
   PORT=5000
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```
   *(Note: If you leave the key blank, the application will use the Mock AI mapping mode so you can still test it).*
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:5000`.

#### 2. Setup the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:3000`. Open this address in your browser to view the application.

---

### Running with Docker

If you have Docker installed, you can launch both services together using a single command:

```bash
docker-compose up --build
```
This runs the frontend on port 3000 and the backend on port 5000.

---

### Running Unit Tests

I have written automated test assertions to verify phone formatting, initial letter capitalization, and the logic that skips leads missing both email and phone:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the test command:
   ```bash
   npm test
   ```

---

## Features Implemented

* Drag and drop CSV upload interface.
* Real-time local CSV data table preview before submission.
* Standardized leads display table with a search bar query filter.
* Lead Detailed Profiles modal to inspect individual CRM records.
* CSV exporter button to download the leads table database back to file.
* Toggle theme support for light and dark modes.
* Skip checks that mark rows missing contact data as "Skipped".
