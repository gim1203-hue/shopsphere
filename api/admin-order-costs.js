import { requireAdmin, sendApiError } from './_lib/firebaseAdmin.js'

const dollarsToCents = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) return null
  return Math.round(amount * 100)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { db, user } = await requireAdmin(request)
    const sessionId = String(request.body?.sessionId || '')
    const manualShippingCostCents = dollarsToCents(request.body?.shipping)
    const manualTaxCostCents = dollarsToCents(request.body?.tax)
    const manualOtherCostCents = dollarsToCents(request.body?.other)

    if (!sessionId.startsWith('cs_')) return response.status(400).json({ error: 'Invalid checkout session' })
    if (manualShippingCostCents === null || manualTaxCostCents === null || manualOtherCostCents === null) {
      return response.status(400).json({ error: 'Shipping, tax, and other costs must be valid non-negative amounts.' })
    }

    await db.collection('fulfillmentOrders').doc(sessionId).set({
      manualShippingCostCents,
      manualTaxCostCents,
      manualOtherCostCents,
      costsUpdatedAt: new Date(),
      costsUpdatedBy: user.uid,
    }, { merge: true })

    return response.status(200).json({ manualShippingCostCents, manualTaxCostCents, manualOtherCostCents })
  } catch (error) {
    return sendApiError(response, error)
  }
}
