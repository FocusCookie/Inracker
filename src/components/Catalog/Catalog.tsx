import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import Drawer from "../Drawer/Drawer";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { CancelReason } from "@/types/overlay";

type Props = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  /** optional action */
  action?: React.ReactElement<HTMLButtonElement>;
  title: string;
  description: string;
  children: React.ReactNode;
  placeholder?: string;
  search: string;
  onSearchChange: (search: string) => void;
  onExitComplete: () => void;
  onCancel: (reason: CancelReason) => void;
};

function Catalog({
  open,
  action,
  title,
  description,
  placeholder,
  children,
  search,
  onOpenChange,
  onSearchChange,
  onExitComplete,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentCatalog");

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.target.value);
  }

  function handleCancel() {
    onCancel("cancel");
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      onExitComplete={onExitComplete}
      title={title}
      description={description}
      actions={action}
      cancelTrigger={
        <Button onClick={handleCancel} variant="ghost">
          {t("cancel")}
        </Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        <div className="p-0.5 pr-4">
          <Input
            placeholder={placeholder ? placeholder : t("searchPlaceholder")}
            defaultValue={search}
            onChange={handleSearchTerm}
          />
        </div>

        <div className="h-full overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="flex h-full flex-col gap-4 p-1">{children}</div>
          </ScrollArea>
        </div>
      </div>
    </Drawer>
  );
}

export default Catalog;
