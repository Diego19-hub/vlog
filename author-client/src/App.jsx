import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PostFormPage from "./pages/PostFormPage.jsx";
import CommentsPage from "./pages/CommentsPage.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/posts/new" element={<PostFormPage />} />
            <Route
              path="/posts/:postId/edit"
              element={<PostFormPage />}
            />
            <Route
              path="/posts/:postId/comments"
              element={<CommentsPage />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;