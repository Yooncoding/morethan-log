import React, { ReactNode } from "react"
import { Noto_Color_Emoji } from "next/font/google"

const notoColorEmoji = Noto_Color_Emoji({
  weight: ["400"],
  subsets: ["emoji"],
  fallback: ["Apple Color Emoji"],
})

// next/font ships Noto Color Emoji as COLRv1, which iOS Safari cannot render
// (glyphs come out blank). Use the platform emoji font by default and only
// prefer Noto where the browser actually supports COLRv1.
const emojiStyle = {
  fontFamily: `"Apple Color Emoji", "Segoe UI Emoji", ${notoColorEmoji.style.fontFamily}, sans-serif`,
  "@supports font-tech(color-COLRv1)": {
    fontFamily: notoColorEmoji.style.fontFamily,
  },
}

type Props = {
  className?: string
  children?: ReactNode
}

export const Emoji = ({ className, children }: Props) => {
  return (
    <span className={className} css={emojiStyle}>
      {children}
    </span>
  )
}
