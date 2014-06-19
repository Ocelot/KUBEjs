(function(KUBE){
	"use strict";
	KUBE.LoadFactory('ControlPoint',ControlPoint,['ExtendObject']);
	KUBE.LoadFactory('Bezier',Bezier,['ExtendObject']);

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
}(KUBE));