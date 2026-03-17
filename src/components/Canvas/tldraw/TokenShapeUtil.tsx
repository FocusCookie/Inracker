import { BaseBoxShapeUtil, HTMLContainer } from "tldraw";
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
    const context = useCanvasTldrawContext();
    if (!context) return null;

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

    const tokenWithLocalCoords = {
      ...token,
      coordinates: { x: 0, y: 0 },
    };

    const isVisible = tokenVisibility[token.id.toString()] ?? true;
    const isSelected = selectedToken?.id === token.id;

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

    const player = playersById.get(shape.props.entityId);
    const opponent = opponentsById.get(shape.props.entityId);

    if (shape.props.tokenType === "player" && !player) {
      return null;
    }

    if (shape.props.tokenType === "opponent" && !opponent) {
      return null;
    }

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
