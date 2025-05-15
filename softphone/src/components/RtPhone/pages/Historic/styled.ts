import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 8px;
    height: 100%;
    box-sizing: border-box;
`;

export const StickyHeader = styled.div`
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 16px;
    margin-bottom: 8px;
`;

export const Title = styled.p`
    font-size: 1rem;
    font-weight: 600;
`;

export const SearchResults = styled.div`
    margin-top: 12px;
    font-size: 0.875rem;
`;

export const ScrollableArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    flex: 1;
    width: 100%;
    min-height: 0;

    &::-webkit-scrollbar {
        display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
`;

export const ListItem = styled.div`
    display: flex;
    width: 100%;
    border-bottom: 1px solid #d1d5db;
    padding: 8px;
    cursor: pointer;
    &:hover {
        background-color: #f4f4f5;
        border-radius: 6px;
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const ItemDetails = styled.div`
    display: flex;
    width: 100%;
`;

export const ItemName = styled.p`
    font-size: 0.875rem;
`;
