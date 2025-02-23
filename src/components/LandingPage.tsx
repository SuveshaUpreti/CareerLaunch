import React, { useState } from "react";
import { Rocket, LogIn, UserPlus, CheckCircle, XCircle } from "lucide-react";

interface LandingPageProps {
  onLogin: (token: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleAuth = async (isLogin: boolean) => {
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5001/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        onLogin(data.token);
      } else {
        setMessage({ type: "success", text: "✔️ Registered Successfully! Now please press sign in." });
        setTimeout(() => setIsLoginMode(true), 2000); // Auto-switch to login after 2 seconds
      }
    } catch (err: any) {
      setMessage({ type: "error", text: `❌ ${err.message}` });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="w-12 h-12 text-indigo-600" />
          <h1 className="text-4xl font-bold text-indigo-600">CareerLaunch</h1>
        </div>
        <p className="text-xl text-gray-600">Your AI-Powered Career Companion</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
          {isLoginMode ? "Sign In" : "Register"}
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ✅ Display Messages */}
          {message && (
            <div className={`p-2 text-sm text-center rounded-md ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.type === "success" ? <CheckCircle className="inline w-4 h-4 mr-1" /> : <XCircle className="inline w-4 h-4 mr-1" />}
              {message.text}
            </div>
          )}

          {/* ✅ Buttons */}
          <button
            onClick={() => handleAuth(true)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>

          <button
            onClick={() => handleAuth(false)}
            className="w-full flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
