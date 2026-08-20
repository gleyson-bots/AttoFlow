import Link from "next/link";

export function Nav() {
  return (
    <header className="nav">
      <Link className="brand" href="/">
        <span>ATTO</span>FLOW
      </Link>
      <nav>
        <Link href="/tournaments">Camps</Link>
        <Link href="/rewards">Premiações</Link>
        <Link href="/referrals">Indique e ganhe</Link>
        <Link href="/login">Entrar</Link>
        <Link className="btn small" href="/register">Criar conta</Link>
      </nav>
    </header>
  );
}
