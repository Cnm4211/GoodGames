import express from 'express';
import bcrypt from 'bcrypt';
import pool from './db.js';

const app = express();
app.use(express.json());

//SIGNUP
app.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing username, email, or password' });
    }
    
    
    try{
        //hash password
        const passwordHash = await bcrypt.hash(password, 10);

        console.log(username, email, passwordHash);
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


app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));