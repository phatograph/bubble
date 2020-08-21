const express = require('express')
const next = require('next')
const {get} = require('lodash')

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    const server = express()
    const port = process.env.PORT || 3000

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on ${process.env.NODE_ENV} http://localhost:${port}`)
    })
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })
