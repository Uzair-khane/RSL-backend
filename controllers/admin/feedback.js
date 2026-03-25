const FeedBack = require('../../models/feedback')
const baseUrl = '/ap'
const moment = require('moment')

// #Feedback list
const FeedBackList = async (req, res) => {
  let result = await FeedBack.findAll()

  res.render('admin/feedback', {
    successFlash: req.flash('success'),
    errorFlash: req.flash('error').join('<br />'),
    title: 'KPCTA | Feedback',
    pageTitle: 'Feedback',
    baseUrl: baseUrl,
    result: result,
  })
}

// #Feedback table data
const TableDatalist = async (req, res) => {
  var searchStr = {}
  let { start, length, draw } = req.body
  const dataList = await FeedBack.findAll({
    offset: Number(start),
    limit: length != -1 ? Number(length) : null,
    order: [['id', 'DESC']],
  })
  const recordsTotal = await FeedBack.count()
  const recordsFiltered = await FeedBack.count({
    where: searchStr,
  })

  let dataArr = []
  let dataArr2 = []
  let i = 0
  let no = Number(start)

  dataList.forEach(async (item) => {
    i++
    no++
    dataArr = [
      no,
      item.full_name,
      item.email,
      item.description.substring(0, 80),
      `<a onclick="viewTableData(${item.id})">
            <button class="btn text-primary btn-sm" data-bs-toggle="tooltip" data-bs-original-title="Edit">
                <span class="fe fe-eye fs-14"></span>
            </button>
        </a>`,
    ]
    dataArr2.push(dataArr)
  })
  var data = JSON.stringify({
    draw: draw,
    recordsTotal: recordsTotal,
    recordsFiltered: recordsFiltered,
    data: dataArr2,
  })
  return res.send(data)
}

// #Feedback View specific record
const FeedBackView = async (req, res) => {
  let feedData = await FeedBack.findOne({
    where: {
      id: req.params.id,
    },
  })
  return res.send({
    data: { feedData: feedData, moment: moment },
    success: true,
  })
}

module.exports = {
  FeedBackList,
  FeedBackView,
  TableDatalist,
}
