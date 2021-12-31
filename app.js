//"use strict";
document.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('start');
  const scoreboard = document.getElementById('scoreboard');
  const gameover = document.getElementById('gameover');
  const lives = document.getElementById('lives');
  const livesRemaining = document.getElementById('lives-remaining');

  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  context.canvas.width = window.innerWidth;
  context.canvas.height = window.innerHeight;
  let canvasWidth = canvas.width;
  let canvasHeight = canvas.height;

  window.addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
  }

  let activeGame = false;
  let postGame = false;
  let preGame = false;
  let originalGame = true;
  let currentScore = 0;
  let scoreDigits = 1;
  let scoreModifier = 1;
  let currentLives = 3;
  let lostLives = 0;
  let gameSpeed = 2000;
  let pipeNumber = 0;

  let gameObjects = [];
  let bird;
  let birdImage;
  let rotateDegrees = 360;

  const hitSound = new Audio('/audio/hit.wav');
  const pointSound = new Audio('/audio/point.wav');
  const swooshSound = new Audio('/audio/swoosh.wav');
  const wingSound = new Audio('/audio/wing.wav');

  const yellowBirdUpFlap = new Image();
  yellowBirdUpFlap.src = '/sprites/yellowbird-upflap.png';
  const yellowBirdMidFlap = new Image();
  yellowBirdMidFlap.src = '/sprites/yellowbird-midflap.png';
  const yellowBirdDownFlap = new Image();
  yellowBirdDownFlap.src = '/sprites/yellowbird-downflap.png';

  const pipeGreenTop = new Image();
  pipeGreenTop.src = '/sprites/pipe-green-top.png';
  const pipeGreenBottom = new Image();
  pipeGreenBottom.src = '/sprites/pipe-green-bottom.png';
  const pipeYellowTop = new Image();
  pipeYellowTop.src = '/sprites/pipe-yellow-top.png';
  const pipeYellowBottom = new Image();
  pipeYellowBottom.src = '/sprites/pipe-yellow-bottom.png';
  const pipeOrangeTop = new Image();
  pipeOrangeTop.src = '/sprites/pipe-orange-top.png';
  const pipeOrangeBottom = new Image();
  pipeOrangeBottom.src = '/sprites/pipe-orange-bottom.png';

  const pipeRedTop = new Image();
  pipeRedTop.src = '/sprites/pipe-red-top.png';
  const pipeRedBottom = new Image();
  pipeRedBottom.src = '/sprites/pipe-red-bottom.png';
  const pipePinkTop = new Image();
  pipePinkTop.src = '/sprites/pipe-pink-top.png';
  const pipePinkBottom = new Image();
  pipePinkBottom.src = '/sprites/pipe-pink-bottom.png';
  const pipePurpleTop = new Image();
  pipePurpleTop.src = '/sprites/pipe-purple-top.png';
  const pipePurpleBottom = new Image();
  pipePurpleBottom.src = '/sprites/pipe-purple-bottom.png';

  const pipeBlueTop = new Image();
  pipeBlueTop.src = '/sprites/pipe-blue-top.png';
  const pipeBlueBottom = new Image();
  pipeBlueBottom.src = '/sprites/pipe-blue-bottom.png';
  const pipeGreyTop = new Image();
  pipeGreyTop.src = '/sprites/pipe-grey-top.png';
  const pipeGreyBottom = new Image();
  pipeGreyBottom.src = '/sprites/pipe-grey-bottom.png';
  const pipeWhiteTop = new Image();
  pipeWhiteTop.src = '/sprites/pipe-white-top.png';
  const pipeWhiteBottom = new Image();
  pipeWhiteBottom.src = '/sprites/pipe-white-bottom.png';

  const topPipe = {
    image: pipeGreenTop
  };
  const bottomPipe = {
    image: pipeGreenBottom
  };

  let nextPipe;
  let pipeGap = 150;
  let pipePlacement = 400;
  let pipeRange = 100;

  function updateScore(points = 1) {
    if (nextPipe.invisible) return;
    currentScore += points * scoreModifier;
    const stringScore = currentScore.toString();

    if (stringScore.length > scoreDigits) {
      const digitDifference = stringScore.length - scoreDigits;
      for (let i = 0; i < digitDifference; i++) {
        scoreDigits++;
        scoreboard.firstElementChild.insertAdjacentHTML(
          'beforebegin',
          `<img src="/sprites/1.png" alt="${Math.pow(
            10,
            scoreDigits - 1
          )}s score digit" id="score-digit-${Math.pow(10, scoreDigits - 1)}s"/>`
        );
      }
    }

    for (let i = 0; i < scoreDigits; i++) {
      document.getElementById(
        `score-digit-${Math.pow(10, i)}s`
      ).src = `/sprites/${
        stringScore.split('')[stringScore.length - 1 - i]
      }.png`;
    }
    pointSound.play();
    if (currentScore % 100 === 0) {
      reviewGameDifficulty();
    }
  }

  function updateLives(update = -1) {
    currentLives += update;

    if (update < 0) {
      lostLives += Math.abs(update);
      document.getElementById(`life-${lostLives}`).src =
        '/sprites/yellowbird-lost-life.png';
    } else {
      lives.insertAdjacentHTML(
        'beforeend',
        `<img src ="/sprites/yellowbird-midflap.png" alt="life" id="life-${
          lostLives + currentLives + 1
        }"/>`
      );
    }
    livesRemaining.innerHTML = `${currentLives} ${
      currentLives === 1 ? 'Life' : 'Lives'
    } Remaining!`;
  }

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // *** BEGIN PHYSICS ENGINE ***

  class GameObject {
    constructor(context, x, y, vx, vy) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
    }
  }

  class Bird extends GameObject {
    constructor(context, x, y, vx, vy) {
      super(context, x, y, vx, vy);

      this.width = 34;
      this.height = 24;
      this.isDead = false;
    }

    draw() {
      if (this === '') return;
      if (this.vy > 75) {
        birdImage = yellowBirdUpFlap;
        if (activeGame) swooshSound.play();
      } else if (this.vy < 75 && this.vy > -75) {
        birdImage = yellowBirdMidFlap;
      } else if (this.vy < -75) {
        birdImage = yellowBirdDownFlap; // birdDownFlap
      }

      if (!bird.isDead) {
        this.context.drawImage(birdImage, this.x, this.y);
      } else {
        context.save();
        context.translate(this.x, this.y);
        context.rotate((rotateDegrees * Math.PI) / 180);
        this.context.drawImage(
          birdImage,
          -(this.width / 2),
          -(this.height / 2)
        );
        context.restore();
        rotateDegrees -= 5;
      }
    }

    update(secondsPassed) {
      if (this === '') return;
      this.vy += 300 * secondsPassed;

      this.x += this.vx * secondsPassed;
      this.y += this.vy * secondsPassed;

      if (this.y > canvasWidth) {
        gameObjects[0] = '';
      }
    }
  }

  class Pipe extends GameObject {
    constructor(context, x, y, vx, vy, placement) {
      super(context, x, y, vx, vy);

      this.placement = placement;

      this.passed = false;
      this.invisible = false;
      this.width = 52;
      this.height = 800;

      this.y = -this.height + this.placement;
      this.y2 = this.placement + pipeGap;

      if (this.x === canvasWidth + 50) {
        this.topPipe = topPipe.image;
        this.bottomPipe = bottomPipe.image;
      }
    }

    draw() {
      this.context.drawImage(this.topPipe, this.x, this.y);
      this.context.drawImage(this.bottomPipe, this.x, this.y2);

      if (this.x < canvasWidth / 2 - 52 && this.passed === false) {
        updateScore(1);
        this.passed = true;
        nextPipe = gameObjects[gameObjects.indexOf(this) + 1];
      }
    }

    update(secondsPassed) {
      // Move with set velocity
      this.x -= this.vx * secondsPassed;
      if (this.x < -50) {
        gameObjects.splice(
          gameObjects.indexOf(this),
          gameObjects.indexOf(this)
        );
        console.log(gameObjects.length);
      }
      if (this.vy > 0) {
        this.y -= this.vy * secondsPassed;
        this.y2 += this.vy * secondsPassed;

        if (this.y < -this.height && this.y2 > canvasHeight) {
          this.vy = 0;
          this.invisible = true;
        }
      }
    }
  }

  function generateBird() {
    bird = new Bird(
      context,
      canvas.width / 2 - 17,
      canvas.height / 2 - 12,
      0,
      100
    );

    if (postGame) {
      bird.vy = 0;
      bird.gravity = false;
    }
    gameObjects[0] = bird;
  }

  const restitution = 0.5;

  function detectEdgeCollisions() {
    if (bird.y < 5) {
      bird.vy = Math.abs(bird.vy) * restitution;
      bird.y = 5;
    } else if (!preGame) {
      if (bird.y > canvasHeight - bird.height - 112) {
        bird.vy = -Math.abs(bird.vy) * restitution;
        bird.y = canvasHeight - bird.width - 112;
        endGame();
      }
    } else if (bird.y > canvasHeight / 2 - bird.height) {
      bird.vy = Math.min(-Math.abs(bird.vy), -50) * 1;
      bird.y = canvasHeight / 2 - bird.height;
    }
  }

  function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < w1 + x1 && x1 < w2 + x2 && y2 < h1 + y1 && y1 < h2 + y2;
  }

  function detectPipeCollisions() {
    if (
      rectIntersect(
        Math.floor(bird.x),
        Math.floor(bird.y),
        bird.width,
        bird.height,
        Math.floor(nextPipe.x),
        Math.floor(nextPipe.y),
        nextPipe.width,
        nextPipe.height
      )
    ) {
      endGame();
    } else if (
      rectIntersect(
        Math.floor(bird.x),
        Math.floor(bird.y),
        bird.width,
        bird.height,
        Math.floor(nextPipe.x),
        Math.floor(nextPipe.y2),
        nextPipe.width,
        nextPipe.height
      )
    ) {
      endGame();
    }
  }

  let secondsPassed = 0;
  let oldTimeStamp = 0;
  let fps;

  /*
    Default values:
      pipeGap = 150
      pipeRange = 100
      gameSpeed = 2000
  */

  function reviewGameDifficulty() {
    if (currentScore >= 500) {
      document.getElementById('screen').style.backgroundImage =
        "url('/sprites/background-night.png')";
      scoreModifier = 5;
    } else if (currentScore >= 200) {
      scoreModifier = 2;
    }

    if (pipeNumber >= 450) {
      bottomPipe.image = pipeWhiteBottom;
      topPipe.image = pipeWhiteTop;
      gameSpeed = 1400;
      pipeRange = 150;
    } else if (pipeNumber >= 400) {
      bottomPipe.image = pipeGreyBottom;
      topPipe.image = pipeGreyTop;
      gameSpeed = 1400;
      pipeRange = 170;
    } else if (pipeNumber >= 350) {
      bottomPipe.image = pipeBlueBottom;
      topPipe.image = pipeBlueTop;
      gameSpeed = 1400;
      pipeRange = 165;
    } else if (pipeNumber >= 300) {
      bottomPipe.image = pipePurpleBottom;
      topPipe.image = pipePurpleTop;
      gameSpeed = 1500;
      pipeRange = 155;
    } else if (pipeNumber >= 250) {
      bottomPipe.image = pipePinkBottom;
      topPipe.image = pipePinkTop;
      gameSpeed = 1600;
      pipeRange = 145;
    } else if (pipeNumber >= 200) {
      bottomPipe.image = pipeRedBottom;
      topPipe.image = pipeRedTop;
      gameSpeed = 1700;
      pipeRange = 135;
    } else if (pipeNumber >= 100) {
      bottomPipe.image = pipeOrangeBottom;
      topPipe.image = pipeOrangeTop;
      gameSpeed = 1800;
      pipeRange = 125;
    } else if (pipeNumber >= 50) {
      bottomPipe.image = pipeYellowBottom;
      topPipe.image = pipeYellowTop;
      gameSpeed = 1900;
    }
  }

  // Update >> Detect Collisions >> Clear Canvas >> Draw
  function gameLoop(timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    secondsPassed = Math.min(secondsPassed, 0.1); //TK
    oldTimeStamp = timeStamp;

    fps = Math.round(1 / secondsPassed);

    for (let i = 0; i < gameObjects.length; i++) {
      if (gameObjects[i]) gameObjects[i].update(secondsPassed);
    }

    if (activeGame) {
      detectEdgeCollisions();
      if (nextPipe ?? false) detectPipeCollisions();
    }

    clearCanvas();

    for (let i = 0; i < gameObjects.length; i++) {
      if (gameObjects[i]) gameObjects[i].draw();
    }

    window.requestAnimationFrame(gameLoop);
  }

  function generatePipeCycle(placement = pipePlacement) {
    if (activeGame) {
      if (pipeNumber % 50 === 0) {
        reviewGameDifficulty();
      }
      placement = Math.min(
        Math.max(
          Math.floor(Math.random() * (2 * pipeRange) + (placement - pipeRange)),
          (20 * (canvasHeight - 112 - pipeGap)) / 100
        ),
        (80 * (canvasHeight - 112 - pipeGap)) / 100
      );
      gameObjects.push(
        new Pipe(context, canvasWidth + 50, 112, 75, 0, placement)
      );
      pipeNumber++;
      window.setTimeout(generatePipeCycle, gameSpeed, placement);
    }
  }

  // *** END PHYSICS ENGINE ***

  function startGame() {
    if (!activeGame && !postGame) {
      activeGame = true;
      preGame = true;

      startScreen.style.display = '';
      startScreen.src = '/sprites/message-flash.png';
      startScreen.classList.add('flash');

      reviewGameDifficulty();
      resizeCanvas();
      generateBird();

      if (originalGame) window.requestAnimationFrame(gameLoop);

      setTimeout(function () {
        preGame = false;
        startScreen.style.display = 'none';
        startScreen.classList.remove('flash');

        if (originalGame) {
          generatePipeCycle();
          nextPipe = gameObjects[1];
        } else {
          setTimeout(
            generatePipeCycle,
            gameSpeed -
              ((canvasWidth + 50 - gameObjects[gameObjects.length - 1].x) /
                75) *
                1000,
            gameObjects[gameObjects.length - 1].placement
          );

          for (let i = 1; i < gameObjects.length; i++) {
            gameObjects[i].vx = 75;
          }
        }
      }, 4500);
    } else if (activeGame) {
      bird.vy -= 200;
      wingSound.play();
    }
  }

  function newRun() {
    originalGame = false;

    for (let i = 1; i < gameObjects.length; i++) {
      gameObjects[i].vx = 0;
    }

    setTimeout(function resetPipes(i = 0) {
      if (i <= gameObjects.indexOf(nextPipe) + 1) {
        if (
          gameObjects[i] instanceof Pipe &&
          gameObjects[i].x < (canvasWidth * 80) / 100
        ) {
          gameObjects[i].vy = 200;
          if (i >= gameObjects.indexOf(nextPipe)) {
            updateScore();
          }
        }
        i++;
        setTimeout(resetPipes, 250, i);
      } else {
        livesRemaining.style.display = 'block';
        setTimeout(() => {
          livesRemaining.style.display = 'none';
          postGame = false;
          rotateDegrees = 360;
          startGame();
        }, 5000);
      }
    }, 2000);
  }

  function endGame() {
    activeGame = false;
    postGame = true;
    updateLives(-1);

    bird.isDead = true;
    bird.vx = -75;
    hitSound.play();

    if (currentLives > 0) return newRun();

    setTimeout(function () {
      //CLEAN UP THIS TIME, put retry button at end of this
      gameObjects = [];
    }, 10000);

    for (let i = 1; i < gameObjects.length; i++) {
      gameObjects[i].vy = 100;
      gameObjects[i].vx = 0;
    }

    scoreboard.classList.add('score-end-animation');
    gameover.classList.add('gameover-animation');

    secondsPassed = 0;
    oldTimeStamp = 0; // reset all variables!
  }

  ['touchstart', 'mousedown', 'keydown'].forEach((evt) =>
    document.addEventListener(evt, startGame, false)
  );
});

/* Bugs to fix:
- Bird breaks if screen too small
*/
