import React from "react"
import umbrellaBeach from "images/icons/umbrella-beach-solid.svg"

export default function UmbrellaBeachIcon() {
  return (
    <i
      dangerouslySetInnerHTML={{ __html: umbrellaBeach }}
      style={{ width: "14px", fill: "white", display: "inline-block" }}
    />
  )
}
