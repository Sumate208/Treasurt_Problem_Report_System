const express = require("express")

const app = express();
const cors = require('cors')
const { logger } = require('./middlewares')
app.use(logger)
app.use(cors())

// Statics
app.use(express.static('static'))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// routers
const indexRouter = require('./routes/index')
const problemRouter = require('./routes/problem')
const testRouter = require('./routes/test')
const userRouter = require('./routes/user')

app.use(indexRouter.router)
app.use(problemRouter.router)
app.use(testRouter.router)
app.use(userRouter.router)

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`)
})