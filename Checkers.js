let whitePieces = []
let blackPieces = []
let hundredTurnsNoCaptureOrRegPieceMovementTie = 0
let sameBoardRepeated3TimesTie = []
const turnIndicator = document.getElementsByClassName('turn-indicator-text')
let didTurnOccur = false
let isWhiteTurn = true
let mustCapture = true

/////buttons//////
////new game
const newGameBtn = document.getElementById('new-game-btn')
newGameBtn.addEventListener('click', () => {
    window.location.href = './Checkers.html';
})
newGameBtn.addEventListener('mouseenter', () => {
    newGameBtn.classList.add('hover');
})
newGameBtn.addEventListener('mouseleave', () => {
    newGameBtn.classList.remove('hover');
})
////instructions
const instructionsBtn = document.getElementById('instructions-btn')
instructionsBtn.addEventListener('click', () => {
    alert()
})
instructionsBtn.addEventListener('mouseenter', () => {
    instructionsBtn.classList.add('hover');
})
instructionsBtn.addEventListener('mouseleave', () => {
    instructionsBtn.classList.remove('hover');
})

//game board cells(that are playable)
class Cell {
    constructor(boardLocation) {
        this.boardLocation = boardLocation
        this.htmlRef = document.getElementById(boardLocation)
        this.isEmpty = true
    }
}
let cells = {
    '00': new Cell('00'), '02': new Cell('02'), '04': new Cell('04'), '06': new Cell('06'), '11': new Cell('11'), '13': new Cell('13'),
    '15': new Cell('15'), '17': new Cell('17'), '20': new Cell('20'), '22': new Cell('22'), '24': new Cell('24'), '26': new Cell('26'),
    '31': new Cell('31'), '33': new Cell('33'), '35': new Cell('35'), '37': new Cell('37'), '40': new Cell('40'),
    '42': new Cell('42'), '44': new Cell('44'), '46': new Cell('46'), '51': new Cell('51'), '53': new Cell('53'),
    '55': new Cell('55'), '57': new Cell('57'), '60': new Cell('60'), '62': new Cell('62'), '64': new Cell('64'),
    '66': new Cell('66'), '71': new Cell('71'), '73': new Cell('73'), '75': new Cell('75'), '77': new Cell('77'),
    keys: ['00', '02', '04', '06', '11', '13', '15', '17', '20', '22', '24', '26', '31', '33', '35', '37', '40',
        '42', '44', '46', '51', '53', '55', '57', '60', '62', '64', '66', '71', '73', '75', '77']
}
//////
class CheckersPiece {
    constructor(isWhite) {
        this.isWhite = isWhite
        this.boardLocation
        this.isKing = false
    }
    horizontalDirectionSet(fromX, targetX) {
        if (this.isKing)
            return (targetX > fromX) ? 1 : -1
        return this.isWhite ? 1 : -1
    }
    isValidMove(target) {
        let fromX = Number(this.boardLocation[0]), targetX = Number(target[0]), fromY = Number(this.boardLocation[1]), targetY = Number(target[1])
        let horizontalDirection = this.horizontalDirectionSet(fromX, targetX)
        let verticalDirection = (targetY > fromY) ? 1 : -1
        let horizontal = horizontalDirection * targetX - horizontalDirection * fromX
        let vertical = verticalDirection * targetY - verticalDirection * fromY
        //regular move
        if (horizontal === 1 && vertical === 1)
            return isCellEmpty(target)
        //capture
        else if (horizontal === 2 && vertical === 2
            && cells[target].isEmpty) {
            let inBetweenCell = (targetX + fromX) / 2 + '' + (targetY + fromY) / 2
            return findPiece(inBetweenCell, !this.isWhite) !== null
        }
        else
            return false
    }
}
//initialization
function initializePieces() {
    for (let i = 0; i < 12; i++) {
        whitePieces.push(new CheckersPiece(true))
        blackPieces.push(new CheckersPiece(false))
    }
    let whiteCounter = 0
    let blackCounter = 0
    for (let key of cells.keys)
        if (key[0] < 3) {
            whitePieces[whiteCounter].boardLocation = key
            addPieceToBoard(key, true)
            whiteCounter++
        }
        else if (key[0] > 4) {
            blackPieces[blackCounter].boardLocation = key
            addPieceToBoard(key, false)
            blackCounter++
        }

}
function gameStart() {
    initializePieces()
    addEventListenersForPieces()
    newTurn()
}
function newTurn() {
    if(hasGameEnded())
    {
        return
    }
    mustCapture = isMustCapture()
    didTurnOccur = false
    turnIndicatorlightAndAvailableToMoveIndicator()
    while (didTurnOccur) {
        return newTurn()
    }
}

