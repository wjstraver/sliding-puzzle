var Debug = function(){
	_enabled = false;
	return {
		log: function(){
			if(_enabled) console.log.apply(console, arguments);
		},
		warn: function(){
			if(_enabled) console.warn.apply(console, arguments);
		},
		error: function(){
			if(_enabled) console.error.apply(console, arguments);
		},
		dir: function(){
			if(_enabled) for(var i=0; i<arguments.length; i++) console.dir(arguments[i]);
		},
		set: function(bool){
			_enabled = (bool === true);
		}
	};
}();