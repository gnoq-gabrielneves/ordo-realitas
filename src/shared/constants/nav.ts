import {
  BookOpen,
  ClipboardList,
  FileText,
  Hexagon,
  LayoutDashboard,
  MapPin,
  Monitor,
  Package,
  Shield,
  Sparkles,
  Swords,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: `/${string}`;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

export const NAV_GROUPS = [
  {
    label: "Central",
    items: [
      { label: "Painel", href: "/home", icon: LayoutDashboard },
      { label: "Campanhas", href: "/campanhas", icon: BookOpen },
      { label: "Escudo", href: "/escudo", icon: ClipboardList },
      { label: "Combate", href: "/combate", icon: Swords },
      { label: "Tokens", href: "/tokens", icon: Hexagon },
      { label: "Apresentação", href: "/apresentacao", icon: Monitor },
    ],
  },
  {
    label: "Arquivos",
    items: [
      { label: "Agentes", href: "/agentes", icon: Shield },
      { label: "Sujeitos", href: "/sujeitos", icon: Users },
      { label: "Lugares", href: "/lugares", icon: MapPin },
      { label: "Itens", href: "/itens", icon: Package },
      { label: "Rituais", href: "/rituais", icon: Sparkles },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Documentação", href: "/documentacao", icon: FileText },
      { label: "Usuários", href: "/usuarios", icon: UserCog },
    ],
  },
] as const satisfies readonly NavGroup[];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => [...group.items]);
