import { useEffect, useRef, useState } from "react"

const calcX = (): number => Math.random() * 200 - 100
const duration = (): number => Math.random() * 1000 + 3000

function Tights({ ix }: { ix: number }): React.JSX.Element {
  const [x0, setX0] = useState(calcX())
  const [x1, setX1] = useState(calcX())
  const [move, setMove] = useState(false)
  const [r0, setR0] = useState(Math.random())
  const [r1, setR1] = useState(Math.random())
  const [dur, setDur] = useState(ix * 5000)
  const ref = useRef<SVGGElement>(null)
  const startAnimation = (e: SVGGElement) => {
    const a = e.animate(
      {
        transform: [
          `translate( ${x0}%, -70%) rotate(${r0}turn)`,
          `translate( ${x1}%, ${move ? "70%" : "-70%"}) rotate(${r1}turn)`,
        ]
      },
      { duration: dur, iterations: 1, }
    )
    a.finished.then(() => {
      a.cancel();
      setMove(true)
      setX0(calcX())
      setX1(calcX())
      setR0(Math.random())
      setR1(Math.random())
      setDur(duration())
    })
    return () => a.cancel()

  }
  useEffect(() => {
    if (null != ref.current) {
      startAnimation(ref.current)
    }
  }, [ref.current, x0, x1])
  const d = [
    "M -3 0",
    "L -3 7",
    "L -1 7",
    "L -1 2",
    "L 1 2",
    "L 1 7",
    "L 3 7",
    "L 3 0",
    "Z"
  ].join(" ")
  return <g ref={ref} transform="translate( -200 -200)">
    <path d={d} fill={`oklch(0.9 0.4 ${ix}turn / 0.3)`}></path>
  </g>

}


export function BGTights(): React.JSX.Element {
  const viewBox = "-10 -22 20 44"
  const count = 10
  return <div id="bg-tights">
    <svg
      style={{ border: "solid red 1px" }}
      width={"var(--w)"}
      height={"var(--h)"}
      viewBox={viewBox}
    >
      {Array.from({ length: count }).map(
        (_, ix) => <Tights key={ix} ix={ix / count} />
      )}
    </svg>
  </div>
}
