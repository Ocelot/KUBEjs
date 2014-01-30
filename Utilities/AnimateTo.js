(function(KUBE){
	"use strict";
	KUBE.LoadFactory('AnimateTo',AnimateTo,['Animate','ObjectKUBE']);
	
	// We've created a non reference object to avoid awkward memory leaks
	AnimateTo.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function AnimateTo(){
		var target,$api;
		
		target = {'time':1000};
		$api = {
			'AnimateDomJack':AnimateDomJack,
			'Height':Height,
			'Width':Width,
			'Top':Top,
			'Left':Left,
			'Opacity':Opacity,
			'Time':Time,
			'Easing':Easing,
			'Get':Get
		}.KUBE().create(AnimateTo.prototype);
		return $api;
		
		function AnimateDomJack(_DJ,_callback,_behavior){
			KUBE.Animate().Trigger(_DJ,$api,undefined);
		}
		
		function Height(_height){
			return handleBehavior('height',_height);
		}
		
		function Width(_width){
			return handleBehavior('width',_width);
		}
		
		function Top(_top){
			return handleBehavior('top',_top);
		}
		
		function Left(_left){
			return handleBehavior('left',_left);
		}
		
		function Opacity(_opacity){
			return handleBehavior('opacity',_opacity);
		}
		
		function BackgroundColor(_r,_g,_b,_a){
			//return handleBehavior('backgroundColor',{})
		}
		
		function Time(_time){
			return handleBehavior('time',_time);
		}
		
		function Easing(_easing){
			return handleBehavior('easing',_easing);
		}
		
		function Get(){
			return target;
		}
		
		function Trigger(_Node, _callback){
			KUBE.Animate().Trigger(_Node,$api,_callback);
		}
		
		function handleBehavior(_target,_var){
			var $return = target[_target];
			if(_var !== undefined){
				$return = $api;
				target[_target] = _var;
			}
			return $return;
		}
	}
}(KUBE));