/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as CryptoJS from "crypto-js";
import api, { checkAuth } from "../api";
import { useZaf } from "./useZaf";
import { Loader } from "rtk-ux";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../features/user/User";

interface AuthContextType {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    error: Error | null;
    token: string | null;
    organizationsId: string | undefined;
    uri: string | undefined;
    originator: string;
    setOriginator: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType>({
    login: async () => {},
    logout: () => {},
    loading: false,
    error: null,
    token: null,
    organizationsId: undefined,
    uri: undefined,
    originator: "",
    setOriginator: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [uri, setUri] = useState<string>("");
    const [error, setError] = useState<Error | null>(null);
    const [organizationsId, setOrganizationsId] = useState<string | undefined>(undefined);
    const [originator, setOriginator] = useState<string>("");
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

    const zafClient = useZaf();

    // let teste = "";
    // zafClient?.zafClient?.metadata().then(function (metadata: any) {
    //   console.log("metadata", metadata);
    //   if (metadata && metadata.settings && metadata.settings.apiToken) {
    //     teste = metadata.settings.apiToken;
    //     console.log("API Token:", teste);
    //   } else {
    //     console.log("API Token não encontrado.");
    //   }
    // });

    const login = async (email: string, password: any) => {
        password = CryptoJS.AES.encrypt(password, "bHVpc2ZsYXZpb0BydW50YXNrLmNvbTpMdWlzQDIwMjA=").toString();
        const data = JSON.stringify({ email, password });
        const config = {
            url: "https://api.oauth.runtask.com/api/func/get_url_by_zd?is_server=false",
            type: "POST",
            contentType: "application/json",
            data: data,
            headers: {
                Authorization: `Bearer {{setting.apiToken}}`,
            },
            secure: true,
        };

        setLoading(true);
        setError(null);

        try {
            const response: any = await zafClient.zafClient
                ?.request(config)
                .then((e: any) => {
                    return e;
                })
                .catch(() => {
                    return;
                });

            if (response?.data?.User && response?.data?.User._id) {
                api.defaults.baseURL = response?.data?.uri;
                api.defaults.headers.common["Authorization"] = `Bearer ${response?.data?.Token}`;

                localStorage.setItem("@name-softphone-zendesk", response?.data?.User.name);
                localStorage.setItem("@id-softphone-zendesk", response?.data?.User._id.toString());
                localStorage.setItem("@token-softphone-zendesk", response?.data?.Token);
                localStorage.setItem("@organizations_id-softphone-zendesk", response?.data?.User.organizations_id);
                localStorage.setItem("@uri-softphone-zendesk", response?.data?.uri);
                setUri(response?.data?.uri);
                dispatch(setUser(response?.data?.User));
                setOrganizationsId(response?.data?.User.organizations_id);
            } else {
                throw new Error("Invalid response data");
            }
        } catch (error) {
            setError(new Error("Login failed: " + (error as Error).message));
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        dispatch(setUser(null));
        setToken("");
        setOrganizationsId(undefined);
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("@name-softphone-zendesk");
        const savedUserId = localStorage.getItem("@id-softphone-zendesk");
        const getToken = localStorage.getItem("@token-softphone-zendesk");
        const getUri = localStorage.getItem("@uri-softphone-zendesk");

        if (savedUser && savedUserId && getToken && getUri) {
            setLoadingAuth(true);
            checkAuth(getToken)
                .then((isSuccess) => {
                    setLoadingAuth(false);
                    if (!isSuccess) {
                        logout();
                        return;
                    }
                    dispatch(setUser(isSuccess));
                    // @ts-ignore
                    setOrganizationsId(isSuccess?.organizations_id);
                    setToken(getToken);
                    setUri(getUri);
                    setToken(getToken);
                })
                .catch(() => {
                    setLoadingAuth(false);
                    logout();
                });
        } else {
            setLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        const interceptor = api.interceptors.request.use(
            (config) => {
                config.baseURL = localStorage.getItem("@uri-softphone-zendesk") || undefined;
                if (token) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                login,
                logout,
                loading,
                error,
                token,
                organizationsId,
                uri,
                originator,
                setOriginator,
            }}
        >
            {loadingAuth ? <Loader center /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
