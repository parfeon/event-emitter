# Event listener

Small and easy to use event listener / emitter with strongly-typed functions.

## Install

#### NPM
```sh
npm install @randombytes/event-emitter
```

#### Yarn
```shell
yarn add @randombytes/event-emitter
```

## Import

```typescript
import { EventEmitter } from '@randombytes/event-emitter'
```

## Usage

```typescript
// Prepare events map for emitter.
import {EventEmitter} from "./emitter";

// Events map type which will be used by EventEmitter to assist 
// with functions usage.
type TestEvents = {
  'case-one': (title: string) => void
  'case-two': (title: string, subtitle: string) => void
  'case-three': (title: string, flag: boolean) => void
}

// Create event emitter instance.
const emitter = new EventEmitter<TestEvents>()

// Add listener which will be called for each emitted target events.
const listenerToken = emitter.on('case-two', (title) => {
  // Handle `case-two` event with passed title.
})

// Add listener which will be called only once for emitted 
// target event.
emitter.once('case-three', (title, flags) => {
  // Handle `case-three` event with passed title and flags.
})

// Emit events assisted by IDE for list of expected arguments.
emitter.emit('case-two', 'Event title')
emitter.emit('case-three', 'One time event title', true)

// Unregister listener when it will be required
listenerToken.invalidate()

// or remove all listeners at once.
emitter.removeAllListeners()
```
