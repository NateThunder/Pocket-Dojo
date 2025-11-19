import Game from './Game'
import './App.css'

function App() {
  return (
    <div className="app">
      <main className="app-content">
        <div className="games-layout" aria-live="polite">
          <div className="games-header">
            <h1>Flow Node Trainer</h1>
          </div>
          <div className="games-stage">
            <Game />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
