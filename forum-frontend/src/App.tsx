import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';

function App() {
  // Check if we already have a user saved in the browser
  const [user, setUser] = useState<string | null>(localStorage.getItem("username"));

  const handleLogin = (username: string) => {
    localStorage.setItem("username", username); // Save to browser memory
    setUser(username); // Update state to show the app
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUser(null);
  };

  // IF NOT LOGGED IN -> SHOW LOGIN SCREEN
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // IF LOGGED IN -> SHOW THE FORUM
  return (
    <Router>
        {/* Optional: Add a logout button somewhere, or just clear cache to test */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
             <span style={{ marginRight: 10, fontWeight: 'bold' }}>Hello, {user}!</span>
             <button onClick={handleLogout}>Logout</button>
        </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:id" element={<Home />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </Router>
  )
}

export default App