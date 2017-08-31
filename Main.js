app = {};

var GameState = {
	//Menus
	MainMenu : 1,
	Options : 2,
	//In Game
	Play : 3,
	Pause : 4,
	NextLevel : 5,
	//End,
	Win : 6,
	Lose : 7
}

// For Delta time tracking
var LastUpdate = Date.now();
var Now;
var DeltaTime;
var clock = 0;

// Set offset from screen
var OffsetX = 0;
var Mute = false;

// Keep track of last gamestate
var LastGamestate;





// Button class
class Button {

	constructor(x, y, ImageLoad, mute)
	{
		this.name = ImageLoad;
		this.img = new Image();
		var LoadPath = 'assets/' + ImageLoad + '.png';
		this.width = 128;
		this.height = 128;
		this.x = x - (this.width / 2);
		this.y = y - (this.height / 2);
		this.accel = 0;
		this.vel = 0;

		if (ImageLoad === 'Null')
		{

		}
		else
		{
			if (this.name != "AudioOn")
			{
				this.img.src = LoadPath;
			}
			else
			{
				if (!Mute)
				{
					this.img.src = LoadPath;
					app.ButtonClickSound.volume = 1;
					app.BackgroundMusic.volume = 1;
				}
				else
				{
					this.img.src = "assets/AudioOff.png";
					app.ButtonClickSound.volume = 0;
					app.BackgroundMusic.volume = 0;
				}
			}
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
		if (Mute)
		{
			this.img.src = "assets/AudioOff.png";
		}
		else
		{
			this.img.src = "assets/AudioOn.png";
		}
	}

	Update(velocity)
	{
		this.x += velocity;
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
		this.audio = new Audio("assets/Jump.wav");
		if (!Mute)
		{
			this.audio.volume = 1;
		}
		else
		{
			this.audio.volume = 0;
		}
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
		if (!Mute)
		{
			this.audio.volume = 1;
		}
		else
		{
			this.audio.volume = 0;
		}


		// Calculate velocity over the horizontal axis
		this.velocity.x = this.velocity.x + (this.acceleration.x * DeltaTime);

		if (app.Controller.Level < 2)
		{
			if (this.velocity.x > 12)
			{
				this.velocity.x = 12;
			}
		}
		else
		{
			if (this.velocity.x >= 14)
			{
				this.velocity.x = 14;
			}
		}


		this.x += this.velocity.x;

		OffsetX += this.velocity.x;

		app.ctx.translate(-this.velocity.x, 0);

		// Invisibility
		if (this.invincible)
		{
			this.clock += DeltaTime;

			if (this.clock > 25)
			{
				this.invincible = false;
				this.clock = 0;
			}
		}

		// Jump physics
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
		this.EndPosition = 50000;
		this.ScoreText = "Score : " + this.Score;
		this.Lives = 3;
		this.LivesText = "Lives : " + this.Lives;
		this.x = 0;
		this.y = 30;
		this.Multiplier = 1;
		this.GenerateObstacle = false;
		this.GenerateFinish = false;
		this.GeneratePickUp = false;
		this.count = 0;
		this.clock = 0;
	}

	Draw()
	{
		app.ctx.fillText(this.ScoreText, this.x, this.y);
		app.ctx.fillText(this.LivesText, this.x + 250, this.y);
	}

	Update(velocity)
	{
		console.log(this.Multiplier);

		// Scroll HUD
		this.x += velocity;

		if (this.Level === 1)
		{
			this.EndPosition = 5000;
		}
		else if (this.Level === 2)
		{
			this.EndPosition = 60000;
		}

		// Calcu;ate Score
		this.Score += this.Multiplier * (velocity / 120);

		this.Score = Math.round(this.Score * 100) / 100;

		this.ScoreText = "Score : " + this.Score;

		this.LivesText = "Lives : " + this.Lives;

		// Calculate generation
		if (this.x < this.EndPosition)
		{
			this.clock += DeltaTime * velocity;

			if (this.clock > 200)
			{
				this.GenerateObstacle = true;

				if (this.Level < 2)
				{
					this.clock = 0;
				}
			}

			if (this.Level > 1)
			{
				if (this.clock > 200)
				{
					this.GeneratePickUp = true;
					this.clock = 0;
				}
			}
		}

		if (this.x > this.EndPosition)
		{
			this.clock += DeltaTime * velocity;

			if (this.clock > 200)
			{
				if (this.count < 1)
				{
					this.GenerateFinish = true;
					this.clock = 0;
					this.count++;
				}
			}
		}
	}
}






// Obstacle class
class Obstacle {
	constructor(x, Level, name)
	{
		this.name = name;
		this.ground = app.canvas.height - 500;
		this.x = x;
		this.y = this.ground + 64;
		this.width = 64;
		this.height = 64;

		this.img = new Image();

		if (Level < 3)
		{
			this.img.src = "assets/" + name + ".png";
		}
	}

