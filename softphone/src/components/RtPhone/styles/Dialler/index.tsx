import { Col } from "rtk-ux";
import styled from "styled-components";

export const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

interface ColStyledProps {
    hasMarginRight?: boolean;
}
export const ColStyled = styled(Col)<ColStyledProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: ${({ hasMarginRight }) => (hasMarginRight ? "30px" : "0")};
`;
