const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('work_status.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS work_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      is_at_work INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS breaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      break_name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

// Register endpoint
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Create initial work status record
      db.run(
        'INSERT INTO work_status (user_id, is_at_work) VALUES (?, ?)',
        [this.lastID, 1],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to create work status' });
          }
          res.json({ message: 'User registered successfully' });
        }
      );
    }
  );
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  });
});

// Get current work status (public)
app.get('/api/status', (req, res) => {
  db.get(
    `SELECT users.username, work_status.is_at_work, work_status.updated_at 
     FROM work_status 
     JOIN users ON work_status.user_id = users.id 
     ORDER BY work_status.updated_at DESC LIMIT 1`,
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'No work status found' });
      }

      const username = row.username;
      const userId = row.user_id;
      const isAtWork = row.is_at_work;
      const updatedAt = row.updated_at;

      // Check if currently on break
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                         now.getMinutes().toString().padStart(2, '0');

      db.all(
        `SELECT * FROM breaks WHERE user_id = ? AND is_active = 1`,
        [userId],
        (err, breaks) => {
          let onBreak = false;

          if (!err && breaks) {
            onBreak = breaks.some(b => currentTime >= b.start_time && currentTime <= b.end_time);
          }

          res.json({
            username: username,
            isAtWork: isAtWork === 1,
            onBreak: onBreak,
            updatedAt: updatedAt
          });
        }
      );
    }
  );
});

// Update work status (requires authentication)
app.post('/api/status', verifyToken, (req, res) => {
  const { isAtWork } = req.body;

  db.run(
    'UPDATE work_status SET is_at_work = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [isAtWork ? 1 : 0, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update status' });
      }
      res.json({ message: 'Status updated', isAtWork });
    }
  );
});

// Get all breaks for authenticated user
app.get('/api/breaks', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM breaks WHERE user_id = ? ORDER BY start_time',
    [req.userId],
    (err, breaks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch breaks' });
      }
      res.json(breaks || []);
    }
  );
});

// Create a break
app.post('/api/breaks', verifyToken, (req, res) => {
  const { breakName, startTime, endTime } = req.body;

  if (!breakName || !startTime || !endTime) {
    return res.status(400).json({ error: 'Break name, start time, and end time required' });
  }

  db.run(
    'INSERT INTO breaks (user_id, break_name, start_time, end_time) VALUES (?, ?, ?, ?)',
    [req.userId, breakName, startTime, endTime],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create break' });
      }
      res.json({ id: this.lastID, message: 'Break created' });
    }
  );
});

// Update a break
app.put('/api/breaks/:id', verifyToken, (req, res) => {
  const { breakName, startTime, endTime, isActive } = req.body;

  db.run(
    'UPDATE breaks SET break_name = ?, start_time = ?, end_time = ?, is_active = ? WHERE id = ? AND user_id = ?',
    [breakName, startTime, endTime, isActive ? 1 : 0, req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update break' });
      }
      res.json({ message: 'Break updated' });
    }
  );
});

// Delete a break
app.delete('/api/breaks/:id', verifyToken, (req, res) => {
  db.run(
    'DELETE FROM breaks WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete break' });
      }
      res.json({ message: 'Break deleted' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
