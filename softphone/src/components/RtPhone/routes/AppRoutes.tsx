import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";

import LoginPage from "../pages/LoginPage";
import Dialler from "../components/Dialler";
import Historic from "../pages/Historic/Historic";

import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Dialler />
              </PrivateRoute>
            }
          />
          <Route
            path="/historic"
            element={
              <PrivateRoute>
                <Historic />
              </PrivateRoute>
            }
          />
          <Route
            path="/conference"
            element={
              <PrivateRoute>
                <Dialler />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
