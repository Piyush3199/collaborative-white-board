import { useState } from 'react'
import Whiteboard from './components/Whiteboard'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Whiteboard />}></Route>
      </Routes>
    </Router>
  )
}

export default App
