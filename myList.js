import express from 'express';
import pool from './db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

//verify JWT
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

router.post('/', authenticate, async (req, res) => {
    const { game_name, image, genre, platforms, release_year, rating } = req.body;

    try {
        await pool.query(
            'INSERT INTO gamesList (user_id, game_name, image, genre, platforms, release_year, rating) VALUES (?, ?, ?, ? ,? ,?, ?)',
            [req.user.userId, game_name, image, genre, platforms, release_year, rating]
        );
        res.status(200).json({ message: 'Game added to your list' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add game to your list', error: err.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM gamesList WHERE user_id = ?',
            [req.user.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

/*
to do
update games list to either include all values were displaying
or just to have one column for the enitre json

test
*/