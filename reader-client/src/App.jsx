import {
  BrowserRouter,
  Route,
  Routes,
  Link,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/posts/:postId"
            element={<PostDetailPage />}
          />
          <Route
            path="*"
            element={
              <p className="status error">
                Página no encontrada
              </p>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;