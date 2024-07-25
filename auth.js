const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Example user (you would typically fetch this from a database)
const users = [
    { id: 1, username: 'user1', passwordHash: '$2a$10$4O7e81BChA5fWbHEbD.UC.PMwSPs5iQVXz/Q4hfA8/CTjofazw6D2' }
  ];
// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Check password using bcrypt
    bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
        if (err) {
            console.error('bcrypt error:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }
        
          if (!isMatch) {
            console.log('Password does not match:', password, user.passwordHash);
            return res.status(401).json({ message: 'Incorrect password' });
          }
        
          // Password is correct
          const payload = {
            id: user.id,
            username: user.username
          };
        
          // Sign token
          jwt.sign(payload, 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) {
              console.error('JWT error:', err);
              return res.status(500).json({ message: 'Error signing token', err });
            }
            res.json({ token });
      });
    });
  });
   
// Protected route
router.get('/protected', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Protected route',
        authData
      });
    }
  });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

module.exports = router;