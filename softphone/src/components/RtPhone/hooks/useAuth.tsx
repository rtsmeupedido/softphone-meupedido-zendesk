import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../api";

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  token: null,
  organizationsId: undefined,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [organizationsId, setOrganizationsId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("@name-softphone-zendesk");
    const savedUserId = localStorage.getItem("@id-softphone-zendesk");
    const getToken = localStorage.getItem("@token-softphone-zendesk");
    const getOrganizationsId = localStorage.getItem(
      "@organizations_id-softphone-zendesk"
    );
    if (savedUser && savedUserId && getToken && getOrganizationsId) {
      setUser({ name: savedUser, _id: Number(savedUserId) });
      setToken(getToken);
      setOrganizationsId(getOrganizationsId);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = JSON.stringify({ email, password });
    const config = {
      method: "post",
      url: "https://api.devel.runtask.com/auth/signin",
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await axios.request(config);
      // console.log("Response auth", response);
      if (response.data.User && response.data.User._id) {
        localStorage.setItem(
          "@name-softphone-zendesk",
          response.data.User.name
        );
        localStorage.setItem(
          "@id-softphone-zendesk",
          response.data.User._id.toString()
        );
        localStorage.setItem("@token-softphone-zendesk", response.data.Token);
        localStorage.setItem(
          "@organizations_id-softphone-zendesk",
          response.data.User.organizations_id
        );
        setUser(response.data.User);
        setOrganizationsId(response.data.User.organizations_id);
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
    setUser(null);
    setToken("");
    setOrganizationsId(undefined);
  };

  useEffect(() => {
    if (!token) return;
    // console.log("TOKEN", token);
    const interceptor = api.interceptors.request.use(
      (config) => {
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
      value={{ user, login, logout, loading, error, token, organizationsId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
