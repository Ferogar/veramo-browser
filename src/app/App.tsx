import React from 'react';
import './App.css';
import { AgentContext } from '../veramo'
import { DidForm } from './DidForm';
import { IIdentifier } from '@veramo/core';
import { DidItem } from './DidItem';

export function App() {
  const [identifiers, setIdentifiers] = React.useState<IIdentifier[]>([])
  const agent = React.useContext(AgentContext)
  
  const loadIdentifiers = async () => {
    console.log('LOAD')
    const i = await agent.didManagerFind()
    setIdentifiers(i)
  }

  React.useEffect(() => {
    loadIdentifiers()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <DidForm onCreate={() => loadIdentifiers()}/>
        { identifiers.map((identifier) => (
          <DidItem key={identifier.alias} identifier={identifier}
            onDelete={() => loadIdentifiers()} />
        ))}
      </header>
    </div>
  );
}
