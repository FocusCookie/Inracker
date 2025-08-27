import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AppWindow,
  ChevronRight,
  Gem,
  NotebookTabs,
  PanelLeft,
  PersonStanding,
  Shield,
  Skull,
  Sparkles,
  SquareX,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { useTranslation } from "react-i18next";

export type SettingsCategory =
  | "general"
  | "players"
  | "effects"
  | "immunities"
  | "opponents"
  | "resistances"
  | "effects";

type Props = {
  onClose: () => void;
  onSelect: (category: SettingsCategory) => void;
  activeItem: SettingsCategory;
};

function SettingsSidebar({ activeItem, onClose, onSelect }: Props) {
  const { t } = useTranslation("ComponentSettingsSidebar");
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar className="h-full" variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar} tooltip={t("settings")}>
              <PanelLeft />
              <span>{t("settings")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("general")}
                  isActive={activeItem === "general"}
                  onClick={() => onSelect("general")}
                >
                  <AppWindow />
                  <span>{t("general")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("opponents")}
                  isActive={activeItem === "opponents"}
                  onClick={() => onSelect("opponents")}
                >
                  <Skull />
                  <span>{t("opponents")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("players")}
                  isActive={activeItem === "players"}
                  onClick={() => onSelect("players")}
                >
                  <PersonStanding />
                  <span>{t("players")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={t("statuses")}
                      isActive={
                        activeItem === "immunities" ||
                        activeItem === "resistances" ||
                        activeItem === "effects"
                      }
                    >
                      <NotebookTabs />
                      <span>{t("statuses")}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeItem === "effects"}
                          onClick={() => onSelect("effects")}
                        >
                          <Sparkles />
                          <span>{t("effects")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>

                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeItem === "immunities"}
                          onClick={() => onSelect("immunities")}
                        >
                          <Gem />
                          <span>{t("immunities")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>

                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={activeItem === "resistances"}
                          onClick={() => onSelect("resistances")}
                        >
                          <Shield />
                          <span>{t("resistances")}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          tooltip={t("close")}
          className="cursor-pointer"
          onClick={onClose}
        >
          <SquareX />
          <span>{t("close")}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

export default SettingsSidebar;
