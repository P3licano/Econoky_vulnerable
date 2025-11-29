type ClampOptions = {
  decimals?: number
  maxIntegerDigits?: number
}

export function clampNumber(
  value: string | number,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  options?: ClampOptions
) {
  let normalizedValue: string | number = value

  if (typeof value === 'string') {
    const allowsNegative = min < 0
    let sanitized = value.replace(',', '.').replace(/[^\d.-]/g, '')

    if (!allowsNegative) {
      sanitized = sanitized.replace(/-/g, '')
    }

    if (options?.maxIntegerDigits || typeof options?.decimals === 'number') {
      const isNegative = sanitized.startsWith('-') && allowsNegative
      const unsigned = isNegative ? sanitized.slice(1) : sanitized
      let [integerPart = '', decimalPart = ''] = unsigned.split('.')

      if (options?.maxIntegerDigits) {
        integerPart = integerPart.replace(/^0+(?=\d)/, '') || '0'
        integerPart = integerPart.slice(0, options.maxIntegerDigits)
      }

      if (typeof options?.decimals === 'number' && decimalPart) {
        decimalPart = decimalPart.slice(0, options.decimals)
      }

      sanitized = decimalPart ? `${integerPart}.${decimalPart}` : integerPart
      if (isNegative) {
        sanitized = `-${sanitized}`
      }
    }

    normalizedValue = sanitized
  }

  let numeric =
    typeof normalizedValue === 'number' ? normalizedValue : Number(normalizedValue)

  if (isNaN(numeric)) {
    numeric = min
  }

  let clamped = Math.min(Math.max(numeric, min), max)

  if (typeof options?.decimals === 'number') {
    const factor = Math.pow(10, options.decimals)
    clamped = Math.round(clamped * factor) / factor
  }

  return clamped
}

export function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function sanitizeCurrencyInput(
  value: string | number,
  max = 999_999_999,
  options?: { min?: number; decimals?: number }
) {
  const { min = 0, decimals = 2 } = options || {}
  return clampNumber(value, min, max, { decimals, maxIntegerDigits: 9 })
}


