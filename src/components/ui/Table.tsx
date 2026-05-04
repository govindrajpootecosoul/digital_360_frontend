import type { ReactNode } from 'react'

export type TableColumn<T> = {
  id: string
  header: string
  className?: string
  cell: (row: T) => ReactNode
}

export function Table<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = 'No rows to display.',
  onRowClick,
}: {
  columns: TableColumn<T>[]
  rows: T[]
  emptyMessage?: string
  onRowClick?: (row: T) => void
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-12 text-center text-sm text-neutral-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`transition-colors hover:bg-neutral-50/80 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`whitespace-nowrap px-4 py-3 text-neutral-800 ${col.className ?? ''}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
