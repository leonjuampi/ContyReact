
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
