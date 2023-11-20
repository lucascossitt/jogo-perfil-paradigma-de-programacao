<template>
    <div class="row">
        <div class="col-lg-2">
            <div class="alert alert-dark">
                <h5 class="text-center">Jogadores conectados</h5>
                <hr>
                <ul>
                    <li v-for="player in players" :key="player">{{player}}</li>
                </ul>
            </div>
        </div>
        <div class="col-lg-10">
            <div class="alert alert-light">
                <div class="row">
                    <div v-for="msg in msgs" :key="msg">
                        <p>{{msg}}</p>
                        <hr>
                    </div>
                </div>
                <div class="row">
                    <div class="input-group">
                        <input @keyup.enter="chutar" v-model="chute" :disabled="!liberadoJogar" type="text" class="form-control" placeholder="Insira seu chute">
                        <button @click="chutar" :disabled="!liberadoJogar" class="btn btn-success">Enviar</button>
                        <button @click="iniciar" class="btn btn-primary" v-if="liberadoIniciar">Iniciar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .chat {
        height: 90vh;
    }

    .fixed-row-bottom {
        position: absolute;
        bottom: 0;
        width: 99%;
        margin-bottom: 5px;
    }
</style>

<script>
import {io} from 'socket.io-client'

export default {
    name: 'App',
    data: function () {
        return {
            socket: null,
            msgs: [],
            players: [],
            liberadoJogar: false,
            liberadoIniciar: false,
            chute: null
        }
    },
    created: function () {
        this.socket = io('ws://192.168.3.16:8081')
        console.log(this.socket)

        this.socket.on('msg', (msg, acabou) => {
            console.log('msg', msg)
            this.msgs.push(msg)

            if (acabou) {
                alert('O jogo acabou!')
            }
        })
        this.socket.on('players', players => {
            console.log('players', players)
            this.players = players
        })
        this.socket.on('liberadoJogar', liberadoJogar => {
            console.log('liberadoJogar', liberadoJogar)
            this.liberadoJogar = liberadoJogar
        })
        this.socket.on('liberadoIniciar', liberadoIniciar => {
            console.log('liberadoIniciar', liberadoIniciar)
            this.liberadoIniciar = liberadoIniciar
        })
    },
    methods: {
        iniciar() {
            this.socket.emit('iniciar', true)
            this.liberadoIniciar = false
        },
        chutar() {
            console.log(this.chute)
            this.socket.emit('guess', this.chute)
            this.chute = null
        }
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
