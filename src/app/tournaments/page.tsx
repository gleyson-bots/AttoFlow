import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { joinTournamentAction } from "@/app/actions/tournaments";

type Camp = {
  id: string;
  title: string;
  description: string;
  mode: string;
  map: string;
  maxPlayers: number;
  entryCredits: number;
  prizeCredits: number;
  startsAt: Date;
  status: "OPEN" | "LIVE";
  _count: { registrations: number };
};

async function loadCamps(): Promise<{ camps: Camp[]; databaseOnline: boolean }> {
  try {
    const camps = await db.tournament.findMany({
      where: { status: { in: ["OPEN", "LIVE"] } },
      orderBy: { startsAt: "asc" },
      include: { _count: { select: { registrations: true } } },
    });
    return { camps: camps as Camp[], databaseOnline: true };
  } catch (error) {
    console.error("[AttoFlow][DB] Tournaments page is using safe fallback", error);
    return { camps: [], databaseOnline: false };
  }
}

export default async function Tournaments({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const q = await searchParams;
  const user = await getCurrentUser();
  const { camps, databaseOnline } = await loadCamps();

  return (
    <main className="section">
      <span className="eyebrow">CAMPEONATOS</span>
      <h1>Escolha seu próximo camp.</h1>
      <p className="lead">
        Competições com taxa de entrada em créditos e premiação definida pela organização. Sem odds ou aposta em resultado.
      </p>
      {q.error && <p className="alert">{q.error}</p>}
      {q.success && <p className="success">{q.success}</p>}
      {!databaseOnline && (
        <div className="panel">
          <h2>Camps sendo preparados</h2>
          <p>O calendário competitivo está temporariamente indisponível enquanto finalizamos a infraestrutura.</p>
        </div>
      )}
      {databaseOnline && camps.length === 0 && (
        <div className="panel"><p>Nenhum campeonato aberto neste momento.</p></div>
      )}
      <div className="campgrid">
        {camps.map((c) => (
          <article className="camp" key={c.id}>
            <div className="camptop"><span>{c.status}</span><b>{c.mode}</b></div>
            <h2>{c.title}</h2>
            <p>{c.description}</p>
            <div className="campmeta">
              <span>Mapa <b>{c.map}</b></span>
              <span>Vagas <b>{c._count.registrations}/{c.maxPlayers}</b></span>
              <span>Entrada <b>{c.entryCredits} cr</b></span>
              <span>Prêmio <b>{c.prizeCredits} cr</b></span>
            </div>
            <small>{new Date(c.startsAt).toLocaleString("pt-BR")}</small>
            {user ? (
              <form action={joinTournamentAction}>
                <input type="hidden" name="tournamentId" value={c.id} />
                <button className="btn" disabled={c.status !== "OPEN"}>Inscrever-se</button>
              </form>
            ) : (
              <a className="btn" href="/login">Entrar para jogar</a>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
