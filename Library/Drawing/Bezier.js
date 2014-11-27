/** MIT License
 * Copyright (c) 2012 Gaetan Renaudeau <renaudeau.gaetan@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Modified by RedScotch Software, but core logic is mostly unchanged from the
 * above
 */

/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function(KUBE){
	"use strict";
	KUBE.LoadFactory('/Library/Drawing/Bezier',Bezier,['/Library/Extend/Object', '/Library/Drawing/ControlPoint']);

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