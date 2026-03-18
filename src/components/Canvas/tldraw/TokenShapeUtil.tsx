import { useMemo } from "react";
import { BaseBoxShapeUtil, HTMLContainer, useEditor, useValue } from "tldraw";
import { TokenShape } from "./shapes";
import { useCanvasTldrawContext } from "./CanvasTldrawContext";
import { PlayerToken } from "../PlayerToken";
import { OpponentToken } from "../OpponentToken";

export class TokenShapeUtil extends BaseBoxShapeUtil<TokenShape> {
  static override type = "token" as const;

  override getDefaultProps(): TokenShape["props"] {
    return {
      w: 100,
      h: 100,
      tokenId: 0,
      entityId: 0,
      tokenType: "player",
    };
  }

  override component(shape: TokenShape) {
    const editor = useEditor();
    const context = useCanvasTldrawContext();
    if (!context) return null;

    const isLowDetail = useValue(
      "isLowDetail",
      () => editor.getEfficientZoomLevel() < 0.4, // Increased threshold for better performance
      [editor],
    );

    const {
      database,
      playersById,
      opponentsById,
      tokensById,
      selectedToken,
      tokenVisibility,
      setTokenVisibility,
      onTokenSelect,
      onOpenEffectsCatalog,
      onHealPlayer,
      onDamagePlayer,
      onHealOpponent,
      onDamageOpponent,
      onRemoveFromInitiative,
      onAddToInitiative,
      initiativeEntityIds,
    } = context;

    const token = tokensById.get(shape.props.tokenId);
    if (!token) {
      return null;
    }

    const player = playersById.get(shape.props.entityId);
    const opponent = opponentsById.get(shape.props.entityId);

    if (shape.props.tokenType === "player" && !player) {
      return null;
    }

    if (shape.props.tokenType === "opponent" && !opponent) {
      return null;
    }

    const entity = (shape.props.tokenType === "player" ? player : opponent)!;
    const isVisible = tokenVisibility[token.id.toString()] ?? true;
    const isSelected = selectedToken?.id === token.id;

    // Fast path for low detail or non-selected tokens when zoomed out a bit
    if (isLowDetail && !isSelected) {
      return (
        <div className="h-full w-full pointer-events-none flex items-center justify-center">
          <svg width={shape.props.w} height={shape.props.h} viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={45}
              fill={shape.props.tokenType === "player" ? "#10b981" : "#ef4444"}
              stroke="white"
              strokeWidth={4}
              opacity={isVisible ? 0.8 : 0.3}
            />
            {entity.image ? (
               <defs>
                 <clipPath id={`clip-${shape.id}`}>
                   <circle cx="50" cy="50" r="40" />
                 </clipPath>
               </defs>
            ) : null}
            {entity.image ? (
              <image
                href={entity.image}
                width="80"
                height="80"
                x="10"
                y="10"
                clipPath={`url(#clip-${shape.id})`}
                opacity={isVisible ? 1 : 0.4}
              />
            ) : (
              <text
                x={50}
                y={55}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={40}
                fontWeight="bold"
                style={{ userSelect: "none" }}
              >
                {entity.icon || entity.name.charAt(0).toUpperCase()}
              </text>
            )}
          </svg>
        </div>
      );
    }

    const tokenWithLocalCoords = useMemo(
      () => ({
        ...token,
        coordinates: { x: 0, y: 0 },
      }),
      [token],
    );

    const handleToggleVisibility = () => {
      setTokenVisibility(token.id, !isVisible);
    };

    const handleSelect = () => {
      if (isSelected) {
        onTokenSelect(null);
      } else {
        onTokenSelect(token);
      }
    };

    return (
      <HTMLContainer
        style={{ width: shape.props.w, height: shape.props.h, zIndex: 1 }}
        className="pointer-events-auto"
      >
        {shape.props.tokenType === "player" ? (
          <PlayerToken
            token={tokenWithLocalCoords}
            player={player!}
            isVisible={isVisible}
            isSelected={isSelected}
            isInteractive={true}
            onDragStart={() => {}}
            onClick={(_clickedToken) => handleSelect()}
            onTokenSelect={onTokenSelect}
            onToggleVisibility={(_clickedToken) => handleToggleVisibility()}
            onOpenEffectsCatalog={onOpenEffectsCatalog}
            onHealPlayer={onHealPlayer}
            onDamagePlayer={onDamagePlayer}
            onRemoveFromInitiative={onRemoveFromInitiative}
            onAddToInitiative={onAddToInitiative}
            initiativeEntityIds={initiativeEntityIds}
            database={database}
          />
        ) : (
          <OpponentToken
            token={tokenWithLocalCoords}
            opponent={opponent!}
            isVisible={isVisible}
            isSelected={isSelected}
            isInteractive={true}
            onDragStart={() => {}}
            onClick={(_clickedToken) => handleSelect()}
            onTokenSelect={onTokenSelect}
            onToggleVisibility={(_clickedToken) => handleToggleVisibility()}
            onOpenEffectsCatalog={onOpenEffectsCatalog}
            onHealOpponent={onHealOpponent}
            onDamageOpponent={onDamageOpponent}
            onRemoveFromInitiative={onRemoveFromInitiative}
            onAddToInitiative={onAddToInitiative}
            initiativeEntityIds={initiativeEntityIds}
            database={database}
          />
        )}
      </HTMLContainer>
    );
  }

  override canResize() {
    return false;
  }

  override indicator(shape: TokenShape) {
    return (
      <rect width={shape.props.w} height={shape.props.h} rx={999} ry={999} />
    );
  }
}
