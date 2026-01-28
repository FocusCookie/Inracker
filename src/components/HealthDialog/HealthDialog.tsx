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

type OverlayProps = OverlayMap["health.dialog"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitComplete?: () => void;
};

type Props = OverlayProps & RuntimeProps;

const formSchema = z.object({
  amount: z.coerce.number().min(1),
  note: z.string().optional(),
});

function HealthDialog({
  open,
  onOpenChange,
  currentHealth,
  maxHealth,
  entityName,
  type,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentHealthDialog");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      note: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onConfirm(values.amount, values.note);
    onOpenChange(false);
    form.reset();
  }

  function handleOpenChange(state: boolean) {
    if (!state) {
      onCancel?.("dismissed");
    }
    onOpenChange(state);
  }

  const isHeal = type === "heal";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isHeal ? t("healTitle") : t("damageTitle")}
          </DialogTitle>
          <DialogDescription>
            {t(isHeal ? "healDescription" : "damageDescription", {
              name: entityName,
              health: currentHealth,
              max: maxHealth,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("note")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant={isHeal ? "default" : "destructive"}
              >
                {isHeal ? t("heal") : t("damage")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default HealthDialog;
