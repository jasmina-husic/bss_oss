import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  /* hydrate from localStorage */
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("bss_user");
    return stored ? JSON.parse(stored) : null;
  });

  function login(username, password) {
    /* demo creds: admin/admin   user/user */
    if (
      (username === "admin" && password === "admin") ||
      (username === "user" && password === "user")
    ) {
      const role = username === "admin" ? "admin" : "user";
      const u = { username, role };
      setUser(u);
      localStorage.setItem("bss_user", JSON.stringify(u));
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("bss_user");
  }

  /* keep in sync across tabs */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "bss_user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
