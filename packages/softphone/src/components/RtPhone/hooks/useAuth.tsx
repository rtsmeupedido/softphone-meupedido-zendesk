import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../api";
import { useZaf } from "./useZaf";
import { Buffer } from "buffer";

interface UserType {
  name: string;
  _id: number;
}

interface AuthContextType {
  user: UserType | null;
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
  user: null,
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
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uri, setUri] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);
  const [organizationsId, setOrganizationsId] = useState<string | undefined>(
    undefined
  );
  const [originator, setOriginator] = useState<string>("");

  const zafClient = useZaf();

  useEffect(() => {
    const savedUser = localStorage.getItem("@name-softphone-zendesk");
    const savedUserId = localStorage.getItem("@id-softphone-zendesk");
    const getToken = localStorage.getItem("@token-softphone-zendesk");
    const getOrganizationsId = localStorage.getItem(
      "@organizations_id-softphone-zendesk"
    );
    const getUri = localStorage.getItem("@uri-softphone-zendesk");
    if (savedUser && savedUserId && getToken && getOrganizationsId && getUri) {
      setUser({ name: savedUser, _id: Number(savedUserId) });
      setToken(getToken);
      setOrganizationsId(getOrganizationsId);
      setUri(getUri);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const agent = await zafClient?.zafClient?.get("currentUser");
    console.log("Agent", agent);

    const auth =
      "Basic " + new Buffer(email + ":" + password).toString("base64");

    const config = {
      url: "https://api.oauth.runtask.com/api/func/get_url_by_zd",
      type: "POST",
      contentType: "application/json",
      data: {},
      headers: {
        Authorization: auth,
      },
      // secure: true,
    };

    setLoading(true);
    setError(null);

    try {
      const response: any = await zafClient.zafClient
        ?.request(config)
        .then((e) => {
          return e;
        })
        .catch(() => {
          return;
        });

      console.log("Response", response);
      if (response?.User && response?.User._id) {
        api.defaults.baseURL = response?.uri;
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response?.Token}`;

        localStorage.setItem("@name-softphone-zendesk", response?.User.name);
        localStorage.setItem(
          "@id-softphone-zendesk",
          response?.User._id.toString()
        );
        localStorage.setItem("@token-softphone-zendesk", response?.Token);
        localStorage.setItem(
          "@organizations_id-softphone-zendesk",
          response?.User.organizations_id
        );
        localStorage.setItem("@uri-softphone-zendesk", response?.uri);
        setUri(response?.uri);
        setUser(response?.User);
        setOrganizationsId(response?.User.organizations_id);
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
    localStorage.removeItem("@name-softphone-zendesk");
    localStorage.removeItem("@id-softphone-zendesk");
    localStorage.removeItem("@token-softphone-zendesk");
    localStorage.removeItem("@organizations_id-softphone-zendesk");
    localStorage.removeItem("@uri-softphone-zendesk");
    setUser(null);
    setToken("");
    setOrganizationsId(undefined);
  };

  useEffect(() => {
    if (!token) return;

    const interceptor = api.interceptors.request.use(
      (config) => {
        config.baseURL =
          localStorage.getItem("@uri-softphone-zendesk") || undefined;
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
        user,
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
