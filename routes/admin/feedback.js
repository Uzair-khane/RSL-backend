const express = require('express'),
  router = express.Router()

const { FeedBackController } = require('../../controllers')

// #FeedBack List
router.get('/list', async (req, res) => {
  return FeedBackController.FeedBackList(req, res)
})


// #FeedBack Table list
router.post('/list', async (req, res) => {
  return FeedBackController.TableDatalist(req, res)
})

// #FeedBack View Data
router.get('/view/:id', async (req, res) => {
  return FeedBackController.FeedBackView(req, res)
})

module.exports = router
