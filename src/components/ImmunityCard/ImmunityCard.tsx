import { DBImmunity } from "@/types/immunitiy";
import Collapsible from "../Collapsible/Collapsible";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import { Button } from "../ui/button";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";

type Props = {
  immunity: DBImmunity;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
  onRemove?: (immunityId: DBImmunity["id"]) => void;
  onEdit?: (immunity: DBImmunity) => void;
  onDelete?: () => void;
};

function ImmunityCard({ immunity, actions, onRemove, onEdit, onDelete }: Props) {
  function handleRemoveImmunity() {
    if (onRemove) {
      onRemove(immunity.id);
    }
    if (onDelete) {
      onDelete();
    }
  }

  function handleEditImmunity() {
    if (onEdit) {
      onEdit(immunity);
    }
  }

  return (
    <Collapsible
      title={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{immunity.icon}</span>
            <span className="font-semibold">{immunity.name}</span>
          </div>
          {actions || (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditImmunity}
                >
                  <Pencil1Icon />
                </Button>
              )}
              {(onRemove || onDelete) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveImmunity}
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          )}
        </div>
      }
    >
      <MarkdownReader markdown={immunity.description} />
    </Collapsible>
  );
}

export default ImmunityCard;
