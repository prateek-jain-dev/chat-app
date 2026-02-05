const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in dev
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// API Endpoints

// Login / Register
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    const queryCheck = 'SELECT * FROM users WHERE username = ?';
    db.query(queryCheck, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            return res.json(results[0]);
        } else {
            const queryInsert = 'INSERT INTO users (username) VALUES (?)';
            db.query(queryInsert, [username], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: result.insertId, username, created_at: new Date() });
            });
        }
    });
});

// Get Messages
app.get('/api/messages', (req, res) => {
    const query = `
    SELECT messages.id, messages.content, messages.created_at, users.username 
    FROM messages 
    JOIN users ON messages.user_id = users.id 
    ORDER BY messages.created_at ASC
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('sendMessage', (data) => {
        // data: { user_id, content, username }
        const { user_id, content, username } = data;
        const query = 'INSERT INTO messages (user_id, content) VALUES (?, ?)';

        db.query(query, [user_id, content], (err, result) => {
            if (err) {
                console.error('Error saving message:', err);
                return;
            }

            const message = {
                id: result.insertId,
                user_id,
                content,
                username,
                created_at: new Date()
            };

            io.emit('receiveMessage', message);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
