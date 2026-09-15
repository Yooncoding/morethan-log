import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { zIndexes } from "src/styles/zIndexes"

type Props = {
  open: boolean
  onClose: () => void
}

// 임시 안내창: 아직 작성 전인 페이지(About·Resume)로 이동하는 대신 띄운다.
// 페이지가 완성되면 NavBar의 UNDER_CONSTRUCTION 목록에서 경로를 빼면 된다.
const UnderConstructionModal: React.FC<Props> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // 헤더의 backdrop-filter가 position: fixed의 기준 박스가 되어 버리므로
  // body에 포털로 그린다. (열렸을 때만, 클라이언트에서만 렌더)
  if (!open || typeof document === "undefined") return null

  return createPortal(
    <StyledOverlay onClick={onClose}>
      <div
        className="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="under-construction-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="icon" aria-hidden="true">
          🚧
        </span>
        <div className="title" id="under-construction-title">
          블로그 공사중입니다
        </div>
        <div className="desc">
          이 페이지는 아직 준비 중이에요.
          <br />
          조금만 기다려 주세요.
        </div>
        <button type="button" className="close" onClick={onClose}>
          확인
        </button>
      </div>
    </StyledOverlay>,
    document.body
  )
}

export default UnderConstructionModal

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const popIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${zIndexes.dialog};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 0.15s ease-out;

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 20rem;
    padding: 2rem 1.5rem 1.5rem;
    border-radius: 1rem;
    text-align: center;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "white" : theme.colors.gray4};
    color: ${({ theme }) => theme.colors.gray12};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: ${popIn} 0.2s ease-out;
  }
  .icon {
    font-size: 2.5rem;
    line-height: 1;
    margin-bottom: 1rem;
    /* 기기 기본 이모지 폰트로 그린다 — next/font Noto(COLRv1)는 일부 모바일
       Safari에서 빈칸으로 나오므로 이 아이콘만큼은 폰트에 의존하지 않는다 */
    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
      "Segoe UI Symbol", sans-serif;
  }
  .title {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .desc {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: ${({ theme }) => theme.colors.gray11};
    margin-bottom: 1.5rem;
  }
  .close {
    width: 100%;
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray12};
    background-color: ${({ theme }) => theme.colors.gray5};
    transition: background-color 0.15s ease-out;
    &:hover {
      background-color: ${({ theme }) => theme.colors.amber11};
      color: white;
    }
  }
`
