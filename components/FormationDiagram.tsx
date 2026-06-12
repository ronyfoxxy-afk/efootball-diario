/**
 * Diagrama de formação tática em SVG.
 * Recebe uma formação como "4-3-3", "4-2-3-1", "3-5-2" e desenha
 * o campo na vertical com o goleiro embaixo e o ataque em cima.
 */
export default function FormationDiagram({ formation }: { formation: string }) {
  const lines = formation
    .split('-')
    .map((n) => parseInt(n, 10))
    .filter((n) => !isNaN(n) && n > 0 && n <= 6)

  // Formação válida: 2 a 4 linhas, somando 10 jogadores de linha
  const total = lines.reduce((a, b) => a + b, 0)
  if (lines.length < 2 || lines.length > 4 || total !== 10) return null

  const W = 340
  const H = 440
  const PAD_X = 30
  const PAD_TOP = 50
  const PAD_BOTTOM = 70

  // Linhas de jogadores: da defesa (perto do GK) ao ataque (topo)
  // lines[0] = defesa ... lines[ultimo] = ataque
  const rows = lines.length
  const usableH = H - PAD_TOP - PAD_BOTTOM
  const rowGap = usableH / rows

  const players: { x: number; y: number }[] = []

  lines.forEach((count, i) => {
    // i=0 (defesa) fica mais embaixo; última linha (ataque) fica no topo
    const y = H - PAD_BOTTOM - rowGap * i - rowGap / 2
    const gap = (W - PAD_X * 2) / (count + 1)
    for (let j = 1; j <= count; j++) {
      players.push({ x: PAD_X + gap * j, y })
    }
  })

  // Goleiro
  const gk = { x: W / 2, y: H - 32 }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
      <div
        style={{
          background: '#111115',
          border: '1px solid #1d1d20',
          borderRadius: 14,
          padding: '14px 14px 10px',
          maxWidth: 380,
          width: '100%',
        }}
      >
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            fontWeight: 900,
            color: '#e8b84b',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            textAlign: 'center',
            margin: '0 0 10px',
          }}
        >
          Formação {formation}
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Campo */}
          <rect x="0" y="0" width={W} height={H} rx="10" fill="#0d2818" />
          {/* Faixas de grama */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x="0" y={(H / 6) * i} width={W} height={H / 12} fill="#0f2e1c" />
          ))}
          {/* Linhas do campo */}
          <rect x="8" y="8" width={W - 16} height={H - 16} rx="6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <line x1="8" y1={H / 2} x2={W - 8} y2={H / 2} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <circle cx={W / 2} cy={H / 2} r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <circle cx={W / 2} cy={H / 2} r="3" fill="rgba(255,255,255,0.35)" />
          {/* Áreas */}
          <rect x={W / 2 - 70} y={8} width={140} height={48} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <rect x={W / 2 - 34} y={8} width={68} height={20} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <rect x={W / 2 - 70} y={H - 56} width={140} height={48} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <rect x={W / 2 - 34} y={H - 28} width={68} height={20} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

          {/* Jogadores de linha */}
          {players.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="13" fill="#e8b84b" stroke="#09090b" strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="13" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            </g>
          ))}

          {/* Goleiro */}
          <circle cx={gk.x} cy={gk.y} r="13" fill="#4f7ef8" stroke="#09090b" strokeWidth="2.5" />
          <circle cx={gk.x} cy={gk.y} r="13" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}