//logic functions
function isValidMove(boardLocation, target, isWhiteTurn) {
    let piece = findPiece(boardLocation, isWhiteTurn)
    if (piece === null)
        return false
    return piece.isValidMove(target)
}
function isMustCapture() {
    let pieces = isWhiteTurn ? whitePieces : blackPieces
    for (let piece of pieces) {
        if (checkForValidMoves(piece.boardLocation, isWhiteTurn).length !== 0)
            return true
    }
    return false
}
function isMovable(boardLocation, isWhite) {
    return checkForValidMoves(boardLocation, isWhite).length !== 0
}
function checkForValidMoves(boardLocation, isWhite) {
    let ret = []
    for (let cellLocation of cells.keys)
        if (mustCapture) {
            if (isValidMove(boardLocation, cellLocation, isWhite) && Math.abs(Number(boardLocation[0]) - Number(cellLocation[0])) === 2)
                ret.push(cellLocation)
        }
        else
            if (isValidMove(boardLocation, cellLocation, isWhite))
                ret.push(cellLocation)
    return ret
}
function isCaptureMove(boardLocation, target) {
    return Math.abs(Number(boardLocation[0]) - Number(target[0])) === 2
}
function isPromotion(boardLocation, isWhite) {
    let promotionRow = isWhite ? 7 : 0
    return boardLocation[0] === '' + promotionRow
}
function hasGameEnded(){
    let tieMessage = 'Game ended in a tie!'
    if(hasGameWon()){
        alert('${0} has Won!', isWhiteTurn? 'Player 2': 'Player 1')
        return true
    }
    if(isTieNotEnoughPieces()){
        alert('${0} Not enough pieces on board to win')
        return true
    }
    if(isTieNoCaptureOrRegPieceMove()){
        alert('${0} 100 moves with no ')
        return true
    }
    if(isTieNotEnoughPieces()){
        alert('${0} has Won!', isWhiteTurn? 'Player 2': 'Player 1')
        return true
    }
    if(isTieNotEnoughPieces()){
        alert('${0} has Won!', isWhiteTurn? 'Player 2': 'Player 1')
        return true
    }
    
}
function hasGameWon(){
    let pieces = isWhiteTurn? whitePieces:blackPieces
    if(pieces.length === 0)
        return true
    for (const piece of pieces) {
        if(isMovable(piece.boardLocation, isWhiteTurn))
            return false
    }
    return true
}
function isTie()

