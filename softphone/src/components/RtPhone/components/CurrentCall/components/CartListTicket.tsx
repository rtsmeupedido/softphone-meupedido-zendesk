import { useState, useEffect } from "react";
import { Button, Loader, Radio, Spin } from "rtk-ux";
import CardButtonTicket from "./CardButtonTicket";

import { format } from "date-fns";
import { useZaf } from "../../../hooks/useZaf";

interface Props {
    handleBackClick: () => void;
    userId: number;
}

const CartListTicket = ({ handleBackClick, userId }: Props) => {
    const [selectedTicket, setSelectedTicket] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [ticket, setTicket] = useState<any[]>([]);
    const { zafClient } = useZaf();

    const getUserTickets = async (userId: any) => {
        try {
            const response: any = await zafClient?.request({
                url: `/api/v2/users/${userId}/tickets/requested`,
                httpCompleteResponse: true,
                contentType: "application/json",
                method: "GET",
            });

            if (response?.responseJSON?.tickets && Array.isArray(response.responseJSON.tickets)) {
                return response.responseJSON.tickets;
            } else {
                console.error("Erro: Resposta da API não contém 'tickets'.", response);
                return [];
            }
        } catch (error: any) {
            console.error("Erro ao buscar tickets:", error.responseText || error.message);
            return [];
        }
    };

    useEffect(() => {
        async function fetchTicket() {
            const fetch = await getUserTickets(userId);

            setTicket(fetch);
            setIsLoading(false);
        }
        fetchTicket();
    }, [userId]);

    if (!ticket) {
        return (
            <div className="flex items-center justify-center min-h-60">
                <Spin size="large" />
            </div>
        );
    }
    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-1 flex-col gap-2">
                    Tickets associados:
                    {ticket && ticket.length > 0 ? (
                        ticket.map((t: any) => (
                            <div onClick={() => setSelectedTicket(t.id)} key={t.id} className="bg-zinc-100 border border-zinc-100 p-2 w-full px-3 rounded flex flex-col cursor-pointer hover:border-blue-600 transition-all">
                                <div className="flex items-center w-full">
                                    <Radio checked={selectedTicket === t.id} onChange={() => setSelectedTicket(t.id)} />
                                    <div className="flex flex-col flex-1 gap-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold">#{t.id}</span>
                                            <div className="flex w-full flex-1 justify-end text-xs text-zinc-600">{format(new Date(t.updated_at), "dd/MM/yyyy HH:mm")}</div>
                                        </div>
                                        <p>{t.subject}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center min-h-60">{isLoading ? <Loader spinning /> : <p className="text-sm">Usuário não possui ticket.</p>}</div>
                    )}
                </div>
                <div className="flex flex-col gap-2 pb-4">
                    <CardButtonTicket disabled={!selectedTicket} ticketId={selectedTicket} id={userId} />
                    <Button type="dashed" onClick={handleBackClick}>
                        Voltar
                    </Button>
                </div>
            </div>
        </>
    );
};

export default CartListTicket;
