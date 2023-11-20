const {Server} = require('socket.io')
const {createServer} = require('node:http')
const express = require('express')
const fs = require('fs')
const cors = require('cors')

const port = 8081
const app = express()
app.use(cors())
const server = createServer(app)
const io = new Server(server, {cors: {origin: "*"}})

const paradigmas = JSON.parse(fs.readFileSync('./listaParadigmas.json').toString())
let paradigmaAtual = null
let indexCaracteristicaAtual = 0
let indexPlayerAtual = 0
let players = []
let ultimoNumPlayer = 0

io.on('connection', async socket => {
    if (!players.includes(socket)) {
        ultimoNumPlayer++
        socket.nome = `Player ${ultimoNumPlayer}`
        players.push(socket)
    }

    players[0].emit('liberadoIniciar', true)
    io.emit('players', players.map(a => a.nome))
    socket.emit('liberadoJogar', false)

    socket.on('disconnect', () => {
        io.emit('players', players.map(a => a.nome))
        players.splice(players.indexOf(socket), 1)
    })

    socket.on('iniciar', () => {
        if (players[0] === socket) {
            paradigmaAtual = paradigmas[Math.floor(paradigmas.length * Math.random())]
            io.emit('msg', 'Iniciando...', false)
            io.emit('msg', `Turno de: ${players[indexPlayerAtual].nome}`, false)
            io.emit('msg', `Caracteristica: ${paradigmaAtual.caracteristicas[indexCaracteristicaAtual]}`, false)
            io.emit('liberadoJogar', false)
            players[0].emit('liberadoJogar', true)
        } else {
            socket.emit('msg', 'Você não pode iniciar o jogo')
        }
    })

    socket.on('guess', async msg => {
        if (players[indexPlayerAtual] == socket) {
            io.emit('liberadoJogar', false)
            io.emit('msg', `${players[indexPlayerAtual].nome} chutou: ${msg}`, false)

            if (msg === paradigmaAtual.nome) {
                io.emit('msg', `${players[indexPlayerAtual].nome} ganhou! O paradigma era: ${paradigmaAtual.nome}`, true)
                players = []
                indexCaracteristicaAtual = 0
                indexPlayerAtual = 0
                paradigmaAtual = null
            } else {
                indexPlayerAtual++
                indexCaracteristicaAtual++

                if (!players[indexPlayerAtual])
                    indexPlayerAtual = 0

                if (!paradigmaAtual.caracteristicas[indexCaracteristicaAtual]) {
                    io.emit('msg', `Jogo finalizado, ninguem acertou! O paradigma era: ${paradigmaAtual.nome}`, true)
                    players = []
                    indexCaracteristicaAtual = 0
                    indexPlayerAtual = 0
                    paradigmaAtual = null
                    return
                }

                io.emit('msg', `Turno de: ${players[indexPlayerAtual].nome}`, false)
                io.emit('msg', `Caracteristica: ${paradigmaAtual.caracteristicas[indexCaracteristicaAtual]}`, false)
                players[indexPlayerAtual].emit('liberadoJogar', true)
            }
        }
    })
})

server.listen(port, () => {
    console.log('Iniciado na porta', port)
})