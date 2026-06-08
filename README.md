# isAtWork

A simple website to display your work status with authentication, break scheduling, and real-time updates.

## Features

- 🔐 **Secure Login** - Authentication to mark yourself as working
- 📊 **Live Status Display** - Public page shows if you're currently at work
- ⏰ **Break Management** - Configure scheduled break times when you're not available
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔄 **Real-time Updates** - Status updates instantly

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/Ayuumobutinschool/isAtWork.git
cd isAtWork
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
isAtWork/
├── backend/           # Express API server
├── frontend/          # React frontend
├── public/            # Static assets
└── docs/              # Documentation
```

## Usage

1. **Login Page**: Navigate to the login page and authenticate
2. **Dashboard**: After login, you'll see a dashboard to:
   - Mark yourself as "At Work" or "Not at Work"
   - Configure break times
   - View your work schedule
3. **Public Status**: Anyone can visit `/status` to see if you're currently working

## Tech Stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: HTML/CSS/JavaScript (or React)
- **Database**: SQLite for simple local storage
- **Deployment**: GitHub Pages + GitHub Actions

## License

MIT
