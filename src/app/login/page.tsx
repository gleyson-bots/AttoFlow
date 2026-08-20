import Link from "next/link";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;

  return (
    <main className="auth">
      <form className="panel form" action="/api/auth/login" method="post">
        <span className="eyebrow">BEM-VINDO DE VOLTA</span>
        <h1>Entrar</h1>
        {q.error && <p className="alert">{q.error}</p>}
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Senha
          <input name="password" type="password" autoComplete="current-password" minLength={8} required />
        </label>
        <button className="btn" type="submit">Entrar</button>
        <p>
          Ainda não tem conta? <Link href="/register">Cadastre-se</Link>
        </p>
      </form>
    </main>
  );
}
