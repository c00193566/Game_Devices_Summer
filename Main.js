app = {};

var GameState = {
	//Menus
	MainMenu : 1,
	Options : 2,
	//In Game
	Play : 3,
	Pause : 4,
	//End
	Win : 5,
	Lose : 6
}

// For Delta time tracking
var LastUpdate = Date.now();
var Now;
var DeltaTime;

// Set offset from screen
var OffsetX = 0;





// Button class
class Button {

	constructor(x, y, ImageLoad)
	{
		this.name = ImageLoad;
		this.img = new Image();
		var LoadPath = 'assets/' + ImageLoad + '.png';
		if (ImageLoad === 'Null')
		{

		}
		else
		{
			this.img.src = LoadPath;
		}
		this.width = 128;
		this.height = 128;
		this.x = x - (this.width / 2);
		this.y = y - (this.height / 2);
		this.accel = 0;
		this.vel = 0;

		if (this.name === "AudioOn")
		{
			this.audio = true;
		}
	}

	PauseInit(Acceleration)
	{
		this.accel = Acceleration;
	}

	Draw()
	{
		app.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	}

	ChangeImage()
	{
		if (this.audio === true)
		{
			this.img.src = "assets/AudioOff.png";
			this.audio = false;
		}
		else
		{
			this.img.src = "assets/AudioOn.png";
			this.audio = true;
		}
	}

	Update()
	{
		this.vel = this.vel + (this.accel * DeltaTime);

		if (app.Controller.Level < 2)
		{
			if (this.vel > 12)
			{
				this.vel = 12;
			}
		}


		this.x += this.vel;
	}
}






// Payer class
class Player {

	constructor()
	{
		this.name = "Player";
		this.ground = app.canvas.height - 500;
		this.invincible = false;
		this.visible = true;
		this.clock = 0.0;
		this.x = 50;
		this.y = this.ground;
		this.srcX = 0; // Refers to the x position on the sprite sheet
		this.srcY = 0; // Refers to the y position on the sprite sheet
		this.width = 128; // Width of image
		this.height = 128; // Height of image
		this.img = new Image();
		this.img.src = "assets/female.png";
		this.count = 0; // Used for updating frames
		this.jump = false;
		this.acceleration = {x : 0.1, y : 9.81};
		this.velocity = { x : 0, y : 0};
		this.u = 60;
		this.InAir = false;
	}

	SpriteCycle()
	{
		this.count += 1;

		if (this.count > 3)
		{
			this.count = 0;

			this.srcX += 128;

			if (this.srcX > this.width * 5)
			{
				this.srcX = 0;
			}
		}	
	}

	Update()
	{
		// Calculate velocity over the horizontal axis
		this.velocity.x = this.velocity.x + (this.acceleration.x * DeltaTime);

		if (app.Controller.Level < 2)
		{
			if (this.velocity.x > 12)
			{
				this.velocity.x = 12;
			}
		}


		this.x += this.velocity.x;

		OffsetX += this.velocity.x;

		app.ctx.translate(-this.velocity.x, 0);

		if (this.jump)
		{
			this.velocity.y = -this.u;
			this.jump = false;
			this.InAir = true;
		}
		else
		{
			if (this.InAir)
			{
				// Calculate vertical physics
				this.velocity.y = this.velocity.y + (this.acceleration.y * DeltaTime);
				this.y += (this.velocity.y * DeltaTime) + (0.5 * this.acceleration.y * (DeltaTime * DeltaTime));

				if (this.y >= this.ground)
				{
					this.InAir = false;
					this.y = this.ground;
				}
			}
		}
	}

	Draw()
	{
		if (this.invincible)
		{
			if(this.visible)
			{
				app.ctx.drawImage(this.img, this.srcX, this.srcY, this.width, this.height, this.x, this.y, this.width, this.height);
				this.visible = false;
			}
			else
			{
				this.visible = true;
			}
		}
		else
		{
			app.ctx.drawImage(this.img, this.srcX, this.srcY, this.width, this.height, this.x, this.y, this.width, this.height);
		}	
	}
}






// Class to keep track of score and lives
// Calculates when to generate obstacles
class GameController {
	constructor()
	{
		app.ctx.fillStyle = 'white';
		app.ctx.font = '30px serif';
		this.Level = 1;
		this.Score = 0;
		this.ScoreText = "Score : " + this.Score;
		this.Lives = 3;
		this.LivesText = "Lives : " + this.Lives;
		this.x = 0;
		this.y = 30;
		this.Multiplier = 1;
		this.GenerateObstacle = false;
		this.clock = 0;
	}

