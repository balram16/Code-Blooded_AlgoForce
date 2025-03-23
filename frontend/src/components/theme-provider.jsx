import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext()

function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "farm-assure-theme",
  onThemeChange,
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      
      root.classList.add(systemTheme)
      if (onThemeChange) onThemeChange(systemTheme)
      return
    }
    
    root.classList.add(theme)
    if (onThemeChange) onThemeChange(theme)
  }, [theme, onThemeChange])

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  
  return context
}

export { ThemeProvider, useTheme }
export default ThemeProvider 