import { useEffect, useRef, useState } from 'react'
import MovesMenu from './MovesMenu'
import { useNodeMechanics } from './useNodeMechanics'
import './Game.css'

const moveVideoMap: Record<string, string> = {
  stage1_double_leg: 'https://www.youtube.com/watch?v=4DHzLvLd-0Y',
  stage1_body_lock_trip: 'https://www.youtube.com/watch?v=xagOTpxeliE&t=22s',
  stage1_single_leg_snap: 'https://www.youtube.com/watch?v=mCRx-fBm8zE&t=301s',
  stage1_guard_pull_closed: 'https://www.youtube.com/watch?v=JDJYWBbzspQ',
  stage1_arm_drag_to_back: 'https://www.youtube.com/watch?v=e_c7G5T_ZR8&t=191s',
  stage2a_posture_break: 'https://www.youtube.com/watch?v=IJx92rHqtfg',
  stage2a_knee_slice_pass: 'https://www.youtube.com/watch?v=Hcjo1LI4LKw',
  stage2a_double_under_pass: 'https://www.youtube.com/watch?v=PizdshB63kw',
  stage2a_torreando_pass: 'https://www.youtube.com/watch?v=dIMMnofqOXk',
  stage2a_leg_drag_pass: 'https://www.youtube.com/watch?v=x5AsEhq3bio',
  stage2b_closed_guard_control: 'https://www.youtube.com/watch?v=zXpFhLK5MQI',
  stage2b_hip_bump: 'https://www.youtube.com/watch?v=9gOLkgms0QU',
  stage2b_scissor_sweep: 'https://www.youtube.com/watch?v=UBf7uF5x8GQ',
  stage2b_flower_sweep: 'https://www.youtube.com/watch?v=NEzVVhg2p5c',
  stage2b_kimura_guard: 'https://www.youtube.com/watch?v=mVkKOPNGvjA',
  stage2b_cross_collar_guard: 'https://www.youtube.com/watch?v=6yQGBRR9yqY',
  stage2b_triangle_choke: 'https://www.youtube.com/watch?v=VA6zjDN690s',
  stage2b_bad_half_escape: 'https://www.youtube.com/watch?v=tcS7oBdpRW0',
  stage2b_bad_turtle: 'https://www.youtube.com/watch?v=-BYPW3FwG7I&t=43s',
  stage2c_front_headlock_spin: 'https://www.youtube.com/watch?v=dU5Lv_PQeQM',
  stage2c_wrestle_up_single: 'https://www.youtube.com/shorts/CYK5RmnlRHw',
  stage2_open_guard_control: 'https://www.youtube.com/watch?v=LPet-GrNNB8',
  stage2_tripod_sweep: 'https://www.youtube.com/watch?v=Q5RS_5uwgIk',
  stage2_sickle_sweep: 'https://www.youtube.com/watch?v=WryGCOlJMZ4',
  stage2_technical_standup: 'https://www.youtube.com/watch?v=4yc0Swz_El0',
  stage2_half_guard_control: 'https://www.youtube.com/watch?v=15kus9CLg2s',
  stage2_old_school_sweep: 'https://www.youtube.com/watch?v=Jnc2siD9cak',
  stage2_half_guard_knee_cut: 'https://www.youtube.com/watch?v=1guSnAAkPC0',
  stage3_side_control: 'https://www.youtube.com/watch?v=nDbHQPBvQvQ',
  stage3_knee_on_belly: 'https://www.youtube.com/watch?v=7DbaY0BtuWk',
  stage3_mount: 'https://www.youtube.com/watch?v=u_bMy3mQjro',
  stage3_back_control: 'https://www.youtube.com/watch?v=VlsiWgXF9SI',
  stage4_rnc: 'https://www.youtube.com/shorts/oYDe-hrazL8',
  stage4_cross_collar_mount: 'https://www.youtube.com/watch?v=Krl3t53gVYY',
  stage4_armbar_mount: 'https://www.youtube.com/watch?v=ECPcvbKt-lY',
  stage4_kimura_side: 'https://www.youtube.com/watch?v=QT0TqceznpQ',
  stage4_bow_and_arrow: 'https://www.youtube.com/watch?v=xqNhZVNhxnE',
  stage4_straight_ankle: 'https://youtu.be/JD3QucUWIwI?si=2IwKpRGBIWGdrt8I&t=16',
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

    const configuredUrl = moveVideoMap[activeMoveId]
    if (!configuredUrl) {
      setVideoEmbedUrl(null)
      return
    }

    try {
      const parsed = new URL(configuredUrl)
      const hostname = parsed.hostname.replace(/^www\./, '')
      let embed: string | null = null

      if (hostname === 'youtu.be') {
        const videoId = parsed.pathname.replace('/', '')
        embed = videoId ? `https://www.youtube.com/embed/${videoId}` : null
      } else if (hostname.includes('youtube.com')) {
        if (parsed.pathname.startsWith('/embed/')) {
          embed = `https://www.youtube.com${parsed.pathname}`
        } else if (parsed.pathname.startsWith('/shorts/')) {
          const [, , videoId] = parsed.pathname.split('/')
          embed = videoId ? `https://www.youtube.com/embed/${videoId}` : null
        } else {
          const videoId = parsed.searchParams.get('v')
          embed = videoId ? `https://www.youtube.com/embed/${videoId}` : null
        }
      }

      setVideoEmbedUrl(embed)
    } catch {
      setVideoEmbedUrl(null)
    }
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
          onAddBranch={handleAddBranch}
          onClearNode={handleClearNode}
          onCloseMenu={closeMenu}
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
