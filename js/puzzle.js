var PUZZLE = {};
//______________________________________//
//__________Constants___________________//
//______________________________________//
PUZZLE.Constants = {
	DEBUG 	  : false,
	X_AMOUNT  : 4,
	Y_AMOUNT  : 4,
	SHUFFLE   : 100,
	ANIM_TIME : 0.3 // in sec
};
//______________________________________//
//__________Main________________________//
//______________________________________//
PUZZLE.Main = function(){
	var _started = false;
	var _isAnimating = false;
	var _pieces = false;
	var _last = false;

	//___Functions____________________________________________________________________________________________________________________________________________________________________________________/
	var _switchPosWithLast = function(obj){
		var lX = _last.currentX;
		var lY = _last.currentY;
		_last.currentX = obj.currentX;
		_last.currentY = obj.currentY;
		obj.currentX  = lX;
		obj.currentY  = lY;
	};
	
	var _shuffle = function(count, prevMove){
		if(count < PUZZLE.Constants.SHUFFLE){
			var objArr  = [];
			var moveArr = [];
			// do a random step
			var t = (prevMove == "bottom")? false : _getNeighbour("top");
			var l = (prevMove == "right")?  false : _getNeighbour("left");
			var b = (prevMove == "top")?    false : _getNeighbour("bottom");
			var r = (prevMove == "left")?   false : _getNeighbour('right');

			if(t){
				objArr.push(t);
				moveArr.push("top");
			}
			if(l){
				objArr.push(l);
				moveArr.push("left");
			}
			if(b){
				objArr.push(b);
				moveArr.push("bottom");
			}
			if(r){
				objArr.push(r);
				moveArr.push("right");
			}

			var n = Math.round(Math.random()*(objArr.length-1));
			_switchPosWithLast(objArr[n])
			
			_shuffle(count+1, moveArr[n]);
		} else {
			// now actually move the pieces
			for(var i=0; i<_pieces.length; i++){
				for(var j=0; j<_pieces[i].length; j++){
					PUZZLE.Animate.toNewPosition(_pieces[i][j], true);
				}
			}
		}
	};

	var _moveCallback = function(){
		_isAnimating = false;

		_checkFinish();
	};

	var _checkFinish = function(){
		var valid = true;

		for(var i=0; i<_pieces.length; i++){
			for(var j=0; j<_pieces[i].length; j++){
				if(_pieces[i][j].currentX !== _pieces[i][j].x || _pieces[i][j].currentY !== _pieces[i][j].y) valid = false;

				if(!valid) break;
			}
			if(!valid) break;
		}

		if(valid){
			Debug.log('Game Finished! | Score',PUZZLE.Score.getScore());
			PUZZLE.Controls.setEnded();
			_started = false;
		}
	};
	//___Public_Functions_____________________________________________________________________________________________________________________________________________________________________________/
	var _getIsStarted = function(){
		return _started;
	};
	var _startGame = function(){
		if(!_started){
			PUZZLE.Score.reset();

			_shuffle(0, "");
			_started = true;
			PUZZLE.Controls.setStarted();
		}
	};
	var _resetGame = function(){
		if(_started && _pieces.length){
			_started = false;

			for(var i=0; i<_pieces.length; i++){
				for(var j=0; j<_pieces[i].length; j++){
					_pieces[i][j].currentX = _pieces[i][j].x;
					_pieces[i][j].currentY = _pieces[i][j].y;

					PUZZLE.Animate.toNewPosition(_pieces[i][j], true);
				}
			}

			PUZZLE.Score.reset();
			PUZZLE.Controls.setReset();
		}
	};

	var _setPieces = function(arr){
		if(!_pieces) _pieces = arr;
	};
	var _getPieces = function(){
		return _pieces;
	};
	var _setLast = function(obj){
		if(!_last) _last = obj;
	};
	var _getLast = function(){
		return _last;
	};
	var _getNeighbour = function(side){
		if(_pieces.length){
			var n = false;
			for(var i=0; i<_pieces.length; i++){
				for(var j=0; j<_pieces[i].length; j++){
					var pX = _pieces[i][j].currentX;
					var pY = _pieces[i][j].currentY;
					if(_pieces[i][j] !== _last){

						switch(side){
							case "top":
								if(pX == _last.currentX && pY+1 == _last.currentY){
									// this is the top one!
									n = _pieces[i][j];
								}
								break;
							case "left":
								if(pY == _last.currentY && pX+1 == _last.currentX){
									// this is the left one!
									n = _pieces[i][j];
								}
								break;
							case "bottom":
								if(pX == _last.currentX && pY-1 == _last.currentY){
									// this is the bottom one!
									n = _pieces[i][j];
								}
								break;
							case "right":
								if(pY == _last.currentY && pX-1 == _last.currentX){
									// this is the bottom one!
									n = _pieces[i][j];
								}
								break;
						}
						if(n) break;
					}
				}
				if(n) break;
			}
			return n;
		}
		return false;
	};

	var _getIsAnimating = function(){
		return _isAnimating;
	};
	var _moveElements = function(obj){
		if(!_isAnimating && _started){
			// _isAnimating = true; /// so we dont need this!
			_switchPosWithLast(obj);
			
			PUZZLE.Animate.toNewPosition(_last, false);
			PUZZLE.Animate.toNewPosition(obj, true, _moveCallback);
			PUZZLE.Score.addMovement();
		}

	};
	//___Initialize___________________________________________________________________________________________________________________________________________________________________________________/
	var _init = function(){
		PUZZLE.Animate.init();
		PUZZLE.Pieces.init();
		PUZZLE.Controls.init();
		PUZZLE.Score.init();

		Debug.set(PUZZLE.Constants.DEBUG);
	};
	window.onload = _init;
	//___Public_______________________________________________________________________________________________________________________________________________________________________________________/
	return {
		getIsStarted   : _getIsStarted,
		startGame      : _startGame,
		resetGame 	   : _resetGame,

		setPieces 	   : _setPieces,
		getPieces 	   : _getPieces,
		setLast 	   : _setLast,
		getLast 	   : _getLast,
		getNeihgbour   : _getNeighbour,

		getIsAnimating : _getIsAnimating,
		//setIsAnimating : _setIsAnimating,
		moveElements   : _moveElements
	};
}();

