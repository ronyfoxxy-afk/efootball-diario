const LIVEPIX_CLIENT_ID = process.env.LIVEPIX_CLIENT_ID!
const LIVEPIX_CLIENT_SECRET = process.env.LIVEPIX_CLIENT_SECRET!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://efootball-diario.vercel.app'

let cachedToken: { token: string; expires: number } | null = null

export async function getLivePixToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: LIVEPIX_CLIENT_ID,
    client_secret: LIVEPIX_CLIENT_SECRET,
    scope: 'payments:read payments:write webhooks',
  })

  const res = await fetch('https://oauth.livepix.gg/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await res.json()
  if (!data.access_token) throw new Error('Falha ao obter token LivePix')

  cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.token
}

export async function criarPagamentoLivePix(valor: number, reference: string): Promise<{ checkoutUrl: string; reference: string }> {
  const token = await getLivePixToken()

  const res = await fetch('https://api.livepix.gg/v2/payments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(valor * 100), // centavos
      currency: 'BRL',
      redirectUrl: `${SITE_URL}/api/livepix/callback?reference=${reference}`,
    }),
  })

  const data = await res.json()
  if (!data.data?.redirectUrl) throw new Error('Falha ao criar pagamento LivePix')

  return {
    checkoutUrl: data.data.redirectUrl,
    reference: data.data.reference,
  }
}

export async function consultarPagamento(reference: string) {
  const token = await getLivePixToken()
  const res = await fetch(`https://api.livepix.gg/v2/payments?reference=${reference}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  const data = await res.json()
  return data.data?.[0] || null
}
