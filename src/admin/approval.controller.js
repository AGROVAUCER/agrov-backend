// src/admin/approval.controller.js
const service = require('./approval.service')

async function approveFirm(req, res) {
  const firm = await service.approveFirm(req.params.id)
  res.json(firm)
}

async function approveStore(req, res) {
  const store = await service.approveStore(req.params.id)
  res.json(store)
}

module.exports = {
  approveFirm,
  approveStore
}
