import Link from "next/link";
import { db } from "@/lib/db";

type CampCard = {
  id: string;
  title: string;
  mode: string;
  map: string;
  prizeCredits: number;
  maxPlayers: number;
  _count: { registrations: number };
};

async function loadHomeStats(): Promise<{ camps: CampCard[]; users: number; databaseOnline: boolean }> {
  try {
    const [camps, users] = await Promise.all([
      db.tournament.findMany({
        where: { status: "OPEN" },
        take: 3,
        orderBy: { startsAt: "asc" },
        include: { _count: { select: { registrations: true } } },
      }),
      db.user.count(),
    ]);

    return { camps, users, databaseOnline: true };
  } catch (error) {
    console.error("[AttoFlow][DB] Homepage is using safe fallback", error);
    return { camps: [], users: 0, databaseOnline: false };
  }
}

export default async function Home() {
  const { camps, users, databaseOnline } = await loadHomeStats();
  const nextCamp = camps[0];

  return (
    <main>
      <section className="hero">
        <div>
          <span className="eyebrow">FREE FIRE COMPETITIVO</span>
          <h1>
            Jogue sério.<br />
            <em>Suba de nível.</em>
          </h1>
          <p>
            A AttoFlow reúne comunidade, camps organizados, rankings, premiações em créditos e um programa de indicação.
          </p>
          <div className="actions">
            <Link className="btn" href="/register">Entrar na AttoFlow</Link>
            <Link className="ghost linkbtn" href="/tournaments">Ver campeonatos</Link>
          </div>
          <div className="stats">
            <b>{users}+</b><span>jogadores</span>
            <b>{camps.length}</b><span>camps abertos</span>
          </div>
          {!databaseOnline && (
            <p className="muted">Plataforma em implantação: dados ao vivo serão liberados em breve.</p>
          )}
        </div>

        <div className="heroCard">
          <span>PRÓXIMO DROP</span>
          {nextCamp ? (
            <>
              <h2>{nextCamp.title}</h2>
              <p>{nextCamp.mode} · {nextCamp.map}</p>
              <strong>{nextCamp.prizeCredits} créditos</strong>
              <small>{nextCamp._count.registrations}/{nextCamp.maxPlayers} inscritos</small>
            </>
          ) : (
            <>
              <h2>Novo camp em breve</h2>
              <p>Acompanhe a AttoFlow para a próxima abertura de vagas.</p>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <span className="eyebrow">ECOSSISTEMA</span>
        <h2>Mais que uma sala personalizada.</h2>
        <div className="grid3">
          <article><b>01</b><h3>Camps organizados</h3><p>Inscrições, vagas, horários, status e histórico em um só lugar.</p></article>
          <article><b>02</b><h3>Premiações</h3><p>Saldo e recompensas registradas no perfil com origem transparente.</p></article>
          <article><b>03</b><h3>Indique e ganhe</h3><p>Cada jogador tem um código único para crescer junto com a comunidade.</p></article>
        </div>
      </section>
    </main>
  );
}
