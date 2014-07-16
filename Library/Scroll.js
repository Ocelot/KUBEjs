(function(KUBE){
	"use strict";
	KUBE.LoadFactory("Scroll",Scroll,['DomJack','Bezier','ExtendObject']); //TODO: MathKUBE wut?
	
	Scroll.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Scroll(_DomJack){
		var $scrollAPI, animating, interrupt, defaultAnimations;
		animating = false;
		interrupt = false;
		$scrollAPI = {
			"GetWidth":GetWidth,
			"GetHeight":GetHeight,
			"ScrollLeft": ScrollLeft,
			"ScrollRight": ScrollRight,
			"ScrollTop": ScrollTop,
			"ScrollBottom": ScrollBottom,
			"IsAnimating":IsAnimating,
			"Interrupt":Interrupt,
			"Scroll": ScrollAll
		}.KUBE().create(Scroll.prototype);

		defaultAnimations = {
			"easeIn": { "P1": KUBE.ControlPoint(0.42,0.00), "P2": KUBE.ControlPoint(1.00,1.00) },
			"easeOut": { "P1": KUBE.ControlPoint(0.00,0.00), "P2": KUBE.ControlPoint(0.58,1.00) },
			"ease" : { "P1": KUBE.ControlPoint(0.25,0.10), "P2": KUBE.ControlPoint(0.25,1.00) },
			"easeInOut": { "P1": KUBE.ControlPoint(0.42,0.00), "P2": KUBE.ControlPoint(0.58,1.00) },
			"linear" : { "P1": KUBE.ControlPoint(0.00,0.00), "P2": KUBE.ControlPoint(1.00,1.00) },
			"crazy":{ "P1": KUBE.ControlPoint(0.02,0.99), "P2": KUBE.ControlPoint(0.98,0.02) },
            "weird":{ "P1": KUBE.ControlPoint(0.65,0.42), "P2": KUBE.ControlPoint(0.3,1.5) }
		}

		if(!isDJ(_DomJack)){
			throw new Error("Scroll requires a valid DomJack to be initialized");
			$scrollAPI = false;
		}
		
		return $scrollAPI;
		
		/* Public */
		function GetWidth(){
			return _DomJack.GetNode().scrollWidth;
		}
		
		function GetHeight(){
			return _DomJack.GetNode().scrollHeight;
		}
		
		function X(_position){
			return (_position !== undefined ? ScrollLeft(_position) : _DomJack.GetNode().scrollLeft);
		}
		
		function Y(_position){
			return (_position !== undefined ? ScrollTop(_position) : _DomJack.GetNode().scrollTop);
		}

		// TODO TOMORROW: MAKE THE FUNCTIONS BELOW WORK IN THE FASTEST WAY POSSIBLE.  BASICALLY IF _MS, THEN CREATE ANIMATION OBJ AND GO
		function ScrollAll(_X,_Y,_ms){
			//Scroll both appropriately within the same animation
			animateScroll(_X);
		}
		
		function ScrollLeft(_position,_ms,_easing){
			//Scroll along X axis (left/right)
			_position = stringPosition(_position);
            if(_ms !== undefined){
                animateScroll(generateAnimationObject('x',_position,_ms,_easing));
            }
            else{
                _DomJack.GetNode().scrollLeft = parseInt(_position);
            }
			return $scrollAPI;
		}

		function ScrollRight(_position,_ms,_easing){
			var currentWidth = _DomJack.GetNode().scrollWidth
			return ScrollLeft(currentWidth - _position, _ms,_easing);
		}
		
		function ScrollTop(_position,_ms,_easing){
			//Scroll along Y axis (up/down)
			_position = stringPosition(_position);
            if(_ms !== undefined){
                animateScroll(generateAnimationObject('y',_position,_ms,_easing));
            }
            else{
                _DomJack.GetNode().scrollTop = parseInt(_position);
            }
			return $scrollAPI;
		}

		function ScrollBottom(_position,_ms,_easing){
			var currentHeight = _DomJack.GetNode().scrollHeight
			return ScrollTop(currentHeight - _position, _ms, _easing);
		}

		function IsAnimating(){
			return animating;
		}
		
		function Interrupt(){
			if(animating){
                interrupt = true;
			}
			return $scrollAPI;
		}

        function generateAnimationObject(_dir,_pos,_ms,_easing){
            var $return = {'destination': {}}, direction, P;
            if(KUBE.Is(_easing) === "object"
                && (KUBE.Is(_easing.P1,true) === "ControlPoint")
                && (KUBE.Is(_easing.P2,true) === "ControlPoint")
            ){
                $return['P1'] = _easing.P1;
                $return['P2'] = _easing.P2;
            }
            else{
                P = defaultAnimations[_easing] || defaultAnimations['easeInOut'];
                $return['P1'] = P.P1;
                $return['P2'] = P.P2;
            }

            direction = (_dir.toLowerCase() == "x" || _dir.toLowerCase() == "y" ? _dir.toLowerCase() : "x");
            $return['destination'][direction] = _pos;
            $return['duration'] = _ms;
            return $return;
        }

		/* Private */
		function animateScroll(_animationObj){
			var duration, Bezier, DJNode, destinationObj = {}, initialPosition = {}, startTs = null;
			Bezier = KUBE.Bezier(_animationObj.P1,_animationObj.P2,20);
			duration = _animationObj.duration;
			destinationObj = _animationObj.destination;
			DJNode = _DomJack.GetNode();
            window.XXX = Bezier;
			initialPosition = {"x":DJNode.scrollLeft, "y":DJNode.scrollTop};

			if(!_DomJack.IsDetached() && (destinationObj.x !== undefined || destinationObj.y !== undefined)){
				animating = true;
                interrupt = false;
				requestAnimationFrame(run);
			}
			else{
				throw new Error('Cannot animate scroll on detached element or animation needs a destination.');
			}

			function run(_ts){
				var currentTS,currentY,newX,newY,xRoundFn,yRoundFn;
				(startTs === null ? startTs = _ts : "");
				currentTS = _ts - startTs;
				if(currentTS <= duration){
					currentY = toPrecision(Bezier.Get(Math.floor(currentTS / duration * 1000) / 1000),4);
					if(destinationObj.x !== undefined){
                        xRoundFn = (destinationObj.x < initialPosition.x ? Math.floor : Math.ceil);
						newX = xRoundFn(currentY * (destinationObj.x - initialPosition.x) + initialPosition.x);
						DJNode.scrollLeft = newX;
					}
					if(destinationObj.y !== undefined){
                        yRoundFn = (destinationObj.y < initialPosition.y ? Math.floor : Math.ceil);
						newY = yRoundFn(currentY * (destinationObj.y - initialPosition.y) + initialPosition.y);
						DJNode.scrollTop = newY;
					}
					if(!interrupt){
						requestAnimationFrame(run);
					}
				}
				else{
					animating = false;
					interrupt = false;
                    if(destinationObj.y !== undefined){ DJNode.scrollTop = destinationObj.y;}
                    if(destinationObj.x !== undefined){ DJNode.scrollLeft = destinationObj.x;}
					if(KUBE.Is(_animationObj.callback) === "function"){
						_animationObj.callback();
					}
				}
			}
		}
		
		function stringPosition(_position){
			var N,$return = pxInt(_position);
			N = _DomJack.GetNode();
			if(KUBE.Is(_position) === 'string'){
				switch(_position.toLowerCase()){
					case 'right':
						$return = (N.scrollWidth > N.clientWidth ? (N.scrollWidth-N.clientWidth) : 0);
						break;
						
					case 'bottom':
						$return = (N.scrollHeight > N.clientHeight ? (N.scrollHeight-N.clientHeight) : 0);
						break;
						
					case 'left': case 'top': default:
						$return = 0;
						break;
				}
			}
			return $return;
		}
		
		function isDJ(_DJ){
			return (KUBE.Is(_DJ,true) === 'DomJack'? true : false);
		}

		function pxInt(string){
			return (isPx(string) ? parseInt(string) : string);
		}
		
		function isPx(string){
			return (KUBE.Is(string) === 'number' || String(string).slice(String(string).length-2) === 'px' ? true : false);
		}

        function toPrecision(_num,_precision){
            return parseFloat(Number(_num).toPrecision(_precision));
        }
	}	
}(KUBE));


