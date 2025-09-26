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


//friend routes
router.post('/add/:friendId', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.params;

        if (friendId == req.user.userId) {
            return res.status(400).json({ message: "You can't friend yourself" });
        }

        // Check if relationship already exists
        const [existing] = await pool.query(
            'SELECT status FROM friendsList WHERE user_id=? AND friend_id=?',
            [req.user.userId, friendId]
        );

        if (existing.length > 0) {
            if (existing[0].status === 'accepted') {
                return res.status(400).json({ message: 'You are already friends' });
            }
            if (existing[0].status === 'pending') {
                return res.status(400).json({ message: 'Friend request already sent' });
            }
            if (existing[0].status === 'rejected') {
                return res.status(400).json({ message: 'Your request was rejected. Try again later.' });
            }
        }

        await pool.query(
            'INSERT INTO friendsList (user_id, friend_id, status) VALUES (?, ?, "pending")',
            [req.user.userId, friendId]
        );

        res.json({ message: 'Friend request sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send friend request', error: err.message });
    }
});

router.post('/accept/:friendId', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.params;

        // Update request sender row
        await pool.query(
            'UPDATE friendsList SET status="accepted" WHERE user_id=? AND friend_id=?',
            [friendId, req.user.userId]
        );

        // Ensure reciprocal row exists
        await pool.query(
            'INSERT INTO friendsList (user_id, friend_id, status) VALUES (?, ?, "accepted") ON DUPLICATE KEY UPDATE status="accepted"',
            [req.user.userId, friendId]
        );

        res.json({ message: 'Friend request accepted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to accept friend request', error: err.message });
    }
});

router.post('/reject/:friendId', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.params;

        await pool.query(
            'UPDATE friendsList SET status="rejected" WHERE user_id=? AND friend_id=?',
            [friendId, req.user.userId]
        );

        res.json({ message: 'Friend request rejected' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reject friend request', error: err.message });
    }
});

router.delete('/remove/:friendId', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.params;

        await pool.query(
            'DELETE FROM friendsList WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)',
            [req.user.userId, friendId, friendId, req.user.userId]
        );

        res.json({ message: 'Friend removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove friend', error: err.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.username, u.email, f.created_at
             FROM friendsList f
             JOIN users u ON f.friend_id = u.id
             WHERE f.user_id = ? AND f.status="accepted"`,
            [req.user.userId]
        );

        res.json({ results: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch friends', error: err.message });
    }
});

router.get('/pending', authenticateToken, async (req, res) => {
    try {
        const [incoming] = await pool.query(
            `SELECT u.id, u.username, u.email, f.created_at
             FROM friendsList f
             JOIN users u ON f.user_id = u.id
             WHERE f.friend_id=? AND f.status="pending"`,
            [req.user.userId]
        );

        res.json({ results: incoming });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch pending requests', error: err.message });
    }
});

router.get('/outgoing', authenticateToken, async (req, res) => {
    try {
        const [outgoing] = await pool.query(
            `SELECT u.id, u.username, u.email, f.created_at
             FROM friendsList f
             JOIN users u ON f.friend_id = u.id
             WHERE f.user_id=? AND f.status="pending"`,
            [req.user.userId]
        );

        res.json({ outgoing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch outgoing requests', error: err.message });
    }
});

router.get('/users/search', authenticateToken, async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ message: 'Username query required' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, username, email FROM users WHERE username LIKE ? AND id != ? LIMIT 20',
            [`%${username}%`, req.user.userId]
        );
        res.json({ results: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to search users', error: err.message });
    }
});

//fetch friends profile
router.get('/:friendId', authenticateToken, async (req, res) => {
    try{
        const {friendId} = req.params;

        const [rows] = await pool.query(
            
        )
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch friend profile', error: err.message });
    }
    
});

export default router;