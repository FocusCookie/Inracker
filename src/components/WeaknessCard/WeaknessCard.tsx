import { DBWeakness } from "@/types/weakness";
import Collapsible from "../Collapsible/Collapsible";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import { Button } from "../ui/button";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";

type Props = {
  weakness: DBWeakness;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
  onRemove?: (weaknessId: DBWeakness["id"]) => void;
  onEdit?: (weakness: DBWeakness) => void;
  onDelete?: () => void;
};

function WeaknessCard({ weakness, actions, onRemove, onEdit, onDelete }: Props) {
  function handleRemoveWeakness() {
    if (onRemove) {
      onRemove(weakness.id);
    }
    if (onDelete) {
      onDelete();
    }
  }

  function handleEditWeakness() {
    if (onEdit) {
      onEdit(weakness);
    }
  }

  return (
    <Collapsible
      disabled={!weakness.description}
      title={
        <div className="flex w-full items-center justify-between min-w-0 gap-2">
          <div className="flex items-center gap-4 min-w-0">
            <span>{weakness.icon}</span>
            <span className="font-semibold truncate">{weakness.name}</span>
          </div>
          {actions || (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditWeakness}
                >
                  <Pencil1Icon />
                </Button>
              )}
              {(onRemove || onDelete) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveWeakness}
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          )}
        </div>
      }
    >
      <MarkdownReader markdown={weakness.description} />
    </Collapsible>
  );
}

export default WeaknessCard;
