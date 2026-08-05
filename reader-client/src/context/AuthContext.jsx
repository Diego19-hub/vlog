import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("blogToken"),
  );

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("blogUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  function login(authData) {
    localStorage.setItem("blogToken", authData.token);
    localStorage.setItem(
      "blogUser",
      JSON.stringify(authData.user),
    );

    setToken(authData.token);
    setUser(authData.user);
  }

  function logout() {
    localStorage.removeItem("blogToken");
    localStorage.removeItem("blogUser");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider",
    );
  }

  return context;
}