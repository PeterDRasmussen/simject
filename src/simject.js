;(function(options){
	'use strict'
	
	var argumentResolver = undefined,
		container = {},
		singletons = {};
			
	var si = (window.simject || {});
	window.simject = si;
	si.options = si.options || {
		defaultSingleton: true,
		errors:{
			showInLog: false,
			throwException: true
		}
	};

	var handleError = function(err){
		err = 'simject error: ' + err;
		if (si.options && si.options.errors){
			if (si.options.errors.showInLog && console){
				console.log(err);
			}
			if (si.options.errors.throwException){
				throw err;
			}
		}
	};
	
	//inspiration from: http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
	var isFunction = function (object) {
		 return object && {}.toString.call(object) === '[object Function]';
	};
	
	var create = function(type){
		var registration = container[type];
		if (!registration){
			handleError('simject: could not find any registration with type of ' + type);
			return undefined;
		}
		var obj = registration.obj;
		if (isFunction(obj)){
			var parameters = argumentResolver.getParameterNames(obj);
			var dependencies = [];
			for (var i = 0; i < parameters.length; i++){
				dependencies.push(si.get(parameters[i]));
			}
			return obj.apply(null,dependencies);
		}
		return obj;
	};
	
	si.register = function(type, singletonOrObj, obj){
		if (!type)
			handleError('type is empty, null or undefined');
		
		if (arguments.length === 2){
			container[type] = {
				obj: singletonOrObj,
				singleton: si.options.defaultSingleton
			};
		}else{
			container[type] = {
				obj: obj,
				singleton: !!singletonOrObj
			};
		}
	};
	
	
	si.get = function(type){
		var registration = container[type];
		
		if (!registration){
			handleError('registration for type "' + type + '" not found.');
			return undefined;
		}
		
		if (registration.singleton){
			var singletonObj = singletons[type];
			if (!singletonObj){
				console.log('not defined',type);
				singletonObj = singletons[type] = create(type);
			}
			console.log('defined',type);
			return singletonObj;
		}
		console.log('creating new type ', type);
		return create(type);
	};
	
	si.getAll = function(parameters){
		var objects = [];
		for (var i = 0; i < parameters.length; i++){
			objects.push(si.get(parameters[i]));
		}
		return objects;
	}
	
	si.run = function(f){
		var parameters = argumentResolver.getParameterNames(f);
		console.log(parameters);
		var objects = si.getAll(parameters);
		f.apply(null,objects);
	};
	
	//Thanks to: http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
	argumentResolver = {
		getParameterNames: function(func){
			var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
			var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
				
			if(result === null)
				result = [];
			return result;
		}
	};
}());