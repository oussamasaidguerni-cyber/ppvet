import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from './ui/Input'
import { globalSearch } from '../lib/search'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const search = async () => {
      if (query.length >= 2) {
        const res = await globalSearch(query)
        setResults(res)
        setShowResults(true)
      } else {
        setResults([])
        setShowResults(false)
      }
    }
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = (link: string) => {
    navigate(link)
    setQuery('')
    setShowResults(false)
  }

  const getTypeLabel = (type: string) => {
    const labels: any = { client: 'Client', animal: 'Animal', invoice: 'Invoice', product: 'Product', appointment: 'Appointment' }
    return labels[type] || type
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clients, animals, invoices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((r, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(r.link)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-gray-600">{r.subtitle}</div>
                </div>
                <span className="text-xs text-gray-500">{getTypeLabel(r.type)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {showResults && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 shadow-lg z-50 p-4 text-sm text-gray-600">
          No results found
        </div>
      )}
    </div>
  )
}