//______________________________________//
//__________Animate_____________________//
//______________________________________//
PUZZLE.Animate = function(){
	var _elWidth = 0;
	var _elHeight = 0;

	//___Functions____________________________________________________________________________________________________________________________________________________________________________________/


	//___Public_Functions_____________________________________________________________________________________________________________________________________________________________________________/
	var _init = function(){
		_elWidth  = 100 / PUZZLE.Constants.X_AMOUNT;
		_elHeight = 100 / PUZZLE.Constants.Y_AMOUNT;
	};
	var _toNewPosition = function(obj, animate, callback){
		if(animate){
			callback = callback || function(){};
			Debug.log(obj.currentX*_elWidth, obj.currentY*_elHeight)
			TweenMax.to(obj.element, PUZZLE.Constants.ANIM_TIME, {left: (obj.currentX*_elWidth)+"%", top: (obj.currentY*_elHeight)+"%", onComplete: callback, ease: Power1.easeOut});
		} else {
			TweenMax.set(obj.element, {left: (obj.currentX*_elWidth)+"%", top: (obj.currentY*_elHeight)+"%"});
		}
	};

	//___Public_______________________________________________________________________________________________________________________________________________________________________________________/
	return {
		init 	      : _init,
		toNewPosition : _toNewPosition
	}
}();

