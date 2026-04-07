# Rotina Fácil

> **Note:** This is an open-source **Study Project** focused on practicing full-stack web development, interface design, and systems architecture.

Rotina Fácil (Portuguese for "Easy Routine") is a simple web application designed for personal routine and task management. It features a *Glassmorphism* aesthetic emulating Apple design language. The project is currently in the Minimum Viable Product (MVP) phase.

## Current Features
The application supports the following core operations:
- **Task Management MVP**: Support for Creating, Deleting, and Updating tasks logically integrated with a PostgreSQL backend database.
- **Authentication Flow**: Secure system featuring User Registration, Login generation, and JWT (JSON Web Tokens) persistence via localStorage.
- **Protected API Routes**: Backend middleware ensuring requests and task queries are strictly authenticated.

## Paused / Mocked Features
Certain features are visibly present in the layout but their functional implementations have been safely paused to maintain focus on the core MVP:
- **Calendar Navigation**: The calendar grids and day selections are currently UI interface mockups.
- **AI Assistant Integration**: The chat panel is styled and has mock interactions, but no active LLM backend processing is currently hooked up.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript. 
- **Backend**: Node.js, Express.js
- **Database / Security**: PostgreSQL, JSON Web Tokens, SHA512 hashing.

## How to run locally

1. **Clone the repository and enter the directory:**
   ```bash
   git clone https://github.com/dzhumsx/rotina-facil.git
   cd rotina-facil
   ```

2. **Backend Setup:**
   Ensure you have a `.env` file inside the `/server` folder containing your environment variables (`PORT`, `KEY` for the JWT, `TOKEN_GEN_KEY` and Postgres Database connection strings).
   ```bash
   cd server
   npm install
   node node.js
   ```
   *The server should run on `localhost:3000`.*

3. **Frontend Setup:**
   Launch the `client/index.html` file in your browser using any local server (e.g., *Live Server* extension in VS Code) to avoid CORS policy restrictions on local API fetches.

## Deployment (Railway VPS)

This project is optimized for deployment using [Railway](https://railway.app/) (Virtual Private Server / PaaS).

1. **Database:** Provision a PostgreSQL instance directly on Railway. Extract the provided connection string to use in your server.
2. **Backend:** Deploy this repository to a Railway service. Railway natively detects the Node.js environment. Ensure the Root Directory is set to `/server` and the Start Command is set to `node node.js`.
3. **Environment Variables:** In the Server's Railway dashboard, input all your required `.env` variables (`PORT`, `KEY`, `TOKEN_GEN_KEY`, and the Postgres database credentials).
4. **Frontend:** Your frontend can optionally be deployed via Netlify or Vercel, or statically. Make sure to update the `URL` constant inside `client/script.js` from `http://localhost:3000` to your new public Railway domain.
