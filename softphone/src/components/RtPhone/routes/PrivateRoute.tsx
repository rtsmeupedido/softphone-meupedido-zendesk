import NavigationTabs from "../components/Tabs/NavigationTabs";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const user = useAppSelector((s) => s.user.data);

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
