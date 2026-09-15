import { Routes, Route } from 'react-router-dom'
import ChatPage from './components/ChatPage'
import ResponsePage from './components/ResponsePage'

function App() {
  return (
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/response" element={<ResponsePage />} />
    </Routes>
  )
}

export default App
