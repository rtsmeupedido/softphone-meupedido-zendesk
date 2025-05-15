import { ChangeEvent, KeyboardEvent, useState } from "react";
import { Input, Row } from "antd";
import RoundedButton from "../../../components/RoundedButton";
import { numbers } from "../../../utils";
import { ColStyled } from "../../../styles/Dialler";
import { MuiIcon as Icon } from "rtk-ux";

interface PhoneCompProps {
    minimized?: boolean;
    sendCall?: (phone: string) => void;
    onChangeNewCall?: () => void;
}

export const PhoneComp = ({ sendCall, onChangeNewCall, minimized }: PhoneCompProps) => {
    const [phone, setPhone] = useState("");

    function onCall() {
        if (sendCall) {
            sendCall(phone);
            if (onChangeNewCall) {
                onChangeNewCall();
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            onCall();
        }
    }

    return (
        <>
            <Input
                value={phone}
                variant="filled"
                className={`text-center ${minimized ? "mb-2" : "mb-4"}`}
                size="large"
                onChange={(ev: ChangeEvent<HTMLInputElement>) => setPhone(ev.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite o número"
            />
            <Row justify={"center"} className="px-12 mx-0" gutter={[12, 12]}>
                {numbers.map((char) => (
                    <ColStyled span={8} key={char}>
                        <RoundedButton theme="secondary" onClick={() => setPhone((ph) => ph + char)}>
                            {char}
                        </RoundedButton>
                    </ColStyled>
                ))}
                <ColStyled span={8}></ColStyled>
                <ColStyled span={8}>
                    <RoundedButton theme="primary" onClick={onCall}>
                        <Icon icon={["mui", "phone"]} fontSize={"small"} />
                    </RoundedButton>
                </ColStyled>
                <ColStyled span={8}>
                    <RoundedButton theme="ghost" onClick={() => setPhone((ph) => ph.slice(0, -1))}>
                        <Icon icon={["mui", "backspace"]} fontSize="large" color="black" />
                    </RoundedButton>
                </ColStyled>
            </Row>
        </>
    );
};
