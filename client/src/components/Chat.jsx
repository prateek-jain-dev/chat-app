import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function Chat({ user, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect to Socket.io
        const SERVER_URL = `http://${window.location.hostname}:3000`;
        socketRef.current = io(SERVER_URL);

        // Load history
        fetchHistory();

        // Listen for messages
        socketRef.current.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const API_URL = `http://${window.location.hostname}:3000`;
            const response = await axios.get(`${API_URL}/api/messages`);
            setMessages(response.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            user_id: user.id,
            username: user.username,
            content: newMessage
        };

        // Emit to socket (server will broadcast and save to DB)
        socketRef.current.emit('sendMessage', messageData);
        setNewMessage('');
    };

    return (
        <div className="chat-layout">
            <header className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #c084fc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 'bold'
                    }}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Global Chat</h2>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Logged in as {user.username}</p>
                    </div>
                </div>
                <button onClick={onLogout} style={{ background: 'transparent', color: '#94a3b8', padding: '0.5rem' }}>
                    Logout
                </button>
            </header>

            <div className="messages-area">
                {messages.map((msg, index) => {
                    const isSelf = msg.username === user.username; // Note: In real app use ID
                    return (
                        <div key={index} className={`message ${isSelf ? 'self' : 'other'}`}>
                            {!isSelf && <div className="message-user">{msg.username}</div>}
                            <div>{msg.content}</div>
                            <div className="message-meta">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" className="primary" style={{ padding: '0.75rem 1.5rem' }}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;
