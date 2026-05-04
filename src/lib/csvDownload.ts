type CsvCell = string | number | boolean | null | undefined

function escapeCsvCell(v: CsvCell): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'string' ? v : String(v)
  const needsQuotes = /[",\n\r]/.test(s)
  const escaped = s.replaceAll('"', '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function downloadCsv(opts: {
  filename: string
  headers: string[]
  rows: Array<Record<string, CsvCell>>
}) {
  const csv =
    `${opts.headers.map(escapeCsvCell).join(',')}\n` +
    opts.rows.map((r) => opts.headers.map((h) => escapeCsvCell(r[h])).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = opts.filename.endsWith('.csv') ? opts.filename : `${opts.filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

