(function(KUBE){
	"use strict";
	KUBE.LoadFactory('ControlPoint',ControlPoint,['ObjectKUBE']);
	KUBE.LoadFactory('Bezier',Bezier,['ObjectKUBE']);

	//http://wiki.teamfortress.com/w/images/6/69/Announcer_control_point_warning.wav?t=20100625225237
	//OUR CONTROL POINT IS BEING CAPTURED
	ControlPoint.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function ControlPoint(_x,_y){
		var x,y;
		x = checkBounds(_x);
		y = checkBounds(_y);
		var api = {
			'X' : X,
			'Y': Y,
			'Get': Get
		}

		return api.KUBE().create(ControlPoint.prototype);

		function X(){
			return x;
		}

		function Y(){
			return y;
		}

		function Get(){
			return {'x': x, 'y': y}
		}

		function checkBounds(v){
            //Ok, I removed bounds checking as it has a sweet side effect of bounce physics!
            return v;
            //keeping it for posterity, but I don't care anymore! :p
			var $return = v;
			if(v > 1){ $return = 1; }
			else if(v < 0){ $return = 0 }
			return $return;
		}

	}

	Bezier.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Bezier(_CP1,_CP2,_NRIteration){
		var $api, CP1 = _CP1,
			CP2 = _CP2,
			NRIteration = _NRIteration || 4; //This defines how many times
		if(KUBE.Is(CP1,true) !== 'ControlPoint' || KUBE.Is(CP2,true) !== 'ControlPoint'){
			throw new Error('Attempted to initialize a Bezier curve without valid ControlPointObjects');
		}

		$api = {
			"Get": Get,
			"SetIteration": SetIteration,
			"CalcBezier":CalcBezier
		}.KUBE().create(Bezier.prototype);

		return $api;

		function Get(aX) { //Returns Y for given X
			if (CP1.X() == CP1.Y() && CP2.X() == CP2.Y()) return aX; // linear
			return CalcBezier(GetTForX(aX), CP1.Y(), CP2.Y());
		}

		function SetIteration(_iteration){
			NRIteration = _iteration;
			return $api;
		}

		function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
		function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
		function C(aA1)      { return 3.0 * aA1; }

		// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
		function CalcBezier(aT, aA1, aA2) {
			return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
		}

		// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
		function GetSlope(aT, aA1, aA2) {
			return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
		}

		function GetTForX(aX) {
			// Newton raphson iteration
			var aGuessT = aX;
			for (var i = 0; i < NRIteration; ++i) {
				var currentSlope = GetSlope(aGuessT, CP1.X(), CP2.X());
				if (currentSlope == 0.0) return aGuessT;
				var currentX = CalcBezier(aGuessT, CP1.X(), CP2.X()) - aX;
				aGuessT -= currentX / currentSlope;
			}
			return aGuessT;
		}
	}


//	function Bezier(){
//		var $bezierAPI,calcCache,preCalcFlag,preCalcPrecision,bezierType,points;
//
//		points = [];
//		calcCache = {};
//		preCalcFlag = false;
//		preCalcPrecision = 1000;
//
//		$bezierAPI = {
//			'SetPoints':SetPoints,
//			'PreCalc':PreCalc,
//			'Get':Get,
//			'GetDistance':GetDistance,
//			'GetYForX':GetYForX
//		}.KUBE().create(Bezier.prototype);
//
//		init(arguments);
//		return $bezierAPI;
//
//		//Init
//		function init(_initArgs){
//			var i,pointArgs = [];
//			if(_initArgs.length){
//				for(i=0;i<_initArgs.length;i++){
//					pointArgs.push(_initArgs[i]);
//				}
//				SetPoints.apply($bezierAPI,pointArgs);
//			}
//		}
//
//		function getSlope(_t,_xy1,_xy2){
//			//		A
//			//return (3*(1-(3*_xy2)+(3*_xy1))*_t*_t)+(2*(3*_xy2-6*_xy1)*_t)+()*_t;
//		}
//
//		//Public
//		function GetYForX(aX) {
//			var $return;
//			if(calcCache.KUBE().isEmpty()){
//				calcPath();
//				console.log(calcCache);
//			}
//			for(var t in calcCache){
//				if(calcCache.hasOwnProperty(t)){
//					if(Math.round(calcCache[t].x*preCalcPrecision)/preCalcPrecision == Math.round(aX*preCalcPrecision)/preCalcPrecision){
//						$return = calcCache[t].y;
//						break;
//					}
//				}
//			}
//			return $return;
//		}
//
//		function Get(_t){
//			//_t is the point along the path (0,1) you're calculating for
//			var $return;
//			if(validateRange(_t)){
//				$return = getFromCache(_t);
//			}
//			else{
//				throw new Error('Bezier Error. Cannot calculate for out of range value: '+_t);
//			}
//			return $return;
//		}
//
//		function GetDistance(_t1,_t2){
//			var P1,P2,$return;
//			if(validateRange(_t1) && validateRange(_t2)){
//				$return = {'x':0,'y':0};
//				P1 = Get(_t1);
//				P2 = Get(_t2);
//				$return.x = P2.x-P1.x;
//				$return.y = P2.y-P1.y;
//			}
//			else{
//				throw new Error('Bezier Error. Cannot calculate distance. Invalid t range given.');
//			}
//			return $return;
//		}
//
//		function PreCalc(_flagState,_precision){
//			var $return = preCalcFlag;
//			if(defined(_flagState)){
//				$return = $bezierAPI;
//				if(preCalcFlag !== _flagState || (defined(_precision) && _precision !== preCalcPrecision)){
//					preCalcPrecision = (KUBE.Is(_precision) === 'number' ? _precision : preCalcPrecision);
//					preCalcFlag = (_flagState ? true : false);
//					updateCalcCache();
//				}
//			}
//			return $return;
//		}
//
//		function SetPoints(){
//			var i,P;
//			if(arguments.length){
//				reset();
//				for(i=0;i<arguments.length;i++){
//					P = validatePoint(arguments[i]);
//					if(P){
//						points.push(P);
//					}
//				}
//				setType(points.length);
//				updateCalcCache();
//			}
//			return $bezierAPI;
//		}
//
//		//Private
//		function getFromCache(_t){
//			if(!defined(calcCache[_t])){
//				switch(bezierType){
//					case 'linear': linearB(_t,points[0],points[1]); break;
//					case 'quad': quadB(_t,points[0],points[1],points[2]); break;
//					case 'cubic': cubicB(_t,points[0],points[1],points[2],points[3]); break;
//				}
//			}
//			return calcCache[Math.round(_t*preCalcPrecision)/preCalcPrecision];
//		}
//
//		function calcPath(){
//			var i,precision;
//			precision = 1/preCalcPrecision;
//			if(bezierType){
//				for(i=0;i<=1;i+=precision){
//					getFromCache(i);
//				}
//			}
//		}
//
//		function updateCalcCache(){
//			calcCache = {};
//			if(preCalcFlag){
//				calcPath();
//			}
//		}
//
//		function defined(_var){
//			return (_var !== undefined ? true : false);
//		}
//
//		function setType(_points){
//			switch(_points){
//				case 2: bezierType = 'linear'; break;
//				case 3: bezierType = 'quad'; break;
//				case 4: bezierType = 'cubic'; break;
//				default:
//					if(_points > 4){
//						throw new Error('Bezier Error. Bezier does not currently handle recursive bezier');
//					}
//					break;
//			}
//		}
//
//		function validatePoint(_P){
//			var valid,$return;
//
//			valid = false;
//			$return = false;
//
//			switch(KUBE.Is(_P)){
//				case 'array':
//					if(KUBE.Is(_P[0]) === 'number' && KUBE.Is(_P[1]) === 'number' && validateRange(_P[0]) && validateRange(_P[1])){
//						valid = true;
//						$return = {};
//						$return.x = _P[0];
//						$return.y = _P[1];
//					}
//					break;
//
//				case 'object':
//					if(KUBE.Is(_P.x) === 'number' && KUBE.Is(_P.y) === 'number' && validateRange(_P.x) && validateRange(_P.y)){
//						valid = true;
//						$return = _P;
//					}
//					break;
//			}
//
//			if(!valid){
//				throw new Error('Bezier Error. Could not validate Point.');
//			}
//			return $return;
//		}
//
//		function validateRange(_t){
//			return (_t >= 0 && _t <= 1 ? true : false);
//		}
//
//		//B calcs
//		function linearB(_t,_SP,_EP){
//			var b = {};
//			b.x = _SP.x+(_t*(_EP.x-_SP.x));
//			b.y = _SP.y+(_t*(_EP.y-_SP.y));
//			calcCache[_t] = b;
//		}
//
//		function quadB(_t,_SP,_CP,_EP){
//			var b = {};
//			b.x = (Math.pow((1-_t),2)*_SP.x)+(2*(1-_t)*_t*_CP.x)+(Math.pow(_t,2)*_EP.x);
//			b.y = (Math.pow((1-_t),2)*_SP.y)+(2*(1-_t)*_t*_CP.y)+(Math.pow(_t,2)*_EP.y);
//			calcCache[_t] = b;
//		}
//
//		function cubicB(_t,_SP,_CP1,_CP2,_EP){
//			var b = {};
//			b.x = (Math.pow((1-_t),3)*_SP.x)+((3*(Math.pow(1-_t,2)))*_t*_CP1.x)+(3*(1-_t)*Math.pow(_t,2)*_CP2.x)+(Math.pow(_t,3)*_EP.x);
//			b.y = (Math.pow((1-_t),3)*_SP.y)+((3*(Math.pow(1-_t,2)))*_t*_CP1.y)+(3*(1-_t)*Math.pow(_t,2)*_CP2.y)+(Math.pow(_t,3)*_EP.y);
//			calcCache[Math.round(_t*preCalcPrecision)/preCalcPrecision] = b;
//		}
//
//		function reset(){
//			calcCache = {};
//			bezierType = undefined;
//			points = [];
//		}
//	}
}(KUBE));