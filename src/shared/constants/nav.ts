import { BookOpen, LayoutDashboard, MapPin, Monitor, Package, Shield, Sparkles, Swords, UserCog, Users } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Painel",      href: "/home",        icon: LayoutDashboard },
  { label: "Campanhas",   href: "/campanhas",   icon: BookOpen },
  { label: "Combate",     href: "/combate",     icon: Swords },
  { label: "Sujeitos",    href: "/sujeitos",    icon: Users },
  { label: "Lugares",     href: "/lugares",     icon: MapPin },
  { label: "Agentes",     href: "/agentes",     icon: Shield },
  { label: "Itens",       href: "/itens",       icon: Package },
  { label: "Rituais",     href: "/rituais",     icon: Sparkles },
  { label: "Apresentação",href: "/apresentacao",icon: Monitor },
  { label: "Usuários",    href: "/usuarios",    icon: UserCog },
] as const;
