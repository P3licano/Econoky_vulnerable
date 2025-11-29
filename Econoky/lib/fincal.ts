const FINCAL_BASE_URL = 'https://fincalapi.com/v1'

const buildSearchParams = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, String(value))
  })

  if (!searchParams.has('format')) {
    searchParams.set('format', 'json')
  }

  return searchParams
}

const buildHeaders = () => {
  const headers: Record<string, string> = {}
  if (process.env.FINCAL_API_KEY) {
    headers['x-api-key'] = process.env.FINCAL_API_KEY
  }
  return headers
}

export async function callFinCal(endpoint: string, params: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${FINCAL_BASE_URL}/${endpoint}`)
  url.search = buildSearchParams(params).toString()

  const response = await fetch(url.toString(), {
    headers: buildHeaders(),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`FinCal API error: ${response.status} ${body}`)
  }

  return response.json()
}

