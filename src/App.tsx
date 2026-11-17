import { useEffect, useRef, useState } from 'react'
import './App.css'
import Training from './training/Training'

type Page = 'home' | 'training' | 'statistics'

function Dartboard() {
  const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
  return (
    <svg className="dartboard" viewBox="-250 -250 500 500" aria-hidden="true">
      <circle r="246" fill="#101114" stroke="#b8bdc7" strokeWidth="2" />
      {numbers.map((number, index) => (
        <g key={number} transform={`rotate(${index * 18})`}>
          <path d="M 0 0 L -32.85 -207.42 A 210 210 0 0 1 32.85 -207.42 Z" fill={index % 2 ? '#bab4a3' : '#17181c'} stroke="#777" strokeWidth="1" />
          {[202, 128].map((radius) => (
            <path key={radius} d={`M ${-radius * 0.1564} ${-radius * 0.9877} A ${radius} ${radius} 0 0 1 ${radius * 0.1564} ${-radius * 0.9877}`} fill="none" stroke={index % 2 ? '#426b58' : '#d72638'} strokeWidth="12" />
          ))}
          <text y="-222" textAnchor="middle" fill="#ddd" fontSize="19">{number}</text>
        </g>
      ))}
      <circle r="21" fill="#426b58" stroke="#aaa" />
      <circle r="9" fill="#d72638" stroke="#aaa" />
    </svg>
  )
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (page !== 'home') heading.current?.focus()
  }, [page])

  function goHome() {
    setPage('home')
    requestAnimationFrame(() => heading.current?.focus())
  }

  return (
    <div className="app-shell">
      <Dartboard />
      <header className="brand"><span className="brand-mark" aria-hidden="true">◎</span> DART <span>TRAINING</span></header>
      <main>
        {page === 'home' ? (
          <>
            <div className="intro">
              <p className="eyebrow">YOUR PRACTICE. YOUR PROGRESS.</p>
              <h1 ref={heading} tabIndex={-1}>Every dart<br />counts<span>.</span></h1>
              <p className="lead">Find your focus. Build your accuracy.<br />Make every session a step forward.</p>
            </div>
            <nav className="choices" aria-label="Main menu">
              <button className="choice training" onClick={() => setPage('training')}>
                <span className="choice-icon target-icon" aria-hidden="true">◎</span>
                <span className="choice-copy"><span className="eyebrow">FOCUS ON YOUR TARGET</span><span className="choice-title">Triple 20 Training</span><span className="description">One target. Every throw. A clearer picture of your game.</span></span>
                <span className="arrow" aria-hidden="true">↗</span>
              </button>
              <button className="choice statistics" onClick={() => setPage('statistics')}>
                <svg className="choice-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M7 32V22m13 10V13m13 19V5" /></svg>
                <span className="choice-copy"><span className="eyebrow">SEE YOUR PROGRESS</span><span className="choice-title">Statistics</span><span className="description">Explore your sessions, accuracy and patterns over time.</span></span>
                <span className="arrow" aria-hidden="true">↗</span>
              </button>
            </nav>
          </>
        ) : page === 'training' ? (
          <section className="destination">
            <button className="back-button" onClick={goHome}>← Back to Start Page</button>
            <h1 ref={heading} tabIndex={-1}>Triple 20 Training</h1>
            <Training />
          </section>
        ) : (
          <section className="destination">
            <button className="back-button" onClick={goHome}>← Back to Start Page</button>
            <p className="eyebrow">SEE YOUR PROGRESS</p>
            <h1 ref={heading} tabIndex={-1}>Statistics</h1>
            <div className="notice"><h2>Coming next</h2><p>Session history and full statistics will be added in the next development steps.</p></div>
          </section>
        )}
      </main>
      <footer><span className="footer-line" /> BUILT FOR THE PRACTICE BOARD</footer>
    </div>
  )
}

export default App
