import { useEffect, useMemo, useRef, useState } from 'react'
import MovesMenu from './MovesMenu'
import GameLobby from './GameLobby'
import { moveVideoMap } from './TechniqueVideo'
import { createGameSave, loadGameSaves, persistGameSaves, updateGameSaveNodes, type GameSave } from './gameSaves'
import { createInitialNodeState, useNodeMechanics, type ActiveNode } from './useNodeMechanics'
import './Game.css'

const HISTORY_LIMIT = 25
const ACTION_DEBOUNCE_MS = 200

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
    if (
      current?.id !== other?.id ||
      current?.parentId !== other?.parentId ||
      current?.moveId !== other?.moveId ||
      current?.position.x !== other?.position.x ||
      current?.position.y !== other?.position.y
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
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [historyIndex, setHistoryIndex] = useState(0)
  const historyRef = useRef<ActiveNode[][]>([])
  const historySuspendRef = useRef(false)
  const historyDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    historyRef.current = [cloneNodes(nodes)]
    setHistoryIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (historySuspendRef.current) {
      historySuspendRef.current = false
      return
    }

    const timer = setTimeout(() => {
      const snapshot = cloneNodes(nodes)
      if (historyRef.current.length === 0) {
        historyRef.current = [snapshot]
        setHistoryIndex(0)
        return
      }

      if (areNodesEqual(snapshot, historyRef.current[historyIndex])) {
        return
      }

      let nextHistory = historyRef.current
      if (historyIndex < historyRef.current.length - 1) {
        nextHistory = historyRef.current.slice(0, historyIndex + 1)
      }

      nextHistory = [...nextHistory, snapshot]

      if (nextHistory.length > HISTORY_LIMIT) {
        nextHistory = nextHistory.slice(nextHistory.length - HISTORY_LIMIT)
        setHistoryIndex(nextHistory.length - 1)
      } else {
        setHistoryIndex(nextHistory.length - 1)
      }

      historyRef.current = nextHistory
    }, ACTION_DEBOUNCE_MS)

    if (historyDebounceTimerRef.current) {
      clearTimeout(historyDebounceTimerRef.current)
    }
    historyDebounceTimerRef.current = timer

    return () => {
      if (historyDebounceTimerRef.current) {
        clearTimeout(historyDebounceTimerRef.current)
        historyDebounceTimerRef.current = null
      }
    }
  }, [nodes, historyIndex])

  const applySnapshot = (
    snapshot: ActiveNode[],
    { resetHistory = false, nextIndex }: { resetHistory?: boolean; nextIndex?: number } = {},
  ) => {
    historySuspendRef.current = true
    loadNodesFromSnapshot(snapshot)
    if (resetHistory) {
      historyRef.current = [cloneNodes(snapshot)]
      setHistoryIndex(0)
    } else if (typeof nextIndex === 'number') {
      setHistoryIndex(nextIndex)
    }
  }

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
    const snapshot = cloneNodes(initialNodes)
    const newSave = createGameSave(name, snapshot)
    persistSaves([...saves, newSave])
    applySnapshot(snapshot, { resetHistory: true })
    setActiveSaveId(newSave.id)
    setViewMode('play')
  }

  const handleOpenSave = (saveId: string) => {
    const target = saves.find((save) => save.id === saveId)
    if (!target) return
    const snapshot = cloneNodes(target.nodes)
    applySnapshot(snapshot, { resetHistory: true })
    setActiveSaveId(target.id)
    setViewMode('play')
  }

  const handleSaveProgress = () => {
    const snapshot = duplicateNodes()
    if (!activeSaveId) {
      const defaultLabel = `Flow ${saves.length + 1}`
      const name = promptForName('Name this flow to save it', defaultLabel)
      if (!name) return
      const newSave = createGameSave(name, snapshot)
      persistSaves([...saves, newSave])
      setActiveSaveId(newSave.id)
      setViewMode('play')
      return
    }

    const next = saves.map((save) =>
      save.id === activeSaveId ? updateGameSaveNodes(save, snapshot) : save,
    )
    persistSaves(next)
  }

  const handleUndo = () => {
    if (historyIndex === 0 || historyRef.current.length === 0) return
    const newIndex = historyIndex - 1
    applySnapshot(historyRef.current[newIndex], { nextIndex: newIndex })
  }

  const handleRedo = () => {
    if (historyRef.current.length === 0 || historyIndex >= historyRef.current.length - 1) return
    const newIndex = historyIndex + 1
    applySnapshot(historyRef.current[newIndex], { nextIndex: newIndex })
  }

  const handleToggleAutoSave = () => {
    setAutoSaveEnabled((prev) => {
      const next = !prev
      if (next && viewMode === 'play') {
        handleSaveProgress()
      }
      return next
    })
  }

  useEffect(() => {
    if (!autoSaveEnabled || viewMode !== 'play') return
    handleSaveProgress()
  }, [autoSaveEnabled, nodes, viewMode])

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

  const canUndo = historyIndex > 0
  const canRedo = historyRef.current.length > historyIndex + 1

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
            {'\u2190 Saved Flows'}
          </button>
          <div>
            <p className="toolbar-label">Active Flow</p>
            <p className="toolbar-value">{activeSave?.name ?? 'Unsaved Session'}</p>
          </div>
        </div>
        <div className="game-toolbar__actions">
          <label className="autosave-toggle">
            <input type="checkbox" checked={autoSaveEnabled} onChange={handleToggleAutoSave} />
            <span className="autosave-toggle__slider" />
            <span className="autosave-toggle__label">Auto Save</span>
          </label>
          <button
            type="button"
            className="toolbar-secondary"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            className="toolbar-secondary"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷
          </button>
        </div>
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






