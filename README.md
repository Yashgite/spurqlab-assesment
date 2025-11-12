SpurqLab - Candidate Submission App

Overview

This project is a simple full‑stack app where candidates:
- Fill a form and upload a PDF resume
- Record a short intro video in the browser
- Review everything, then submit to the backend

Tech Stack

- Client: React + Vite, React Router, Bootstrap
- Server: Node.js, Express, Multer (disk storage), Mongoose
- DB: MongoDB

Prerequisites

- Node.js 18+ and npm
- MongoDB (local mongod or MongoDB Atlas)

Project Structure

- client/ → React UI
- server/ → Express API

Setup

1) Server

- Create server/.env

PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>

- Install and run

cd server
npm install
npm run dev

- You should see:

✅ MongoDB Connected
🚀 Server running on port 5050

- Health check:

http://127.0.0.1:5050/health → { "ok": true }

2) Client

- Install and run

cd client
npm install
npm run dev

- App: http://localhost:5173
- The Vite proxy sends /api/* to http://127.0.0.1:5050 (configured in client/vite.config.js).

Key Flows

- Form → Video → Review:
  - Form: Validates inputs, stores text in sessionStorage, stores resume as an object URL + name
  - Video: Camera starts when you click Start, stops on Stop; video stored as object URL
  - Review: Displays data; on submit, reconstructs blobs and posts multipart/form-data to the backend

Backend Endpoints

- POST /api/candidates/register
  - multipart/form-data fields:
    - firstName, lastName, position, currentPosition, experience
    - resume: PDF file
    - video: webm file
  - Files saved to server/uploads/
  - MongoDB document saved in candidates collection

Common Issues & Fixes

- Connection refused (ERR_CONNECTION_REFUSED)
  - Server isn't running or wrong port. Start the server and verify /health. Ensure client proxy points to the same port (default 5050).

- net::ERR_CONNECTION_RESET
  - AV/VPN/Firewall may be terminating the TCP connection. Temporarily allow Node.js or disable to test.

- 500 Internal Server Error on submit
  - Check the server console for “Register error:” details (Mongo URI issues, file write permissions, etc.). Ensure server/uploads exists (it is created automatically) and Node can write to it.

- E11000 duplicate key error on email
  - The model defines a partial unique index on email so only actual strings are unique. If you previously created a non‑partial index, drop it once:

mongosh
use spurqlab
db.candidates.dropIndex("email_1")

Notes & Behavior

- Video/camera permissions: The app requests camera/mic only when Start is clicked and stops tracks on Stop and page unload.
- Storage: sessionStorage holds text fields and object URLs (resume/video) for the current session only.
- Success UX: On successful submit, the UI shows a friendly message and auto‑redirects home.

Customization

- Ports: Change PORT in server/.env and update the Vite proxy in client/vite.config.js accordingly.


Server

npm run dev     # nodemon server
npm start       # node server.js

Client

npm run dev     # Vite dev server

License

MIT



