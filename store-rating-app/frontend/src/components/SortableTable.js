import React from 'react';

/**
 * columns: [{ key, label, sortable=true, render?: (row) => node }]
 * rows: array of data objects (must include an `id` or unique key)
 * sortBy / sortDir: current sort state ('asc' | 'desc')
 * onSort(key): called when a sortable header is clicked
 */
export default function SortableTable({ columns, rows, sortBy, sortDir, onSort, emptyMessage = 'No records found.' }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && onSort && onSort(col.key)}
                style={{ cursor: col.sortable === false ? 'default' : 'pointer' }}
              >
                {col.label}
                {sortBy === col.key && (
                  <span className="arrow">{sortDir === 'desc' ? '▼' : '▲'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr className="empty-row">
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
