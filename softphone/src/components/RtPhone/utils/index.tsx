import axios from "axios";
import { Dispatch } from "redux";

import { setTicket, appendUser } from "../features/zendesk";

export const numbers = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
];

const ZDK_URL = import.meta.env.ZDK_URL;
const ZDK_TOKEN = import.meta.env.ZDK_TOKEN;

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getUsersZendesk = (phone: string) => {
  return async (dispatch: Dispatch, getState: () => any) => {
    const pbxExtension = getState().phone.pbxExtension;
    const phoneNumber = pbxExtension?.number;

    axios
      .get(
        `https://phone2b9237.zendesk.com/api/v2/users/search?query=phone:${phoneNumber}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${ZDK_TOKEN}`,
          },
        }
      )
      .then(({ data }: { data: { users: [] } }) => {
        console.log("🚀 ~ data:", data);
        dispatch(setTicket({ users: data.users }));
      })
      .catch((error) => {
        console.error("Failed to fetch users", error);
      });
  };
};

export const getUserTickets = async (userId: number) => {
  // &role=end-user
  return await axios
    .get(`${ZDK_URL}users/${userId}/tickets/requested`, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${ZDK_TOKEN}`,
      },
    })
    .then(({ data }: { data: { tickets: [] } }) => {
      return data.tickets;
    })
    .catch(() => {
      return [];
    });
};
export const getTicket = async (ticketId: number) => {
  // &role=end-user
  return await axios
    .get(`${ZDK_URL}tickets/${ticketId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${ZDK_TOKEN}`,
      },
    })
    .then(({ data }: { data: { ticket: any } }) => {
      return data.ticket;
    })
    .catch(() => {
      return [];
    });
};

export interface TicketInterface {
  subject: string;
  description: string;
  callDate?: string;
  originPhoneNumber?: string;
  agentId?: string;
  agentName?: string;
  callCode?: string;
}

export const addTicket = async (data: TicketInterface) => {
  const ticketData = {
    ticket: {
      subject: data.subject,
      description: data.description,
      comment: {
        html_body: data.callDate
          ? `<div style="font-family: Arial, sans-serif; color: #333; padding: 10px; margin: 10px; display: flex; flex-direction: column;">
          <div style="align-self: flex-start; font-size: 24px; color: green; font-weight: bold;">Runtask - Test</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Data e Hora:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;">${data.callDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Telefone de Origem:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;">${data.originPhoneNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Agente:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;">${data.agentId} - ${data.agentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Código da Ligação:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ccc;">${data.callCode}</td>
            </tr>
          </table>
        </div>`
          : undefined,
        public: false,
        author_id: data.agentId,
      },
    },
  };

  const config = {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${ZDK_TOKEN}`,
    },
  };

  return await axios
    .post(`${ZDK_URL}/tickets`, ticketData, config)
    .then((response) => {
      return response.data.ticket;
    })
    .catch((error) => {
      console.error("Erro ao criar ticket:", error);
      return false;
    });
};

export interface NewContact {
  name: string;
  email: string;
  phone: string | number;
}
export const addUsersZendesk = (data: NewContact) => {
  return async (dispatch: any) => {
    axios
      .post(
        `https://phone2b9237.zendesk.com/api/v2/users`,
        {
          user: { ...data, role: "end-user" },
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${ZDK_TOKEN}`,
          },
        }
      )
      .then(({ data }: { data: { user: any } }) => {
        if (data.user !== undefined && data.user !== null) {
          dispatch(appendUser(data.user));
        }
      });
  };
};
