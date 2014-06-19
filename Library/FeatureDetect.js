/* 
 * Name: FeatureDetect
 * Type: KUBESingletonClass
 */
(function(KUBE){
	"use strict";
	
	/* Load class */
	KUBE.LoadSingleton('FeatureDetect', FeatureDetect,['ExtendObject']);
	
	/* Declaration */
	FeatureDetect.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function FeatureDetect(){
		var detectionCache,$api,testNode;
		
		testNode = document.createElement('div');
		detectionCache = {};
		$api = {
			'rgba':rgba,
			'hsla':hsla,
			'IsRetina':IsRetina,
			'FloatType':FloatType,
			'LinearGradient':LinearGradient,
			'SupportsW3CGradient': SupportsW3CGradient,
			'Prefix':Prefix,
			'Keyframes':Keyframes,
			'Transitions':Transitions
		}.KUBE().create(FeatureDetect.prototype);
		return $api;
		
		/* Public Methods */
		function Prefix(){
			var prefix,prop;
			if(KUBE.Is(detectionCache.prefix) === 'undefined'){
				for(prop in testNode.style){
					prefix = /^webkit|^ms|^moz/i.exec(prop);
					if(prefix){
						detectionCache.prefix = prefix[0].toLowerCase();
						break;
					}
				}				
			}
			return detectionCache.prefix;
		}
		
		function LinearGradient(){
			if(KUBE.Is(detectionCache.linearGradient) === 'undefined'){
				var prefixArray = [
					"linear-gradient(left,black,white)",
					"-webkit-linear-gradient(left,black,white)",
					"-moz-linear-gradient(left,black,white)",
					"-ms-linear-gradient(left,black,white)",
					"-o-linear-gradient(left,black,white)"
				];
				detectionCache.linearGradient = false;
				try{
					for(var i=0;i<prefixArray.length;i++){
						testNode.style.background = prefixArray[i];
						if(testNode.style.background !== ''){
							detectionCache.linearGradient = true;
							break;
						}
					}
				}
				catch(e){}
			}
			return detectionCache.linearGradient;
		}

		function SupportsW3CGradient(){
			var w3cGradient, webkitGradient;
			if(detectionCache['w3cGradient'] === undefined){
				w3cGradient = "linear-gradient(to top, black 0%, white 100%)";
				testNode.style.backgroundImage = w3cGradient;
				if(testNode.style.backgroundImage !== ''){
					detectionCache['w3cGradient'] = true;
				}
			}
			return detectionCache['w3cGradient'];
		}

		function IsRetina(){
			return (window.devicePixelRatio > 1 ? true : false);
		}
		
		function FloatType(){
			if(KUBE.Is(detectionCache.floatType) === 'undefined'){
				if(KUBE.Is(testNode.style.cssFloat) !== 'undefined'){
					detectionCache.floatType = 'css';
				}
				else{
					detectionCache.floatType = 'style';
				}
			}
			return detectionCache.floatType;
		}
		
		function Keyframes(){
			var prefix;
			if(detectionCache.keyframes === undefined){
				detectionCache.keyframes = false;
				prefix = Prefix();
				if(testNode.style['animationName'] !== undefined || testNode.style[prefix+'AnimationName'] !== undefined){
					detectionCache.keyframes = true;
				}
			}
			return detectionCache.keyframes;
		}
		
		function Transitions(){
			var prefix;
			if(detectionCache.transitions === undefined){
				detectionCache.transitions = false;
				prefix = Prefix();
				if(testNode.style['transition'] !== undefined || testNode.style[prefix+'Transition'] !== undefined){
					detectionCache.transitions = true;
				}
			}
			return detectionCache.transitions;
		}
				
		function rgba(){
			if(KUBE.Is(detectionCache.rgba) === 'undefined'){
				detectionCache.rgba = true;
				try{
					testNode.style.color = 'rgba(1,1,1,0.5)';
				}
				catch(e){
					detectionCache.rgba = false;
				}
			}
			return detectionCache.rgba;
		}
		
		function hsla(){
			if(KUBE.Is(detectionCache.hsla) === 'undefined'){
				detectionCache.hsla = true;
				try{
					testNode.style.color = 'hsla(1,1%,1%,0.5)';
				}
				catch(e){
					detectionCache.hsla = false;
				}
			}
			return detectionCache.hsla;
		}
	}
}(KUBE));