import { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for persisted session (optional enhancement, skipping for now)
  }, []);

  return (
    <>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <Chat user={user} onLogout={() => setUser(null)} />
      )}
    </>
  );
}

export default App;
