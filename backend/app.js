const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('✅ PopQuiz 后端服务器已启动')
})

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
})
