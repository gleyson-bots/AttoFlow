import {requireAdmin} from "@/lib/auth";
import {db} from "@/lib/db";
import {createTournamentAction,updateTournamentStatusAction,updateUserStatusAction} from "@/app/actions/tournaments";

export default async function Admin({searchParams}:{searchParams:Promise<{error?:string,success?:string}>}){
  await requireAdmin();
  const q=await searchParams;

  let users;
  let camps;
  let regs;
  try {
    [users,camps,regs]=await Promise.all([
      db.user.findMany({orderBy:{createdAt:"desc"},take:50}),
      db.tournament.findMany({orderBy:{createdAt:"desc"},include:{_count:{select:{registrations:true}}}}),
      db.registration.count()
    ]);
  } catch (error) {
    console.error("[AttoFlow][ADMIN][DB]", error);
    return <main className="section">
      <span className="eyebrow">CENTRAL ADMINISTRATIVA</span>
      <h1>AttoFlow configurado parcialmente.</h1>
      <div className="panel">
        <h2>Login administrativo funcionando</h2>
        <p>Você entrou como administrador de bootstrap. O banco de produção ainda não está conectado, então usuários, camps, inscrições e premiações permanecem temporariamente desativados.</p>
        <p>Configure <code>DATABASE_URL</code> com PostgreSQL e aplique o schema Prisma para liberar o painel completo.</p>
      </div>
    </main>;
  }

  return <main className="section"><span className="eyebrow">CENTRAL ADMINISTRATIVA</span><h1>Operação AttoFlow</h1>{q.error&&<p className="alert">{q.error}</p>}{q.success&&<p className="success">{q.success}</p>}<div className="cards"><div className="metric"><span>Usuários</span><b>{users.length}</b></div><div className="metric"><span>Camps</span><b>{camps.length}</b></div><div className="metric"><span>Inscrições</span><b>{regs}</b></div></div><div className="split adminsplit"><section className="panel"><h2>Novo campeonato</h2><form className="form" action={createTournamentAction}><label>Nome<input name="title" required/></label><label>Descrição<textarea name="description" rows={3}/></label><div className="formgrid"><label>Modo<select name="mode"><option>Squad</option><option>Solo</option><option>Duo</option></select></label><label>Mapa<select name="map"><option>Bermuda</option><option>NexTerra</option><option>Kalahari</option><option>Purgatório</option></select></label><label>Vagas<input name="maxPlayers" type="number" defaultValue="48"/></label><label>Entrada (cr)<input name="entryCredits" type="number" defaultValue="20"/></label><label>Premiação (cr)<input name="prizeCredits" type="number" defaultValue="500"/></label><label>Início<input name="startsAt" type="datetime-local" required/></label></div><label>Regras<textarea name="rules" rows={4}/></label><button className="btn">Publicar camp</button></form></section><section className="panel"><h2>Campeonatos</h2>{camps.map(c=><div className="adminrow" key={c.id}><div><b>{c.title}</b><small>{c._count.registrations} inscritos · {c.entryCredits} cr entrada</small></div><form action={updateTournamentStatusAction}><input type="hidden" name="tournamentId" value={c.id}/><select name="status" defaultValue={c.status}><option>DRAFT</option><option>OPEN</option><option>LIVE</option><option>FINISHED</option><option>CANCELLED</option></select><button className="ghost">Salvar</button></form></div>)}</section></div><section className="panel"><h2>Usuários</h2>{users.map(u=><div className="adminrow" key={u.id}><div><b>{u.name}</b><small>{u.email} · {u.nickname||"sem nick"} · {u.credits} cr · {u.role}</small></div><form action={updateUserStatusAction}><input type="hidden" name="userId" value={u.id}/><select name="status" defaultValue={u.status}><option value="ACTIVE">Ativo</option><option value="BLOCKED">Bloqueado</option></select><button className="ghost">Atualizar</button></form></div>)}</section></main>;
}
