# Flappy-Bird
Interactive browser game built with vanilla JavaScript, HTML, and CSS with adaptive difficulty, multiple lives, and dynamic animations
<img width="1514" alt="Screen Shot 2022-02-03 at 4 48 59 PM" src="https://user-images.githubusercontent.com/96708796/152435152-4c56f66f-9457-4d27-9c5f-80c46f123428.png">

## Table of contents
* [Features](#features)
* [What I Learned](#what-i-learned)
* [Technologies](#technologies)
* [Special Thanks](#special-thanks)

## Features
* Custom animations and physics with HTML canvas
* Pipes change color according to difficulty
* Scoreboard increments differently according to difficulty
* Sounds for tap, score, and collision events

### Future Features
* Improved mobile compatibility
* Save high score via browser storage

## What I Learned
* Animation loops consist of four steps: update, detect collisions, draw, and clear
* `window.requestAnimationFrame()` ensures the browser is ready before displaying content
* Dynamic loops can be made by adding a recursive function call at the end of a function: `setTimeout(function, time-variable)`
* Default parameters can be set by assigning them a value in the function definition
* Subclasses should inherit all the properties of their super class and `instanceof` can be used to check the type/class of an object
* CSS animations can be timed by adding a class to the HTML element
* Within `setTimeout()` and other methods that take functions as arguments, anonymous functions `() => {}` can be used so a new function does not have to be defined
	
## Technologies
Project is created with:
* JavaScript (ES6)
* HTML 5
* CSS 3
	
## Special Thanks
* Thank you to samuelcust for providing the image and sound assets for the game
* [Link to asset repository](https://github.com/samuelcust/flappy-bird-assets)
