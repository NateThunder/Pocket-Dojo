import { useMemo, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { BJJNode } from './BjjData'
import { bjjData } from './BjjData'

export const NODE_SIZE = 72

export type ActiveNode = {
  id: string
  parentId: string | null
  moveId: string | null
  position: {
    x: number
    y: number
  }
}

export type Connection = {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const collectDescendantIds = (targetId: string, nodes: ActiveNode[]) => {
  const ids = new Set<string>()
  const queue = [targetId]

  while (queue.length) {
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

const createChildNode = (
  parent: ActiveNode,
  siblingCount: number,
  arenaRect: DOMRect,
  nodeCounterRef: MutableRefObject<number>,
) => {
  const offsetX = NODE_SIZE + 58
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

export function useNodeMechanics(arenaRef: RefObject<HTMLDivElement | null>) {
  const nodeCounterRef = useRef(2)
  const hasDraggedRef = useRef(false)
  const menuDragOffsetRef = useRef({ x: 0, y: 0 })
  const menuDraggingRef = useRef(false)
  const menuDragActiveRef = useRef(false)
  const menuDragStartRef = useRef({ x: 0, y: 0 })

  const [nodes, setNodes] = useState<ActiveNode[]>(() => [
    { id: 'node-1', parentId: null, moveId: null, position: { x: 80, y: 80 } },
  ])
  const [activeMenuNodeId, setActiveMenuNodeId] = useState<string | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [menuPosition, setMenuPosition] = useState({ x: 750, y: 24 })
  const [isDraggingMenu, setIsDraggingMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const baseNodeLookup = useMemo(() => {
    return bjjData.nodes.reduce<Record<string, BJJNode>>((acc, node) => {
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

  const nodeLookup = useMemo(() => {
    return nodes.reduce<Record<string, ActiveNode>>((acc, node) => {
      acc[node.id] = node
      return acc
    }, {})
  }, [nodes])

  const activeMenuNode = activeMenuNodeId ? nodes.find((node) => node.id === activeMenuNodeId) ?? null : null
  const activeMoveId = activeMenuNode?.moveId ?? null
  const parentMenuNode =
    activeMenuNode && activeMenuNode.parentId ? nodeLookup[activeMenuNode.parentId] ?? null : null
  const parentMoveId = parentMenuNode?.moveId ?? null
  const sourceMoveId = activeMoveId ?? parentMoveId ?? null
  const currentNode = sourceMoveId ? baseNodeLookup[sourceMoveId] : null
  const isTerminalMove = currentNode?.type === 'Submission'

  const availableMoves = useMemo(() => {
    if (!activeMenuNode) return []

    if (!sourceMoveId) {
      return stageOneMoves
    }

    const nextIds = edgeLookup[sourceMoveId] ?? []
    return nextIds.map((id) => baseNodeLookup[id]).filter((node): node is BJJNode => Boolean(node))
  }, [activeMenuNode, sourceMoveId, stageOneMoves, edgeLookup, baseNodeLookup])

  const groupedMoves = useMemo(() => {
    const grouped = availableMoves.reduce<Record<string, BJJNode[]>>((acc, node) => {
      const groupKey = node.group || 'Other'
      acc[groupKey] = acc[groupKey] ?? []
      acc[groupKey].push(node)
      return acc
    }, {})

    return Object.entries(grouped) as [string, BJJNode[]][]
  }, [availableMoves])

  const headerTitle = !activeMenuNode
    ? 'Select a node to begin'
    : !sourceMoveId


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

  const handlePointerDown = (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    const nodeRect = event.currentTarget.getBoundingClientRect()
    setDraggingNodeId(nodeId)
    hasDraggedRef.current = false
    setDragOffset({
      x: event.clientX - nodeRect.left,
      y: event.clientY - nodeRect.top,
    })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
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
      prev.map((current) => (current.id === nodeId ? { ...current, position: { x: nextX, y: nextY } } : current)),
    )
  }

  const handlePointerUp = (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNodeId !== nodeId) return

    setDraggingNodeId(null)
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (!hasDraggedRef.current) {
      setActiveMenuNodeId((prev) => (prev === nodeId ? null : nodeId))
    }

    hasDraggedRef.current = false
  }

  const handlePointerCancel = (nodeId: string) => (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNodeId !== nodeId) return

    setDraggingNodeId(null)
    event.currentTarget.releasePointerCapture(event.pointerId)
    hasDraggedRef.current = false
  }

  const handleMenuPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!arenaRef.current || !menuRef.current) return
    const target = event.target as HTMLElement
    if (target.closest('button') || target.closest('iframe')) {
      return
    }

    menuDragStartRef.current = { x: event.clientX, y: event.clientY }
    const menuRect = menuRef.current.getBoundingClientRect()
    menuDragOffsetRef.current = {
      x: event.clientX - menuRect.left,
      y: event.clientY - menuRect.top,
    }
    menuDraggingRef.current = true
    menuDragActiveRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleMenuPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!menuDraggingRef.current || !arenaRef.current || !menuRef.current) return

    if (!menuDragActiveRef.current) {
      const start = menuDragStartRef.current
      const moved =
        Math.abs(event.clientX - start.x) > 2 || Math.abs(event.clientY - start.y) > 2
      if (moved) {
        menuDragActiveRef.current = true
        setIsDraggingMenu(true)
      }
    }

    if (!menuDragActiveRef.current) {
      return
    }

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
    if (menuDragActiveRef.current) {
      setIsDraggingMenu(false)
    }
    menuDragActiveRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

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
      const withoutDescendants = descendantIds ? prev.filter((node) => !descendantIds.has(node.id)) : prev
      const updatedNodes = withoutDescendants.map((node) =>
        node.id === targetNode.id ? { ...node, moveId } : node,
      )

      if (isSubmission || !arenaRef.current) {
        return updatedNodes
      }

      const existingPlaceholders = updatedNodes.filter(
        (node) => node.parentId === targetNode.id && node.moveId === null,
      )

      if (existingPlaceholders.length > 0) {
        setActiveMenuNodeId(existingPlaceholders[0].id)
        return updatedNodes
      }

      const arenaRect = arenaRef.current.getBoundingClientRect()
      const siblings = updatedNodes.filter((node) => node.parentId === targetNode.id)
      const newNode = createChildNode(targetNode, siblings.length, arenaRect, nodeCounterRef)

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
      const newNode = createChildNode(targetNode, siblings.length, arenaRect, nodeCounterRef)
      setActiveMenuNodeId(newNode.id)
      return [...prev, newNode]
    })
  }

  const handleClearNode = () => {
    if (!activeMenuNode) return

    setNodes((prev) => {
      const descendants = collectDescendantIds(activeMenuNode.id, prev)
      return prev
        .filter((node) => !descendants.has(node.id))
        .map((node) => (node.id === activeMenuNode.id ? { ...node, moveId: null } : node))
    })
  }

  const closeMenu = () => setActiveMenuNodeId(null)

  return {
    nodes,
    connections,
    activeMenuNode,
    activeMoveId,
    isTerminalMove,
    draggingNodeId,
    menuRef,
    menuPosition,
    isDraggingMenu,
    headerTitle,
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
  }
}
