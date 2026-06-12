/**
 * Diagrama de formação tática no estilo do Game Plan do eFootball.
 * Meio campo visto de cima (gol embaixo), cards dourados com sigla da posição.
 */

function positionsForLine(count: number, lineIndex: number, totalLines: number): string[] {
  // Última linha = ataque
  const isAttack = lineIndex === totalLines - 1
  const isDefense = lineIndex === 0
  const isFirstMid = lineIndex === 1 && totalLines > 2

  if (isDefense) {
    if (count <= 3) return Array(count).fill('ZC')
    const mids = Array(count - 2).fill('ZC')
    return ['LE', ...mids, 'LD']
  }
  if (isAttack) {
    if (count === 1) return ['CA']
    if (count === 2) return ['CA', 'CA']
    if (count === 3) return ['CA', 'SA', 'CA']
    const mids = Array(count - 2).fill('CA')
    return ['PE', ...mids, 'PD']
  }
  if (isFirstMid) {
    if (count === 1) return ['VOL']
    if (count === 2) return ['VOL', 'VOL']
    const mids = Array(count - 2).fill('VOL')
    return ['MLG', ...mids, 'MLD']
  }
  // Demais linhas de meio
  if (count === 1) return ['MAT']
  if (count === 2) return ['MC', 'MC']
  const mids = Array(count - 2).fill('MAT')
  return ['MLG', ...mids, 'MLD']
}

export default function FormationDiagram({ formation }: { formation: string }) {
  const lines = formation
    .split('-')
    .map((n) => parseInt(n, 10))
    .filter((n) => !isNaN(n) && n > 0 && n <= 6)

  const total = lines.reduce((a, b) => a + b, 0)
  if (lines.length < 2 || lines.length > 5 || total !== 10) return null

  const W = 360
  const H = 460
  const PAD_X = 34
  const PAD_TOP = 64
  const PAD_BOTTOM = 96
  const CARD = 44

  const rows = lines.length
  const usableH = H - PAD_TOP - PAD_BOTTOM
  const rowGap = usableH / rows

  const players: { x: number; y: number; pos: string }[] = []

  lines.forEach((count, i) => {
    const y = H - PAD_BOTTOM - rowGap * i - rowGap / 2
    const gap = (W - PAD_X * 2) / (count + 1)
    const posList = positionsForLine(count, i, rows)
    for (let j = 1; j <= count; j++) {
      players.push({ x: PAD_X + gap * j, y, pos: posList[j - 1] })
    }
  })

  const gk = { x: W / 2, y: H - 52, pos: 'GO' }
  const all = [...players, gk]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
      <div
        style={{
          background: '#0b0b0e',
          border: '1px solid #1d1d20',
          borderRadius: 14,
          padding: '14px 14px 10px',
          maxWidth: 400,
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
          <defs>
            <radialGradient id="grass" cx="50%" cy="42%" r="80%">
              <stop offset="0%" stopColor="#16381f" />
              <stop offset="60%" stopColor="#0d2414" />
              <stop offset="100%" stopColor="#07130b" />
            </radialGradient>
            <linearGradient id="cardGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4d27a" />
              <stop offset="45%" stopColor="#c89b3c" />
              <stop offset="100%" stopColor="#8f6a1f" />
            </linearGradient>
            <linearGradient id="cardInner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#23231f" />
              <stop offset="100%" stopColor="#121210" />
            </linearGradient>
            <linearGradient id="cardGK" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86a8ff" />
              <stop offset="50%" stopColor="#4f7ef8" />
              <stop offset="100%" stopColor="#2b4cb0" />
            </linearGradient>
          </defs>

          {/* Gramado com vinheta */}
          <rect x="0" y="0" width={W} height={H} rx="10" fill="url(#grass)" />
          {/* Faixas sutis de grama */}
          {[1, 3, 5, 7].map((i) => (
            <rect key={i} x="0" y={(H / 9) * i} width={W} height={H / 18} fill="rgba(255,255,255,0.02)" />
          ))}

          {/* Meio campo: linha central no topo + semicírculo */}
          <line x1="10" y1="26" x2={W - 10} y2="26" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <path d={`M ${W / 2 - 46} 26 A 46 46 0 0 0 ${W / 2 + 46} 26`} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />

          {/* Laterais */}
          <line x1="10" y1="26" x2="10" y2={H - 10} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1={W - 10} y1="26" x2={W - 10} y2={H - 10} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="10" y1={H - 10} x2={W - 10} y2={H - 10} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />

          {/* Área do gol (embaixo) */}
          <rect x={W / 2 - 88} y={H - 78} width={176} height={68} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <rect x={W / 2 - 42} y={H - 38} width={84} height={28} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <path d={`M ${W / 2 - 40} ${H - 78} A 44 44 0 0 1 ${W / 2 + 40} ${H - 78}`} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />

          {/* Cards dos jogadores */}
          {all.map((p, i) => {
            const isGK = p.pos === 'GO'
            return (
              <g key={i}>
                {/* sombra */}
                <rect x={p.x - CARD / 2 + 2} y={p.y - CARD / 2 + 3} width={CARD} height={CARD} rx="10" fill="rgba(0,0,0,0.45)" />
                {/* borda dourada/azul */}
                <rect x={p.x - CARD / 2} y={p.y - CARD / 2} width={CARD} height={CARD} rx="10" fill={isGK ? 'url(#cardGK)' : 'url(#cardGold)'} />
                {/* interior escuro */}
                <rect x={p.x - CARD / 2 + 3} y={p.y - CARD / 2 + 3} width={CARD - 6} height={CARD - 6} rx="8" fill="url(#cardInner)" />
                {/* brilho superior */}
                <rect x={p.x - CARD / 2 + 3} y={p.y - CARD / 2 + 3} width={CARD - 6} height={(CARD - 6) / 2.6} rx="8" fill="rgba(255,255,255,0.06)" />
                {/* sigla da posição */}
                <text
                  x={p.x}
                  y={p.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Barlow Condensed', sans-serif"
                  fontWeight="900"
                  fontSize="16"
                  fill={isGK ? '#9db9ff' : '#f0d489'}
                  letterSpacing="0.5"
                >
                  {p.pos}
                </text>
                {/* barrinha inferior dourada */}
                <rect x={p.x - 12} y={p.y + CARD / 2 - 8} width={24} height={3.5} rx="2" fill={isGK ? '#4f7ef8' : '#e8b84b'} opacity="0.9" />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
