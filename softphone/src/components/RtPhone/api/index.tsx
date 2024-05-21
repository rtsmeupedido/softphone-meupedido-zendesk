import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
export const show = (
  datasource: string,
  data: any,
  type: string = "table"
): any => {
  return new Promise((resolve) => {
    api
      .get(
        `/api/${datasource}/${Object.values(data)[0]}?field=${
          Object.keys(data)[0]
        }&$type=${type}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error?.response?.data);
      });
  });
};

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
export const getTenantSettingsOrganizationsId = async (
  organizationsid: string
) => {
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

export default api;
