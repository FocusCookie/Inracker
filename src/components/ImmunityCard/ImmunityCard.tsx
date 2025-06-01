import { DBImmunity } from "@/types/immunitiy";
import Collapsible from "../Collapsible/Collapsible";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import { Button } from "../ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

type Props = {
  immunity: DBImmunity;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
  onRemove?: (immunityId: DBImmunity["id"]) => void;
};

function ImmunityCard({ immunity, actions, onRemove }: Props) {
  function handleRemoveImmunity() {
    if (onRemove) {
      onRemove(immunity.id);
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
          {actions ||
            (onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveImmunity}
              >
                <TrashIcon />
              </Button>
            ))}
        </div>
      }
    >
      <MarkdownReader markdown={immunity.description} />
    </Collapsible>
  );
}

export default ImmunityCard;
