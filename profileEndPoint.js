import express from 'express';
import pool from './db.js'
import jwt from 'jsonwebtoken';

const router = express.Router();


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // { userId, userName }
        next();
    });
}


router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT username, email, created_at FROM users WHERE id = ?', 
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch user profile', error: err.message });
    }
});

export default router;