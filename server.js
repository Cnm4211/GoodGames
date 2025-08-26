import express from 'express';
import bcrypt from 'bcrypt';
import pool from './db.js';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const RAWG_BASE_URL = 'https://api.rawg.io/api';



//SIGNUP
app.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing username, email, or password' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    
    try{
        //check if user exists
        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email.toLowerCase(), username]
        );

        if (existingUser.length > 0){
            return res.status(409).json({message: 'User with this email or username already exists'});
        }


        //hash password
        const passwordHash = await bcrypt.hash(password, 10);

        //insert into database
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email.toLowerCase(), passwordHash]
        );

        res.status(201).json({message: 'user created successfully', userId: result.insertId});
    }
    catch (err){
        console.error(err);
        res.status(500).json({message: 'Signup Failed', error: err.message});
    }
});

//LOGIN
app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try{
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?', [
                email.toLowerCase(),
        ]);
        
        if (rows.length === 0){
            return res.status(404).json({message: "Invalid credentials"});
        }

        const user = rows[0];


        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }

        res.json ({ message: "Login Successful", userId: user.id});

    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: 'Login Failed', error: err.message});
    }

});


//Rawg API routes

app.get('/games', async (req, res) => {
    const {search} = req.query;
    try{
        const response = await axios.get(`${RAWG_BASE_URL}/games`, {
            params: {
                key: process.env.RAWG_API_KEY,
                search: search,
                page_size: 5,
                page: 1,

            },
        });

        res.json(response.data);
    }
    catch (err){
        console.error(err);
        res.status(500).json({message: 'Failed to fetch games', error: err.message});
    }
});

//details about one game
app.get('/games/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const response = await axios.get(`${RAWG_BASE_URL}/games/${id}`, {
            params: {
                key: process.env.RAWG_API_KEY,
            },
        });

        res.json(response.data);
    }
    catch (err){
        console.error(err);
        res.status(500).json({message: 'Failed to fetch game details', error: err.message});
    }
});



//ROOT
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));