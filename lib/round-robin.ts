/**
 * Gera o calendário de uma liga "todos contra todos" com ida e volta.
 * Algoritmo round-robin clássico (círculo): com N participantes (par),
 * gera N-1 rodadas no turno e mais N-1 no returno.
 * Se N for ímpar, adiciona um "bye" (folga) — o total de rodadas por turno
 * passa a ser N (cada jogador folga em uma rodada por turno).
 */
export function gerarConfrontos(participantIds: string[]): { rodada: number; home: string | null; away: string | null }[] {
  const ids = [...participantIds]
  if (ids.length % 2 !== 0) ids.push('BYE') // marcador de folga — n vira par

  const n = ids.length
  const totalRodadasTurno = n - 1
  const metade = n / 2

  const confrontos: { rodada: number; home: string | null; away: string | null }[] = []
  let arr = [...ids]

  for (let rodada = 0; rodada < totalRodadasTurno; rodada++) {
    for (let i = 0; i < metade; i++) {
      const home = arr[i]
      const away = arr[n - 1 - i]
      if (home !== 'BYE' && away !== 'BYE') {
        confrontos.push({ rodada: rodada + 1, home, away })
        confrontos.push({ rodada: totalRodadasTurno + rodada + 1, home: away, away: home })
      }
    }
    const fixo = arr[0]
    const resto = arr.slice(1)
    resto.unshift(resto.pop()!)
    arr = [fixo, ...resto]
  }

  return confrontos
}

/** Embaralha um array (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
