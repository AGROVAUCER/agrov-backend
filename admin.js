const express = require('express')
const { requireManager } = require('./auth')

const router = express.Router()

router.get('/dashboard', requireManager, (req, res) => {
  res.json({
    message: 'Manager access OK',
    email: req.user.email,
  })
})

module.exports = router
