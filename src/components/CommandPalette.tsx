import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { globalSearch } from '../lib/search'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setQuery('')
        setResults([])
        setSelectedIndex(0)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const search = async () => {
      if (query.length >= 2) {
        const res = await globalSearch(query)
        setResults(res)
        setSelectedIndex(0)
      } else {
        setResults([])
        setSelectedIndex(0)
      }
    }
    const timeout = setTimeout(search, 200)
    return () => clearTimeout(timeout)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (results.length ? (i + 1) % results.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        navigate(results[selectedIndex].link)
        setOpen(false)
        setQuery('')
        setResults([])
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex, navigate])

  if (!open) return null

  const quickActions = [
    { label: 'Go to Dashboard', action: () => navigate('/') },
    { label: 'Go to Calendar', action: () => navigate('/appointments') },
    { label: 'Go to Patients', action: () => navigate('/clients') },
    { label: 'Go to Consultations', action: () => navigate('/medical') },
    { label: 'Go to Inventory', action: () => navigate('/inventory') },
    { label: 'Go to Finance', action: () => navigate('/billing') },
    { label: 'Go to Settings', action: () => navigate('/settings') },
    { label: 'Register Patient', action: () => navigate('/clients/new') },
    { label: 'Book Appointment', action: () => navigate('/appointments') },
    { label: 'Start Consultation', action: () => navigate('/medical/start-visit') },
    { label: 'Create Invoice', action: () => navigate('/billing') },
  ]

  const displayItems = query.length >= 2 ? results : quickActions.map((a, i) => ({ type: 'action', id: i, title: a.label, subtitle: 'Action', link: null, action: a.action }))

  return (
    <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setOpen(false)}>
      <div className="flex items-start justify-center pt-[20vh] px-4">
        <div className="w-full max-w-xl bg-card border border-border shadow-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a command..."
              className="w-full h-12 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <span className="text-xs text-muted-foreground">Esc</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {displayItems.length === 0 && query.length >= 2 ? (
              <div className="p-4 text-sm text-muted-foreground">No results found</div>
            ) : (
              displayItems.map((item: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action()
                    } else if (item.link) {
                      navigate(item.link)
                    }
                    setOpen(false)
                    setQuery('')
                    setResults([])
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between ${
                    selectedIndex === idx ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    {item.subtitle && <div className="text-xs text-muted-foreground">{item.subtitle}</div>}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
          <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      </div>
    </div>
  )
}