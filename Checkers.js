let whitePieces = []
let blackPieces = []
let cellsArray = []
let cellsHtmlRef = []
let NoCaptureOrRegPieceMovementCounter = 0
let savedBoardsAsStrings = []
const turnIndicator = document.getElementsByClassName('turn-indicator-text')
let didTurnOccur = false
let isWhiteTurn = true
let mustCapture = true
let isGameActive = true
/////////////////////////////////////////////////////
/////buttons//////
////home button
const homeBtn = document.getElementById('home-btn')
homeBtn.addEventListener('click', () => { window.location.href = 'https://einav15.github.io/MainPage/main.html'; })
homeBtn.addEventListener('mouseenter', () => { homeBtn.classList.add('hover') })
homeBtn.addEventListener('mouseleave', () => { homeBtn.classList.remove('hover'); })
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
    document.getElementById('instructions').scrollIntoView();
})
instructionsBtn.addEventListener('mouseenter', () => {
    instructionsBtn.classList.add('hover');
})
instructionsBtn.addEventListener('mouseleave', () => {
    instructionsBtn.classList.remove('hover');
})
///////////////////////////////////////////////////////////////////
////initialize board////
class Cell {
    constructor(boardLocation) {
        this.boardLocation = boardLocation
        this.isEmpty = true
    }
}

let board = document.getElementById('board')

for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        if (j === 0) {
            let col = document.createElement('div')
            col.className = 'flex-container-column'
            board.appendChild(col)
        }
        let cell = document.createElement('div')
        cell.className = 'flex-squares'
        if ((i % 2 === 0) !== (j % 2 === 0)) {
            cell.id = (7 - j) + '' + i
            cell.classList.add('black-cell')
            cellsArray.push(new Cell(cell.id))
            cellsHtmlRef.push(cell)
        }
        else
            cell.classList.add('white-cell')
        board.childNodes[i + 1].appendChild(cell)
    }
}

///////////////////////////////////////////
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
            return cellsArray[translateLocationToIndexInArray(target)].isEmpty
        //capture
        else if (horizontal === 2 && vertical === 2
            && cellsArray[translateLocationToIndexInArray(target)].isEmpty) {
            let inBetweenCell = (targetX + fromX) / 2 + '' + (targetY + fromY) / 2
            return findPiece(inBetweenCell, !this.isWhite) !== null
        }
        else
            return false
    }
}
//game initialization and turn start
function initializePieces() {
    for (let i = 0; i < 12; i++) {
        whitePieces.push(new CheckersPiece(true))
        blackPieces.push(new CheckersPiece(false))
    }
    let whiteCounter = 0
    let blackCounter = 0
    for (let cell of cellsArray)
        if (cell.boardLocation[0] < 3) {
            whitePieces[whiteCounter].boardLocation = cell.boardLocation
            addPieceToBoard(cell.boardLocation, true)
            whiteCounter++
        }
        else if (cell.boardLocation[0] > 4) {
            blackPieces[blackCounter].boardLocation = cell.boardLocation
            addPieceToBoard(cell.boardLocation, false)
            blackCounter++
        }

}
function gameStart() {
    initializePieces()
    addEventListenersForPieces()
    newTurn()
}
function newTurn() {
    mustCapture = isMustCapture()
    didTurnOccur = false
    if (hasGameEnded())
        isGameActive = false
    else
        turnIndicatorlightAndAvailableToMoveIndicator()
    saveBoardState()
    NoCaptureOrRegPieceMovementCounter++
    while (didTurnOccur && isGameActive)
        return newTurn()
}

