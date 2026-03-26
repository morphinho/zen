import {
  LayoutDashboard,
  Utensils,
  BookOpen,
  Gift,
  MessageCircle,
  User,
  ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import zenlifeLogo from "@/assets/zenlife-logo.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Nadzorna ploča", url: "/dashboard", icon: LayoutDashboard },
  { title: "Moj plan", url: "/dashboard/plan", icon: Utensils },
  { title: "Upitnik", url: "/dashboard/cuestionario", icon: ClipboardList },
  { title: "Recepti", url: "/dashboard/recetas", icon: BookOpen },
  { title: "Bonus", url: "/dashboard/bonus", icon: Gift },
  { title: "Podrška", url: "/dashboard/soporte", icon: MessageCircle },
  { title: "Profil", url: "/dashboard/perfil", icon: User },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <img src={zenlifeLogo} alt="ZenLife" className="h-8 w-auto" />
          {!collapsed && <span className="font-heading font-bold text-primary text-lg">ZenLife</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