//html and css manipulation
function addPieceToBoard(boardLocation, isWhite) {
    let visualPiece = document.createElement("div")
    visualPiece.classList.add("circle")
    if (!isWhite)
        visualPiece.classList.add("black-piece")
    else
        visualPiece.classList.add("white-piece")
    cells[boardLocation].isEmpty = false
    cells[boardLocation].htmlRef.appendChild(visualPiece)

}
function removePieceFromBoard(boardLocation) {
    cells[boardLocation].isEmpty = true
    while (cells[boardLocation].htmlRef.hasChildNodes())
        cells[boardLocation].htmlRef.removeChild(cells[boardLocation].htmlRef.children[0])
}
function movePiece(boardLocation, target) {
    cells[boardLocation].isEmpty = true
    cells[target].isEmpty = false
    while (cells[target].htmlRef.hasChildNodes())
        cells[target].htmlRef.removeChild(cells[target].htmlRef.childNodes[0])

    cells[target].htmlRef.appendChild(cells[boardLocation].htmlRef.childNodes[0])
    removeAvailableMoves()
}
function promotion(boardLocation, isWhite) {
    let piece = findPiece(boardLocation, isWhite)
    if (!piece.isKing) {
        let king = document.createElement("img")
        king.setAttribute('src', 'crown.png')
        cells[boardLocation].htmlRef.children[0].appendChild(king)
        piece.isKing = true;
    }
}
function executeMove(from, target, isWhite, captured = null) {
    if (captured !== null) {
        removeCapturedPieceFromPieceArray(captured, !isWhite)
        removePieceFromBoard(captured)
    }
    findPiece(from, isWhite).boardLocation = target
    movePiece(from, target)
    mustCapture = true
    if (isCaptureMove(from, target) && checkForValidMoves(target, isWhite).length !== 0) {
        cells[target].htmlRef.addEventListener('dblclick', chainCaptureCancel)
        cells[target].htmlRef.target = target
        showAvailableMoves(target)
        endTurn()
        newTurn()
    }
    if (isPromotion(target, isWhite))
        promotion(target, isWhite)
    endTurn()
    newTurn()

}
function chainCaptureCancel(event) {
    removeAvailableMoves()
    endTurn()
    newTurn()
    cells[Number(event.currentTarget.target)].htmlRef.removeEventListener('dblclick', chainCaptureCancel)
}
function removeCapturedPieceFromPieceArray(captured, isWhite) {
    let capturedPiece = findPiece(captured, isWhite)
    let isWhitePiece = (capturedPiece !== null && isWhite)
    let pieces = isWhitePiece ? whitePieces : blackPieces
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].boardLocation === captured) {
            pieces.splice(i, 1)
            break;
        }
    }
}
function turnIndicatorlightAndAvailableToMoveIndicator() {
    let turn = isWhiteTurn ? 1 : 0
    turnIndicator[turn].classList.add('turn-indicator')
    turnIndicator[Math.abs(turn - 1)].classList.remove('turn-indicator')
    let pieces = isWhiteTurn ? whitePieces : blackPieces
    for (let piece of pieces) {
        let boardLocation = piece.boardLocation
        if (checkForValidMoves(boardLocation, isWhiteTurn).length !== 0)
            cells[boardLocation].htmlRef.childNodes[0].classList.add('available-to-move')
    }
}
function addEventListenersForPieces() {
    let whitePiecesInHtml = document.getElementsByClassName('white-piece')
    let blackPiecesInHtml = document.getElementsByClassName('black-piece')
    for (let piece of whitePiecesInHtml)
        addClickEventListener(piece, true)
    for (let piece of blackPiecesInHtml)
        addClickEventListener(piece, false)
}
function addClickEventListener(piece, isWhite) {
    piece.addEventListener('click', () => {
        showAvailableMoves(piece.parentNode.id, isWhite)
    })
}
function showAvailableMoves(boardLocation, isWhite) {
    if (isWhite === isWhiteTurn) {
        removeAvailableMoves()
        let availableMove = document.createElement('div')
        availableMove.classList.add('circle')
        availableMove.classList.add('available-move')

        if (isMovable(boardLocation, isWhite)) {
            let availableCells = checkForValidMoves(boardLocation, isWhite)
            for (let cellLocation of availableCells) {
                cells[cellLocation].htmlRef.appendChild(availableMove.cloneNode()).addEventListener('click', () => {
                    let captured = null
                    if (isCaptureMove(boardLocation, cellLocation)) {
                        let x = Math.abs(Number(boardLocation[0]) + Number(cellLocation[0])) / 2
                        let y = Math.abs(Number(boardLocation[1]) + Number(cellLocation[1])) / 2
                        captured = x + '' + y
                    }
                    executeMove(boardLocation, cellLocation, isWhite, captured)
                })
            }
        }
    }
}
function removeAvailableMoves() {
    for (let cellLocation of cells.keys) {
        let cell = cells[cellLocation]
        if (cell.isEmpty && cell.htmlRef.hasChildNodes())
            cells[cellLocation].htmlRef.removeChild(cell.htmlRef.children[0])
    }
}

//auxilary functions
function findPiece(boardLocation, isWhite) {
    let pieces = isWhite ? whitePieces : blackPieces
    for (let piece of pieces) {
        if (piece.boardLocation === boardLocation)
            return piece
    }
    return null
}
function isCellEmpty(boardLocation) {
    return cells[boardLocation].isEmpty
}
function endTurn() {
    let pieces = isWhiteTurn ? whitePieces : blackPieces
    for (let piece of pieces) {
        cells[piece.boardLocation].htmlRef.childNodes[0].classList.remove('available-to-move')
    }
    didTurnOccur = true
    isWhiteTurn = !isWhiteTurn
}
function applyMustCapture() {
    mustCapture = true
}

////////start the game////////
gameStart()