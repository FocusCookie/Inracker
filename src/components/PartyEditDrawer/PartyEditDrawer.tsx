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
import { Party } from "@/types/party";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
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
import { Button } from "../ui/button";
import { CancelReason, OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["party.edit"];

type RuntimeProps = {
  party: Party;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void; // host removes after exit
};

type Props = OverlayProps & RuntimeProps;

function PartyEditDrawer({
  party,
  open,
  onOpenChange,
  onDelete,
  onCancel,
  onComplete,
  onExitComplete,
  onEdit,
}: Props) {
  const { t } = useTranslation("ComponentPartyEditDrawer");
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      name: party?.name ?? "",
      description: party?.description ?? "",
      icon: party?.icon ?? "",
    },
  });

  useEffect(() => {
    if (party) {
      form.reset({
        name: party.name,
        description: party.description,
        icon: party.icon,
      });
    }
  }, [party, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const { name, description, icon } = values;

      const updatedParty = await onEdit({
        ...party,
        name,
        icon,
        description,
      });

      onComplete({ partyId: updatedParty.id });

      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while updating a party");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  async function handleDeleteParty() {
    try {
      setIsLoading(true);

      await onDelete(party.id);

      onComplete({ partyId: party.id });
      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log("Error while deleting a party");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    setClosingReason("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      onCancel?.("dismissed");
      setClosingReason("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Drawer
      onExitComplete={onExitComplete}
      description={t("titleDescription")}
      open={open}
      onOpenChange={handleOpenChange}
      title={t("title")}
      actions={
        <div className="flex gap-4">
          <Button disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
            {t("save")}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
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
              <AlertDialogFooter className="flex gap-4">
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
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={handleCancelClick}
        >
          {t("cancel")}
        </Button>
      }
    >
      <Form {...form} key={party?.id}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-4 pr-4"
        >
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
              <FormLabel>{t("icon")}</FormLabel>
              <IconPicker
                initialIcon={party?.icon}
                disabled={isLoading}
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
                      disabled={isLoading}
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
                  <Textarea disabled={isLoading} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Drawer>
  );
}

export default PartyEditDrawer;
