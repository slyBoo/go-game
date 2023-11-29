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
const socket = new WebSocket('ws://localhost/game');
let intersectionPoints = []; // where the player can place the pieces
let grid;
let gridSize; // size of the grid
let pieces = {}; // store the pieces on the board
let boardSize; // size of the board
let playerNum = 1; // 0 for white 1 for black
let statusText
// temporary variables before networking
let tempPlayerColour = 1; // 0 for white 1 for black
let gameEnd = false;
let leftScore;
let rightScore

function preload() // load assets 
{
}

function create() // create game objects
{
    boardSize = this.cameras.main.width * 0.6;
    // draw a piece when the player clicks
    this.input.on('pointerdown', function (pointer)
    {
        let margin = boardSize * 0.05; 
        let boardX = (this.cameras.main.width - boardSize) / 2;
        let boardY = (this.cameras.main.height - boardSize) / 2;
        if (pointer.x > boardX && pointer.x < boardSize + boardX - margin && pointer.y > boardY && pointer.y < boardSize + boardY - margin) {
            socket.send(`M: ${Math.round((pointer.x - (boardX + margin)) / gridSize)} ${Math.round((pointer.y - (margin + boardY)) / gridSize)}`)
        }
    }, this);

    // "waiting for player" text under the board
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Waiting for the\nother player to connect...', {
        fontFamily: 'Renogare',
        fontSize: '5em',
        color: "#eff1f5",
    }).setOrigin(0.5, 0.5);
    statusText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 40, '', { 
        fontFamily: 'Renogare',
        fontSize: '4em', 
        fill: '#000000' 
    }).setOrigin(0.5, 0.5);
    // Listen for messages from the server
    socket.addEventListener('message', (event) => {
        const receivedMessage = event.data;
        const parsedMessage = receivedMessage.split(' ')
        // Check if the message starts with a specific string
        if (parsedMessage[0] == "bd:" && !gameEnd) {
            // Do something when the message starts with the expected string
            displayBoard.call(this, parseInt(parsedMessage[1])); // display the game board
        } else if (parsedMessage[0] == "M:") {
            const colour = tempPlayerColour == 0 ? colours.Base : colours.Text // set the player colour
            tempPlayerColour = Math.abs(tempPlayerColour - 1);
            const x = grid[parseInt(parsedMessage[2])][parseInt(parsedMessage[4])].x
            const y = grid[parseInt(parsedMessage[2])][parseInt(parsedMessage[4])].y
            placePiece.call(this, x, y, colour)
            statusText.setText(`Move made at x:${parsedMessage[2]} y:${parsedMessage[4]}`);
        } else if (parsedMessage[0] == "D:") {
            coords = parsedMessage[1].split(',')
            for (let index = 0; index < coords.length; index = index + 2) {
                const x = grid[parseInt(coords[index])][parseInt(coords[index + 1])].x
                const y = grid[parseInt(coords[index])][parseInt(coords[index + 1])].y
                deletePiece(x, y)
                
            }
            statusText.setText("Pieces have been captured!");
        } else if (parsedMessage[0] == "pass") {
            tempPlayerColour = Math.abs(tempPlayerColour - 1);
            statusText.setText("Player passed his turn!");
        } else if (parsedMessage[0] ==  "gs") {
            if (parsedMessage[2] == "1") {
                playerNum = 1
                statusText.setText("Play the first move!");
            } else {
                playerNum = 2
                statusText.setText("Wait for your opponent to play!");
            }
        } else if (parsedMessage[0] == "end:") {
            gameOver.call(this, parseInt(parsedMessage[1]), parseInt(parsedMessage[2]));
            statusText.setText("Game has ended!");
            gameEnd = true;
        }
        else if (parsedMessage[0] == "S:")
        {
            if (playerNum == 1) {
                leftScore.setText(parsedMessage[2]);
                rightScore.setText(parsedMessage[1]);
            } else {
                leftScore.setText(parsedMessage[1]);
                rightScore.setText(parsedMessage[2]);
            }
        }
        else {
            statusText.setText(receivedMessage);
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

    passButton.call(this); // the pass button
}

function placePiece(x, y, color) {
    // get the closest point to the mouse
    let closestPoint = intersectionPoints.reduce((closest, point) => {
        const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y);
        return (distance < closest.distance) ? { point, distance } : closest;
    }, { point: null, distance: Infinity });

    // place the piece if there's no piece there already
    if ( (closestPoint.point && closestPoint.distance < gridSize / 2))
    {
        createPiece.call(this, closestPoint.point, color);
    }
}

function createPiece(point, colour) {
    const pieceSize = gridSize * 0.4;
    const piece = this.add.circle(point.x, point.y, pieceSize, colour, 1);
    piece.setStrokeStyle(2, colours.Text);
    pieces[`${point.x}, ${point.y}`] = piece; // store the piece
}

// name: delete piece
// description: deletes a piece from the board
function deletePiece(x, y)
{
    if (pieces[`${x}, ${y}`]) // if the piece exists
    {
        pieces[`${x}, ${y}`].destroy(); // delete the piece
    }
}

// name: passButton
// description: a pass button that sends "pass" to the server when clicked
function passButton()
{
    const buttonWidth = 200;
    const buttonHeight = 75;
    const buttonX = this.cameras.main.centerX - (buttonWidth / 2);
    const buttonY = this.cameras.main.centerY - boardSize / 2 - buttonHeight - 20; // Position above the board
    const buttonText = 'Pass';

    // button drawing
    const graphics = this.add.graphics({ fillStyle: { color: colours.Surface0 } });
    graphics.fillRoundedRect(buttonX + 5, buttonY + 5, buttonWidth, buttonHeight, 15); // Small offset for the shadow
    graphics.fillStyle(colours.Base, 1);
    graphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);

    // button text
    const text = this.add.text(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, buttonText, {
        fontFamily: 'Renogare',
        fontSize: '5em',
        color: '#4c4f69', // colours.Text
    });
    text.setOrigin(0.5, 0.5);

    // player text
    const playerText = this.add.text(20, buttonY + buttonHeight / 2, "You: ", {
        fontFamily: 'Renogare',
        fontSize: '4em',
        color: '#4c4f69', // colours.Text
    });
    playerText.setOrigin(0, 0.5);
    this.add.circle(playerText.width * 1.5, buttonY + buttonHeight / 2, gridSize * 0.4, playerNum == 1 ? colours.Text : colours.Base, 1).setStrokeStyle(2, colours.Text);
    
    // opponent text
    const opponentText = this.add.text(this.cameras.main.width - gridSize - 20, buttonY + buttonHeight / 2, "Opponent: ", {
        fontFamily: 'Renogare',
        fontSize: '4em',
        color: '#4c4f69', // colours.Text
    });
    opponentText.setOrigin(1, 0.5);
    this.add.circle(this.cameras.main.width - (gridSize * 0.8), buttonY + buttonHeight / 2, gridSize * 0.4, playerNum == 1 ? colours.Base : colours.Text, 1).setStrokeStyle(2, colours.Text).setStrokeStyle(2, colours.Text);
    
    // pass when clicked 
    graphics.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    graphics.on('pointerdown', () => {
        socket.send('pass');
    });

    // player 1 score
    leftScore = this.add.text(buttonX - (boardSize / 2), this.cameras.main.centerY, "0", {
        fontFamily: 'Renogare',
        fontSize: '10em',
        color: (playerNum == 1 ? "#4c4f69" : "#eff1f5"), 
    });
    leftScore.setOrigin(0.5, 0.5);

    // player 2 score
    rightScore = this.add.text(buttonX + (boardSize / 2) + buttonWidth, this.cameras.main.centerY, "0", {
        fontFamily: 'Renogare',
        fontSize: '10em',
        color: (playerNum === 2 ? "#4c4f69" : "#eff1f5"), 
    });
    rightScore.setOrigin(0.5, 0.5);

    return graphics;
}

function gameOver(score1, score2)
{
    // draw a rectangle over everything
    const graphics = this.add.graphics({ fillStyle: { color: colours.Rosewater } });
    graphics.fillRoundedRect(0, 0, this.cameras.main.width, this.cameras.main.height, 0);
    const winner = score1 > score2 ? 1 : 2
    const winnerText = playerNum == winner ? "Opponent Wins..." : "You Win!"
    // game over text
    if (score1 == score2) {
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Game Over\nDraw!\nScore: ${score1} - ${score2}\n\n\n Refresh Page to play again`, {
            fontFamily: 'Renogare',
            fontSize: '8em',
            color: "#171818",
        }).setOrigin(0.5, 0.5);
    } else {
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Game Over\n${winnerText}!\nScore: ${score1} - ${score2}\n\n\n Refresh Page to play again`, {
            fontFamily: 'Renogare',
            fontSize: '8em',
            color: "#171818",
        }).setOrigin(0.5, 0.5);
    }
    socket.close()
}