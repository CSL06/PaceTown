/**
 * @vitest-environment jsdom
 *
 * The StrictMode case is the one that actually shipped broken: a "have I
 * started" ref outlived React's development mount/cleanup/mount, so the second
 * mount skipped the work the first had just cancelled and the bar froze. That
 * regression is pinned first.
 */
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useBootProgress } from './useBootProgress'

/** A response shaped like the few members useBootProgress actually touches. */
function fakeResponse(bytes: number, chunks = 2) {
  const per = Math.floor(bytes / chunks)
  let sent = 0
  return {
    ok: true,
    headers: { get: (h: string) => (h.toLowerCase() === 'content-length' ? String(bytes) : null) },
    body: {
      getReader: () => ({
        read: async () => {
          if (sent >= chunks) return { done: true, value: undefined }
          sent += 1
          return { done: false, value: new Uint8Array(per) }
        },
      }),
    },
    arrayBuffer: async () => new ArrayBuffer(0),
  }
}

function Probe() {
  const { progress, ready, stage, timedOut } = useBootProgress()
  return (
    <div>
      <span data-testid="pct">{Math.round(progress * 100)}</span>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="stage">{stage}</span>
      <span data-testid="timedout">{String(timedOut)}</span>
    </div>
  )
}

afterEach(() => vi.restoreAllMocks())

describe('StrictMode', () => {
  it('still completes when React mounts, cleans up, and mounts again', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse(1000)))

    render(<StrictMode><Probe /></StrictMode>)

    // The bug: this sat at 0 forever, because the second mount skipped the
    // work the first mount's cleanup had aborted.
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(screen.getByTestId('pct')).toHaveTextContent('100')
    expect(screen.getByTestId('stage')).toHaveTextContent('ready')
  })
})

describe('progress', () => {
  it('reaches ready and full for a normal load', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse(4000)))
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(screen.getByTestId('pct')).toHaveTextContent('100')
    expect(screen.getByTestId('timedout')).toHaveTextContent('false')
  })

  it('makes one request per asset, with no preflight HEAD round', async () => {
    // Typed parameters, or mock.calls is an empty tuple and call[1] will not
    // compile even though the test passes under vitest.
    const spy = vi.fn(async (_url: string, _init?: RequestInit) => fakeResponse(500))
    vi.stubGlobal('fetch', spy)
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    // Eight assets, eight fetches. A HEAD pass would double this.
    expect(spy).toHaveBeenCalledTimes(8)
    for (const call of spy.mock.calls) {
      expect(call[1]?.method).toBeUndefined()
    }
  })

  it('opens the town even when every asset fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
  })

  it('opens the town when the server hides sizes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      headers: { get: () => null },
      body: { getReader: () => ({ read: async () => ({ done: true, value: undefined }) }) },
      arrayBuffer: async () => new ArrayBuffer(0),
    })))
    render(<Probe />)
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
  })

  it('reports no progress and opens immediately without fetch', () => {
    vi.stubGlobal('fetch', undefined)
    render(<Probe />)
    expect(screen.getByTestId('ready')).toHaveTextContent('true')
    expect(screen.getByTestId('pct')).toHaveTextContent('100')
  })
})
