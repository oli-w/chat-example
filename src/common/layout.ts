import styled from 'styled-components';

export const Col = styled.div<{ $alignItems?: 'start' | 'center' }>`
    display: flex;
    flex-direction: column;
    gap: 10px;
    ${({ $alignItems }) => ($alignItems ? `align-items: ${$alignItems};` : null)};
`;
export const Row = styled.div<{ $wrap?: boolean; $center?: boolean; $justifyContent?: 'space-between' }>`
    display: flex;
    flex-direction: row;
    gap: 10px;
    ${({ $wrap = true }) => ($wrap ? 'flex-wrap: wrap;' : null)};
    ${({ $center = false }) => ($center ? 'align-items: center;' : null)};
    ${({ $justifyContent = null }) => ($justifyContent ? `justify-content: ${$justifyContent};` : null)};
`;
export const Box = styled.div`
    border: solid 1px #ccc;
    padding: 5px;
`;
