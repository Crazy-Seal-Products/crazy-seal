// next/server for the quote route in replays: the real NextResponse, with an after() that queues its
// callback on globalThis.__cs.after for the test to run (or not, to play "the server stopped").
export { NextRequest, NextResponse } from 'next/server.js'

export function after(task) {
  globalThis.__cs.after.push(task)
}
