import { Chat } from "./components/Chat"

function App() {
  return (
    <main className="h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4 text-center">English Chat Tutor V0.2</h1>

      <Chat />
    </main>
  )
}

export default App
