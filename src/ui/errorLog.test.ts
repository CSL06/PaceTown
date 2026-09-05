/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearProblems, problemsAsText, recentProblems, recordProblem, setReporter,
} from './errorLog'

beforeEach(() => {
  localStorage.clear()
  setReporter(null)
})

describe('recording', () => {
  it('keeps what happened, where', () => {
    recordProblem('error', 'the clock tower fell over', 'at Tower.tsx:12')
    const [entry] = recentProblems()
    expect(entry.message).toBe('the clock tower fell over')
    expect(entry.kind).toBe('error')
    expect(entry.stack).toContain('Tower.tsx')
    expect(entry.route).toBe('/')
  })

  it('lists the newest first, because that is the one being reported', () => {
    recordProblem('error', 'first')
    recordProblem('error', 'second')
    expect(recentProblems()[0].message).toBe('second')
  })

  it('caps the buffer so it can never fill the quota', () => {
    for (let i = 0; i < 40; i += 1) recordProblem('error', `problem ${i}`)
    const entries = recentProblems()
    expect(entries.length).toBeLessThanOrEqual(25)
    // The most recent survived; the oldest were dropped.
    expect(entries[0].message).toBe('problem 39')
  })

  it('truncates a runaway stack rather than storing all of it', () => {
    recordProblem('error', 'boom', 'x'.repeat(50_000))
    expect(recentProblems()[0].stack!.length).toBeLessThanOrEqual(1200)
  })

  it('survives storage that refuses to be written', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => { throw new Error('quota') })
    // A logger that throws is worse than no logger.
    expect(() => recordProblem('error', 'boom')).not.toThrow()
    setItem.mockRestore()
  })

  it('survives storage that has been corrupted', () => {
    localStorage.setItem('pacetown.problems', '{not json')
    expect(recentProblems()).toEqual([])
    expect(() => recordProblem('error', 'boom')).not.toThrow()
    expect(recentProblems()).toHaveLength(1)
  })
})

describe('the reporter seam', () => {
  it('sends nowhere by default', () => {
    // The whole point: nothing leaves the browser unless asked.
    recordProblem('error', 'quiet')
    expect(recentProblems()).toHaveLength(1)
  })

  it('forwards to a reporter once one is wired', () => {
    const sent: string[] = []
    setReporter((e) => sent.push(e.message))
    recordProblem('react', 'sent onward')
    expect(sent).toEqual(['sent onward'])
  })

  it('does not let a broken reporter break the app', () => {
    setReporter(() => { throw new Error('collector is down') })
    expect(() => recordProblem('error', 'boom')).not.toThrow()
  })
})

describe('handing it over', () => {
  it('says so plainly when there is nothing to report', () => {
    expect(problemsAsText()).toMatch(/no problems/i)
  })

  it('renders something a person can paste into a bug report', () => {
    recordProblem('promise', 'unhandled rejection')
    const text = problemsAsText()
    expect(text).toContain('unhandled rejection')
    expect(text).toContain('promise')
  })

  it('clears on request', () => {
    recordProblem('error', 'boom')
    clearProblems()
    expect(recentProblems()).toEqual([])
  })
})
