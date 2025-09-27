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


//profile routes
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const {userId} = req.params;
        const [rows] = await pool.query(
            'SELECT username, email, created_at FROM users WHERE id = ?',
            [userId]
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

router.get('/:userId/mygames', authenticateToken, async (req, res) => {
    const {userId} = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT Count(*) FROM gameslist WHERE user_id = ?',
            [userId]
        );

        res.json({ gameCount: rows[0] });


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch user games', error: err.message });
    }
});

router.get('/:userId/favoriteGenre', authenticateToken, async (req, res) => {
    const {userId} = req.params;
    try {
        const [rows] = await pool.query(
            `WITH split_genres AS (
                SELECT user_id,
                    TRIM(REGEXP_SUBSTR(genre, '[^,]+', 1, n)) AS single_genre
                FROM gameslist
                CROSS JOIN (
                    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
                ) AS numbers
                WHERE user_id = 2
                AND REGEXP_SUBSTR(genre, '[^,]+', 1, n) IS NOT NULL
            )
            SELECT single_genre AS genre
            FROM split_genres
            GROUP BY single_genre
            ORDER BY COUNT(*) DESC
            LIMIT 1`,
            [userId]
        );

        res.json({ favoriteGenre: rows[0] || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch favorite genre', error: err.message });
    }
});

router.get('/:userId/topTen', authenticateToken, async (req, res) => {
    const {userId} = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM top_ten WHERE user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



export default router;