(function(KUBE){
	"use strict";

	/* Load class */
	KUBE.LoadFactory('/Library/LinearGradient', LinearGradient,['/Library/Color','/Library/FeatureDetect','/Library/Convert','/Library/ExtendObject']);
	KUBE.LoadFactory('/Library/RadialGradient', RadialGradient,['/Library/Color', '/Library/FeatureDetect','/Library/Convert','/Library/ExtendObject']);

	KUBE.EmitState('Gradient');

	LinearGradient.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function LinearGradient(){
		//To preface this.  All directions and angles specified in gradientStore are implied to be in "W3C" mode.
		//This means a few things.  Vertical and Horizontal define the "to" direction.  It also means that Angle is different.
		//In W3C mode, an angle of "0" means gradient goes bottom to top.  In  "middle" syntax, 0 is left to right.
		//The only time someone should be getting out "Middle" syntax gradient is specific versions of webkit that don't support W3C
		var Detect = KUBE.Class('/Library/FeatureDetect');
		var Check = KUBE.Class('/Library/ConvertCheck');
        var gradientStore = {
			"angle": '',
			'direction': {
				'vertical' : '',
				'horizontal':''
			},
			"colors": [],
			"repeating": false
		};
        var $api = {
				"Degrees": Degrees,
				"ToRight":ToRight,
				"ToLeft":ToLeft,
				"ToBottom": ToBottom,
				"ToTop": ToTop,
                "Add": Add,
                "Get": Get,
                "GetImage": GetImage,
				"Repeating": Repeating,
                "ParseFromString": ParseFromString
            }.KUBE().create(LinearGradient.prototype);
		return $api;

		function ToRight(){
			resetAngle();
			gradientStore.direction['horizontal'] = "right";
			return $api;
		}
		function ToLeft(){
			resetAngle();
			gradientStore.direction['horizontal'] = "left";
			return $api;
		}
		function ToTop(){
			resetAngle();
			gradientStore.direction['vertical'] = "top";
			return $api;
		}
		function ToBottom(){
			resetAngle();
			gradientStore.direction['vertical'] = "bottom";
			return $api;
		}

		function resetDirection(){
			gradientStore.direction = {'vertical': '','horizontal': ''};
		}
		function resetAngle(){
			gradientStore.angle = '';
		}

		function Repeating(_bool){
			gradientStore.repeating = (_bool ? true : false);
			return $api;
		}

		function Degrees(_deg){
			resetDirection();
			gradientStore.angle = parseInt(_deg);
			return $api;
		}

		function Add(_val,_color){
			if(KUBE.Color().IsValidColor(_color)){
				gradientStore.colors.push({'position': _val, 'color': _color});
			}
            return $api
		}

		function Get(_percent){
			return gradientStore.colors[_percent] || false;
		}

		function GetImage(_forceMiddleSyntax){
			var prefix, gradientString ,angle, direction;
			//I'm going to detect middle syntax automatically (or try to) and give the correct string back.
			if(!Detect().SupportsW3CGradient() || _forceMiddleSyntax){
				prefix = (gradientStore.repeating ? "-webkit-repeating-linear-gradient" : "-webkit-linear-gradient"); //This doesn't need IE/Moz/FF/Opera prefix as all of those should never be prefixed.
				angle = translateToMiddleSyntaxAngle(gradientStore.angle);
				direction = translateToMiddleSyntaxDirection(gradientStore.direction.horizontal,gradientStore.direction.vertical);
				gradientString = generateGradientString(angle,direction,true);

			}
			else{
				prefix = (gradientStore.repeating ? "repeating-linear-gradient" : "linear-gradient");
				angle = gradientStore.angle;
				direction = gradientStore.direction;
				gradientString = generateGradientString(angle,direction,false);

			}
            return prefix + "(" + gradientString  + ")";;
		}

		function translateToMiddleSyntaxDirection(_horiz,_vert){
			var horiz = (_horiz == "right" ? "left" : "right");
			var vert = (_vert == "top" ? "bottom" : "top");
			return {"horizontal" : horiz, "vertical": vert};
		}
		function translateToMiddleSyntaxAngle(_angle){
			//This is easy. Literally just +90deg as 0 in W3C is bottom to top, but 0 is left to right in Middle syntax
			return parseFloat(_angle) + 90;
		}

		function generateGradientString(_angle,_direction,_middleSyntax){
			var $return = [];
				$return.push(generateDirectionString());
				$return.push(generateColorString());
			return $return.join(',');

			function generateDirectionString(){
				var directionArray = [];
				if(_angle){
					directionArray.push(_angle + "deg");
				}
				else{
					if(!_middleSyntax){
						directionArray.push("to");
					}
					(_direction.horizontal ? directionArray.push(_direction.horizontal) : "");
					(_direction.vertical ? directionArray.push(_direction.vertical) : "");
				}

				return directionArray.join(" ");
			}
		}

		function generateColorString(){
			var $return = [];

			gradientStore.colors.KUBE().each(function(v,k){
				var color = v.color, position = v.position;
				position = (Check('px',position) ? position  : position + "%");
				if(position == '%'){ //This means that there's no position set, which is useful for repeat
					$return.push(color);
				}
				else{
					$return.push(color + " " + position);
				}
			});
			return $return.join(',');
		}


		function ParseFromString(_str){
			//Yay...
		}

	}

	function RadialGradient(){
		var gradientStore = { "circular" : false, "colors": {} };
		var $api = {
			"IsCircular": Circular,
			"Add": Add,
			"Get": Get,
			"GetString": GetString,
			"ParseFromString": ParseFromString

		};

		return $api;
	}

}(KUBE));
