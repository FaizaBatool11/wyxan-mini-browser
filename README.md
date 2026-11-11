# Mini Browser

A fictional browser application built as a full-stack project using Next.js, NestJS, MongoDB, and TypeScript.

Users can browse fictional websites stored in MongoDB, navigate between pages, manage browsing history for different people, search website content, and publish their own HTML websites.

## Features

- **People Selection:** Select a person to view their individual browsing history.
- **Fictional Website Navigation:** Open websites using fictional `.test` addresses.
- **Back and Forward Navigation:** Navigate between previously visited websites.
- **Browsing History:** View and revisit previously opened websites.
- **Website Search:** Search website content using keywords.
- **Publish Websites:** Create and publish websites using custom HTML.
- **HTML Sanitization:** Sanitize submitted HTML to prevent unsafe scripts and unwanted content from running.
- **MongoDB Storage:** Store people, websites, and browsing visits in MongoDB.
- **Seed Data:** Populate the database with demo people, websites, and browsing history.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- NestJS
- Node.js
- TypeScript
- MongoDB
- Mongoose
- Cheerio
- sanitize-html

## Project Structure

```text
wyxan-mini-browser/
│
├── backend/
│   ├── src/
│   │   ├── people/
│   │   ├── sites/
│   │   ├── visits/
│   │   ├── seed.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   └── package.json
│
└── README.md
```

## Prerequisites

Make sure you have the following installed:

- Node.js (22.x recommended)
- npm
- MongoDB Atlas account or a MongoDB database

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd wyxan-mini-browser
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure your MongoDB connection:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
```

### 3. Seed the Database

Run the following command inside the backend folder:

```bash
npm run seed
```

This will populate the database with demo people, websites, and browsing history.

### 4. Start the Backend

```bash
npm run start:dev
```

Backend runs at:

`http://localhost:4000`

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/people` | Get all people |
| POST | `/people` | Create a person |
| GET | `/sites` | Get all websites |
| POST | `/sites` | Publish a website |
| GET | `/sites/by-address?address=` | Find a website by address |
| GET | `/sites/search?keyword=` | Search website content |
| PATCH | `/sites?address=` | Update a website |
| POST | `/visits` | Save a browsing visit |
| GET | `/visits/person/:personId` | Get a person's browsing history |

## Important Notes

- This application uses fictional `.test` website addresses.
- Website content is stored in MongoDB and rendered inside a sandboxed iframe.
- External websites and real internet browsing are not supported.
- Submitted HTML is sanitized before storage and display.
- Actual environment variables and database credentials must never be committed to GitHub.

## Author

Developed as a Full Stack Developer assessment project.