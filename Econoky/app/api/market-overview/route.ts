import { NextResponse } from 'next/server'

type IndexQuote = {
  symbol: string
  label: string
  value: number
  change: number
  date: string
}

const tryParseJson = (text: string) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const sanitizeStooqPayload = (text: string) => {
  const parsed = tryParseJson(text)
  if (parsed) return parsed

  const cleaned = text.replace(/"volume":\s*([}\]])/g, '"volume":0$1')
  const cleanedParsed = tryParseJson(cleaned)
  if (cleanedParsed) return cleanedParsed

  throw new Error('Respuesta de Stooq inválida')
}

async function fetchStooqQuote(symbol: string, label: string): Promise<IndexQuote | null> {
  try {
    const url = `https://stooq.com/q/l/?s=${symbol}&f=sd2t2ohlc&h&e=json`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) {
      throw new Error(`Stooq response ${res.status}`)
    }
    const raw = await res.text()
    const data = sanitizeStooqPayload(raw)
    const item = data?.symbols?.[0]
    if (!item?.close) {
      return null
    }
    const closeValue = Number(item.close)
    const openValue = Number(item.open ?? closeValue)
    return {
      symbol: item.symbol ?? symbol,
      label,
      value: closeValue,
      change: Number.isFinite(openValue) ? closeValue - openValue : 0,
      date: item.date && item.time ? `${item.date} ${item.time}` : new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching ${label} from Stooq`, error)
    return null
  }
}

async function fetchCryptoPrices() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur,usd',
      { next: { revalidate: 300 } }
    )
    if (!res.ok) {
      throw new Error('Coingecko error')
    }
    const data = await res.json()
    return [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        eur: data?.bitcoin?.eur ?? null,
        usd: data?.bitcoin?.usd ?? null,
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        eur: data?.ethereum?.eur ?? null,
        usd: data?.ethereum?.usd ?? null,
      },
    ]
  } catch (error) {
    console.error('Error fetching crypto data', error)
    return null
  }
}

async function fetchGoldPrice() {
  try {
    const res = await fetch('https://data-asg.goldprice.org/dbXRates/EUR', {
      next: { revalidate: 600 },
    })
    if (!res.ok) {
      throw new Error('Gold API error')
    }
    const data = await res.json()
    const item = data?.items?.[0]
    if (!item?.xauPrice) {
      return null
    }
    return {
      ounceEur: item.xauPrice,
      change: item.chgXau ?? null,
      updatedAt: data?.date ?? new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching gold price', error)
    return null
  }
}

async function fetchFx() {
  try {
    const [eurUsdRes, usdEurRes] = await Promise.all([
      fetch('https://api.exchangerate.host/latest?base=EUR&symbols=USD', {
        next: { revalidate: 600 },
      }),
      fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR', {
        next: { revalidate: 600 },
      }),
    ])

    const eurUsdData = eurUsdRes.ok ? await eurUsdRes.json() : null
    const usdEurData = usdEurRes.ok ? await usdEurRes.json() : null

    return {
      eurUsd: eurUsdData?.rates?.USD ?? null,
      usdEur: usdEurData?.rates?.EUR ?? null,
      eurUsdDate: eurUsdData?.date ?? null,
      usdEurDate: usdEurData?.date ?? null,
    }
  } catch (error) {
    console.error('Error fetching FX data', error)
    return null
  }
}

async function fetchEuribor() {
  try {
    const res = await fetch('https://stooq.com/q/l/?s=euriboru12&f=sd2t2ohlcv&h&e=json', {
      next: { revalidate: 10800 },
    })
    if (res.ok) {
      const data = await res.json()
      const item = data?.symbols?.[0]
      if (item?.close) {
        return {
          value: Number(item.close),
          date: item.date ?? null,
          source: 'stooq.com',
          isFallback: false,
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Euríbor data', error)
  }

  return {
    value: 3.95,
    date: new Date().toISOString(),
    source: 'Referencia manual',
    isFallback: true,
  }
}

export async function GET() {
  try {
    const [indicesRaw, crypto, gold, fx, euribor] = await Promise.all([
      Promise.all([
        fetchStooqQuote('^ibex', 'IBEX 35'),
        fetchStooqQuote('^ndx', 'NASDAQ 100'),
        fetchStooqQuote('^spx', 'S&P 500'),
      ]),
      fetchCryptoPrices(),
      fetchGoldPrice(),
      fetchFx(),
      fetchEuribor(),
    ])

    const indices = indicesRaw.filter(
      (item): item is IndexQuote => Boolean(item) && typeof item?.value === 'number'
    )

    return NextResponse.json({
      indices,
      crypto,
      gold,
      fx,
      euribor,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error building market overview', error)
    return NextResponse.json(
      { error: error.message || 'No se pudo generar el estado del mercado' },
      { status: 500 }
    )
  }
}

