import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app'
import { agentBuilder, AgentContext } from './veramo'
import reportWebVitals from './reportWebVitals'


(window as any).initSqlJs({ locateFile: (filename: string) => `/sql.js/${filename}` }).then(function(SQL: any){
  (window as any).SQL = SQL
  const container = document.getElementById('root')
  if (container === null) {
    return
  }
  const agent = agentBuilder()

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <AgentContext.Provider value={agent}>
        <App />
      </AgentContext.Provider>
    </React.StrictMode>,
  )
  //...
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
