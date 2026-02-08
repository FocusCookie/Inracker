import Drawer from "../Drawer/Drawer";
import { useTranslation } from "react-i18next";
import {
  useLogs,
  useCreateLog,
  useUpdateLog,
  useDeleteLog,
} from "@/hooks/useLogs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import IconPicker from "../IconPicker/IconPicker";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OverlayMap } from "@/types/overlay";
import { useState } from "react";
import { Log } from "@/types/logs";
import { Pencil, Trash2, X } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

type OverlayProps = OverlayMap["session.log"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string(),
});

function SessionLogDrawer({
  open,
  onOpenChange,
  onExitComplete,
  chapterId,
}: Props) {
  const { t } = useTranslation("ComponentSessionLogDrawer");

  const logsQuery = useLogs(chapterId);
  const createLogMutation = useCreateLog();
  const updateLogMutation = useUpdateLog();
  const deleteLogMutation = useDeleteLog();

  const [editingLog, setEditingLog] = useState<Log | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "📝",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingLog) {
      await updateLogMutation.mutateAsync({
        id: editingLog.id,
        chapterId,
        ...values,
      });
      setEditingLog(null);
    } else {
      await createLogMutation.mutateAsync({
        chapterId: chapterId,
        ...values,
        type: "manual",
      });
    }
    form.reset({
      title: "",
      description: "",
      icon: "📝",
    });
  }

  function handleEdit(log: Log) {
    setEditingLog(log);
    form.reset({
      title: log.title,
      description: log.description || "",
      icon: log.icon,
    });
  }

  function handleCancelEdit() {
    setEditingLog(null);
    form.reset({
      title: "",
      description: "",
      icon: "📝",
    });
  }

  function handleIconSelect(icon: string) {
    form.setValue("icon", icon);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      onExitComplete={onExitComplete}
      title={t("title")}
      description={t("description")}
      cancelTrigger={<Button variant="ghost">{t("cancel")}</Button>}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden pr-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2 border-b p-1 pb-4"
          >
            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IconPicker
                        initialIcon={field.value}
                        onIconClick={handleIconSelect}
                        disabled={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormControl>
                      <Input placeholder={t("logTitle")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editingLog ? (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCancelEdit}
                    title={t("cancelEdit")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button type="submit">{t("update")}</Button>
                </div>
              ) : (
                <Button type="submit">{t("add")}</Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={t("logDescription")}
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-1">
            {logsQuery.data?.length === 0 && (
              <p className="text-muted-foreground text-center">{t("noLogs")}</p>
            )}
            {logsQuery.data?.map((log) => (
              <div
                key={log.id}
                className={`group flex gap-2 rounded-md border p-2 ${editingLog?.id === log.id ? "bg-muted" : ""}`}
              >
                <span className="text-2xl">{log.icon}</span>
                <div className="flex grow flex-col">
                  <div className="flex justify-between">
                    <span className="font-bold">{log.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {format(log.createdAt, "HH:mm")}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {log.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleEdit(log)}
                    title={t("edit")}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 h-6 w-6"
                        title={t("delete")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("confirmDeleteLog")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-4">
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            deleteLogMutation.mutate({
                              id: log.id,
                              chapterId,
                            })
                          }
                        >
                          {t("delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Drawer>
  );
}

export default SessionLogDrawer;
