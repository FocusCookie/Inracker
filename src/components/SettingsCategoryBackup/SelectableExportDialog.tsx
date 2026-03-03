import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Item {
  id: string | number;
  label: string;
  icon?: string;
  sublabel?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: Item[];
  onExport: (ids: (string | number)[]) => void;
  isLoading?: boolean;
}

export function SelectableExportDialog({
  open,
  onOpenChange,
  title,
  items,
  onExport,
  isLoading,
}: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryBackup");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setSearch("");
    }
  }, [open]);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.sublabel?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const toggleItem = (id: string | number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    onExport(Array.from(selectedIds));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-md flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t("itemsSelected", { count: selectedIds.size })}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={t("searchPlaceholder", {
                defaultValue: "Search...",
              })}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          {search && (
            <Button variant="ghost" size="icon" onClick={() => setSearch("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mb-4 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="flex-1"
          >
            {t("selectAll")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAll}
            className="flex-1"
          >
            {t("deselectAll")}
          </Button>
        </div>

        <ScrollArea className="flex-1 rounded-md border p-2">
          {filteredItems.length === 0 ? (
            <div className="text-muted-foreground flex h-20 items-center justify-center">
              {t("noItemsFound")}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      "flex items-center justify-between rounded-md p-2 text-left transition-colors hover:cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.icon && (
                        <span className="shrink-0">{item.icon}</span>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span
                            className={cn(
                              "truncate text-xs",
                              isSelected
                                ? "opacity-80"
                                : "text-muted-foreground",
                            )}
                          >
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="ml-2 h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || isLoading}
          >
            {t("exportSelected")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
