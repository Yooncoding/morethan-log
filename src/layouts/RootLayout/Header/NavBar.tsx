import styled from "@emotion/styled"
import Link from "next/link"
import { useState } from "react"
import UnderConstructionModal from "./UnderConstructionModal"

// 임시 조치: 아직 작성 전인 페이지. 완성되면 여기서 지우면 링크가 다시 열린다.
const UNDER_CONSTRUCTION = ["/about", "/resume"]

const NavBar: React.FC = () => {
  const [showNotice, setShowNotice] = useState(false)
  const links = [
    { id: 1, name: "About", to: "/about" },
    { id: 2, name: "Resume", to: "/resume" },
  ]
  return (
    <StyledWrapper className="">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.to}
              onClick={(e) => {
                if (!UNDER_CONSTRUCTION.includes(link.to)) return
                e.preventDefault()
                setShowNotice(true)
              }}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <UnderConstructionModal
        open={showNotice}
        onClose={() => setShowNotice(false)}
      />
    </StyledWrapper>
  )
}

export default NavBar

const StyledWrapper = styled.div`
  flex-shrink: 0;
  ul {
    display: flex;
    flex-direction: row;
    li {
      display: block;
      margin-left: 1rem;
      color: ${({ theme }) => theme.colors.gray11};
    }
  }
`
