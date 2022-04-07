// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager, IMessageHandler, TAgent } from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Web did identity provider
import { WebDIDProvider } from '@veramo/did-provider-web'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'


// Custom key management system for RN
import { KeyManagementSystem } from '@veramo/kms-local'

import { ISelectiveDisclosure, SelectiveDisclosure, SdrMessageHandler } from '@veramo/selective-disclosure'

// 
import { MessageHandler } from '@veramo/message-handler'
import { JwtMessageHandler } from '@veramo/did-jwt'

//
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c'

// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, IDataStoreORM, DataStore, DataStoreORM, PrivateKeyStore } from '@veramo/data-store'

// TypeORM is installed with `@veramo/data-store`
import { createConnection, ConnectionOptions } from 'typeorm'

import * as base64 from '@juanelas/base64'

const rinkebyProviderData = {
  defaultKms: 'local',
  network: 'rinkeby',
  rpcUrl: 'https://rinkeby.infura.io/ethr-did',
}

const resolvers = {
  ...ethrDidResolver({
    networks: [rinkebyProviderData]
      .map(({ network, rpcUrl }) => ({
        name: network,
        rpcUrl
      }))
  }),
  ...webDidResolver(),
}


export const resolver = new Resolver(resolvers)
export type VeramoAgent = TAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver &
  ISelectiveDisclosure & IMessageHandler & ICredentialIssuer & IDataStore &
  IDataStoreORM>

const printHash = (buffer: Uint8Array) => {
  crypto.subtle.digest({
    name: 'SHA-256'
  }, buffer).then((digest) => {
    const digestBase64 = base64.encode(digest)
    console.log(digestBase64)
  })
}


export const agentBuilder = () => {
  const veramoBase64 = localStorage.getItem('veramo')
  let database = new Uint8Array()
  let synchronize = true
  if(veramoBase64) {
    synchronize = false
    database = base64.decode(veramoBase64, false) as Uint8Array
    printHash(database)
  }

  const opts: ConnectionOptions = {
    type: 'sqljs',
    database,
    synchronize,
    autoSave: true,
    autoSaveCallback(data: Uint8Array) {
      printHash(data)
      const veramoBase64 = base64.encode(data, true, false)
      localStorage.setItem('veramo', veramoBase64)
    },
    //   logging: ['error', 'info', 'warn'],
    entities: Entities,
  }
  const dbConnection = createConnection(opts);
  (window as any).dbConnectionPromise = dbConnection

  return createAgent<
    IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver &
    ISelectiveDisclosure & IMessageHandler & ICredentialIssuer & IDataStore &
    IDataStoreORM
  >({
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(
            new PrivateKeyStore(dbConnection)
          ),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr:rinkeby': new EthrDIDProvider(rinkebyProviderData),
          'did:web': new WebDIDProvider({
            defaultKms: 'local',
          }),
        },
      }),
      new CredentialIssuer(),
      new SelectiveDisclosure(),
      new DataStore(dbConnection),
      new DataStoreORM(dbConnection),
      new MessageHandler({
        messageHandlers: [
          new JwtMessageHandler(),
          new SdrMessageHandler(),
          new W3cMessageHandler(),
        ]
      }),
      new DIDResolverPlugin({
        resolver
      }),
    ],
  })
}