/*
//This actually does do correct bezier animations of scroll bar!  I KNOW, LE GASP!

//saving this here for posterity so I can implement it tomorrow.  Like a boss.

 KUBE.Uses(['Bezier','DomJack','Select','Gradient'],function(BZ,DJ,S,G){
     DJ().Ready(function(){
         var BG = KUBE.LinearGradient();
         BG.Repeating(true);
         BG.Add('','black').Add('63px','black').Add('64px','white').Add('128px','white').ToRight();
         var P = KUBE.DomJack('div');
         var C = KUBE.DomJack('div');
         P.Style().Overflow('auto').Width(500).Height(500).Background().Color('blue');
         C.Style().Width(4000).Height(250).Background().Image(BG.GetImage());
         DJ(document.body).Append(P.Append(C));
         P.GetNode().scrollLeft = 2500;
         window.P = P;
         //Retarded.  Fast to middle, stop, fast to end
         //					var CP1 = KUBE.ControlPoint(0.02,0.99); var CP2 = KUBE.ControlPoint(0.98,0.02);
         //Ease-in
         //					var CP1 = KUBE.ControlPoint(0.42,0); var CP2 = KUBE.ControlPoint(1,1);
         //Ease-out
         //					var CP1 = KUBE.ControlPoint(0,0); var CP2 = KUBE.ControlPoint(0.58,1);
         //Ease
         //					var CP1 = KUBE.ControlPoint(0.25,0.1); var CP2 = KUBE.ControlPoint(0.25,1.0);
         //Ease-in-out
         var CP1 = KUBE.ControlPoint(0.42,0); var CP2 = KUBE.ControlPoint(0.58,1.0);
         //Linear
         //var CP1 = KUBE.ControlPoint(0,0); var CP2 = KUBE.ControlPoint(1,1);



         setTimeout(function(){
             requestAnimationFrame(run);
         },1000);
     });

 })


 */