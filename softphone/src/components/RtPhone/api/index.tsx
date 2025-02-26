import axios from "axios";

const url = localStorage.getItem("@uri-softphone-zendesk") || undefined;

export const api = axios.create({
    baseURL: url,
});

// --------------- BEST ACTIONS ------------------
export const show = (datasource: string, data: any, type: string = "table"): any => {
    return new Promise((resolve) => {
        api.get(`/api/${datasource}/${Object.values(data)[0]}?field=${Object.keys(data)[0]}&$type=${type}`, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve(error?.response?.data);
            });
    });
};

export const list = (datasource?: string, data?: any, pagination?: any, type: string = "table", sort: any = null, getPagination: boolean = false, select: any[] = []): Promise<any> => {
    return new Promise((resolve) => {
        const requestData = {
            ...data,
            pagination: {
                ...pagination,
                size: pagination?.size || pagination?.pageSize,
                pageSize: pagination?.size || pagination?.pageSize,
            },
            sort,
            getPagination,
            type,
            select,
        };

        api.post(`/api/${datasource}/filter?$type=${type}`, requestData, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve(error?.response?.data);
            });
    });
};

export const update = (datasource?: string, data?: any, form: string | null = null, idField: string = "_id"): Promise<any> => {
    return new Promise((resolve) => {
        let url = `/api/${datasource}/${data?.[idField]}?field=${idField}`;
        if (form) {
            url += `&form=${form}`;
        }

        api.put(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve(error?.response?.data);
            });
    });
};

export const create = (datasource?: string, data?: any, form: string | null = null): Promise<any> => {
    return new Promise((resolve) => {
        let url = `/api/${datasource}`;
        if (form) {
            url += `?form=${form}`;
        }

        api.post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                resolve(error?.response?.data);
            });
    });
};

export const checkAuth = (token: string) => {
    return new Promise((resolve, reject) => {
        const url = "/auth/check";
        api.get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                if (response?.data?._id) {
                    resolve(response?.data);
                } else {
                    reject(false);
                }
            })
            .catch(() => {
                reject(false);
            });
    });
};

// --------------- BEST ACTIONS FUNC------------------

export const getPbxExtension = async (extension: string) => {
    try {
        const { success, data } = await show("tenant_extensions", {
            _id: extension,
        });
        if (!success) return;
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
};
export const getTenantSettings = async () => {
    try {
        const { success, data } = await show("local_settings", {
            keyname: "tenant_settings",
        });
        if (!success) return null;
        return data;
    } catch (err) {
        return null;
    }
};

//Traz as configurações de exibicao de acoes do ramal do usuário
export const getTenantSettingsOrganizationsId = async (organizationsid: string) => {
    try {
        const { success, data } = await show("tenant_settings", {
            organizations_id: organizationsid,
        });
        if (!success) return null;

        return data;
    } catch (err) {
        return null;
    }
};

export const getPbxSettings = async (organizationsid: string) => {
    try {
        if (!organizationsid) return null;
        const { success, data } = await show("tenant_settings", {
            organizations_id: organizationsid,
        });
        if (!success) return null;

        return data;
    } catch (err) {
        return null;
    }
};

export const getUserStatus = async () => {
    try {
        const { success, data } = await list("user_status", {}, null, "query");
        if (!success) {
            return null;
        }
        return data;
    } catch (err) {
        return null;
    }
};

export default api;
