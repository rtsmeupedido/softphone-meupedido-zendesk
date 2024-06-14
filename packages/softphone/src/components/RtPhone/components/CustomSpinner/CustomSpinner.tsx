import styled from "styled-components";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 9999;
`;

const antIcon = (
  <LoadingOutlined style={{ fontSize: 24, color: "blue" }} spin />
);

interface LoadingProps {
  title?: string;
}

export const Loading = ({ title }: LoadingProps) => (
  <LoadingContainer>
    {title && <h1>{title}</h1>}
    <Spin indicator={antIcon} />
  </LoadingContainer>
);
