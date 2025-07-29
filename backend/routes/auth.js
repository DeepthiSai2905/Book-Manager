const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT configuration
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
  throw new Error('JWT_SECRET and JWT_EXPIRES_IN must be defined in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Hardcoded users (in a real app, this would be in a database)
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'user1', password: 'user123' }
];

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const user = users.find(u => u.username === username && u.password === password);
    console.log("User found:", user);
    if (!user) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        username: user.username
      }
    };

    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            username: user.username
          }
        });
      }
    );
    console.log("Login successful");
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
