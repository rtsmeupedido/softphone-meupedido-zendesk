import NavigationTabs from "../components/Tabs/NavigationTabs";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const user = useAppSelector((s) => s.user.data);

    return user ? (
        <>
            <div style={{ overflow: "auto", height: "calc(100% - 52px)" }} className="p-4">
                {children}
            </div>
            <NavigationTabs />
        </>
    ) : (
        <Navigate to="/" />
    );
};

export default PrivateRoute;
