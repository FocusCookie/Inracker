import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
  /**
   * button which opens the catalog dialog
   */
  trigger?: React.ReactElement<HTMLButtonElement>;
  /** optional tooltip, for trigger */
  tooltip?: string;
  /** optional action */
  action?: React.ReactElement<HTMLButtonElement>;
  title: string;
  description: string;
  children: React.ReactNode;
  placeholder: string;
  search: string;
  onSearchChange: (search: string) => void;
};

function Catalog({
  open,
  trigger,
  tooltip,
  action,
  title,
  description,
  placeholder,
  children,
  search,
  onOpenChange,
  onSearchChange,
}: Props) {
  function handleSearchTerm(event: React.ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.target.value);
  }

  return (
    <>
      <Dialog
        open={trigger ? undefined : open}
        onOpenChange={trigger ? undefined : onOpenChange}
      >
        {trigger && tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip} </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {trigger && !tooltip && (
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        )}

        <DialogContent className="m-4 p-4 pr-0">
          <div className="pr-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>

              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <Input
              className="mt-4"
              placeholder={placeholder}
              defaultValue={search}
              onChange={handleSearchTerm}
            />
          </div>

          <div className="max-h-[200px] overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="flex h-full flex-col gap-4 p-1">{children}</div>
            </ScrollArea>
          </div>

          {action && <DialogFooter className="pr-4">{action}</DialogFooter>}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Catalog;
