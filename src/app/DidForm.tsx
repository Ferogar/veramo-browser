import React from 'react'
import { AgentContext } from '../veramo'

interface Props {
  onCreate(): void
}

export const DidForm = (props: Props) => {
  const [alias, setAlias] = React.useState('')
  const agent = React.useContext(AgentContext)

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    console.log('Submit', alias)
    await agent.didManagerGetOrCreate({ alias })
    setAlias('')
    props.onCreate()
  }

  return (
    <form onSubmit={(ev) => onSubmit(ev)}>
      <input value={alias} onChange={(ev) => setAlias(ev.target.value)} />
      <button type='submit'>Add</button>
    </form>
  )
}
