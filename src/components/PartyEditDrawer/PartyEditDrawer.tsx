import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { Party } from "@/types/party";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

type Props = {
  party: Party;
  onUpdate: (party: Party) => void;
  /**
   * disabels the inputs and sets the create button to loading and disables other buttons
   */
  isUpdating: boolean;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onDelete: (id: Party["id"]) => void;
};

function PartyEditDrawer({
  party,
  isUpdating,
  open,
  onUpdate,
  onOpenChange,
  onDelete,
}: Props) {
  const { t } = useTranslation("ComponentPartyEditDrawer");

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("usernameMaxTwoChars"),
    }),
    description: z.string(),
    icon: z.string().emoji(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: party.name,
      description: party.description,
      icon: party.icon,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, description, icon } = values;

    onUpdate({
      id: party.id,
      name,
      icon,
      description,
      players: party.players,
    });
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  function handleDeleteParty() {
    onDelete(party.id);
  }

  return (
    <div className="flex gap-2">
      <div>
        <Drawer
          description={t("titleDescription")}
          open={open}
          onOpenChange={onOpenChange}
          title={t("title")}
          actions={
            <div className="flex gap-4">
              <Button
                loading={isUpdating}
                disabled={isUpdating}
                onClick={form.handleSubmit(onSubmit)}
              >
                {t("save")}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    loading={isUpdating}
                    disabled={isUpdating}
                  >
                    {t("delete")}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteNote")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteParty}>
                      {t("yesDelete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          }
          cancelTrigger={
            <Button disabled={isUpdating} variant="ghost">
              {t("cancel")}
            </Button>
          }
        >
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-3 pl-0.5 pt-1.5">
                  <FormLabel>{t("icon")}</FormLabel>
                  <IconPicker
                    initialIcon={form.getValues("icon")}
                    disabled={isUpdating}
                    onIconClick={handleIconSelect}
                  />
                  <FormMessage />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full px-0.5">
                      <FormLabel>{t("name")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isUpdating}
                          placeholder="The greedy Adventurer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="px-0.5">
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isUpdating}
                        placeholder=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Drawer>
      </div>
    </div>
  );
}

export default PartyEditDrawer;
