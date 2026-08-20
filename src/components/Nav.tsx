import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
export async function Nav(){const user=await getCurrentUser();return <header className="nav"><Link className="brand" href="/"><span>ATTO</span>FLOW</Link><nav><Link href="/tournaments">Camps</Link><Link href="/rewards">Premiações</Link><Link href="/referrals">Indique e ganhe</Link>{user?<><Link href={user.role==="ADMIN"?"/admin":"/dashboard"}>{user.role==="ADMIN"?"Admin":"Painel"}</Link><form action={logoutAction}><button className="ghost">Sair</button></form></>:<><Link href="/login">Entrar</Link><Link className="btn small" href="/register">Criar conta</Link></>}</nav></header>}