//______________________________________//
//__________Controls____________________//
//______________________________________//
PUZZLE.Controls = function(){
	var _startBtn;
	var _resetBtn;
	var _overlay;
	var _holdingUp    = false;
	var _holdingLeft  = false;
	var _holdingDown  = false;
	var _holdingRight = false;

	//___Interaction Functions________________________________________________________________________________________________________________________________________________________________________/
	var _clickStart = function(){
		PUZZLE.Main.startGame();
	};
	var _clickReset = function(){
		PUZZLE.Main.resetGame();
	};

	var _keyDown = function(e){
		if(PUZZLE.Main.getIsAnimating()){
			// is animating, so block the rest
			Debug.log('Animation in progress | keydown blocked');
			return;
		}
		var side = "";
		var neihgbour = false;

		switch(e.keyCode){
			case 38: // arrow up
			case 87: // w
				if(!_holdingUp){
					_holdingUp = true;
					Debug.log('up');
					side = "top";
				}
				break;
			case 37: // arrow left
			case 65: // a
				if(!_holdingLeft){
					_holdingLeft = true;
					Debug.log('left');
					side = "left";
				}
				break;
			case 40: // arrow down
			case 83: // s
				if(!_holdingDown){
					_holdingDown = true;
					Debug.log('down');
					side = "bottom";
				}
				break;
			case 39: // arrow right
			case 68: // d
				if(!_holdingRight){
					_holdingRight = true;
					Debug.log('right');
					side = "right";
				}
				break;
		}

		if(side){
			Debug.log('getting neighbour at',side);
			neighbour = PUZZLE.Main.getNeihgbour(side);

			if(neighbour){
				PUZZLE.Main.moveElements(neighbour);
			} else {
				Debug.log('no neihgbour found at', side);
			}
		}
	};
	var _keyUp = function(e){
		switch(e.keyCode){
			case 38: // arrow up
			case 87: // w
				_holdingUp = false;
				break;
			case 37: // arrow left
			case 65: // a
				_holdingLeft = false;
				break;
			case 40: // arrow down
			case 83: // s
				_holdingDown = false;
				break;
			case 39: // arrow right
			case 68: // d
				_holdingRight = false;
				break;
		}
	};


	//___Functions____________________________________________________________________________________________________________________________________________________________________________________/
	var _checkHit = function(obj, last){
		if( (obj.currentX-1 == last.currentX || obj.currentX+1 == last.currentX) && obj.currentY == last.currentY ) return true;
		return ( (obj.currentY-1 == last.currentY || obj.currentY+1 == last.currentY) && obj.currentX == last.currentX );
	};

	var _enableStartBtn = function(){
		_startBtn.classList.remove('disabled');
	};
	var _disableStartBtn = function(){
		_startBtn.classList.add('disabled');
	};
	var _enableResetBtn = function(){
		_resetBtn.classList.remove('disabled');
	};
	var _disableResetBtn = function(){
		_resetBtn.classList.add('disabled');
	};

	var _hideOverlay = function(){
		_overlay.classList.add('hidden');
		_overlay.classList.remove('finished');
	};
	var _showOverlay = function(){
		_overlay.classList.remove('hidden');
		_overlay.classList.remove('finished');
	};


	//___Public_Functions_____________________________________________________________________________________________________________________________________________________________________________/
	var _init = function(){
		_startBtn = document.getElementById('startBtn');
		_startBtn.addEventListener('click', _clickStart);

		_resetBtn = document.getElementById('resetBtn');
		_resetBtn.addEventListener('click', _clickReset);
		_disableResetBtn();

		_overlay = document.getElementById('puzzleOverlay');

		document.addEventListener('keydown', _keyDown); // normally only enable this listener after user triggers start and remove when game is done, but for this simple example, nah...
		document.addEventListener('keyup'  , _keyUp  ); // normally only enable this listener after user triggers start and remove when game is done, but for this simple example, nah...
	};

	var _pieceClick = function(ev, obj){
		if(PUZZLE.Main.getIsAnimating()){
			// is animating, so block the rest
			Debug.log('Animation in progress | Click blocked');
			return;
		}

		var last = PUZZLE.Main.getLast();
		if( _checkHit(obj, last) ){
			// move objects to eachothers position
			PUZZLE.Main.moveElements(obj);
			Debug.log('hit!');
		} else {
			// do nothing
			Debug.log('mis!');
		}
	};

	var _setStarted = function(){
		_hideOverlay();
		_enableResetBtn();
		_disableStartBtn();
	};
	var _setEnded = function(){
		_overlay.innerHTML = "<p>You finished with a score of " + PUZZLE.Score.getScore() + " Moves!";
		_showOverlay();
		_overlay.classList.add('finished');

		_disableResetBtn();
		_enableStartBtn();
	};
	var _setReset = function(){
		_overlay.innerHTML = "";
		_showOverlay();
		_disableResetBtn();
		_enableStartBtn();
	};

	//___Public_______________________________________________________________________________________________________________________________________________________________________________________/
	return{
		init 		: _init,
		pieceClick  : _pieceClick,
		setStarted  : _setStarted,
		setEnded    : _setEnded,
		setReset    : _setReset
	};
}();

