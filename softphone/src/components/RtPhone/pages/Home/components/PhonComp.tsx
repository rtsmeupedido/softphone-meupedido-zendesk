import { ChangeEvent, useState } from "react";
import { Input, Row } from "antd";
import RoundedButton from "../../../components/RoundedButton";
import { numbers } from "../../../utils";
import { ColStyled } from "../../../styles/Dialler";
import { Icon } from "rtk-ux";

interface PhoneCompProps {
  sendCall?: (phone: string) => void;
  onChangeNewCall?: () => void;
}

export const PhoneComp = ({ sendCall, onChangeNewCall }: PhoneCompProps) => {
  const [phone, setPhone] = useState("");

  function onCall() {
    if (sendCall) {
      console.log("🚀 ~ onCall");
      sendCall(phone);
      if (onChangeNewCall) {
        onChangeNewCall();
      }
    }
  }

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
              onClick={() => setPhone((ph) => ph + char)}
            >
              {char}
            </RoundedButton>
          </ColStyled>
        ))}
        <ColStyled span={8}></ColStyled>
        <ColStyled span={8}>
          <RoundedButton theme="primary" onClick={onCall}>
            <Icon icon={["fas", "phone"]} fontSize={18} />
          </RoundedButton>
        </ColStyled>
        <ColStyled span={8}>
          <RoundedButton
            theme="ghost"
            onClick={() => setPhone((ph) => ph.slice(0, -1))}
          >
            <Icon icon={["fas", "delete-left"]} fontSize={24} />
          </RoundedButton>
        </ColStyled>
      </Row>
    </>
  );
};
