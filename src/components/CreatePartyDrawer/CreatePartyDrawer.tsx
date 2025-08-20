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
import Drawer from "../Drawer/Drawer";
import IconPicker from "../IconPicker/IconPicker";
import { Button } from "../ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Party } from "@/types/party";
import type {
  CancelReason,
  OverlayMap,
  OverlaySuccessMap,
} from "@/types/overlay";

type OverlayProps = OverlayMap["party.create"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void; // host toggles open; exit anim plays
  onExitComplete: () => void; // host removes after exit
};
type Props = OverlayProps & RuntimeProps;

export default function CreatePartyDrawer({
  open,
  onCreate,
  onComplete,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const { t } = useTranslation("ComponentPartyCreateDrawer");
  const [isCreating, setIsCreating] = useState(false);
  // null = nothing emitted yet; otherwise we already emitted success/cancel
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  const schema = z.object({
    name: z.string().min(2, { message: t("nameValidation") }),
    description: z.string().optional().default(""),
    icon: z.string().emoji(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", icon: "🧙" },
  });

  async function handleSubmit(values: z.infer<typeof schema>) {
    try {
      setIsCreating(true);

      const input: Omit<Party, "id"> = {
        name: values.name,
        description: values.description ?? "",
        icon: values.icon,
        players: [],
      };
      const created = await onCreate(input); // must return { id: number }
      const partyId = (created as any).id as number;

      onComplete({ partyId } as OverlaySuccessMap["party.create"]);

      setClosingReason("success");
      onOpenChange(false);
      form.reset();
    } finally {
      setIsCreating(false);
    }
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    setClosingReason("cancel");
    onOpenChange(false);
  }

  // Only emit dismissed if we didn't already emit success/cancel
  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      onCancel?.("dismissed");
      setClosingReason("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Drawer
      description={t("titleDescription")}
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("title")}
      actions={
        <Button
          loading={isCreating}
          disabled={isCreating}
          onClick={form.handleSubmit(handleSubmit)}
        >
          {t("create")}
        </Button>
      }
      cancelTrigger={
        <Button
          onClick={handleCancelClick}
          disabled={isCreating}
          variant="ghost"
        >
          {t("cancel")}
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1.5 pl-0.5">
              <FormLabel>{t("icon")}</FormLabel>
              <IconPicker
                initialIcon={form.getValues("icon")}
                disabled={isCreating}
                onIconClick={(icon) => form.setValue("icon", icon)}
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
                      disabled={isCreating}
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
                  <Textarea disabled={isCreating} placeholder="" {...field} />
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