	Draw()
	{
		app.ctx.fillText(this.ScoreText, this.x, this.y);
		app.ctx.fillText(this.LivesText, this.x + 200, this.y);
	}

	Update(velocity)
	{
		// Scroll HUD
		this.x += velocity;

		// Calcu;ate Score
		this.Score += this.Multiplier * (velocity / 120);

		this.Score = Math.round(this.Score * 100) / 100;

		this.ScoreText = "Score : " + this.Score;

		this.LivesText = "Lives : " + this.Lives;

		// Calculate generation
		this.clock += DeltaTime * velocity;

		if (this.clock > 200)
		{
			this.GenerateObstacle = true;
			this.clock = 0;
		}

	}
}






// Obstacle class
class Obstacle {
	constructor(x, Level)
	{
		this.name = "Obstacle";
		this.ground = app.canvas.height - 500;
		this.x = x;
		this.y = this.ground + 64;
		this.width = 64;
		this.height = 64;

		this.img = new Image();

		if (Level < 3)
		{
			this.img.src = "assets/Bush.png";
		}
	}

	Draw()
	{
		app.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	}
}






// Pick up class
class PickUp {
	constructor()
	{

	}
}




function noscroll() {

  window.scrollTo( 0, 0 );

}

function main(){

	var canvas;
	var ctx;
	//Creates new canvas element
	app.canvas = document.createElement("canvas");

	//adds canvas to document
	document.body.appendChild(app.canvas);

	//Gets the width and height of the window
	app.canvas.height = window.innerHeight;
	app.canvas.width = window.innerWidth;

	//Gets the 2D context of the canvas
	app.ctx = app.canvas.getContext("2d");

	var CurrentState;
	app.CurrentState = GameState.MainMenu;

	//Allows the detection of human touch
	document.addEventListener("touchstart", onTouchStart);
	// add listener to disable scroll
	window.addEventListener('scroll', noscroll);

	//Create mouse object
	var mouse;
	app.mouse = {x : 0, y : 0, width : 2, height : 2};

	// Call init function
	init();

	// Call update function
	update();
}






function init(){
	// Create GameController Object
	var Controller;
	app.Controller = new GameController();

	// Create user
	var User;
	app.User = new Player();

	// Background Music
	var BackgroundMusic;
	app.BackgroundMusic = new Audio("assets/Background Music.mp3");
	app.BackgroundMusic.loop = true;
	//app.BackgroundMusic.play();

	// Create button click sound
	var ButtonClickSound;
	app.ButtonClickSound = new Audio("assets/Button.wav");

	var x = app.canvas.width / 2;
	var y = app.canvas.height / 4;

	// Initialise Buttons
	var MenuButtons;
	app.MenuButtons = [new Button(x, y, "Play"), new Button(x, y*2, "Options"), new Button(x, y*3, "Exit")];

	var PauseButton;
	app.PauseButton = new Button(app.canvas.width - 128, 64, "Pause");
	app.PauseButton.PauseInit(app.User.acceleration.x);

	var OptionButtons;
	app.OptionButtons = [new Button(x - 128, y, "Play"), new Button(x + 128, y, "Play"), new Button(x, y*2, "AudioOn"), new Button(x, y*3,"Back")];

	// Create background image
	var BackgroundImage;
	app.BackgroundImage = new Image();
	var GroundImage;
	app.GroundImage = new Image();

	app.BackgroundImage.onload = function()
	{
		var heightDiff = screen.height + app.BackgroundImage.height;
		app.BackgroundImage.height = heightDiff;
		app.BackgroundImage.width = (app.BackgroundImage.width * screen.width);
		app.GroundImage.width = (app.GroundImage.width * screen.width);
		heightDiff = screen.height + app.GroundImage.height;
		app.GroundImage.height = heightDiff;
	}

	app.BackgroundImage.src = "assets/Background.png";
	app.GroundImage.src = "assets/Ground.png";

	// Create array to hold obstacles
	var Obstacles;
	app.Obstacles = [];
}







// Create a new obstacle
function GenerateObstacle()
{
	var x = app.User.x + app.canvas.width;

	app.Obstacles.push(new Obstacle(x, 1));
}





