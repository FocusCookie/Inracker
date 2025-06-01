import { Opponent } from "@/types/opponents";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { useController, useForm } from "react-hook-form";
import LabelsInput from "../LabelInput/LabelInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (opponent: Opponent["id"]) => void;
  opponents: Opponent[];
};

function OpponentsCatalog({ open, opponents, onAdd, onOpenChange }: Props) {
  const { t } = useTranslation("ComponentOpponentsCatalog");
  const [search, setSearch] = useState("");

  const { control } = useForm({
    defaultValues: {
      searchLabels: [],
    },
  });

  const { field: searchLabelsField } = useController({
    name: "searchLabels",
    control,
  });

  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  const nameMatchOpponents = (opponents: Opponent[]) =>
    opponents.filter((opponent) =>
      opponent.name.toLowerCase().includes(search.toLowerCase()),
    );

  const labelMatchOpponents = (opponents: Opponent[]) => {
    const searchLabels = searchLabelsField.value as string[];
    if (!searchLabels || searchLabels.length === 0) {
      return opponents;
    }
    return opponents.filter((opponent) =>
      searchLabels.some((searchValue) =>
        opponent.labels.some(
          (label: string) => label.toLowerCase() === searchValue.toLowerCase(),
        ),
      ),
    );
  };

  const filteredOpponents = opponents
    .filter((opponent) => {
      if (search) {
        return nameMatchOpponents([opponent]).length > 0;
      }
      return true;
    })
    .filter((opponent) => {
      const searchLabels = searchLabelsField.value as string[];
      if (searchLabels && searchLabels.length > 0) {
        return labelMatchOpponents([opponent]).length > 0;
      }
      return true;
    });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="m-4 p-4 pr-0">
        <div className="pr-4">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="name" className="w-full">
            <div className="mt-4 flex w-full justify-center">
              <TabsList>
                <TabsTrigger value="name">{t("searchByName")}</TabsTrigger>
                <TabsTrigger value="label">{t("searchByLabel")}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="name">
              <div className="flex flex-col gap-2 pb-2">
                <label
                  className="text-sm font-medium"
                  htmlFor={`${name}-input`}
                >
                  {t("searchByName")}
                </label>
                <Input placeholder={t("search")} onChange={handleSearchTerm} />
              </div>
            </TabsContent>

            <TabsContent value="label">
              <LabelsInput
                control={control}
                name="searchLabels"
                label={t("searchLabels")}
                placeholder={t("searchLabelsPlaceholder")}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex max-h-[300px] w-full overflow-hidden">
          <div className="scrollable-y w-full overflow-y-scroll pr-0.5">
            <div className="flex h-full w-full flex-col gap-4 p-1">
              {filteredOpponents.map((opponent) => (
                <div key={`oponents-catalog-${opponent.id}}`}>
                  <button
                    onClick={() => {
                      onAdd(Math.abs(opponent.id));
                    }}
                    className="focus-visible:ring-ring hover:bg-secondary/80 focus-within:bg-secondary/80 flex w-full items-start justify-start gap-2 rounded-md p-1 ring-offset-1 outline-black transition-colors focus-within:outline-1 hover:cursor-pointer focus-visible:ring-1"
                  >
                    <div className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md">
                      <Avatar>
                        <AvatarImage
                          src={opponent.image || undefined}
                          alt={opponent.name}
                        />
                        <AvatarFallback>{opponent.icon}</AvatarFallback>
                      </Avatar>
                      <span className="absolute top-0 right-0 min-h-6 min-w-6 rounded-full bg-white p-0.5 shadow">
                        {opponent.icon}
                      </span>
                    </div>
                    <div className="flex w-full flex-col justify-between gap-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-xl font-bold">
                          {opponent.name}
                        </span>
                        <Badge variant="outline">LVL {opponent.level}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {opponent.labels &&
                          opponent.labels.map((label: string) => (
                            <Badge key={label} variant="outline">
                              {label}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OpponentsCatalog;
