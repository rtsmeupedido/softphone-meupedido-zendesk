import { useState, useEffect } from "react";
import { Tabs, MuiIcon } from "rtk-ux";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationTabs = () => {
    const [tabActive, setTabActive] = useState("home");
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        switch (location.pathname) {
            case "/historic":
                setTabActive("history");
                break;
            case "/home":
                setTabActive("home");
                break;
            case "/conference":
                setTabActive("conference");
                break;
            default:
                setTabActive("");
                break;
        }
    }, [location.pathname]);

    function onChangeTab(type: any) {
        setTabActive(type);
        switch (type) {
            case "logout":
                logout();
                break;
            case "history":
                navigate("/historic");
                break;
            case "home":
                navigate("/home");
                break;
            case "conference":
                navigate("/conference");
                break;
            default:
                break;
        }
    }

    const tabBarStyle = {
        background: tabActive === "home" ? "#130f40" : tabActive === "history" ? "#130f40" : tabActive === "conference" ? "#130f40" : "#130f40",
    };

    return (
        <Tabs
            className="sticky bottom-0 w-full"
            tabBarStyle={tabBarStyle}
            tabPosition="bottom"
            onChange={onChangeTab}
            centered
            items={[
                {
                    label: (
                        <div className="w-12 flex justify-center">
                            <MuiIcon className={tabActive === "home" ? "text-orange-500" : "text-white"} width={22} icon={["mui", "home"]} />
                        </div>
                    ),
                    key: "home",
                },
                {
                    label: (
                        <div className="w-12 flex justify-center">
                            <MuiIcon className={tabActive === "history" ? "text-orange-500" : "text-white"} width={22} icon={["mui", "history"]} />
                        </div>
                    ),
                    key: "history",
                },
                {
                    label: (
                        <div className="w-12 flex justify-center">
                            <MuiIcon className={tabActive === "conference" ? "text-orange-500" : "text-white"} width={22} icon={["mui", "star"]} />
                        </div>
                    ),
                    key: "conference",
                },
                {
                    label: (
                        <div className="w-12 flex justify-center">
                            <MuiIcon className="text-red-600" width={19} icon={["mui", "logout"]} />
                        </div>
                    ),
                    key: "logout",
                },
            ]}
        />
    );
};

export default NavigationTabs;