// Main Update function
function update(){
	// Calculate Delta Time
	Now = Date.now();
	DeltaTime = Now - LastUpdate;
	DeltaTime = DeltaTime / 60;
	LastUpdate = Now;

	// Clear canvas for drawing purposes
	app.ctx.clearRect(0, 0, app.BackgroundImage.width, app.canvas.height);

	// Main Menu Update
	if (app.CurrentState === GameState.MainMenu)
	{
		for (var i = 0; i < app.MenuButtons.length; i++)
		{
			app.MenuButtons[i].Draw();
			Collision(app.mouse, app.MenuButtons[i]);
		}
	}
	// Options menu update
	else if (app.CurrentState === GameState.Options)
	{
		for (var i = 0; i < app.OptionButtons.length; i++)
		{
			app.OptionButtons[i].Draw();
			Collision(app.mouse, app.OptionButtons[i]);
		}
	}
	// Play Update
	else if (app.CurrentState === GameState.Play)
	{
		// Draw Background
		app.ctx.drawImage(app.BackgroundImage, 0, 0, app.BackgroundImage.width + 1000, app.BackgroundImage.height);
		app.ctx.drawImage(app.GroundImage, 0, (app.User.ground + 128), app.GroundImage.width, app.GroundImage.height);

		// Update the player
		app.User.Update();
		app.User.SpriteCycle();
		app.User.Draw();

		// Update GameController
		app.Controller.Update(app.User.velocity.x);
		app.Controller.Draw();

		if (app.Controller.GenerateObstacle)
		{
			app.Controller.GenerateObstacle = false;
			GenerateObstacle();
		}

		if (app.Obstacles.length > 0)
		{
			for (var i = 0; i < app.Obstacles.length; i++)
			{
				app.Obstacles[i].Draw();

				PlayerCollision(app.User, app.Obstacles[i]);
			}
		}

		// Pause button function calls
		app.PauseButton.Update();
		app.PauseButton.Draw();

		

		Collision(app.mouse, app.PauseButton);
	}
	// Pause Update
	else if (app.CurrentState === GameState.Pause)
	{
		console.log("Game is Paused");
	}

	// Reset Mouse
	app.mouse.x = 0;
	app.mouse.y = 0;

	// Call update function 
	window.requestAnimationFrame(update);
}





// Function for player collision
function PlayerCollision(Object_01, Object_02)
{
	var collide = false;

	if (Object_01.x > Object_02.x && Object_01.x < (Object_02.x + Object_02.width) &&
		(Object_01.y + Object_01.height) > Object_02.y)
	{
		collide = true	
	}

	if (collide)
	{
		HandleCollision(Object_02);
	}
}

// Function to handle collision detection between 2 objects
function Collision(Object_01, Object_02)
{
	var collide = false;

	//testing purposes
	if (Object_02.name === "Pause")
	{
		var PlaceHolderX = Object_02.x - OffsetX;
		if (Object_01.x > PlaceHolderX && Object_01.x < (PlaceHolderX + Object_02.width) &&
			Object_01.y > Object_02.y && Object_01.y < (Object_02.y + Object_02.height))
		{
			collide = true;
		}
	}
	else
	{
		if (Object_01.x > Object_02.x && Object_01.x < (Object_02.x + Object_02.width) &&
			Object_01.y > Object_02.y && Object_01.y < (Object_02.y + Object_02.height))
		{
			collide = true;
			console.log(collide);
		}
	}

	if (collide === true)
	{
		HandleCollision(Object_02);
	}
}






function HandleCollision(Object_02)
{
	if (Object_02.name === "Options")
		{
			app.CurrentState = GameState.Options;
			app.ButtonClickSound.play();
		}
		else if (Object_02.name === "Obstacle")
		{
			if (!app.User.invincible)
			{
				app.User.invincible = true;
				app.Controller.Lives -= 1;
				console.log("Hit");
			}
		}
		else if (Object_02.name === "Play")
		{
			app.CurrentState = GameState.Play;
			app.ButtonClickSound.play();
		}
		else if (Object_02.name === "Back")
		{
			app.ButtonClickSound.play();
			app.CurrentState = GameState.MainMenu;
		}
		else if (Object_02.name === "AudioOn")
		{
			app.ButtonClickSound.play();
			Object_02.ChangeImage();

			// Mutes or unmutes audio
			if (Object_02.audio === true)
			{
				app.ButtonClickSound.volume = 1;
				app.BackgroundMusic.volume = 1;
			}
			else
			{
				app.ButtonClickSound.volume = 0;
				app.BackgroundMusic.volume = 0;
			}
		}
		else if (Object_02.name === "Pause")
		{
			app.ButtonClickSound.play();
			app.CurrentState = GameState.Pause;
		}
		else if (Object_02.name === "Exit")
		{
			app.ButtonClickSound.play();
			window.location.href = "http://keoghsph.pythonanywhere.com/projects";
		}
}

// Function to handle touch input
function onTouchStart(e){
	touches = e.touches;
	app.mouse.x = touches[0].clientX;
	app.mouse.y = touches[0].clientY;

	if (app.CurrentState === GameState.Play && !app.User.jump && !app.User.InAir)
	{
		app.User.jump = true;
		console.log("Jump");
	}
}