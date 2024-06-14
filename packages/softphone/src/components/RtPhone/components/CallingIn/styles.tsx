import { Button } from "rtk-ux";
import styled from "styled-components";

export const ButtonStyleDecline = styled(Button)`
    border-radius: 0;
    &.ant-btn-default {
        background: rgb(220 38 38);
        border-color: rgb(220 38 38) !important;
        color: white !important;
        &:hover {
            background: rgb(185 28 28) !important;
            border-color: rgb(185 28 28) !important;
            color: white !important;
        }
    }
`;
export const ButtonStyleAccept = styled(Button)`
    border-radius: 0;
    &.ant-btn-default {
        background: rgb(34 197 94);
        border-color: rgb(34 197 94) !important;
        color: white !important;
        &:hover {
            background: rgb(22 163 74) !important;
            border-color: rgb(22 163 74) !important;
            color: white !important;
        }
    }
`;
