// src/lib/email/gmail.ts while quote requests replay: sendEmail counts each attempt, then records the
// message, or fails the way Gmail does when it's unreachable while globalThis.__cs.mailFails is set.
export async function sendEmail(message) {
  const cs = globalThis.__cs
  cs.attempts = (cs.attempts ?? 0) + 1
  if (cs.mailFails) throw Object.assign(new Error('fake: Gmail is unreachable'), { code: 'ETIMEDOUT' })
  cs.mail.push(message)
  return { messageId: `fake-${cs.mail.length}` }
}
