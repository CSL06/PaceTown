/** A guardian speaking inside a panel: portrait left, words right. */
export function Guardian({ who, says }: { who: string; says: string }) {
  return (
    <div className="guardian">
      <div className="face"><img src={`/game/portraits/${who}.webp`} alt="" /></div>
      <div>
        <div className="who">{who.charAt(0).toUpperCase() + who.slice(1)}</div>
        <p className="says">{says}</p>
      </div>
    </div>
  )
}
