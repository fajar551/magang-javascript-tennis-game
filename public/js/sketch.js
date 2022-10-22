
var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;
var WINNING_SCORE = 12345678;
var player1Score = 0;
var player2Score = 0;

var showingWinScreen = false;

var paddle1Y = 250;
var paddle2Y = 250;
var PADDLE_THICKNESS = 10;
var PADDLE_HEIGHT = 100;


var starts = false;
var playerTwo = false;
var canvas = document.getElementById('gameCanvas');
var canvasContext = canvas.getContext('2d');
canvasContext.font = "28px Arial"

function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

colorRect(0, 0, canvas.width, canvas.height, '#0008FE');
canvasContext.fillStyle = 'white';
canvasContext.fillText("Send your room-id to opponent to join", 350, 250);
socket.emit("start");

socket.on('playerTwo', () => {
    playerTwo = true;
    starts = true;
    fx();
});


socket.on('updated', (data1) => {

    ballX = data1.ballX
    ballY = data1.ballY
    ballSpeedX = data1.ballSpeedX
    ballSpeedY = data1.ballSpeedY
    player1Score = data1.player1Score
    player2Score = data1.player2Score
    paddle2Y = data1.paddle2Y
    starts = data1.starts
    fx();
});

// on disconnect reset variables
socket.on('dc', () => {
    playerTwo = false;
    starts = false;
    player1Score = 0;
    player2Score = 0;
    showingWinScreen = true;
    colorRect(0, 0, canvas.width, canvas.height, '#0008FE');
    canvasContext.fillStyle = 'white';
    canvasContext.fillText("Opponent has left", 350, 250);

});




function fx() {

    //playerone
    if (playerTwo == false) {
        drawEverything();
        socket.emit("paddle", paddle1Y);
    }
    else {
        var framesPerSecond = 30;
        setInterval(function () {
            let data = {
                ballX: ballX,
                ballY: ballY,
                ballSpeedX: ballSpeedX,
                ballSpeedY: ballSpeedY,
                player1Score: player1Score,
                player2Score: player2Score,
                paddle2Y: paddle2Y,
                starts: starts
            }
            socket.emit("update", data);
            moveEverything();
            
            drawEverything();
            socket.on("XXX", (data2)=>{
                    paddle1Y=data2;
            });
        }, 1000 / framesPerSecond);
    }


}
// canvas.addEventListener('mousedown', handleMouseClick);

canvas.addEventListener('mousemove',
    function (evt) {
        var mousePos = calculateMousePos(evt);
        if(playerTwo==false)
        {
            paddle1Y = mousePos.y - (PADDLE_HEIGHT / 2);
        }
        else
        {
            paddle2Y = mousePos.y - (PADDLE_HEIGHT / 2);
        }
    });
function ballReset() {
    if (player1Score >= WINNING_SCORE ||
        player2Score >= WINNING_SCORE) {

        showingWinScreen = true;

    }

    ballSpeedX = -ballSpeedX;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}
function moveEverything() {
    if (!starts) {
        return;
    }

    if (playerTwo == false)
        return;

    ballX = ballX + ballSpeedX;
    ballY = ballY + ballSpeedY;

    if (ballX < 0) {
        if (ballY > paddle1Y &&
            ballY < paddle1Y + PADDLE_HEIGHT) {
            ballSpeedX = -ballSpeedX;

            var deltaY = ballY
                - (paddle1Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player2Score++; // must be BEFORE ballReset()
            ballReset();
        }
    }
    if (ballX > canvas.width) {
        if (ballY > paddle2Y &&
            ballY < paddle2Y + PADDLE_HEIGHT) {
            ballSpeedX = -ballSpeedX;

            var deltaY = ballY
                - (paddle2Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player1Score++; // must be BEFORE ballReset()
            ballReset();
        }
    }
    if (ballY < 0) {
        ballSpeedY = -ballSpeedY;
    }
    if (ballY > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }
}
function drawEverything() {
    // next line blanks out the screen with black
    colorRect(0, 0, canvas.width, canvas.height, '#0008FE');

    if (!starts) {
        return;
    }

    drawNet();

    // this is left player paddle
    colorRect(0, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white');

    // this is right computer paddle
    colorRect(canvas.width - PADDLE_THICKNESS, paddle2Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white');

    // next line draws the ball
    colorCircle(ballX, ballY, 10, 'white');

    canvasContext.fillText(player1Score, 100, 100);
    canvasContext.fillText(player2Score, canvas.width - 100, 100);

}


function colorCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function colorRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}


function drawNet() {
    for (var i = 0; i < canvas.height; i += 40) {
        colorRect(canvas.width / 2 - 1, i, 2, 20, 'white');
    }
}