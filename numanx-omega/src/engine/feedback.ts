export interface FeedbackPayloadInput {
  type: 'problem' | 'suggestion'
  message: string
  pathname: string
  email?: string
  hp?: string
}

export interface FeedbackClientPayload {
  type: 'problem' | 'suggestion'
  message: string
  page: string
  email?: string
  hp?: string
}

/**
 * Builds the sanitized client-side payload sent to the edge function.
 * Strictly includes only the 4 allowed fields (type, message, page, email) plus hp if non-empty.
 */
export function buildFeedbackPayload(input: FeedbackPayloadInput): FeedbackClientPayload {
  const page = `converter.numanxstudio.com${input.pathname}`
  const payload: FeedbackClientPayload = {
    type: input.type,
    message: input.message.trim(),
    page,
  }

  if (input.email && input.email.trim()) {
    payload.email = input.email.trim()
  }

  if (input.hp) {
    payload.hp = input.hp
  }

  return payload
}
