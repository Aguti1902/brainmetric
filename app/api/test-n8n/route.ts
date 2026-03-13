import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== 'brainmetric2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.N8N_API_KEY
  return NextResponse.json({
    n8n_api_key_configurada: !!key,
    valor_parcial: key ? `${key.substring(0, 6)}...` : 'NO CONFIGURADA',
    longitud: key?.length || 0,
  })
}

// Endpoint para que n8n llame aquí y veamos qué header nos manda
export async function POST(request: NextRequest) {
  const received = request.headers.get('x-api-key')
  const expected = process.env.N8N_API_KEY

  return NextResponse.json({
    header_recibido: received ? `${received.substring(0, 6)}... (${received.length} chars)` : 'NADA',
    header_esperado: expected ? `${expected.substring(0, 6)}... (${expected.length} chars)` : 'NO CONFIGURADO',
    coinciden: received === expected,
    raw_length_received: received?.length,
    raw_length_expected: expected?.length,
  })
}
