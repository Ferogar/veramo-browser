import { IIdentifier } from '@veramo/core'
import React from 'react'
import { AgentContext } from '../veramo'

interface Props {
  identifier: IIdentifier
  onDelete(alias: string): void
}

export const DidItem = (props: Props) => {
  const { identifier } = props
  const agent = React.useContext(AgentContext)

  const deleteIdentity = async () => {
    await agent.didManagerDelete({ did: identifier.did })
    props.onDelete(identifier.alias || '')
  }

  return (
    <div className='DidItem'>
      <p>Alias: {identifier.alias}, DID: {identifier.did}</p>
      <button type='button' onClick={deleteIdentity}>Delete</button>
    </div>
  )
}