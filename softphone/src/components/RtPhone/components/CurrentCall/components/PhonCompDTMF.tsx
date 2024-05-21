import { ChangeEvent, useState } from "react";
import { Input, Row } from "antd";
import RoundedButton from "../../RoundedButton";
import { numbers } from "../../../utils";
import { ColStyled } from "../../../styles/Dialler";
import { Icon } from "rtk-ux";

interface PhonCompDTMFProps {
  session: any;
}

export const PhonCompDTMF = ({ session }: PhonCompDTMFProps) => {
  const [phone, setPhone] = useState("");

  const sendDTMF = (session: any, tone: any, duration = 160) => {
    const options = {
      duration: duration,
      extraHeaders: ["X-Foo: foo", "X-Bar: bar"],
      eventHandlers: {
        succeeded: function (e: any) {
          console.log("DTMF enviado com sucesso:", e);
        },
        failed: function (e: any) {
          console.log("Falha ao enviar DTMF:", e);
        },
      },
    };

    try {
      session.sendDTMF(tone, options);
      console.log(`DTMF ${tone} enviado com duração de ${duration} ms`);
    } catch (error) {
      console.error("Erro ao enviar DTMF:", error);
    }
  };

  const handleButtonClick = (char: string) => {
    setPhone((prevPhone) => {
      const newPhone = prevPhone + char;
      sendDTMF(session, char);
      return newPhone;
    });
  };

  return (
    <>
      <Input
        value={phone}
        variant="filled"
        className="text-center mb-4"
        size="large"
        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
          setPhone(ev.target.value)
        }
        placeholder="Digite o número"
      />
      <Row justify={"center"} className="px-12" gutter={[12, 12]}>
        {numbers.map((char) => (
          <ColStyled span={8} key={char}>
            <RoundedButton
              theme="secondary"
              onClick={() => handleButtonClick(char)}
            >
              {char}
            </RoundedButton>
          </ColStyled>
        ))}
        <ColStyled span={10}></ColStyled>
        <ColStyled span={8} hasMarginRight>
          <RoundedButton
            theme="ghost"
            onClick={() => setPhone((ph) => ph.slice(0, -1))}
          >
            <Icon icon={["fas", "delete-left"]} fontSize={30} />
          </RoundedButton>
        </ColStyled>
      </Row>
    </>
  );
};
