import { Routes, Route, HashRouter } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";

import LoginPage from "../pages/LoginPage";
import Dialler from "../components/Dialler";
import Historic from "../pages/Historic/Historic";

import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/index.html" element={<LoginPage />} />
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
      </HashRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
