# Installation & Setup Guide

## Quick Start (5 minutes)

### 1. **Clone the Repository**
```bash
git clone https://github.com/Ayuumobutinschool/isAtWork.git
cd isAtWork
```

### 2. **Install Dependencies**
```bash
npm install
```
This installs all required packages (Express, SQLite, bcryptjs, etc.)

### 3. **Create Environment File**
```bash
cp .env.example .env
```
The `.env` file contains:
- `PORT=3000`
- `SECRET_KEY=your-super-secret-key-change-this-in-production`
- `NODE_ENV=development`

### 4. **Start the Server**
```bash
npm run dev
```
You should see:
```
Connected to SQLite database
Server running on http://localhost:3000
```

### 5. **Open in Browser**
Go to: **http://localhost:3000**

---

## 🎯 How to Use

### **First Time Setup:**

1. **Register an Account**
   - Click "Login" button
   - Click "Register here" link
   - Create username & password
   - Register

2. **Login**
   - Go back to login page
   - Enter your credentials
   - You'll be redirected to Dashboard

3. **Mark Yourself at Work**
   - Click "Mark At Work" button
   - Check public page (http://localhost:3000) to see status

4. **Add Breaks**
   - In Dashboard, go to "Breaks" section
   - Enter break name (e.g., "Lunch", "Coffee")
   - Set start time (e.g., 12:00)
   - Set end time (e.g., 13:00)
   - Click "Add Break"
   - During break time, public page shows "☕ ON BREAK"

### **Public Page**
Anyone can visit http://localhost:3000 to see:
- Your current status (✓ AT WORK, ☕ ON BREAK, ✗ NOT AT WORK)
- Last updated time
- Your username

---

## 📁 Project Structure

```
isAtWork/
├── server.js              # Backend server
├── package.json           # Dependencies
├── .env                   # Configuration (after setup)
├── work_status.db         # Database (auto-created)
└── public/
    ├── index.html         # Public status page
    ├── login.html         # Login page
    ├── register.html      # Registration page
    ├── dashboard.html     # Your control panel
    ├── app.js             # Shared JavaScript
    └── styles.css         # Styling
```

---

## 🔒 Change Your Secret Key (Important!)

Edit `.env` and change:
```
SECRET_KEY=your-super-secret-key-change-this-in-production
```
To something random like:
```
SECRET_KEY=aB3xYzK9mN2pQ7wL5vR4tU8sJ6hF1gD0
```

---

## 🐛 Troubleshooting

**"npm not found"**
- Install Node.js from https://nodejs.org/

**"Port 3000 already in use"**
- Change PORT in `.env` to 3001, 3002, etc.

**"Database locked"**
- Close other instances of the app and restart

**"CORS errors"**
- Make sure backend is running on localhost:3000

---

## 📦 What Gets Installed

```bash
npm install
```

Installs:
- **express** - Web server
- **sqlite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication tokens
- **cors** - Allow cross-origin requests
- **dotenv** - Environment variables
- **nodemon** - Auto-restart on code changes (dev)

---

## 🚀 Next Steps

Once running:
1. Test with multiple accounts
2. Deploy to cloud (Heroku, Railway, Vercel)
3. Add your own branding/customization
4. Share the public URL with others

Enjoy! 🎉
