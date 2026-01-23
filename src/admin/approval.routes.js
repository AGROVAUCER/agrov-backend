// src/admin/approval.routes.js
const router = require('express').Router()
const ctrl = require('./approval.controller')
const requireAdmin = require('../auth/requireAdmin')

router.post('/firms/:id/approve', requireAdmin, ctrl.approveFirm)
router.post('/stores/:id/approve', requireAdmin, ctrl.approveStore)

module.exports = router
