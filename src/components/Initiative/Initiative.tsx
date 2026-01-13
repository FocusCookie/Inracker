import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import InitiativeCard, {
  EncounterOpponentEntity,
  PlayerEntity,
} from "../InitiativeCard/InitiativeCard";
import { cn } from "@/lib/utils";

type Entity = PlayerEntity | EncounterOpponentEntity;

type Props = {
  entities: Entity[];
  activePosition: number;
  maxVisible?: number;
  onCardClick?: (entity: Entity) => void;
};

function Initiative({
  entities,
  activePosition,
  maxVisible = 6,
  onCardClick,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const showButtons = entities.length > maxVisible;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const sign = direction === "left" ? -1 : 1;
      scrollContainerRef.current.scrollBy({
        left: sign * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const activeCard = cardsRef.current.get(activePosition);
    if (activeCard) {
      activeCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activePosition]);

  if (entities.length === 0) {
    return (
      <div className="absolute top-4 left-1/2 z-40 -translate-x-1/2 transform rounded-xl border border-white/80 bg-white/20 px-4 py-2 font-medium text-white shadow-md backdrop-blur-sm">
        Add players and opponents to the fight
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-1/2 z-40 flex w-fit -translate-x-1/2 transform items-center gap-2 rounded-xl border border-white/80 bg-white/20 px-3 shadow-md backdrop-blur-sm">
      {showButtons && (
        <button
          onClick={() => scroll("left")}
          className="flex h-28 w-8 items-center justify-center rounded border border-black bg-white/20 transition-colors hover:bg-white/30"
          type="button"
        >
          <ChevronLeft className="h-6 w-6 text-black" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "no-scrollbar flex h-full gap-4 scroll-smooth py-3",
          showButtons ? "overflow-x-auto" : "overflow-visible",
        )}
        style={{
          maxWidth: showButtons ? `${maxVisible * 6.5 + 1}rem` : undefined,
        }}
        tabIndex={-1}
      >
        {entities.map((entity) => (
          <div
            key={entity.id}
            className="flex-shrink-0"
            ref={(el) => {
              if (el) {
                cardsRef.current.set(entity.position, el);
              } else {
                cardsRef.current.delete(entity.position);
              }
            }}
          >
            <InitiativeCard
              entity={entity}
              isActive={entity.position === activePosition}
              onClick={onCardClick}
            />
          </div>
        ))}
      </div>

      {showButtons && (
        <button
          onClick={() => scroll("right")}
          className="flex h-28 w-8 items-center justify-center rounded border border-black bg-white/20 transition-colors hover:bg-white/30"
          type="button"
        >
          <ChevronRight className="h-6 w-6 text-black" />
        </button>
      )}
    </div>
  );
}

export default Initiative;
