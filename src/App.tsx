import { useState, useEffect, useRef } from 'react'
import './index.css'

type Priority = 'low' | 'medium' | 'high'
type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: Priority
  createdAt: number
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-rose-100 text-rose-700 border-rose-200',
}

const PRIORITY_DOT: Record<Priority, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const stored = localStorage.getItem('todos')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [inputText, setInputText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length

  function addTodo(e: React.FormEvent) {
    e.preventDefault()
    const text = inputText.trim()
    if (!text) return
    const newTodo: Todo = {
      id: generateId(),
      text,
      completed: false,
      priority,
      createdAt: Date.now(),
    }
    setTodos((prev) => [newTodo, ...prev])
    setInputText('')
    inputRef.current?.focus()
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  function saveEdit(id: string) {
    const text = editText.trim()
    if (!text) return
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))
    setEditingId(null)
  }

  function removeTodo(id: string) {
    setRemovingId(id)
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id))
      setRemovingId(null)
    }, 200)
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Todos</h1>
          <p className="text-gray-400 text-sm mt-1">Stay organized, get things done</p>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-all duration-150"
            >
              Add
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Priority:</span>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                  priority === p
                    ? PRIORITY_COLORS[p] + ' shadow-sm scale-105'
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priority === p ? PRIORITY_DOT[p] : 'bg-gray-300'}`} />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </form>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="flex gap-3 mb-4">
            {[
              { label: 'Total', value: todos.length, color: 'text-gray-700 bg-white' },
              { label: 'Active', value: activeCount, color: 'text-indigo-700 bg-indigo-50' },
              { label: 'Done', value: completedCount, color: 'text-emerald-700 bg-emerald-50' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`flex-1 text-center py-2.5 rounded-xl border border-gray-100 ${color}`}>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs opacity-70">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 mb-4 shadow-sm">
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center shadow-sm">
              <div className="text-4xl mb-3">
                {filter === 'completed' ? '🎉' : filter === 'active' ? '✨' : '📋'}
              </div>
              <p className="text-gray-400 text-sm">
                {filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? 'All tasks are done!'
                  : 'Add your first task above'}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
                  removingId === todo.id
                    ? 'todo-item-exit opacity-0 scale-95'
                    : 'todo-item-enter border-gray-100 hover:shadow-md hover:border-indigo-100'
                }`}
              >
                {editingId === todo.id ? (
                  <div className="flex gap-2 p-3">
                    <input
                      autoFocus
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 pl-4">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        todo.completed
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {todo.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm transition-all duration-200 ${
                        todo.completed ? 'line-through text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {todo.text}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[todo.priority]}`}>
                      {todo.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(todo)}
                        className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeTodo(todo.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {completedCount > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearCompleted}
              className="text-xs text-gray-400 hover:text-rose-500 transition-colors duration-150 underline underline-offset-2"
            >
              Clear {completedCount} completed
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-8">
          Your tasks are saved locally ✦
        </p>
      </div>
    </div>
  )
}

export default App
