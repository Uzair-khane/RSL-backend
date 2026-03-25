var http = require('http')
// var APIKey = '6aa19b26151b66c20a34c4c09a3259383eb3a3b';
const sendOTP = async (to_number, text) => {
  console.log('here')
  var sender = '8583'
  var options = {
    host: 'api.veevotech.com',
    port: 80,
    path:
      '/sendsms?hash=' +
      process.env.VEEVOTECH_API_Key +
      '&receivenum=' +
      to_number +
      '&sendernum=' +
      encodeURIComponent(sender) +
      '&textmessage=' +
      encodeURIComponent(text),
    method: 'GET',
    setTimeout: 30000,
  }
  var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode)
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      console.log(chunk.toString())
    })
  })
  req.on('error', function (e) {
    console.log('problem with request: ' + e.message)
  })

  req.end()
}

module.exports = {
  sendOTP,
}
