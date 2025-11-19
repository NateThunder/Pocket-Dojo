import type { FC } from 'react'
import type { GameSave } from './gameSaves'
import type { BJJNode, StageId } from './BjjData'
import './GameLobby.css'

interface GameLobbyProps {
  saves: GameSave[]
  onCreateSave: () => void
  onOpenSave: (id: string) => void
  onDeleteSave: (id: string) => void
  baseNodeLookup: Record<string, BJJNode>
}

const stageOrder: StageId[] = [1, 2, 3, 4]

const getStageColorClass = (stage: StageId | null) => {
  if (!stage || !stageOrder.includes(stage)) {
    return 'preview-node stage-empty'
  }
  return `preview-node stage-${stage}`
}

const GameLobby: FC<GameLobbyProps> = ({
  saves,
  onCreateSave,
  onOpenSave,
  onDeleteSave,
  baseNodeLookup,
}) => {
  const buildPreviewStages = (save: GameSave) => {
    const stages = save.nodes
      .map((node) => (node.moveId ? baseNodeLookup[node.moveId]?.stage ?? null : null))
      .filter((stage): stage is StageId => stage !== null)
      .slice(0, 6)

    if (stages.length === 0) {
      return [null, null, null]
    }

    return stages
  }

  return (
    <div className="game-lobby">
      <div className="game-lobby__header">
        <p className="eyebrow">Saved Flows</p>
        <h2>Choose a Training Map</h2>
        <p className="section-copy">
          Jump back into a flow you were building or spin up a fresh plan for today&apos;s session.
        </p>
      </div>

      <div className="game-lobby__grid">
        <div className="game-card-wrapper">
          <button type="button" className="game-card game-card--create" onClick={onCreateSave}>
            <div className="game-card__preview game-card__preview--create">
              <span className="game-card__plus">+</span>
            </div>
          </button>
          <p className="game-card__label">Create New Flow</p>
          <p className="game-card__hint">Start a fresh roadmap</p>
        </div>
        {saves.map((save) => {
          const stages = buildPreviewStages(save)
          return (
            <div className="game-card-wrapper" key={save.id}>
              <button
                type="button"
                className="game-card__delete"
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteSave(save.id)
                }}
                aria-label={`Delete ${save.name}`}
              >
                Delete
              </button>
              <button type="button" className="game-card" onClick={() => onOpenSave(save.id)}>
                <div className="game-card__preview">
                  {stages.map((stage, index) => (
                    <span key={`${save.id}-${index}`} className={getStageColorClass(stage)} />
                  ))}
                </div>
              </button>
              <p className="game-card__label">{save.name}</p>
              <p className="game-card__hint">Updated {new Date(save.updatedAt).toLocaleString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GameLobby
