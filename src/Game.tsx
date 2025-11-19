import { useEffect, useMemo, useRef, useState } from 'react'
import MovesMenu from './MovesMenu'
import GameLobby from './GameLobby'
import { moveVideoMap } from './TechniqueVideo'
import { createGameSave, loadGameSaves, persistGameSaves, updateGameSaveNodes, type GameSave } from './gameSaves'
import { createInitialNodeState, useNodeMechanics, type ActiveNode } from './useNodeMechanics'
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

const cloneNodes = (list: ActiveNode[]): ActiveNode[] =>
  list.map((node) => ({
    ...node,
    position: { ...node.position },
  }))

const areNodesEqual = (a: ActiveNode[], b: ActiveNode[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    const current = a[i]
    const other = b[i]
    if (!other) return false
    if (
      current.id !== other.id ||
      current.parentId !== other.parentId ||
      current.moveId !== other.moveId ||
      current.position.x !== other.position.x ||
      current.position.y !== other.position.y
    ) {
      return false
    }
  }
  return true
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
    loadNodesFromSnapshot,
    closeMenu,
    baseNodeLookup,
  } = useNodeMechanics(arenaRef)
  const headerTitle = typeof rawHeaderTitle === 'string' ? rawHeaderTitle : ''

  const [viewMode, setViewMode] = useState<'lobby' | 'play'>('lobby')
  const [saves, setSaves] = useState<GameSave[]>(() => loadGameSaves())
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null)
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<ActiveNode[]>(() =>
    cloneNodes(createInitialNodeState()),
  )
  const [isDirty, setIsDirty] = useState(true)

  const activeSave = useMemo(
    () => saves.find((save) => save.id === activeSaveId) ?? null,
    [saves, activeSaveId],
  )

  const persistSaves = (next: GameSave[]) => {
    setSaves(next)
    persistGameSaves(next)
  }

  const duplicateNodes = (list = nodes) => cloneNodes(list)

  useEffect(() => {
    const dirty = !areNodesEqual(nodes, lastSavedSnapshot)
    setIsDirty((previous) => (previous !== dirty ? dirty : previous))
  }, [nodes, lastSavedSnapshot])

  const promptForName = (message: string, fallback: string) => {
    if (typeof window === 'undefined') return null
    const response = window.prompt(message, fallback)
    if (!response) return null
    const trimmed = response.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const handleCreateNewSave = () => {
    const defaultLabel = `Flow ${saves.length + 1}`
    const name = promptForName('Name your new flow', defaultLabel)
    if (!name) return
    const initialNodes = createInitialNodeState()
    setLastSavedSnapshot([])
    setIsDirty(true)
    const newSave = createGameSave(name, initialNodes)
    persistSaves([...saves, newSave])
    loadNodesFromSnapshot(initialNodes)
    setActiveSaveId(newSave.id)
    setViewMode('play')
  }

  const handleOpenSave = (saveId: string) => {
    const target = saves.find((save) => save.id === saveId)
    if (!target) return
    setLastSavedSnapshot(cloneNodes(target.nodes))
    setIsDirty(false)
    loadNodesFromSnapshot(target.nodes)
    setActiveSaveId(target.id)
    setViewMode('play')
  }

  const handleSaveProgress = () => {
    if (!isDirty) return
    const snapshot = duplicateNodes()
    if (!activeSaveId) {
      const defaultLabel = `Flow ${saves.length + 1}`
      const name = promptForName('Name this flow to save it', defaultLabel)
      if (!name) return
      const newSave = createGameSave(name, snapshot)
      persistSaves([...saves, newSave])
      setActiveSaveId(newSave.id)
      setViewMode('play')
      setLastSavedSnapshot(snapshot)
      setIsDirty(false)
      return
    }

    const next = saves.map((save) =>
      save.id === activeSaveId ? updateGameSaveNodes(save, snapshot) : save,
    )
    persistSaves(next)
    setLastSavedSnapshot(snapshot)
    setIsDirty(false)
  }

  const handleBackToLobby = () => {
    closeMenu()
    setViewMode('lobby')
  }

  useEffect(() => {
    if (!activeMoveId) {
      setVideoEmbedUrl(null)
      return
    }

    setVideoEmbedUrl(convertToYouTubeEmbed(moveVideoMap[activeMoveId]))
  }, [activeMoveId])

  const selectedMoveDetails = activeMoveId ? baseNodeLookup[activeMoveId] ?? null : null

  if (viewMode === 'lobby') {
    return (
      <GameLobby
        saves={saves}
        onCreateSave={handleCreateNewSave}
        onOpenSave={handleOpenSave}
        baseNodeLookup={baseNodeLookup}
      />
    )
  }

  return (
    <div className="game-shell">
      <div className="game-toolbar">
        <div className="game-toolbar__info">
          <button type="button" className="toolbar-link" onClick={handleBackToLobby}>
            ← Saved Flows
          </button>
          <div>
            <p className="toolbar-label">Active Flow</p>
            <p className="toolbar-value">{activeSave?.name ?? 'Unsaved Session'}</p>
          </div>
        </div>
        <button type="button" className="toolbar-primary" onClick={handleSaveProgress}>
          Save Progress
        </button>
      </div>

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
    </div>
  )
}

export default Game




