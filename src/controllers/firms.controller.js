import {
  createFirmProfile,
  getMyFirm,
  approveFirm,
  listAllFirms
} from '../services/firms.service.js'

export async function createFirmProfileController(req, res) {
  try {
    const firm = await createFirmProfile(req.auth.userId, req.body)
    return res.status(201).json({ data: firm })
  } catch (err) {
    console.error('createFirmProfileController error:', err)
    return res.status(500).json({ error: 'Failed to create firm profile' })
  }
}

export async function getMyFirmController(req, res) {
  try {
    const firm = await getMyFirm(req.auth.userId)
    return res.status(200).json({ data: firm })
  } catch (err) {
    console.error('getMyFirmController error:', err)
    return res.status(500).json({ error: 'Failed to load firm' })
  }
}

export async function approveFirmController(req, res) {
  try {
    const firm = await approveFirm(req.params.id)
    return res.status(200).json({ data: firm })
  } catch (err) {
    console.error('approveFirmController error:', err)
    return res.status(500).json({ error: 'Failed to approve firm' })
  }
}

export async function listAllFirmsController(req, res) {
  try {
    const firms = await listAllFirms()
    return res.status(200).json({ data: firms })
  } catch (err) {
    console.error('listAllFirmsController error:', err)
    return res.status(500).json({ error: 'Failed to load firms' })
  }
}
