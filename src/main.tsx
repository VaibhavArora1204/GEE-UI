import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App.tsx'
import './index.css'
import '@mantine/core/styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
    <App />
    </MantineProvider>
  </React.StrictMode>,
)
