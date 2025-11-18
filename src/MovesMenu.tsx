import type { FC, RefObject } from 'react'
import type { BJJNode } from './BjjData'
import TechniqueVideo from './TechniqueVideo'
import './MovesMenu.css'

interface MovesMenuProps {
  headerTitle: string
  menuRef: RefObject<HTMLDivElement | null>
  menuPosition: { x: number; y: number }
  isDraggingMenu: boolean
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void
  onAddBranchButton: () => void
  onClearNodeButton: () => void
  onCloseMenuButton: () => void
  activeMoveId: string | null
  isTerminalMove: boolean
  groupedMoves: [string, BJJNode[]][]
  onSelectMove: (moveId: string) => void
  isLockedNode: boolean
  selectedMoveDetails: BJJNode | null
  videoEmbedUrl: string | null
}

const MovesMenu: FC<MovesMenuProps> = ({
  headerTitle,
  menuRef,
  menuPosition,
  isDraggingMenu,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onAddBranchButton,
  onClearNodeButton,
  onCloseMenuButton,
  activeMoveId,
  isTerminalMove,
  groupedMoves,
  onSelectMove,
  isLockedNode,
  selectedMoveDetails,
  videoEmbedUrl,
}) => {
  const renderGroupList = () => {
    if (groupedMoves.length === 0) {
      return <p className="moves-menu__empty">No linked moves yet. Pick another technique or clear the node to restart.</p>
    }

    return groupedMoves.map(([group, moveNodes]) => (
      <div className="moves-menu__group" key={group}>
        <p className="moves-menu__group-title">{group}</p>
        <ul className="moves-menu__list">
          {moveNodes.map((move) => {
            const isSelected = activeMoveId === move.id
            return (
              <li key={move.id} className="moves-menu__list-item">
                <button
                  type="button"
                  className={`moves-menu__item${isSelected ? ' is-selected' : ''}`}
                  onClick={() => onSelectMove(move.id)}
                  disabled={isLockedNode}
                >
                  <span className="move-name">{move.name}</span>
                  <span className="move-type">{move.type}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    ))
  }

  return (
    <div
      className={`moves-menu${isDraggingMenu ? ' is-dragging' : ''}`}
      role="dialog"
      aria-label="Pocket Dojo move library"
      ref={menuRef}
      style={{ top: menuPosition.y, left: menuPosition.x }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <h2 className="moves-menu__title">{headerTitle}</h2>
      <div className="moves-menu__actions-inline">
        <button
          type="button"
          className="menu-action menu-action--add-branch"
          onClick={onAddBranchButton}
          disabled={!activeMoveId || isTerminalMove}
        >
          Add Branch
        </button>
        <button
          type="button"
          className="menu-action menu-action--clear-node"
          onClick={onClearNodeButton}
        >
          Clear Node
        </button>
        <button type="button" className="menu-action menu-action--close" onClick={onCloseMenuButton}>
          Close
        </button>
      </div>

      <div className="moves-menu__content">
        {selectedMoveDetails && (
          <div className="move-detail">
            <p className="move-detail__eyebrow">{selectedMoveDetails.group}</p>
            <h3 className="move-detail__title">{selectedMoveDetails.name}</h3>
            <p className="move-detail__meta">
              {selectedMoveDetails.type} Stage {selectedMoveDetails.stage}
            </p>
            <p className="move-detail__notes">{selectedMoveDetails.notes_md || 'No description provided yet.'}</p>

            <div className="moves-menu__video-section">
              <h4>Technique Video</h4>
              <TechniqueVideo videoUrl={videoEmbedUrl} />
            </div>
          </div>
        )}

        {!selectedMoveDetails ? renderGroupList() : null}
      </div>
    </div>
  )
}

export default MovesMenu

