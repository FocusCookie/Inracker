import { DBResistance } from "@/types/resistances";
import Collapsible from "../Collapsible/Collapsible";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import { Button } from "../ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

type Props = {
  resistance: DBResistance;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
  onRemove?: (resistanceId: DBResistance["id"]) => void;
};

function ResistanceCard({ resistance, actions, onRemove }: Props) {
  function handleRemoveResistance() {
    if (onRemove) {
      onRemove(resistance.id);
    }
  }

  return (
    <Collapsible
      title={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{resistance.icon}</span>
            <span className="font-semibold">{resistance.name}</span>
          </div>
          {actions ||
            (onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveResistance}
              >
                <TrashIcon />
              </Button>
            ))}
        </div>
      }
    >
      <MarkdownReader markdown={resistance.description} />
    </Collapsible>
  );
}

export default ResistanceCard;