	Draw()
	{
		app.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
	}
}






// Pick up class
class PickUp {
	constructor(x, name)
	{
		this.name = name;
		this.x = x + 200;
		this.ground = app.canvas.height - 500;
		this.y = this.ground - 150;
		this.srcX = 0; // Refers to the x position on the sprite sheet
		this.srcY = 0; // Refers to the y position on the sprite sheet
		this.width = 44; // Width of image
		this.height = 40; // Height of image
		this.img = new Image();
		this.img.src = "assets/" + name + ".png";
		this.count = 0;
		this.audio = new Audio("assets/Coin.wav");

		if (!Mute)
		{
			this.audio.volume = 1;
		}
		else
		{
			this.audio.volume = 0;
		}
	}

	CheckMute()
	{
		if (!Mute)
		{
			this.audio.volume = 1;
		}
		else
		{
			this.audio.volume = 0;
		}
	}

	SpriteCycle()
	{
		this.count += 1;

		if (this.count > 3)
		{
			this.count = 0;

			this.srcX += this.width;

			if (this.srcX > this.width * 9)
			{
				this.srcX = 0;
			}
		}	
	}

	Draw()
	{
		app.ctx.drawImage(this.img, this.srcX, this.srcY, this.width, this.height, this.x, this.y, this.width, this.height);
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

	var MainMenuImage;
	app.MainMenuImage = new Image();

	app.MainMenuImage.onload = function()
	{
		app.MainMenuImage.width = app.canvas.width;
		app.MainMenuImage.height = app.canvas.height;
	}

	app.MainMenuImage.src = "assets/MainMenu.png";

	var PauseMenuImage;
	app.PauseMenuImage = new Image();

	app.PauseMenuImage.onload = function()
	{
		app.PauseMenuImage.width = app.canvas.width;
		app.PauseMenuImage.height = app.canvas.height;
	}

	app.PauseMenuImage.src = "assets/PauseImage.png";

	// Initialise Buttons
	var MenuButtons;
	app.MenuButtons = [new Button(x, y, "Play"), new Button(x, y*2, "Options"), new Button(x, y*3, "Exit")];

	var PauseButton;
	app.PauseButton = new Button(app.canvas.width - 128, 64, "Pause");

	var PauseMenu;
	app.PauseMenu = [new Button(x, y, "Play"), new Button(x, y*2, "Options"), new Button(x, y*3, "Exit")]

	var OptionButtons;
	app.OptionButtons = [new Button(x - 128, y, "Play"), new Button(x + 128, y, "Play"), new Button(x, y*2, "AudioOn", Mute), new Button(x, y*3,"Back")];

	// Create background image
	var BackgroundImage;
	app.BackgroundImage = new Image();
	var GroundImage;
	app.GroundImage = new Image();
	var LoseImage;
	app.LoseImage = new Image();

	app.BackgroundImage.onload = function()
	{
		var heightDiff = screen.height + app.BackgroundImage.height;
		app.BackgroundImage.height = heightDiff;
		app.BackgroundImage.width = (app.BackgroundImage.width * screen.width);

		app.GroundImage.width = (app.GroundImage.width * screen.width);
		heightDiff = screen.height + app.GroundImage.height;
		app.GroundImage.height = heightDiff;

		app.LoseImage.width = app.canvas.width;
		heightDiff = screen.height + app.LoseImage.height;
		app.LoseImage.height = app.canvas.height;
	}

	app.BackgroundImage.src = "assets/BackgroundLevel1.png";
	app.GroundImage.src = "assets/GroundLevel1.png";
	app.LoseImage.src = "assets/Lose.png";

	// Create array to hold obstacles
	var Obstacles;
	app.Obstacles = [];

	var PickUps;
	app.PickUps = [];
}







// Create a new obstacle
function GenerateObstacle()
{
	var x = app.User.x + app.canvas.width;
	if (app.Controller.Level === 1)
	{
		app.Obstacles.push(new Obstacle(x, 1, "Bush"));
	}
	else
	{
		app.Obstacles.push(new Obstacle(x, 1, "Concrete"));
	}
}

// Creates a new Pick up
function GeneratePickUp()
{
	var x = app.User.x + app.canvas.width;
	app.PickUps.push(new PickUp(x, "Coin"));
}


// Generates the finish line
function GenerateFinish()
{
	var x = app.User.x + app.canvas.width;
	app.Obstacles.push(new Obstacle(x, 1, "Finish"));
}




// Sets to next level
function NextLevel()
{
	delete app.User;
	delete app.BackgroundImage;
	delete app.GroundImage;
	delete app.Obstacles;

	// Create user
	var User;
	app.User = new Player();

	app.ctx.translate(OffsetX, 0);

	app.Controller.x = 0;
	app.PauseButton.x = app.canvas.width - 128;

	OffsetX = 0;

	app.Controller.GenerateFinish = false;

	app.Controller.clock = 0;


	// Load in Background
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

	if (app.Controller.Level === 2)
	{
		app.BackgroundImage.src = "assets/BackgroundLevel2.png";
		app.GroundImage.src = "assets/GroundLevel2.png";
	}

	// Create array to hold obstacles
	var Obstacles;
	app.Obstacles = [];

	var PickUps;
	app.PickUps = [];

	app.CurrentState = GameState.Play;
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
		app.ctx.drawImage(app.MainMenuImage, 0, 0, app.MainMenuImage.width, app.MainMenuImage.height);

		for (var i = 0; i < app.MenuButtons.length; i++)
		{
			app.MenuButtons[i].Draw();
			Collision(app.mouse, app.MenuButtons[i]);
		}
	}
	// Options menu update
	else if (app.CurrentState === GameState.Options)
	{
		if (LastGamestate === GameState.MainMenu)
		{
			app.ctx.drawImage(app.MainMenuImage, 0, 0, app.MainMenuImage.width, app.MainMenuImage.height);
		}
		else
		{
			app.ctx.drawImage(app.PauseMenuImage, 0, 0, app.PauseMenuImage.width, app.PauseMenuImage.height);
		}

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


		// Generates Obstacles
		if (app.Controller.GenerateObstacle)
		{
			app.Controller.GenerateObstacle = false;
			GenerateObstacle();
		}

		// Generates Finish Line
		if (app.Controller.GenerateFinish)
		{
			app.Controller.GenerateFinish = false;
			GenerateFinish();
		}

		// Generates Pick Ups
		if (app.Controller.GeneratePickUp)
		{
			app.Controller.GeneratePickUp = false;
			GeneratePickUp();
		}

		// Updates Obstacles
		if (app.Obstacles.length > 0)
		{
			for (var i = 0; i < app.Obstacles.length; i++)
			{
				app.Obstacles[i].Draw();

				PlayerCollision(app.User, app.Obstacles[i]);
			}
		}

		// Update Pick ups
		if (app.Controller.Level > 1)
		{
			if (app.PickUps.length > 0)
			{
				for (var i = 0; i < app.PickUps.length; i++)
				{
					app.PickUps[i].CheckMute();
					app.PickUps[i].SpriteCycle();
					app.PickUps[i].Draw();
					PlayerCollision(app.User, app.PickUps[i]);
				}
			}
		}

		// Pause button function calls
		app.PauseButton.Update(app.User.velocity.x);
		app.PauseButton.Draw();

		if (app.Controller.Lives < 0)
		{
			app.ctx.translate(OffsetX,0);
			clock = 0;
			app.CurrentState = GameState.Lose;
		}

		Collision(app.mouse, app.PauseButton);
	}
	// Pause Update
	else if (app.CurrentState === GameState.Pause)
	{
		app.ctx.drawImage(app.PauseMenuImage, 0, 0, app.PauseMenuImage.width, app.PauseMenuImage.height);
		app.ctx.moveTo(0, 0);

		for (var i = 0; i < app.PauseMenu.length; i++)
		{
			app.PauseMenu[i].Draw();
			Collision(app.mouse, app.PauseMenu[i]);
		}
	}
	else if (app.CurrentState === GameState.Lose)
	{
		clock += DeltaTime;

		app.ctx.drawImage(app.LoseImage, 0, 0, app.LoseImage.width, app.LoseImage.height);

		if (clock > 60)
		{
			Reset();
		}
	}
	else if (app.CurrentState === GameState.Win)
	{
		app.ctx.translate(OffsetX,0);
		Reset();
	}
	else if (app.CurrentState === GameState.NextLevel)
	{
		NextLevel();
	}

