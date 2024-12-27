import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";

type Props = {
  /**
   * Name for the button which opens the catalog dialog
   */
  triggerName: string;
  title: string;
  description: string;
  /** Disables the catalog open trigger */
  disabled?: boolean;
  children: React.ReactNode;
  onSearchChange: (search: string) => void;
};

function Catalog({
  triggerName,
  title,
  description,
  disabled,
  children,
  onSearchChange,
}: Props) {
  const { t } = useTranslation("ComponentCatalog");

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.target.value);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled}>{triggerName}</Button>
      </DialogTrigger>

      <DialogContent className="p-4 pr-0">
        <div className="pr-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>

            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <Input
            className="mt-4"
            placeholder={t("search")}
            onChange={handleSearchTerm}
          />
        </div>

        <div className="max-h-[500px] overflow-hidden">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default Catalog;
