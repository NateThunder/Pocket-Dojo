import { useState } from 'react'
import Game from './Game'
import './App.css'

// Top-level nav items drive the simple view switching logic below.
const menuItems = ['Home', 'Games', 'Training', 'Shop', 'Profile']

function App() {
  const [activeItem, setActiveItem] = useState('Home')

  // Static copy blocks so the hero text stays readable inside the component file.
  const renderHome = () => (
    <div className="home-hero" aria-live="polite">
      <p className="eyebrow">Home Base</p>
      <h1>Welcome to Pocket Dojo</h1>
      <p className="welcome-copy">
        Your training ground to rise from white belt foundations to blue belt confidence.
        Dive into quests, track your growth, and celebrate every level-up along the way.
      </p>
    </div>
  )

  // Wrapper that houses the Flow Node Trainer experience.
  const renderGames = () => (
    <div className="games-layout" aria-live="polite">
      <div className="games-header">
        <p className="eyebrow">Games Lab</p>
        <h1>Flow Node Trainer</h1>
        <p className="section-copy">
          Drag the glowing node to chart your path. Every movement sharpens your control and builds
          the reflexes you need for the next belt.
        </p>
      </div>
      <div className="games-stage">
        <Game />
      </div>
    </div>
  )

  // Friendly placeholder for unfinished menu sections.
  const renderFallback = () => (
    <section className="content-card" aria-live="polite">
      <p className="placeholder-text">
        The {activeItem} zone is being forged. Check back soon for fresh challenges.
      </p>
    </section>
  )

  // Main scaffold: pills for the nav and whichever sub-section is currently active.
  return (
    <div className="app">
      <nav className="menu-bar" role="navigation" aria-label="Main menu">
        {menuItems.map((label) => {
          const selected = activeItem === label

          return (
            <button
              key={label}
              className={`menu-button${selected ? ' is-active' : ''}`}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveItem(label)}
            >
              {label}
            </button>
          )
        })}
      </nav>

      {activeItem === 'Games'
        ? renderGames()
        : activeItem === 'Home'
          ? renderHome()
          : renderFallback()}
    </div>
  )
}

export default App
