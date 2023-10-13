import React from "react"
import xmark from "images/icons/xmark-solid.svg"

export default function XmarkIcon() {
  return (
    <i
      dangerouslySetInnerHTML={{ __html: xmark }}
      style={{ width: "12px", fill: "white", display: "inline-block" }}
    />
  )
}
