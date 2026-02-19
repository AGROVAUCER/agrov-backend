import { giveReceipt } from '../services/receiptTransactions.service.js'

export async function giveReceiptController(req, res) {
  try {
    const { receiptToken, userId, amountRsd } = req.body
    const { firmId } = req.merchant

    const result = await giveReceipt({
      receiptToken,
      firmId,
      userId,
      amountRsd
    })

    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}
