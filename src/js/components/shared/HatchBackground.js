import React from "react"
import hatch from "images/icons/hatch.png"

export default function HatchBackground() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url(${hatch})`,
        backgroundSize: "5px 5px",
        backgroundRepeat: "repeat",
      }}
    ></div>
  )
}