function endTurn() {
    let pieces = isWhiteTurn ? whitePieces : blackPieces
    for (let piece of pieces) {
        let index = translateLocationToIndexInArray(piece.boardLocation)
        cellsHtmlRef[index].childNodes[0].classList.remove('available-to-move')
    }
    didTurnOccur = true
    isWhiteTurn = !isWhiteTurn
}
//////////////////////////////////////////
///////logic functions/////////
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
    for (let cell of cellsArray)
        if (mustCapture) {
            if (isValidMove(boardLocation, cell.boardLocation, isWhite) && Math.abs(Number(boardLocation[0]) - Number(cell.boardLocation[0])) === 2)
                ret.push(cell.boardLocation)
        }
        else
            if (isValidMove(boardLocation, cell.boardLocation, isWhite))
                ret.push(cell.boardLocation)
    return ret
}
function isCaptureMove(boardLocation, target) {
    return Math.abs(Number(boardLocation[0]) - Number(target[0])) === 2
}
function isPromotion(boardLocation, isWhite) {
    let piece = findPiece(boardLocation, isWhite)
    let promotionRow = isWhite ? 7 : 0
    if(boardLocation[0] === '' + promotionRow && !piece.isKing){
        piece.isKing = true;
        clearTieAfterCaptureOrMove()
        return true
    }
    return false
}
function hasGameEnded() {
    let tieMessage = 'Game ended in a tie!'
    if (hasGameWon()) {
        let winner = isWhiteTurn ? "Player 2" : "Player 1"
        alert(winner + ' has Won!')
        return true
    }
    if (isTieNotEnoughPieces()) {
        alert(tieMessage + ' Not enough pieces on board to win')
        return true
    }
    if (NoCaptureOrRegPieceMovementCounter === 100) {
        alert(tieMessage + ' 100 moves with no capture or regular piece movement')
        return true
    }
    if (isTie3RepeatingBoards()) {
        alert(tieMessage + ' The same board repeated itself for 3 times')
        return true
    }
    return false
}
function hasGameWon() {
    let pieces = isWhiteTurn ? whitePieces : blackPieces
    if (pieces.length === 0)
        return true
    for (const piece of pieces) {
        if (isMovable(piece.boardLocation, isWhiteTurn))
            return false
    }
    return true
}
function isTieNotEnoughPieces() {

    if (whitePieces.length === 1 && blackPieces.length === 1)
        if (whitePieces[0].isKing && blackPieces[0].isKing)
            return true
    return false
}
function isTie3RepeatingBoards() {
    let counter = 1
    for (let i = 0; i < savedBoardsAsStrings.length - 1; i++)
        if (savedBoardsComparer(savedBoardsAsStrings[i], savedBoardsAsStrings[savedBoardsAsStrings.length - 1]))
            counter++
    return counter === 3
}
function savedBoardsComparer(savedBoard, currentBoard) {
    if (currentBoard.length !== savedBoard.length)
        return false
    for (let i = 0; i < currentBoard.length; i++)
        if (currentBoard[i] !== savedBoard[i])
            return false
    return true
}
function saveBoardState() {
    let boardAsString = ''
    for (let piece of whitePieces)
        boardAsString += piece.boardLocation
    for (let piece of blackPieces)
        boardAsString += piece.boardLocation
    savedBoardsAsStrings.push(boardAsString)
}
function clearTieAfterCaptureOrMove() {
    NoCaptureOrRegPieceMovementCounter = 0
    savedBoardsAsStrings = []
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
function findPiece(boardLocation, isWhite) {
    let pieces = isWhite ? whitePieces : blackPieces
    for (let piece of pieces) {
        if (piece.boardLocation === boardLocation)
            return piece
    }
    return null
}
function translateLocationToIndexInArray(boardLocation) {
    for (let i = 0; i < cellsArray.length; i++) {
        if (boardLocation === cellsArray[i].boardLocation)
            return i
    }
}
function executeMove(from, target, isWhite, captured = null) {
    if (captured !== null) {
        removeCapturedPieceFromPieceArray(captured, !isWhite)
        clearTieAfterCaptureOrMove()
    }
    findPiece(from, isWhite).boardLocation = target
    movePiece(from, target)
}
function movePiece(boardLocation, target){
    let fromIndex = translateLocationToIndexInArray(boardLocation)
    let targetIndex = translateLocationToIndexInArray(target)
    cellsArray[fromIndex].isEmpty = true
    cellsArray[targetIndex].isEmpty = false
}
///////////////////////////////////////
////html and css manipulation/////
function addPieceToBoard(boardLocation, isWhite) {
    let visualPiece = document.createElement("div")
    visualPiece.classList.add("circle")
    if (!isWhite)
        visualPiece.classList.add("black-piece")
    else
        visualPiece.classList.add("white-piece")
    let index = translateLocationToIndexInArray(boardLocation)
    cellsArray[index].isEmpty = false
    cellsHtmlRef[index].appendChild(visualPiece)

}
function removePieceFromBoard(boardLocation) {
    let index = translateLocationToIndexInArray(boardLocation)
    cellsArray[index].isEmpty = true
    while (cellsHtmlRef[index].hasChildNodes())
        cellsHtmlRef[index].removeChild(cellsHtmlRef[index].children[0])
}
function UIMovePiece(boardLocation, target) {
    let fromIndex = translateLocationToIndexInArray(boardLocation)
    let targetIndex = translateLocationToIndexInArray(target)
    while (cellsHtmlRef[targetIndex].hasChildNodes())
        cellsHtmlRef[targetIndex].removeChild(cellsHtmlRef[targetIndex].childNodes[0])
    cellsHtmlRef[targetIndex].appendChild(cellsHtmlRef[fromIndex].childNodes[0])
    removeAvailableMoves()
}
function promotion(boardLocation) {
        let king = document.createElement("img")
        king.setAttribute('src', 'crown.png')
        cellsHtmlRef[translateLocationToIndexInArray(boardLocation)].children[0].appendChild(king)
}
function UIExecuteMove(from, target, isWhite, captured = null) {
    if (captured !== null)
        removePieceFromBoard(captured)
    UIMovePiece(from, findPiece(target, isWhite).boardLocation)
    mustCapture = true
    if (isCaptureMove(from, target) && checkForValidMoves(target, isWhite).length !== 0) {
        return showAvailableMoves(target)
    }
    if (isPromotion(target, isWhite))
        promotion(target)
    /////non-king movement to reset tie counters ////
    endTurn()
    newTurn()
}
function turnIndicatorlightAndAvailableToMoveIndicator() {
    let turn = isWhiteTurn ? 1 : 0
    turnIndicator[turn].classList.add('turn-indicator')
    turnIndicator[Math.abs(turn - 1)].classList.remove('turn-indicator')
    let pieces = isWhiteTurn ? whitePieces : blackPieces
    for (let piece of pieces) {
        let boardLocation = piece.boardLocation
        if (checkForValidMoves(boardLocation, isWhiteTurn).length !== 0)
            cellsHtmlRef[translateLocationToIndexInArray(boardLocation)].childNodes[0].classList.add('available-to-move')
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
    if (isWhite === isWhiteTurn && isGameActive) {
        removeAvailableMoves()
        let availableMove = document.createElement('div')
        availableMove.classList.add('circle')
        availableMove.classList.add('available-move')
        if (isMovable(boardLocation, isWhite)) {
            let availableCells = checkForValidMoves(boardLocation, isWhite)
            for (let cellLocation of availableCells) {
                cellsHtmlRef[translateLocationToIndexInArray(cellLocation)].appendChild(availableMove.cloneNode()).addEventListener('click', () => {
                    let captured = null
                    if (isCaptureMove(boardLocation, cellLocation)) {
                        let x = Math.abs(Number(boardLocation[0]) + Number(cellLocation[0])) / 2
                        let y = Math.abs(Number(boardLocation[1]) + Number(cellLocation[1])) / 2
                        captured = x + '' + y
                    }
                    executeMove(boardLocation, cellLocation, isWhite, captured)
                    UIExecuteMove(boardLocation, cellLocation, isWhite, captured)
                })
            }
        }
    }
}
function removeAvailableMoves() {
    for (let i = 0; i < cellsArray.length; i++) {
        if (cellsArray[i].isEmpty && cellsHtmlRef[i].hasChildNodes())
            cellsHtmlRef[i].removeChild(cellsHtmlRef[i].children[0])
    }
}
////////start the game////////
gameStart()
