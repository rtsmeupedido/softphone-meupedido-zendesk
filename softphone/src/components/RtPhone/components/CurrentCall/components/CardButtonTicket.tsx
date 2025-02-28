import { Button, Col, Row } from "rtk-ux";
import { useZaf } from "../../../hooks/useZaf";
import { useAppSelector } from "../../../store/hooks";
import { format, isValid } from "date-fns";
import { useAuth } from "../../../hooks/useAuth";
import { useState } from "react";

interface Props {
    id: number;
    disabled: boolean;
    ticketId: number | undefined;
}

interface TicketInterface {
    subject: string;
    description: string;
    callDate?: string;
    originPhoneNumber?: string;
    agentId?: string;
    agentName?: string;
    callCode?: string;
}

interface TicketInterfaceUpdate {
    callDate?: string;
    originPhoneNumber?: string;
    agentId?: string;
    agentName?: string;
    callCode?: string;
}

const CardButtonTicket = ({ disabled, ticketId, id }: Props) => {
    const [loading, setLoading] = useState(false);
    const { zafClient }: any = useZaf();
    const { originator } = useAuth();

    const viaId = originator === "remote" ? 45 : 46;

    const currentCall: any = useAppSelector((state) => state.softphone.data);
    const user_phone = currentCall[0]?._remote_identity?._uri?._user || "Usuário Desconhecido";
    const display_name = currentCall[0]?._remote_identity?._display_name;
    const date_and_time = currentCall[0]?._start_time ? new Date(currentCall[0]._start_time) : null;
    const call_id = currentCall[0]._request.headers?.["X-Uniqueid"]?.[0]?.raw || "ID Desconhecido";
    const addTicket = async (data: TicketInterface) => {
        const agent = await zafClient?.get("currentUser");

        const ticketData = {
            ticket: {
                subject: data.subject,
                requester_id: id,
                assignee_id: agent.currentUser?.id,
                description: data.description,
                via_id: viaId,
                comment: {
                    html_body: data.callDate
                        ? `<div style="font-family: Arial, sans-serif; color: #333; padding: 10px; margin: 10px; display: flex; flex-direction: column;">
              <div style="align-self: flex-start; font-size: 24px; color: green; font-weight: bold;">Runtask</div>
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
                  <td style="padding: 8px; border-bottom: 1px solid #ccc;"> ${agent.currentUser?.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Código da Ligação:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ccc;">${data.callCode}</td>
                </tr>
              </table>
            </div>`
                        : undefined,
                    public: false,
                    author_id: agent.currentUser?.id,
                },
            },
        };

        try {
            const response = await zafClient.request({
                url: `/api/v2/tickets`,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(ticketData),
            });

            if (response.ticket) {
                return response.ticket;
            }

            if (response.responseJSON && response.responseJSON.ticket) {
                return response.responseJSON.ticket;
            }
            return undefined;
        } catch (error: any) {
            console.error("Erro ao criar ticket:", error.responseText || error.message);
            return false;
        }
    };

    const updateTicket = async (data: TicketInterfaceUpdate) => {
        const agent = await zafClient?.get("currentUser");
        const ticketData = {
            ticket: {
                via_id: viaId,
                comment: {
                    html_body: data.callDate
                        ? `<div style="font-family: Arial, sans-serif; color: #333; padding: 10px; margin: 10px; display: flex; flex-direction: column;">
              <div style="align-self: flex-start; font-size: 24px; color: green; font-weight: bold;">Runtask</div>
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
                  <td style="padding: 8px; border-bottom: 1px solid #ccc;"> ${agent.currentUser?.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Código da Ligação:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ccc;">${data.callCode}</td>
                </tr>
              </table>
            </div>`
                        : undefined,
                    public: false,
                    author_id: agent.currentUser?.id,
                },
            },
        };

        try {
            const response = await zafClient.request({
                url: `/api/v2/tickets/${ticketId}.json`,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(ticketData),
            });

            if (response.ticket) {
                return response.ticket;
            }

            if (response.responseJSON && response.responseJSON.ticket) {
                return response.responseJSON.ticket;
            }
            return undefined;
        } catch (error: any) {
            console.error("Erro ao criar ticket:", error.responseText || error.message);
            return false;
        }
    };

    async function handleAdcTicket(id: number) {
        try {
            setLoading(true);
            const formattedDate = date_and_time && isValid(date_and_time) ? format(date_and_time, "dd/MM/yyyy HH:mm") : "Data inválida";
            const ticket: any = await addTicket({
                subject: `Novo ticket: ${id}`,
                description: "Novo ticket criado através de uma ligação no RT Phone",
                callDate: formattedDate,
                originPhoneNumber: user_phone,
                agentName: display_name ? display_name : user_phone,
                agentId: user_phone,
                callCode: call_id,
            });
            setLoading(false);
            if (ticket && ticket.id) {
                zafClient?.invoke("routeTo", "ticket", ticket.id);
            } else {
                console.error("Erro: Ticket não foi criado corretamente.");
            }
        } catch (error) {
            setLoading(false);
        }
    }

    async function handleAdcTicketExist(ticketId: number | undefined) {
        zafClient?.invoke("routeTo", "ticket", ticketId);
        const formattedDate = date_and_time && isValid(date_and_time) ? format(date_and_time, "dd/MM/yyyy HH:mm") : "Data inválida";

        await updateTicket({
            callDate: formattedDate,
            originPhoneNumber: user_phone,
            agentName: display_name ? display_name : user_phone,
            agentId: user_phone,
            callCode: call_id,
        });
    }

    return (
        <>
            <Row gutter={[8, 8]} justify={"center"} className="mt-4">
                <Col span={12}>
                    <Button block loading={loading} type={"link"} onClick={() => handleAdcTicket(id)}>
                        Novo ticket
                    </Button>
                </Col>
                <Col span={12}>
                    <Button block disabled={disabled} type="primary" onClick={() => handleAdcTicketExist(ticketId)}>
                        Usar existente
                    </Button>
                </Col>
            </Row>
        </>
    );
};

export default CardButtonTicket;
