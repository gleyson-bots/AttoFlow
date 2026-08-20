export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const q = await searchParams;

  return (
    <main className="auth">
      <form className="panel form wide" action="/api/auth/register" method="post">
        <span className="eyebrow">NOVO JOGADOR</span>
        <h1>Criar conta</h1>
        {q.error && <p className="alert">{q.error}</p>}
        <div className="formgrid">
          <label>
            Nome
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label>
            Nick no Free Fire
            <input name="nickname" />
          </label>
          <label>
            UID Free Fire
            <input name="freeFireUid" />
          </label>
          <label>
            WhatsApp
            <input name="phone" autoComplete="tel" />
          </label>
        </div>
        <label>
          Código de indicação
          <input name="referral" defaultValue={q.ref || ""} />
        </label>
        <button className="btn" type="submit">Criar minha conta</button>
      </form>
    </main>
  );
}
