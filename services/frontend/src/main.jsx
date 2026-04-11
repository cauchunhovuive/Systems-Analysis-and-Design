import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

// 1. Giữ nguyên dòng CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// 2. THÊM DÒNG NÀY: Nạp JavaScript để nút 3 gạch hoạt động
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)