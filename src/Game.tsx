import { useMemo, useRef, useState } from 'react'
import { bjjData } from './BjjData'

// Shared node dimension so layout math for dragging/lines stays consistent.
const NODE_SIZE = 72

type BjjNode = (typeof bjjData.nodes)[number]

// Runtime representation for every draggable token on the arena.
type ActiveNode = {
  id: string
  parentId: string | null
  moveId: string | null
  position: {
    x: number
    y: number
  }
}

// SVG helper type so we can animate lines between nodes.
type Connection = {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

// Prevents dragging from letting nodes escape outside the arena.
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// Walks the node tree to find descendants when clearing a branch.
function collectDescendantIds(targetId: string, nodes: ActiveNode[]) {
  const ids = new Set<string>()
  const queue = [targetId]

  while (queue.length > 0) {
    const current = queue.shift()!
    nodes.forEach((node) => {
      if (node.parentId === current) {
        ids.add(node.id)
        queue.push(node.id)
      }
    })
  }

  return ids
}

// Core Flow Node Trainer surface: handles dragging, menu toggles, and branching.
function Game() {
  const arenaRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const nodeCounterRef = useRef(2)
  const hasDraggedRef = useRef(false)
  const menuDragOffsetRef = useRef({ x: 0, y: 0 })
  const menuDraggingRef = useRef(false)
  const createChildNode = (parent: ActiveNode, siblingCount: number, arenaRect: DOMRect): ActiveNode => {
    const offsetX = NODE_SIZE + 48
    const verticalSpacing = NODE_SIZE + 32
    const nextX = clamp(parent.position.x + offsetX, 0, arenaRect.width - NODE_SIZE)
    const nextY = clamp(parent.position.y + siblingCount * verticalSpacing, 0, arenaRect.height - NODE_SIZE)

    return {
      id: `node-${nodeCounterRef.current++}`,
      parentId: parent.id,
      moveId: null,
      position: { x: nextX, y: nextY },
    }
  }

  // `nodes` stores the full runtime graph of draggable items the user has spawned.
  const [nodes, setNodes] = useState<ActiveNode[]>(() => [
    {
      id: 'node-1',
      parentId: null,
      moveId: null,
      position: { x: 80, y: 80 },
    },
  ])
  // Keeps track of which node currently has its move-picker menu open.
  const [activeMenuNodeId, setActiveMenuNodeId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 750, y: 24 })
  const [isDraggingMenu, setIsDraggingMenu] = useState(false)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Static lookup tables built once per data payload so filtering stays quick.
  const baseNodeLookup = useMemo(() => {
    return bjjData.nodes.reduce<Record<string, BjjNode>>((acc, node) => {
      acc[node.id] = node
      return acc
    }, {})
  }, [])

  const edgeLookup = useMemo(() => {
    return bjjData.edges.reduce<Record<string, string[]>>((acc, edge) => {
      acc[edge.from] = acc[edge.from] ?? []
      acc[edge.from].push(edge.to)
      return acc
    }, {})
  }, [])

  const stageOneMoves = useMemo(() => bjjData.nodes.filter((node) => node.stage === 1), [])

  // Fast map of active runtime nodes by id for sibling/parent lookups.
  const nodeLookup = useMemo(() => {
    return nodes.reduce<Record<string, ActiveNode>>((acc, node) => {
      acc[node.id] = node
      return acc
    }, {})
  }, [nodes])

  const activeMenuNode = activeMenuNodeId
    ? nodes.find((node) => node.id === activeMenuNodeId) ?? null
    : null
  const activeMoveId = activeMenuNode?.moveId ?? null
  const currentNode = activeMoveId ? baseNodeLookup[activeMoveId] : null
  const parentMenuNode =
    activeMenuNode && activeMenuNode.parentId ? nodeLookup[activeMenuNode.parentId] ?? null : null
  const parentMoveId = parentMenuNode?.moveId ?? null
  const sourceMoveId = activeMoveId ?? parentMoveId ?? null
  const sourceMove = sourceMoveId ? baseNodeLookup[sourceMoveId] : null
  const isLockedNode = Boolean(activeMenuNode?.moveId)

  // Moves list either shows starting techniques or the children of the selected node.
  const availableMoves = useMemo(() => {
    if (!activeMenuNode) {
      return []
    }

    if (!sourceMoveId) {
      return stageOneMoves
    }

    const nextIds = edgeLookup[sourceMoveId] ?? []
    return nextIds
      .map((id) => baseNodeLookup[id])
      .filter((node): node is BjjNode => Boolean(node))
  }, [activeMenuNode, sourceMoveId, stageOneMoves, edgeLookup, baseNodeLookup])

  // Grouping by node.group keeps the menu readable for larger data sets.
  const groupedMoves = useMemo(() => {
    const grouped = availableMoves.reduce<Record<string, BjjNode[]>>((acc, node) => {
      const groupKey = node.group || 'Other'
      acc[groupKey] = acc[groupKey] ?? []
      acc[groupKey].push(node)
      return acc
    }, {})

    return Object.entries(grouped)
  }, [availableMoves])

  const headerTitle = !activeMenuNode
    ? 'Select a node to begin'
    : !sourceMove
      ? 'Stage 1 Moves'
      : `Next: ${sourceMove.name ?? 'Current Move'}`
  const isTerminalMove = currentNode?.type === 'Submission'

  // Every token shows either its move name, an "Add Move" placeholder, or the initial text.
  const getNodeLabel = (node: ActiveNode) => {
    if (node.moveId) {
      return baseNodeLookup[node.moveId]?.name ?? 'Move'
    }

    return node.parentId ? 'Add Move' : 'Start Here'
  }

  const getNodeStageClass = (node: ActiveNode) => {
    if (!node.moveId) {
      return node.parentId ? 'stage-placeholder' : 'stage-start'
    }

    const stage = baseNodeLookup[node.moveId]?.stage
    return stage ? `stage-${stage}` : 'stage-placeholder'
  }

  const createTransform = (node: ActiveNode) => {
    const isDragging = draggingNodeId === node.id
    return `translate(${node.position.x}px, ${node.position.y}px)${isDragging ? ' scale(1.05)' : ''}`
  }

  // Translate parent/child relationships into SVG coordinates so we can animate links.
  const connections = useMemo(() => {
    const offset = NODE_SIZE / 2
    return nodes.reduce<Connection[]>((acc, node) => {
      if (!node.parentId) return acc
      const parent = nodeLookup[node.parentId]
      if (!parent) return acc

      acc.push({
        id: `${parent.id}-${node.id}`,
        x1: parent.position.x + offset,
        y1: parent.position.y + offset,
        x2: node.position.x + offset,
        y2: node.position.y + offset,
      })

      return acc
    }, [])
  }, [nodes, nodeLookup])

  // Pointer handlers below control drag lifecycle and menu toggles for each node.
  const handlePointerDown =
    (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
      const nodeRect = event.currentTarget.getBoundingClientRect()
      setDraggingNodeId(nodeId)
      hasDraggedRef.current = false
      setDragOffset({
        x: event.clientX - nodeRect.left,
        y: event.clientY - nodeRect.top,
      })
      event.currentTarget.setPointerCapture(event.pointerId)
    }

  const handlePointerMove =
    (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (draggingNodeId !== nodeId || !arenaRef.current) return

      const arenaRect = arenaRef.current.getBoundingClientRect()
      const maxX = arenaRect.width - NODE_SIZE
      const maxY = arenaRect.height - NODE_SIZE
      const nextX = clamp(event.clientX - arenaRect.left - dragOffset.x, 0, maxX)
      const nextY = clamp(event.clientY - arenaRect.top - dragOffset.y, 0, maxY)
      const node = nodes.find((item) => item.id === nodeId)
      if (!node) return
      if (node.position.x === nextX && node.position.y === nextY) {
        return
      }

      hasDraggedRef.current = true
      setNodes((prev) =>
        prev.map((current) =>
          current.id === nodeId ? { ...current, position: { x: nextX, y: nextY } } : current,
        ),
      )
    }

  const handlePointerUp =
    (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (draggingNodeId !== nodeId) return

      setDraggingNodeId(null)
      event.currentTarget.releasePointerCapture(event.pointerId)

      if (!hasDraggedRef.current) {
        setActiveMenuNodeId((prev) => (prev === nodeId ? null : nodeId))
      }

      hasDraggedRef.current = false
    }

  const handlePointerCancel =
    (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (draggingNodeId !== nodeId) return

      setDraggingNodeId(null)
      event.currentTarget.releasePointerCapture(event.pointerId)
      hasDraggedRef.current = false
    }

  const handleMenuPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current || !menuRef.current) return
    const isButtonTarget = (event.target as HTMLElement).closest('button')
    if (isButtonTarget) {
      return
    }

    const menuRect = menuRef.current.getBoundingClientRect()
    menuDragOffsetRef.current = {
      x: event.clientX - menuRect.left,
      y: event.clientY - menuRect.top,
    }
    menuDraggingRef.current = true
    setIsDraggingMenu(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const handleMenuPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!menuDraggingRef.current || !arenaRef.current || !menuRef.current) return

    const arenaRect = arenaRef.current.getBoundingClientRect()
    const menuRect = menuRef.current.getBoundingClientRect()
    const maxX = Math.max(0, arenaRect.width - menuRect.width)
    const maxY = Math.max(0, arenaRect.height - menuRect.height)
    const nextX = clamp(event.clientX - arenaRect.left - menuDragOffsetRef.current.x, 0, maxX)
    const nextY = clamp(event.clientY - arenaRect.top - menuDragOffsetRef.current.y, 0, maxY)

    setMenuPosition((prev) => {
      if (prev.x === nextX && prev.y === nextY) {
        return prev
      }
      return { x: nextX, y: nextY }
    })
  }

  const handleMenuPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!menuDraggingRef.current) return
    menuDraggingRef.current = false
    setIsDraggingMenu(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  // Selecting a move locks it to the current node and auto-spawns a child placeholder.
  const handleSelectMove = (moveId: string) => {
    if (!activeMenuNode || activeMenuNode.moveId) return

    const selectedMove = baseNodeLookup[moveId]
    const isSubmission = selectedMove?.type === 'Submission'

    setNodes((prev) => {
      const targetNode = prev.find((node) => node.id === activeMenuNode.id)
      if (!targetNode) {
        return prev
      }

      const descendantIds = isSubmission ? collectDescendantIds(targetNode.id, prev) : null
      const withoutDescendants = descendantIds
        ? prev.filter((node) => !descendantIds.has(node.id))
        : prev
      const updatedNodes = withoutDescendants.map((node) =>
        node.id === targetNode.id ? { ...node, moveId } : node,
      )

      if (isSubmission) {
        return updatedNodes
      }

      if (!arenaRef.current) {
        return updatedNodes
      }

      const existingPlaceholders = updatedNodes.filter(
        (node) => node.parentId === targetNode.id && node.moveId === null,
      )

      if (existingPlaceholders.length > 0) {
        const placeholderId = existingPlaceholders[0].id
        setActiveMenuNodeId(placeholderId)
        return updatedNodes
      }

      const arenaRect = arenaRef.current.getBoundingClientRect()
      const siblings = updatedNodes.filter((node) => node.parentId === targetNode.id)
      const newNode = createChildNode(targetNode, siblings.length, arenaRect)

      setActiveMenuNodeId(newNode.id)
      return [...updatedNodes, newNode]
    })
  }

  const handleAddBranch = () => {
    if (!activeMenuNode || !activeMoveId || !arenaRef.current || isTerminalMove) {
      return
    }

    setNodes((prev) => {
      const targetNode = prev.find((node) => node.id === activeMenuNode.id)
      if (!targetNode) {
        return prev
      }

      const arenaRect = arenaRef.current!.getBoundingClientRect()
      const siblings = prev.filter((node) => node.parentId === targetNode.id)
      const newNode = createChildNode(targetNode, siblings.length, arenaRect)
      setActiveMenuNodeId(newNode.id)
      return [...prev, newNode]
    })
  }

  // Clears the current node's assignment plus any children it spawned.
  const handleClearNode = () => {
    if (!activeMenuNode) return

    setNodes((prev) => {
      const descendants = collectDescendantIds(activeMenuNode.id, prev)
      return prev
        .filter((node) => !descendants.has(node.id))
        .map((node) => (node.id === activeMenuNode.id ? { ...node, moveId: null } : node))
    })
  }

  return (
    <div className="game-arena" ref={arenaRef}>
      {/* SVG overlay paints animated connections underneath the draggable nodes. */}
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

      {/* Interactive node tokens */}
      {nodes.map((node) => {
        const label = getNodeLabel(node)
        const stageClass = getNodeStageClass(node)
        const isDragging = draggingNodeId === node.id
        return (
          <div
            key={node.id}
            className={`game-node ${stageClass}${isDragging ? ' is-dragging' : ''}`}
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

      {/* Contextual move picker menu */}
      {activeMenuNode && (
        <div
          className={`moves-menu${isDraggingMenu ? ' is-dragging' : ''}`}
          role="dialog"
          aria-label="Pocket Dojo move library"
          ref={menuRef}
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <div
            className="moves-menu__header"
            onPointerDown={handleMenuPointerDown}
            onPointerMove={handleMenuPointerMove}
            onPointerUp={handleMenuPointerUp}
            onPointerCancel={handleMenuPointerUp}
          >
            <h2>{headerTitle}</h2>
            <div className="moves-menu__actions">
              <button
                type="button"
                className="menu-action"
                onClick={handleAddBranch}
                disabled={!activeMoveId || isTerminalMove}
              >
                Add Branch
              </button>
              <button type="button" className="menu-action menu-action--ghost" onClick={handleClearNode}>
                Clear Node
              </button>
              <button type="button" className="close-menu-button" onClick={() => setActiveMenuNodeId(null)}>
                Close
              </button>
            </div>
          </div>

          <div className="moves-menu__content">
            {groupedMoves.length === 0 ? (
              <p className="moves-menu__empty">
                No linked moves yet. Pick another technique or clear the node to restart.
              </p>
            ) : (
              groupedMoves.map(([group, moveNodes]) => (
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
                            onClick={() => handleSelectMove(move.id)}
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
