import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setError('');

        try {
            const API_URL = `http://${window.location.hostname}:3000`;
            const response = await axios.post(`${API_URL}/api/login`, { username });
            onLogin(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1 className="title">Welcome</h1>
                <p className="subtitle">Join the conversation</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your name..."
                            autoFocus
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

                    <button type="submit" className="primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Joining...' : 'Enter Chat'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
