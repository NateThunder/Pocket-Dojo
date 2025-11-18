import { useEffect, useRef, useState } from 'react'
import MovesMenu from './MovesMenu'
import { moveVideoMap } from './TechniqueVideo'
import { useNodeMechanics } from './useNodeMechanics'
import './Game.css'

const convertToYouTubeEmbed = (rawUrl?: string) => {
  if (!rawUrl) return null

  try {
    const parsed = new URL(rawUrl)
    const hostname = parsed.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }

    if (hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return `https://www.youtube.com${parsed.pathname}`
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const [, , videoId] = parsed.pathname.split('/')
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
  } catch {
    return null
  }

  return null
}

function Game() {
  const arenaRef = useRef<HTMLDivElement | null>(null)
  const {
    nodes,
    connections,
    activeMenuNode,
    activeMoveId,
    isTerminalMove,
    draggingNodeId,
    menuRef,
    menuPosition,
    isDraggingMenu,
    headerTitle: rawHeaderTitle,
    groupedMoves,
    getNodeLabel,
    getNodeStageClass,
    createTransform,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleMenuPointerDown,
    handleMenuPointerMove,
    handleMenuPointerUp,
    handleSelectMove,
    handleAddBranch,
    handleClearNode,
    closeMenu,
    baseNodeLookup,
  } = useNodeMechanics(arenaRef)
  const headerTitle = typeof rawHeaderTitle === 'string' ? rawHeaderTitle : ''

  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!activeMoveId) {
      setVideoEmbedUrl(null)
      return
    }

    setVideoEmbedUrl(convertToYouTubeEmbed(moveVideoMap[activeMoveId]))
  }, [activeMoveId])

  const selectedMoveDetails = activeMoveId ? baseNodeLookup[activeMoveId] ?? null : null

  return (
    <div className="game-arena" ref={arenaRef}>
      <svg className="game-connections" aria-hidden="true" focusable="false">
        {connections.map((connection) => (
          <line
            key={connection.id}
            className="game-connection"
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
          />
        ))}
      </svg>

      {nodes.map((node) => {
        const label = getNodeLabel(node)
        const stageClass = getNodeStageClass(node)
        const isDragging = draggingNodeId === node.id
        const isSelected = activeMenuNode?.id === node.id
        return (
          <div
            key={node.id}
            className={`game-node ${stageClass}${isDragging ? ' is-dragging' : ''}${isSelected ? ' is-selected' : ''}`}
            role="button"
            aria-label={label}
            tabIndex={0}
            style={{ transform: createTransform(node) }}
            onPointerDown={handlePointerDown(node.id)}
            onPointerMove={handlePointerMove(node.id)}
            onPointerUp={handlePointerUp(node.id)}
            onPointerCancel={handlePointerCancel(node.id)}
          >
            {label}
          </div>
        )
      })}

      {activeMenuNode && (
        <MovesMenu
          headerTitle={headerTitle}
          menuRef={menuRef}
          menuPosition={menuPosition}
          isDraggingMenu={isDraggingMenu}
          onPointerDown={handleMenuPointerDown}
          onPointerMove={handleMenuPointerMove}
          onPointerUp={handleMenuPointerUp}
          onAddBranchButton={handleAddBranch}
          onClearNodeButton={handleClearNode}
          onCloseMenuButton={closeMenu}
          activeMoveId={activeMoveId}
          isTerminalMove={isTerminalMove}
          groupedMoves={groupedMoves}
          onSelectMove={handleSelectMove}
          isLockedNode={Boolean(activeMenuNode.moveId)}
          selectedMoveDetails={selectedMoveDetails}
          videoEmbedUrl={videoEmbedUrl}
        />
      )}
    </div>
  )
}

export default Game
