import {
  validateReceipt,
  quoteReceipt
} from '../services/receipts.service.js'

export async function validateReceiptController(req, res) {
  try {
    const { rawQr } = req.body
    const { firmId, merchantPib } = req.merchant

    const result = await validateReceipt({
      rawQr,
      firmId,
      merchantPib
    })

    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

export async function quoteReceiptController(req, res) {
  try {
    const { receiptToken, amountRsd } = req.body
    const { firmId } = req.merchant

    const result = await quoteReceipt({
      receiptToken,
      firmId,
      amountRsd
    })

    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}