	// Reset Mouse
	app.mouse.x = 0;
	app.mouse.y = 0;

	// Call update function 
	window.requestAnimationFrame(update);
}





// Resets all objects
function Reset()
{
	// Clear Obstacle array
	delete app.Obstacles;
	delete app.BackgroundImage;
	if (app.Controller.Level === 2)
	{
		delete app.PickUps;
	}

	delete app.Controller;
	delete app.User;
	delete app.GroundImage;
	app.BackgroundMusic.pause();
	delete app.BackgroundMusic;
	delete app.ButtonClickSound;
	delete app.MenuButtons;
	delete app.PauseButton;
	delete app.OptionButtons;
	delete app.MainMenuImage;

	OffsetX = 0;

	init();

	app.CurrentState = GameState.MainMenu;
}




// Function for player collision
function PlayerCollision(Object_01, Object_02)
{
	var collide = false;

	if (Object_02.name === "Finish")
	{
		if (Object_01.x > Object_02.x)
		{
			collide = true;
		}
	}
	else
	{
		if (Object_01.x > Object_02.x && Object_01.x < (Object_02.x + Object_02.width) &&
			(Object_01.y + Object_01.height) > Object_02.y)
		{
			collide = true	
		}
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
		LastGamestate = app.CurrentState;
		app.CurrentState = GameState.Options;
		app.ButtonClickSound.play();
	}
	else if (Object_02.name === "Bush" || Object_02.name === "Concrete")
	{
		if (!app.User.invincible)
		{
			app.User.invincible = true;
			app.Controller.Lives -= 1;
			app.Controller.Score -= 50;
			app.User.velocity.x -= 5;

			if (app.Controller.Score <= 0)
			{
				app.Controller.Score = 0;
			}

			if (app.User.velocity.x <= 2)
			{
				app.User.velocity.x = 2;
			}
		}
	}
	else if (Object_02.name === "Coin")
	{
		app.Controller.Multiplier += 0.2;
		Object_02.audio.play();
	}
	else if (Object_02.name === "Play")
	{
		if (app.CurrentState === GameState.MainMenu)
		{
			app.CurrentState = GameState.Play;
			app.ButtonClickSound.play();
		}
		else if (app.CurrentState === GameState.Pause)
		{
			app.ctx.translate(-OffsetX, 0);
			app.CurrentState = GameState.Play;
			app.ButtonClickSound.play();
		}
	}
	else if (Object_02.name === "Back")
	{
		app.ButtonClickSound.play();
		app.CurrentState = LastGamestate;
	}
	else if (Object_02.name === "AudioOn")
	{
		app.ButtonClickSound.play();

		if (Mute)
		{
			Mute = false;
		}
		else
		{
			Mute = true;
		}


		Object_02.ChangeImage();

		if (Mute)
		{
			app.ButtonClickSound.volume = 0;
			app.BackgroundMusic.volume = 0;
		}
		else
		{
			app.ButtonClickSound.volume = 1;
			app.BackgroundMusic.volume = 1;
		}

	}
	else if (Object_02.name === "Pause")
	{
		app.ButtonClickSound.play();
		app.ctx.translate(OffsetX, 0);
		app.CurrentState = GameState.Pause;
	}
	else if (Object_02.name === "Exit")
	{
		app.ButtonClickSound.play();
		if (app.CurrentState === GameState.MainMenu)
		{
			window.location.href = "http://keoghsph.pythonanywhere.com/projects";
		}
		else if (app.CurrentState === GameState.Pause)
		{
			Reset();
		}
	}
	else if (Object_02.name === "Finish")
	{
		app.Controller.Level++;
		app.CurrentState = GameState.NextLevel;
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
		app.User.audio.play();
	}
}