//______________________________________//
//__________Pieces______________________//
//______________________________________//
PUZZLE.Pieces = function(){
	var _puzzleInner;
	var _pieces;

	//___Constructors_________________________________________________________________________________________________________________________________________________________________________________/
	var Piece = function(id,x,y,w,h,last){
		this.id = id;
		this.x = x;
		this.y = y;
		this.currentX = x;
		this.currentY = y;
		this.last = last;

		this.element = document.createElement('div');
		this.element.classList.add("piece");
		if(last)this.element.classList.add("last");
		this.element.innerHTML = '<span class="id">' + id + '</span>';

		this.element.style.width  = w+"%";
		this.element.style.height = h+"%";
		this.element.style.left   = (w*x)+"%";
		this.element.style.top    = (h*y)+"%";
		this.element.style.backgroundSize = (PUZZLE.Constants.X_AMOUNT * 100)+"% "+(PUZZLE.Constants.Y_AMOUNT*100)+"%";

		var imPosX = (100 / (PUZZLE.Constants.X_AMOUNT-1)) * x;
		var imPosY = (100 / (PUZZLE.Constants.Y_AMOUNT-1)) * y;
		this.element.style.backgroundPosition = imPosX + "% " + imPosY + "%";

		if(!last) this.element.addEventListener('click',_click.bind(this));
		else PUZZLE.Main.setLast(this);
	};

	//___Functions____________________________________________________________________________________________________________________________________________________________________________________/
	var _click = function(e){
		if(PUZZLE.Main.getIsStarted() ) PUZZLE.Controls.pieceClick(e,this);
		else e.preventDefault();
	};


	var _createPieces = function(){
		_pieces = [];
		var currId = 1;
		var pieceWidth = 100 / PUZZLE.Constants.X_AMOUNT;
		var pieceHeight = 100 / PUZZLE.Constants.Y_AMOUNT;

		for(var y=0; y<PUZZLE.Constants.X_AMOUNT; y++){
			_pieces[y] = [];

			for(var x=0; x<PUZZLE.Constants.Y_AMOUNT; x++){
				var last = (y == PUZZLE.Constants.X_AMOUNT-1 && x == PUZZLE.Constants.Y_AMOUNT -1);
				_pieces[y][x] = new Piece(currId, x, y, pieceWidth, pieceHeight, last);
				//_pieces[y][x].element
				_puzzleInner.appendChild(_pieces[y][x].element);
				currId++;
			}
		}
	};

	//___Public_Functions_____________________________________________________________________________________________________________________________________________________________________________/
	var _init = function(){
		_puzzleInner = document.getElementById('puzzleInner');
		_puzzleInner.innerHTML = "";

		_createPieces();
		PUZZLE.Main.setPieces(_pieces);
	};

	//___Public_______________________________________________________________________________________________________________________________________________________________________________________/
	return {
		init 	: _init
	}
}();

//______________________________________//
//__________Score_______________________//
//______________________________________//
PUZZLE.Score = function(){
	var _scoreField;
	var _scoreValue = 0;

	//___Functions____________________________________________________________________________________________________________________________________________________________________________________/
	var _updateScore = function(){
		if(_scoreField)_scoreField.innerHTML = _scoreValue;
	};

	//___Public_Functions_____________________________________________________________________________________________________________________________________________________________________________/
	var _init = function(){
		_scoreField = document.getElementById('playerScore');
	};

	var _getScore = function(){
		return _scoreValue;
	};

	var _reset = function(){
		if(!PUZZLE.Main.getIsStarted()){
			_scoreValue = 0;
			_updateScore();
		}
	};

	var _addMovement = function(){
		_scoreValue++;
		_updateScore()
	};

	//___Public_______________________________________________________________________________________________________________________________________________________________________________________/
	return {
		init 		: _init,
		getScore 	: _getScore,
		reset 		: _reset,
		addMovement : _addMovement
	}
}();