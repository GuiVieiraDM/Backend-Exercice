const AppError = require('./utils/AppError');
const express = require('express');
const sqliteConnection = require('./database/sqlite')
const routes = require('./routes');

sqliteConnection()

const app = express();
app.use(express.json());
app.use(routes)
app.use((req, res, error, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message
    })
  }

  console.log(error)

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error"
  })
})

const PORT = 3333;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`))