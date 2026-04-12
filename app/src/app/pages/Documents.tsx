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

function getDataUrl(): string | undefined {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return viteEnv?.VITE_DATA_URL;
}

export function Documents() {
  const [rows, setRows] = useState<JsonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '10',
    name: 'Nagoya Lab',
    region: 'Chubu',
    category: 'Core',
  });

  const fetchDocuments = async () => {
    const url = getDataUrl();

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
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddContent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = getDataUrl();

    if (!url) {
      setSubmitError('VITE_DATA_URL is not set in .env');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        id: formData.id,
        name: formData.name,
        region: formData.region,
        category: formData.category,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to post data: ${response.status} ${response.statusText}`);
      }

      setShowForm(false);
      await fetchDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post data';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
            <p className="text-gray-600 mt-1">Data loaded from API and managed in DynamoDB.</p>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setShowForm((prev) => !prev);
                setSubmitError(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showForm ? 'Close' : 'AddContent'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddContent} className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Content</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
                    ID
                  </label>
                  <input
                    id="id"
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleFormChange('id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    id="region"
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleFormChange('region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {submitError && <div className="mt-4 text-sm text-red-600">{submitError}</div>}

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post to API'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Document Data</h2>
              <p className="text-sm text-gray-500 mt-1">Source: {getDataUrl() || 'not configured'}</p>
            </div>

            {loading && <div className="px-6 py-8 text-gray-600">Loading data from API...</div>}

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
