import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await requireAdmin(request)
    return response.status(200).json({ allowed: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}