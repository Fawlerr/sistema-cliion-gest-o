export function DataTable({ columns, rows, emptyState }) {
  if (!rows.length) {
    return emptyState;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-2 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="soft-card">
              {columns.map((column, columnIndex) => (
                <td
                  key={column.key}
                  className={`px-4 py-4 align-middle text-sm text-[color:var(--text-soft)] ${
                    columnIndex === 0 ? "rounded-l-2xl" : ""
                  } ${columnIndex === columns.length - 1 ? "rounded-r-2xl" : ""}`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
