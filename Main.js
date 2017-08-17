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

		if (this.name === "AudioOn")
		{
			this.audio = true;
		}

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
}

// Payer class
class Player {

	constructor()
	{
		this.ground = app.canvas.height - 500;
		this.x = 50;
		this.y = this.ground;
		this.srcX = 0; // Refers to the x position on the sprite sheet
		this.srcY = 0; // Refers to the y position on the sprite sheet
		this.frameWidth = 128; // Width of image
		this.frameHeight = 128; // Height of image
		this.img = new Image();
		this.img.src = "assets/female.png";
		this.count = 0; // Used for updating frames
		this.speed = 3;
		this.jump = false;
		this.gravity= 9.81;
		this.u = 80;
	}

	SpriteCycle()
	{
		this.count += 1;

		if (this.count > 3)
		{
			this.count = 0;

			this.srcX += 128;

			if (this.srcX > this.frameWidth * 5)
			{
				this.srcX = 0;
			}
		}	
	}

	Update(ground)
	{
		this.x += this.speed;

		if (this.jump)
		{
			this.y -= this.u;
			this.jump = false;
		}
		else
		{
			if (this.y < this.ground)
			{
				console.log("In air");
			}
		}
	}

	Draw()
	{
		app.ctx.drawImage(this.img, this.srcX, this.srcY, this.frameWidth, this.frameHeight, this.x, this.y, this.frameWidth, this.frameHeight);
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

	var User;
	app.User = new Player();

	var BackgroundMusic;
	app.BackgroundMusic = new Audio("assets/Background Music.mp3");
	app.BackgroundMusic.loop = true;
	app.BackgroundMusic.play();

	var ButtonClickSound;
	app.ButtonClickSound = new Audio("assets/Button.wav");

	var x = app.canvas.width / 2;
	var y = app.canvas.height / 4;

	// Initialise Buttons
	var MenuButtons;
	app.MenuButtons = [new Button(x, y, "Play"), new Button(x, y*2, "Options"), new Button(x, y*3, "Exit")];

	var PauseButton;
	app.PauseButton = new Button(app.canvas.width - 128, 64, "Pause");

	var OptionButtons;
	app.OptionButtons = [new Button(x - 128, y, "Play"), new Button(x + 128, y, "Play"), new Button(x, y*2, "AudioOn"), new Button(x, y*3,"Back")];
}

// Main Update function
function update(){
	// Clear canvas for drawing purposes
	app.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);

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
		app.User.Update(50);
		app.User.SpriteCycle();
		app.User.Draw();
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

// Function to handle collision detection between 2 objects
function Collision(Object_01, Object_02)
{
	var collid = false;

	if (Object_01.x > Object_02.x && Object_01.x < (Object_02.x + Object_02.width) &&
		Object_01.y > Object_02.y && Object_01.y < (Object_02.y + Object_02.height))
	{
		collid = true;
	}

	if (collid === true)
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

	if (app.CurrentState === GameState.Play && !app.User.jump)
	{
		app.User.jump = true;
		console.log("Jump");
	}
}