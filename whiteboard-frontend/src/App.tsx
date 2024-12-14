import { useState } from 'react'
import Whiteboard from './components/Whiteboard'
import CodeEditor from './components/CodeEditor'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Whiteboard />}></Route>
        <Route path="/editor" element={<CodeEditor />} />
      </Routes>
    </Router>
  )
}

export default App
