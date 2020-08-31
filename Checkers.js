const blackPieces = document.getElementsByClassName('black-piece')
const whitePieces = document.getElementsByClassName('white-piece')
const turnIndicator = document.getElementsByClassName('turn-indicator-text')

let board = [
    [ee, b2, ee, b5, ee, b8, ee, b11],
    [b1, ee, b4, ee, b7, ee, b10, ee],
    [ee, b3, ee, b6, ee, b9, ee, b12],
    [ee, ee, ee, ee, ee, ee, ee, ee],
    [ee, ee, ee, ee, ee, ee, ee, ee],
    [ee, w2, ee, w5, ee, w8, ee, w11],
    [w1, ee, w4, ee, w7, ee, w10, ee],
    [ee, w3, ee, w6, ee, w9, ee, w12]
]
let isGameOn = true
let isWhiteTurn = true



