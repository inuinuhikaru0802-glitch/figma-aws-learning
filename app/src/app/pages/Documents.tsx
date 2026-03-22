import { useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

type JsonRow = Record<string, unknown>;

function normalizeToRows(payload: unknown): JsonRow[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is JsonRow => typeof item === 'object' && item !== null);
  }

  if (typeof payload === 'object' && payload !== null) {
    const candidate = payload as Record<string, unknown>;

    const nestedKeys = ['items', 'documents', 'data', 'rows'];
    for (const key of nestedKeys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is JsonRow => typeof item === 'object' && item !== null);
      }
    }

    return [candidate];
  }

  return [];
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export function Documents() {
  const [rows, setRows] = useState<JsonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      const url = import.meta.env.VITE_DATA_URL as string | undefined;

      if (!url) {
        setError('VITE_DATA_URL is not set in .env');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const payload: unknown = await response.json();
        const normalizedRows = normalizeToRows(payload);
        setRows(normalizedRows);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch S3 data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const columns = useMemo(() => {
    if (rows.length === 0) {
      return [];
    }

    return Object.keys(rows[0]);
  }, [rows]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />

      <main className="ml-64 mt-16 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">Data loaded from S3 JSON via CORS.</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">S3 Document Data</h2>
              <p className="text-sm text-gray-500 mt-1">Source: {import.meta.env.VITE_DATA_URL || 'not configured'}</p>
            </div>

            {loading && <div className="px-6 py-8 text-gray-600">Loading data from S3...</div>}

            {!loading && error && (
              <div className="px-6 py-8 text-red-600">
                Failed to load data.
                <div className="mt-1 text-sm text-red-500">{error}</div>
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <div className="px-6 py-8 text-gray-600">No rows found in the JSON payload.</div>
            )}

            {!loading && !error && rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                        {columns.map((column) => (
                          <td key={`${rowIndex}-${column}`} className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {formatCellValue(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
