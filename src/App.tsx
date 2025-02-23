import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Reviews from "./components/Reviews";
import Favorites from "./components/Favorite";

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {!token ? (
          <LandingPage onLogin={handleLogin} />
        ) : (
          <>
            {/* Navigation Bar */}
            <nav className="bg-indigo-600 text-white p-4 shadow-md">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-7 h-7 text-white" />
                  <h1 className="text-xl font-bold">CareerLaunch</h1>
                </div>
                <div className="space-x-6">
                  <Link to="/" className="hover:underline">Dashboard</Link>
                  <Link to="/favorites" className="hover:underline">Favorites</Link>
                  <Link to="/reviews" className="hover:underline">Reviews</Link>
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/reviews" element={<Reviews />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
