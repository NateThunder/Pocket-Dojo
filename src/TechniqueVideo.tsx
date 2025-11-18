import type { FC } from 'react'
import './TechniqueVideo.css'

interface TechniqueVideoProps {
  videoUrl: string | null
}

const TechniqueVideo: FC<TechniqueVideoProps> = ({ videoUrl }) => {
  if (!videoUrl) {
    return <p className="video-note">No video configured for this technique.</p>
  }

  return (
    <div className="video-inline-player">
      <iframe
        title="Technique Video"
        src={videoUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default TechniqueVideo
