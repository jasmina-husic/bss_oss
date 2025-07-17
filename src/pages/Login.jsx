import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      /* where user originally wanted to go */
      const dest = loc.state?.from?.pathname || "/";
      nav(dest, { replace: true });
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4"
      >
        <h1 className="text-lg font-semibold text-center">BSS/OSS Suite</h1>

        <label className="block text-sm">
          Username
          <input
            className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full border rounded p-2 focus:outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">
          Login
        </button>
      </form>
    </div>
  );
}
