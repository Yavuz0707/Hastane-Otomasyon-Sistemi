import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Yetkisiz Erişim</h1>
        <p className="mt-2 text-sm text-slate-600">Bu ekran için rolünüz yetkili değil. Deneme sisteminde uygun demo kullanıcıyla tekrar giriş yapabilirsiniz.</p>
        <Link className="btn-primary mt-6" href="/">
          Panele Dön
        </Link>
      </section>
    </main>
  );
}
