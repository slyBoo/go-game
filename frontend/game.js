/*
File: game.js
Description: the entire frontend
Created by: osh
        at: 14:57 on Saturday, the 25th of November, 2023.
Last edited 14:57 on Saturday, the 25th of November, 2023.
*/

// colour palette
const colours = {
    Rosewater: 0xdc8a78,
    Flamingo: 0xdd7878,
    Pink: 0xea76cb,
    Mauve: 0x8839ef,
    Red: 0xd20f39,
    Maroon: 0xe64553,
    Peach: 0xfe640b,
    Yellow: 0xdf8e1d,
    Green: 0x40a02b,
    Teal: 0x179299,
    Sky: 0x04a5e5,
    Sapphire: 0x209fb5,
    Blue: 0x1e66f5,
    Lavender: 0x7287fd,
    Text: 0x4c4f69,
    Subtext1: 0x5c5f77,
    Subtext0: 0x6c6f85,
    Overlay2: 0x7c7f93,
    Overlay1: 0x8c8fa1,
    Overlay0: 0x9ca0b0,
    Surface2: 0xacb0be,
    Surface1: 0xbcc0cc,
    Surface0: 0xccd0da,
    Base: 0xeff1f5,
    Mantle: 0xe6e9ef,
    Crust: 0xdce0e8
};

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: colours.Rosewater,
    width: 1600,
    height: 1200,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
  

// global variables
const game = new Phaser.Game(config);
let intersectionPoints = []; // where the player can place the pieces
let grid;
let gridSize; // size of the grid

// temporary variables before networking
let tempPlayerColour = 1; // 0 for white 1 for black

function preload() // load assets 
{

}

function create() // create game objects
{
    const socket = new WebSocket('ws://localhost/game');
    // draw a piece when the player clicks
    this.input.on('pointerdown', function (pointer) {
        let closestPoint = intersectionPoints.reduce((closest, point) => {
            const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, point.x, point.y);
            return (distance < closest.distance) ? { point, distance } : closest;
        }, { point: null, distance: Infinity });
        let boardSize = this.cameras.main.width * 0.6;
        let margin = boardSize * 0.05; 
        let boardX = (this.cameras.main.width - boardSize) / 2;
        let boardY = (this.cameras.main.height - boardSize) / 2;
        // console.log(`M: ${Math.round((pointer.x - (boardX + margin)) / gridSize)} ${Math.round((pointer.y - (margin + boardY)) / gridSize)}`)
        socket.send(`M: ${Math.round((pointer.x - (boardX + margin)) / gridSize)} ${Math.round((pointer.y - (margin + boardY)) / gridSize)}`)
    }, this);
    
    // Listen for messages from the server
    socket.addEventListener('message', (event) => {
        const receivedMessage = event.data;
        const parsedMessage = receivedMessage.split(' ')
        // Check if the message starts with a specific string
        if (parsedMessage[0] == "bd:") {
            // Do something when the message starts with the expected string
            console.log("ye")
            displayBoard.call(this, parseInt(parsedMessage[1])); // display the game board
        } else if (parsedMessage[0] == "M:") {
            const colour = tempPlayerColour == 0 ? colours.Base : colours.Text // set the player colour
            tempPlayerColour = Math.abs(tempPlayerColour - 1); // switch the colour
            const x = grid[parseInt(parsedMessage[2])][parseInt(parsedMessage[4])].x
            const y = grid[parseInt(parsedMessage[2])][parseInt(parsedMessage[4])].y
            placePiece.call(this, x, y, colour)
        }
        console.log('Received a message:', receivedMessage);
    });

}

function update() {

}

// name: displayBoard
// description: displays the game board in the centre of the game window
function displayBoard(boardDimensions) {
    // colours
    const boardColour = colours.Base; 
    const baseColour = colours.Surface0;  
    const gridColour = colours.Subtext0; 

    // board size and position
    const boardSize = this.cameras.main.width * 0.6;
    const margin = boardSize * 0.05; // gep between the boartd and the screen
    const cornerRadius = 20; // radius of the board corners
    const shadowOffset = 30; // the bit under the board to give it depth
    gridSize = (boardSize - 2 * margin) / (boardDimensions - 1);
    console.log(gridSize)
    // centre the board
    const boardX = (this.cameras.main.width - boardSize) / 2;
    const boardY = (this.cameras.main.height - boardSize) / 2;
    console.log(boardX)
    console.log(margin)


    // draw the squares
    const graphics = this.add.graphics({ lineStyle: { width: 2, color: gridColour }, fillStyle: { color: boardColour } });

    graphics.fillStyle(baseColour, 1); // board sides
    graphics.fillRoundedRect(boardX, boardY, boardSize, boardSize + shadowOffset, cornerRadius);

    graphics.fillStyle(boardColour, 1); // board
    graphics.fillRoundedRect(boardX, boardY, boardSize, boardSize, cornerRadius);

    // grid
    grid = Array.from({ length: boardDimensions }, () => Array(boardDimensions).fill(0))
    for (let i = 0; i < boardDimensions; i++) {
        const posY = boardY + margin + i * gridSize; // horizontal
        graphics.strokeLineShape(new Phaser.Geom.Line(boardX + margin, posY, boardX + boardSize - margin, posY));

        const posX = boardX + margin + i * gridSize; // vertical
        graphics.strokeLineShape(new Phaser.Geom.Line(posX, boardY + margin, posX, boardY + boardSize - margin));
    }

    // save the grid points the player can place their pieces at
    intersectionPoints = []; // reset 
    for (let y = 0; y < boardDimensions; y++) {
        for (let x = 0; x < boardDimensions; x++) {
            const posX = boardX + margin + x * gridSize;
            const posY = boardY + margin + y * gridSize;
            intersectionPoints.push({ x: posX, y: posY });
            grid[x][y] = { x: posX, y: posY } 
        }
    }
    console.log(intersectionPoints[13 + (13 % 13)])
}

function placePiece(x, y, color) {
    // get the closest point to the mouse
    let closestPoint = intersectionPoints.reduce((closest, point) => {
        const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y);
        return (distance < closest.distance) ? { point, distance } : closest;
    }, { point: null, distance: Infinity });

    // place the piece
    if (closestPoint.point && closestPoint.distance < gridSize / 2) {
        createPiece.call(this, closestPoint.point, color);
    }
}

function createPiece(point, colour) {
    const pieceSize = gridSize * 0.4;
    const piece = this.add.circle(point.x, point.y, pieceSize, colour, 1);
    piece.setStrokeStyle(2, colours.Text);
}
