const express = require('express'),
  router = express.Router()

const { SettingController } = require('../../controllers')

// # get All Data from the setting Tabel
router.get('/list', async (req, res) => {
  return SettingController.SettingList(req, res)
})

router.post('/update', async (req, res) => {
  return SettingController.SettingUpdate(req, res)
})

router.post('/add', async (req, res) => {
  return SettingController.imagesAdd(req, res)
})

// activity logs
router.get('/activity-logs', async (req, res) => {
  return SettingController.activityLogsPage(req, res)
})
router.post('/activity-logs', async (req, res) => {
  return SettingController.activityLogsData(req, res)
})

module.exports = router
