import { useMemo } from "react";
import { BaseBoxShapeUtil, HTMLContainer, useEditor, useValue } from "tldraw";
import { TokenShape } from "./shapes";
import { useCanvasTldrawContext } from "./CanvasTldrawContext";
import { PlayerToken } from "../PlayerToken";
import { OpponentToken } from "../OpponentToken";
import { NPCToken } from "../NPCToken";

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

    // All hooks must be at the very top to follow the Rules of Hooks.
    const {
      tokensById,
      tokenVisibility,
      selectedToken,
      playersById,
      opponentsById,
      npcsById,
      database,
      setTokenVisibility,
      onTokenSelect,
      onOpenEffectsCatalog,
      onHealPlayer,
      onDamagePlayer,
      onHealOpponent,
      onDamageOpponent,
      onHealNPC,
      onDamageNPC,
      onRemoveFromInitiative,
      onAddToInitiative,
      initiativeEntityIds,
    } = context || {};

    const token = tokensById?.get(shape.props.tokenId);

    const tokenWithLocalCoords = useMemo(
      () => (token ? { ...token, coordinates: { x: 0, y: 0 } } : null),
      [token],
    );

    if (!context || !token || !tokenWithLocalCoords) return null;

    const zoomLevel = editor.getZoomLevel();
    const isLowDetail = zoomLevel < 0.4;

    const isVisible = tokenVisibility?.[token.id.toString()] ?? true;
    const isSelected = selectedToken?.id === token.id;

    if (isLowDetail && !isSelected) {
      const entityId = shape.props.entityId;
      const tokenType = shape.props.tokenType;
      
      let lowDetailIcon = "?";
      let lowDetailImage = "";
      let lowDetailColor = "#3b82f6"; // Default npc blue

      if (tokenType === "player") {
        const player = playersById?.get(entityId);
        lowDetailIcon = player?.icon || player?.name?.charAt(0) || "P";
        lowDetailImage = player?.image || "";
        lowDetailColor = "#10b981";
      } else if (tokenType === "opponent") {
        const opponent = opponentsById?.get(entityId);
        lowDetailIcon = opponent?.icon || opponent?.name?.charAt(0) || "O";
        lowDetailImage = opponent?.image || "";
        lowDetailColor = "#ef4444";
      } else if (tokenType === "npc") {
        const npc = npcsById?.get(entityId);
        lowDetailIcon = npc?.icon || npc?.name?.charAt(0) || "N";
        lowDetailImage = npc?.image || "";
      }

      return (
        <div className="h-full w-full pointer-events-none flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={45}
              fill={lowDetailColor}
              stroke="white"
              strokeWidth={4}
              opacity={isVisible ? 0.8 : 0.3}
            />
            {lowDetailImage && (
               <>
                 <defs>
                   <clipPath id={`clip-${shape.id}`}>
                     <circle cx="50" cy="50" r="40" />
                   </clipPath>
                 </defs>
                 <image
                   href={lowDetailImage}
                   width="80"
                   height="80"
                   x="10"
                   y="10"
                   clipPath={`url(#clip-${shape.id})`}
                   opacity={isVisible ? 1 : 0.4}
                 />
               </>
            )}
            {!lowDetailImage && (
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
                {lowDetailIcon}
              </text>
            )}
          </svg>
        </div>
      );
    }

    const player = playersById?.get(shape.props.entityId);
    const opponent = opponentsById?.get(shape.props.entityId);
    const npc = npcsById?.get(shape.props.entityId);

    const tokenType = shape.props.tokenType;
    if (tokenType === "player" && !player) return null;
    if (tokenType === "opponent" && !opponent) return null;
    if (tokenType === "npc" && !npc) return null;

    const handleToggleVisibility = () => {
      setTokenVisibility?.(token.id, !isVisible);
    };

    const handleSelect = () => {
      const currentToken = tokensById?.get(shape.props.tokenId);
      if (!currentToken) return;
      
      if (isSelected) {
        onTokenSelect?.(null);
      } else {
        onTokenSelect?.(currentToken);
      }
    };

    return (
      <HTMLContainer
        style={{ width: shape.props.w, height: shape.props.h, zIndex: 1 }}
        className="pointer-events-auto"
      >
        {tokenType === "player" && player ? (
          <PlayerToken
            token={tokenWithLocalCoords}
            player={player}
            isVisible={isVisible}
            isSelected={isSelected}
            isInteractive={true}
            onDragStart={() => {}}
            onClick={() => handleSelect()}
            onTokenSelect={onTokenSelect || (() => {})}
            onToggleVisibility={() => handleToggleVisibility()}
            onOpenEffectsCatalog={onOpenEffectsCatalog}
            onHealPlayer={onHealPlayer}
            onDamagePlayer={onDamagePlayer}
            onRemoveFromInitiative={onRemoveFromInitiative}
            onAddToInitiative={onAddToInitiative}
            initiativeEntityIds={initiativeEntityIds}
            database={database!}
          />
        ) : tokenType === "opponent" && opponent ? (
          <OpponentToken
            token={tokenWithLocalCoords}
            opponent={opponent}
            isVisible={isVisible}
            isSelected={isSelected}
            isInteractive={true}
            onDragStart={() => {}}
            onClick={() => handleSelect()}
            onTokenSelect={onTokenSelect || (() => {})}
            onToggleVisibility={() => handleToggleVisibility()}
            onOpenEffectsCatalog={onOpenEffectsCatalog}
            onHealOpponent={onHealOpponent}
            onDamageOpponent={onDamageOpponent}
            onRemoveFromInitiative={onRemoveFromInitiative}
            onAddToInitiative={onAddToInitiative}
            initiativeEntityIds={initiativeEntityIds}
            database={database!}
          />
        ) : tokenType === "npc" && npc ? (
          <NPCToken
            token={tokenWithLocalCoords}
            npc={npc}
            isVisible={isVisible}
            isSelected={isSelected}
            isInteractive={true}
            onDragStart={() => {}}
            onClick={() => handleSelect()}
            onTokenSelect={onTokenSelect || (() => {})}
            onToggleVisibility={() => handleToggleVisibility()}
            onOpenEffectsCatalog={onOpenEffectsCatalog}
            onHealNPC={onHealNPC}
            onDamageNPC={onDamageNPC}
            onRemoveFromInitiative={onRemoveFromInitiative}
            onAddToInitiative={onAddToInitiative}
            initiativeEntityIds={initiativeEntityIds}
            database={database!}
          />
        ) : null}
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
