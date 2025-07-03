import { useEffect, useRef, useState, type FormEvent } from "react";
import { systemPromptsV2 } from "./constants";
import { TopicSelector } from "./TopicSelector";

export const Chat = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('Google US English')
  const [listening, setListening] = useState(false)
  const [topic, setTopic] = useState()

  const synthRef = useRef(window.speechSynthesis)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const messagesWrapper = useRef<HTMLDivElement | null>(null)

  const _sendMessage = async () => {
    if (!input.trim()) return 

    const newMessages = [...messages, { role: 'user', content: input }]

    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            { role: 'system', content: systemPromptsV2[topic] || 'You are a helpful English tutor.' },
            ...newMessages
          ]
        })
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content
      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        speak(reply)

        messagesWrapper.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()

    _sendMessage()
  }

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = synthRef.current.getVoices()
      const filteresVoices = loadedVoices.filter(voice => voice.lang.includes('en-')) 
      setVoices(filteresVoices)
      if (filteresVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(filteresVoices[0].name)
      }
    }

    loadVoices()

    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  useEffect(() => {
    if (listening) {
      _sendMessage()
    }
  }, [input])

  useEffect(() => {
    messagesWrapper.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function getInitialMessageForTopic(topic: string): string {
    const starters: Record<string, string> = {
      greetings: "Hi! How do you usually say hello to someone new?",
      travel: "Where would you like to travel next?",
      airport: "What do you say when you arrive at the airport?",
      movies: "What kind of movies do you like?",
      'frontend-interview': "Can you tell me about your last frontend project?"
    }
    return starters[topic] || "Let's practice English. Select a topic and tell me something!"
  }

  const hasTopicSelected = Boolean(topic) 

  useEffect(() => {
    const starterMessage = getInitialMessageForTopic(topic)

    speak(starterMessage)
  
    setMessages([{ role: 'assistant', content: starterMessage }])
  }, [topic])

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1
    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) utterance.voice = voice
    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript

      setInput(transcript)

      setTimeout(() => {
        console.log('askndasdn')
        _sendMessage()
      }, 100)
    }

    recognition.onerror = (e) => {
      console.error(e)
    }
    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()

    setListening(true)

    recognitionRef.current = recognition
  }

  return (
    <div className=" bg-white p-4 rounded shadow max-w-xl mx-auto">
      <TopicSelector onSelect={setTopic} />

      <div className="h-96 overflow-y-auto border p-2 mb-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span
              className={`inline-block p-2 rounded-lg whitespace-pre-wrap cursor-pointer ${
                msg.role === 'user' ? 'bg-blue-200' : 'bg-green-100'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Escribiendo...</div>}
        <div ref={messagesWrapper}></div>
      </div>

       <form onSubmit={sendMessage} className="flex gap-2 mb-2">
        <input
          type="search"
          className="flex-1 border rounded p-2"
          placeholder="Escribe en inglés..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!hasTopicSelected}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading || !hasTopicSelected}
        >
          Enviar
        </button>
        <button
          ref={recognitionRef}
          type="button"
          onClick={startListening}
          className={`px-3 py-2 rounded ${listening ? 'bg-red-500' : 'bg-gray-700'} text-white`}
          disabled={!hasTopicSelected}
        >
          🎤
        </button>
      </form>

      <div>
        <label>
          Elige un asistente de Voz:
          <select
            className="mb-2 p-2 rounded border w-full"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={!hasTopicSelected}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
