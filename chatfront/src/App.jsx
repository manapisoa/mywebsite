import { useState } from 'react'
import './index.css'
import Chat from './template/chat.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-blue-600 col-auto text-amber-300"> 
      <Chat />  
      </div>
  )
}

export default App
