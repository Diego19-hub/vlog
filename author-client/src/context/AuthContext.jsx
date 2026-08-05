import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("authorToken"),
  );

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authorUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  function login(authData) {
    localStorage.setItem("authorToken", authData.token);
    localStorage.setItem(
      "authorUser",
      JSON.stringify(authData.user),
    );

    setToken(authData.token);
    setUser(authData.user);
  }

  function logout() {
    localStorage.removeItem("authorToken");
    localStorage.removeItem("authorUser");

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