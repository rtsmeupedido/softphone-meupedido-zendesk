import NavigationTabs from "../components/Tabs/NavigationTabs";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  return user ? (
    <>
      {children}
      <NavigationTabs />
    </>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
