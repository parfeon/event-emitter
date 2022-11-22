import {describe, beforeEach, expect, it} from '@jest/globals'
import {EventEmitter} from '../src'

/** Events map for test suite. */
type TestEvents = {
  'case-one': (title: string) => void
  'case-two': (title: string, subtitle: string) => void
  'case-three': (title: string, flag: boolean) => void
}

describe('EventEmitter constructor', () => {
  it('should create EventEmitter instance', () => {
    expect(new EventEmitter<TestEvents>()).not.toBeUndefined()
  })

  it('should have empty list of listeners', () => {
    const ee = new EventEmitter<TestEvents>()

    expect(ee.eventNames.length).toEqual(0)
    expect(ee.listenersCount('case-one')).toEqual(0)
    expect(ee.listenersCount('case-two')).toEqual(0)
    expect(ee.listenersCount('case-three')).toEqual(0)
    expect(ee.listenersCount()).toEqual(0)
  })
})

describe('EventEmitter listener', () => {
  let ee: EventEmitter<TestEvents>

  beforeEach(() => {
    ee = new EventEmitter<TestEvents>()
  })

  it('should register two listeners for same event', () => {
    ee.on('case-one', (title) => {})
    ee.on('case-one', (title) => {})

    expect(ee.eventNames.includes('case-one')).toBeTruthy()
    expect(ee.eventNames.length).toEqual(1)
    expect(ee.listenersCount('case-one')).toEqual(2)
  })

  it('should register on-time listener', () => {
    ee.on('case-one', (title) => {})
    ee.once('case-two', (title, subtitle) => {})

    expect(ee.eventNames.includes('case-one')).toBeTruthy()
    expect(ee.eventNames.length).toEqual(2)
    expect(ee.listenersCount()).toEqual(2)
  })

  it('should remove listener on token invalidation', () => {
    const listenerToken = ee.on('case-one', (title) => {})

    expect(ee.eventNames.length).toEqual(1)

    expect(listenerToken.invalidate()).toBeTruthy()

    expect(ee.eventNames.length).toEqual(0)
    expect(ee.listenersCount()).toEqual(0)
  })

  it('should skip second listener token invalidation call', () => {
    const listenerToken = ee.on('case-one', (title) => {})

    expect(listenerToken.invalidate()).toBeTruthy()
    expect(listenerToken.invalidate()).toBeFalsy()
  })

  it('should remove all listeners', () => {
    ee.on('case-one', (title) => {})
    ee.on('case-one', (title) => {})
    ee.once('case-two', (title, subtitle) => {})
    ee.once('case-three', (title, flag) => {})

    expect(ee.eventNames.length).toEqual(3)
    expect(ee.listenersCount()).toEqual(4)

    ee.removeAllListeners()

    expect(ee.eventNames.length).toEqual(0)
    expect(ee.listenersCount()).toEqual(0)
  })

  it('should not throw when clean up empty listeners list', () => {
    expect(() => ee.removeAllListeners()).not.toThrow()
  })
})

describe('EventEmitter emitter', () => {
  let ee: EventEmitter<TestEvents>

  beforeEach(() => {
    ee = new EventEmitter<TestEvents>()
  })

  it('should not call listener without emitted event', () => {
    const handler = jest.fn(() => {})
    ee.on('case-one', handler)

    expect(handler).not.toBeCalled()
  })

  it('should not call listener for other events', () => {
    const handler = jest.fn(() => {})
    ee.on('case-one', handler)

    ee.emit('case-two', 'Testing listener', 'Test subtitle')

    expect(handler).not.toBeCalled()
  })

  it('should not call listener with invalidated token', () => {
    const handler = jest.fn(() => {})
    const listenerToken = ee.on('case-one', handler)

    expect(listenerToken.invalidate()).toBeTruthy()
    ee.emit('case-two', 'Testing listener', 'Test subtitle')

    expect(handler).not.toBeCalled()
  })

  it('should notify listener when event emitted', () => {
    const handler = jest.fn(() => {})
    ee.on('case-one', handler)

    ee.emit('case-one', 'Testing listener')

    expect(handler).toBeCalledTimes(1)
  })

  it('should pass event parameters to listener', () => {
    const title = 'This is test title'
    const flag = true
    const handler = jest.fn((etitle: string, eflags: boolean) => {
      expect(etitle).toEqual(title)
      expect(eflags).toEqual(flag)
    })
    ee.on('case-three', handler)

    ee.emit('case-three', title, flag)

    expect(handler).toBeCalledTimes(1)
  })

  it('should call once listener only once', () => {
    const onHandler = jest.fn(() => {})
    const onceHandler = jest.fn(() => {})
    ee.on('case-two', onHandler)
    ee.once('case-two', onceHandler)

    expect(ee.listenersCount('case-two')).toEqual(2)

    ee.emit('case-two', 'Test title', 'Test subtitle')

    expect(onceHandler).toBeCalledTimes(1)
    expect(onHandler).toBeCalledTimes(1)
    expect(ee.listenersCount('case-two')).toEqual(1)
  })
})
