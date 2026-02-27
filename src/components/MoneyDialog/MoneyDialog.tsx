import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { OverlayMap } from "@/types/overlay";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { getModifierKey } from "@/lib/utils";

type OverlayProps = OverlayMap["money.dialog"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitComplete?: () => void;
};

type Props = OverlayProps & RuntimeProps;

const formSchema = z.object({
  gold: z.coerce.number().min(0),
  silver: z.coerce.number().min(0),
  copper: z.coerce.number().min(0),
});

function MoneyDialog({
  open,
  onOpenChange,
  player,
  onSave,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentMoneyDialog");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gold: player.gold,
      silver: player.silver,
      copper: player.copper,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        gold: player.gold,
        silver: player.silver,
        copper: player.copper,
      });
    }
  }, [open, player, form]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
        setIsLoading(true);
        await onSave(values.gold, values.silver, values.copper);
        onOpenChange(false);
        form.reset();
    } catch (error) {
        console.error("Failed to save money", error);
    } finally {
        setIsLoading(false);
    }
  }

  function handleOpenChange(state: boolean) {
    if (!state) {
      onCancel?.("dismissed");
    }
    onOpenChange(state);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: player.name })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2">
                <FormField
                control={form.control}
                name="gold"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>{t("gold")}</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="silver"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>{t("silver")}</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="copper"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>{t("copper")}</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter className="flex gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOpenChange(false)}
                      disabled={isLoading}
                    >
                      {t("cancel")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <Kbd>{getModifierKey()}</Kbd>
                      <Kbd>Esc</Kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button type="submit" disabled={isLoading}>
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default MoneyDialog;
