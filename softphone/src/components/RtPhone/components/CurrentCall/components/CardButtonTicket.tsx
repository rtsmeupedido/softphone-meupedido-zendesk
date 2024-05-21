import { Button, Col, Row } from "rtk-ux";
import { useZaf } from "../../../hooks/useZaf";
import { addTicket } from "../../../utils";
import { useAppSelector } from "../../../store/hooks";
import { format } from "date-fns";

interface Props {
  id: number;
  disabled: boolean;
  ticketId: number | undefined;
}

const CardButtonTicket = ({ disabled, ticketId, id }: Props) => {
  const { zafClient }: any = useZaf();

  const currentCall: any = useAppSelector((state) => state.softphone.data);

  const user_phone = currentCall?._remote_identity?._uri?._user;
  const display_name = currentCall?._remote_identity?._display_name;
  const date_and_time = currentCall?._start_time;
  const call_id = currentCall?._request?.ua?._registrator?._call_id;

  async function handleAdcTicket(id: number) {
    const ticket: any = await addTicket({
      subject: `Novo ticket: ${id}`,
      description: "Novo ticket criado atraves de uma ligacao no RT Phone",
      callDate: `${format(date_and_time, "dd/MM/yyyy HH:mm")}`,
      originPhoneNumber: user_phone,
      agentName: display_name,
      agentId: user_phone,
      callCode: call_id,
    });

    console.log(":rocket: ~ ticket:", ticket);

    if (ticket?.id) {
      zafClient?.invoke("routeTo", "ticket", ticket?.id);
    }
  }
  async function handleAdcTicketExist(ticketId: number | undefined) {
    // Depois, navega para o ticket
    zafClient?.invoke("routeTo", "ticket", ticketId);
  }

  return (
    <>
      <Row gutter={[8, 8]} justify={"center"} className="mt-4">
        <Col span={12}>
          <Button block type={"link"} onClick={() => handleAdcTicket(id)}>
            Novo ticket
          </Button>
        </Col>
        <Col span={12}>
          <Button
            block
            disabled={disabled}
            type="primary"
            onClick={() => handleAdcTicketExist(ticketId)}
          >
            Usar existente
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default CardButtonTicket;
