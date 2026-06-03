const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: buildContext(),
    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
  }),
})
const data = await response.json()
const reply = data.content?.[0]?.text || 'Sorry, I had trouble responding. Try again!'
