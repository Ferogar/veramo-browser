import React from 'react'
import { VeramoAgent, agentBuilder } from './agent'

export const AgentContext = React.createContext<VeramoAgent>(undefined as any)
export const AgentProvider = (props: React.PropsWithChildren<{}>) => {
  const agent = agentBuilder()
  return (
    <AgentContext.Provider value={agent}>
      {props.children}
    </AgentContext.Provider>
  )
}
