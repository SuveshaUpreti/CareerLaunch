import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {!token ? <LandingPage onLogin={handleLogin} /> : <Dashboard onLogout={handleLogout} />}
    </div>
  );
}

export default App;
