type UnauthenticatedScreenProps = {
  onLogin: () => void;
  error?: string | null;
  notice?: string | null;
  title?: string;
  description?: string;
};

export function AuthLoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl shadow-slate-200/80 border border-slate-200 p-8 text-center">
        <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
        <h1 className="text-xl font-semibold text-slate-900">{message}</h1>
        <p className="mt-2 text-sm text-slate-600">Dashboard へのアクセス可否を確認しています。</p>
      </div>
    </div>
  );
}

export function UnauthenticatedScreen({
  onLogin,
  error,
  notice,
  title = 'Dashboard',
  description = 'この画面を利用するにはログインが必要です。',
}: UnauthenticatedScreenProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[32px] bg-white/95 backdrop-blur border border-white shadow-2xl shadow-slate-300/50 p-10">
        <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Amazon Cognito Sign-In
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>

        {notice && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

        {error && <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">認証に失敗しました。{error}</div>}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Log in
          </button>
          <p className="text-sm text-slate-500">ログイン後に Cognito からこの CloudFront URL へ戻り、Dashboard を表示します。</p>
        </div>
      </div>
    </div>
  );
}
