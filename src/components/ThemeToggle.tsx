import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { Button } from './ui/Button'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 border border-border rounded p-1">
      <Button
        variant={theme === 'light' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-7 px-2"
      >
        <Sun className="h-3 w-3" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-7 px-2"
      >
        <Moon className="h-3 w-3" />
      </Button>
      <Button
        variant={theme === 'system' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="h-7 px-2"
      >
        <Monitor className="h-3 w-3" />
      </Button>
    </div>
  )
}
