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
