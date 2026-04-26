import { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../../auth/useAuth';
import { uploadImageTextFile } from '../../aws/s3Images';

function isTextFile(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
}

export function ImagesPage() {
  const { idToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resultKey, setResultKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedFileInfo = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return `${selectedFile.name} (${selectedFile.type || 'unknown'})`;
  }, [selectedFile]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setResultKey(null);
    setError(null);
    setSelectedFile(file);
  };

  const onUpload = async () => {
    if (!idToken) {
      setError('ID token is not available. Please sign in again.');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    if (!isTextFile(selectedFile)) {
      setError('Only .txt (text/plain) files are supported right now.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setResultKey(null);

      const uploadedKey = await uploadImageTextFile(idToken, selectedFile);
      setResultKey(uploadedKey);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />

      <main className="ml-64 mt-16 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Documents / Images</h1>
            <p className="text-gray-600 mt-1">Upload text files directly to S3 using Cognito Identity Pool credentials.</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div>
              <label htmlFor="images-text-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select text file
              </label>
              <input
                id="images-text-upload"
                type="file"
                accept=".txt,text/plain"
                onChange={onFileChange}
                className="block w-full text-sm text-gray-700"
              />
              {selectedFileInfo && <p className="mt-2 text-sm text-gray-500">Selected: {selectedFileInfo}</p>}
            </div>

            <button
              type="button"
              onClick={() => {
                void onUpload();
              }}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>

            {resultKey && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Upload completed. S3 Key: {resultKey}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
