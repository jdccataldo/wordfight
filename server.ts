import { createServer } from 'http'
import { Server } from 'socket.io'
import next from 'next'
import { loadDictionaries } from './lib/dictionary'
import { loadUncategorizedWords } from './lib/uncategorizedWords'
import { registerSocketHandlers } from './lib/roomManager'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'

loadDictionaries()
loadUncategorizedWords()

const app = next({ dev, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', socket => {
    registerSocketHandlers(io, socket)
  })

  httpServer.listen(port, () => {
    console.log(`> Word Fighter server running at http://localhost:${port}`)
  })
})
