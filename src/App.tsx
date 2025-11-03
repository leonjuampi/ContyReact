// En src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext' // <-- 1. Importar

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <AuthProvider> {/* <-- 2. Envolver AppRoutes */}
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App