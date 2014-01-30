(function(KUBE){
	"use strict";
	KUBE.LoadSingleton('Animate',Animate,['DomJack','StyleJack','AnimateTo','FeatureDetect','ObjectKUBE']);
	
	//Singleton
	Animate.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Animate(){
		var FD,animationManager,animationState,$api,methodology;
		FD = KUBE.FeatureDetect();
		animationManager = {};
		animationState = {};
		methodology = (FD.Transitions() ? 'transitions' : 'manual');
		$api = {
			'Trigger':Trigger,
			'IsAnimating':IsAnimating,
			'Interrupt':Interrupt
		};
		return $api;
				
		function initCache(_id,DJ){
			if(KUBE.Is(animationManager[_id]) === 'undefined'){
				DJ.Once('cleanup',function(_djId){
					//Is it animating?
					//debugger;
					if(animationState[_djId]){
						debugger;
						animationState[_djId].CleanUp();
					}
					animationManager[_djId] = undefined;
					animationState[_djId] = undefined;
				});
				animationManager[_id] = {
					'Patience':KUBE.Patience(),
					'Q':0,
					'animationKey':0
				};
				animationState[_id] = false;
			}
		}
		
		function Trigger(_Node, _AnimateTo, _callback,_behavior){
			var DJ,djId,interrupt;
			if(KUBE.Is(_AnimateTo) === 'object' && _AnimateTo.KUBE().duckType(KUBE.AnimateTo()) === true){
				_behavior = (_behavior || '').toLowerCase();
				DJ = KUBE.DomJack(_Node);
				djId = DJ.CacheId();
				initCache(djId,DJ);
				
				//Refactor this later				
				if(animationState[djId]){
					//It's currently animating, so behavior matters
					if(_behavior !== 'block'){
						if(_behavior === 'q'){
							if(animationManager[djId].Q < 2){
								//Add
								addAnimation(DJ,_AnimateTo,_callback);
							}
						}
						else{
							//Add and interrupt
							//addAnimation(DJ,_AnimateTo,_callback);
							animationState[djId].Interrupt();
						}
					}
				}
				else{
					//Just add it
					addAnimation(DJ,_AnimateTo,_callback);
				}
			}
			else{
				throw new Error('KUBE Animation Failed. Invalid AnimateTo Object');
			}
			_Node = undefined;
		}
						
		function IsAnimating(_Node){
			return (animationState[KUBE.DomJack(_Node).CacheId()] ? true : false);
		}
		
		function Interrupt(_Node){
			var djId = KUBE.DomJack(_Node).CacheId();
			if(animationState[djId]){
				animationState[djId].Interrupt();
			}
		}

		function addAnimation(_DJ,_AT,_callback){
			var target;
			target = _AT.KUBE().copy();
			addTransitionAnimation(_DJ,target,_callback) || addManualAnimation(_DJ,target,_callback);
		}
		
		function addTransitionAnimation(_DJ,_target,_callback){
			var djId,$return = false;
			if(methodology === 'transitions'){
				$return = true;
				djId = _DJ.CacheId();
				animationManager[djId].Q++;
				animationManager[djId].Patience.Wait(function(_preProgress){
					var resolve;
					if(animationManager[djId]){
						resolve = this.resolve;
						animationManager[djId].Q--;
						animationState[djId] = new transitionAnimation(_DJ,_target.Get(),function(){ animationState[djId] = false; if(KUBE.Is(_callback) === 'function'){ _callback(); }},resolve,_preProgress);
						animationState[djId].Start();
					}
				});
			}
			return $return;			
		}
		
		function addManualAnimation(){
			
		}
		
		function cleanUp(){
			
		}
	}
	
	//Transition Animation
	function transitionAnimation(_DJ,_target,_callback,_resolve,_preProgress){
		var djId,$api,Style,progressData,timer;
		djId = _DJ.CacheId();
		Style = _DJ.Style();
		initProgress();
		$api = {
			'Start':Start,
			'Interrupt':Interrupt,
			'Finish':Finish,
			'CleanUp':cleanUp,
			'Progress':Progress
		};
		return $api;
		
		
		//Progress is tricky, deal with it here
		function initProgress(){
			//We need to get our original value
			progressData = {};
			if(defined(_target.left)){
				progressData.prop = 'left';
				progressData.startVal = Style.Left();
				progressData.target = _target.left;
			}
			else if(defined(_target.top)){
				progressData.prop = 'top';
				progressData.startVal = Style.Top();
				progressData.target = _target.top;
			}
			else if(defined(_target.opacity)){
				progressData.prop = 'opacity';
				progressData.startVal = Style.Opacity();
				progressData.target = _target.opacity;
			}
			
			if(KUBE.Is(_preProgress) === 'object' && _preProgress.progress !== 100){
				if(_preProgress.prop === progressData.prop){
					if(_preProgress.target === progressData.target){
						progressData.startVal = _preProgress.startVal;
					}
					else if(_preProgress.startVal === progressData.target){
						progressData.startVal = _preProgress.target;
					}
				}
			}
		}

		function calcProgress(current,start,target){
			return (current === target ? 100 : ((100-(current/((start-target)/100)))+100)%100);
		}
		
		function Progress(){
			var current;
			switch(progressData.prop){
				case 'top': current = Style.Top(); break;
				case 'left': current = Style.Left(); break;
				case 'opacity': current = Style.Opacity(); break;
			}
			progressData.current = current;
			progressData.progress = Math.round(calcProgress(current,progressData.startVal,progressData.target));
			return progressData.progress;
		}
		
		
		function Start(){
			applyAnimationTargetToNode();
		}
		
		function Interrupt(){
			return Finish(true);
		}
		
		function Finish(_interrupt){
			var top,left,width,height,opacity,transform,progress;
			clearTimeout(timer);
			Style.Transition('all 0 ease 0');
			_DJ.Clear('transitionend');
			
			if(defined(_target.top)){
				transform = Style.Transform();
				top = Style.Top()+transform.Matrix()[5];
				Style.Top(top).Transform().TranslateY(0);
			}

			if(defined(_target.left)){
				transform = Style.Transform();
				left = Style.Left()+transform.Matrix()[4];
				Style.Left(left).Transform().TranslateX(0);
			}
			
			if(defined(_target.width)){
				//Scale
			}
			
			if(defined(_target.height)){
				//Scale
			}
			
			if(defined(_target.opacity)){
				opacity = Style.Opacity();
				Style.Opacity(opacity);
			}			
			
			progress = Progress();
			console.log(progress);
			
			_resolve(progressData);
			_callback();
			(_interrupt && progress !== 100 ? _DJ.Emit('animateInterrupt',progress) : _DJ.Emit('animateEnd'));
			cleanUp();
			return progress;
		}
				
		function cleanUp(){
			$api = undefined;
			Style = undefined;
			_DJ = _target = _callback = _resolve = _preProgress = undefined;
		}
		
		function timeout(){
			timer = setTimeout(function(){
				console.log('failed animation finish. Animation timeout fired.');
				Interrupt();
			},(_target.time+5000));
		}
		
		function applyAnimationTargetToNode(_interrupt){
			var x,y,width,height,setWatchers = false;
			Style.BackfaceVisibility('hidden');
			if(defined(_target.top) || defined(_target.left)){
				y = calculateTop();
				x = calculateLeft();
				setWatchers = true;
			}
			
			if(defined(_target.width) || defined(_target.height)){
				width = calculateWidth();
				height = calculateHeight();
				setWatchers = true;
			}
			
			if(defined(_target.opacity)){
				setWatchers = true;
			}
			
			if(setWatchers){
				_DJ.Once('transitionend',function(){
					Finish();
				});
				
				Style.Transition().Property('all').Duration(_target.time);
				setXY(x,y);
				setScale(width,height);
				setOpacity(_target.opacity);
				timeout();
			}
			else{
				Finish();
			}
		}
		
		function setXY(_x,_y){
			if(defined(_x) && defined(_y)){
				Style.Transform().Translate([_x,_y]);
			}
			else if(defined(_x)){
				Style.Transform().TranslateX(_x);				
			}
			else if(defined(_y)){
				Style.Transform().TranslateY(_y);								
			}
		}
		
		function setScale(_width,_height){
			if(defined(_width) && defined(_height)){
				Style.Transform().Scale([_width,_height]);
			}
			else if(defined(_width)){
				Style.Transform().ScaleX(_width);				
			}
			else if(defined(_height)){
				Style.Transform().ScaleY(_height);								
			}
		}
		
		function setOpacity(_opacity){
			if(defined(_opacity)){
				Style.Opacity(_opacity);
			}
		}
				
		function calculateTop(){
			return (defined(_target.top) ? _target.top-Style.Top() : undefined);
		}
		
		function calculateLeft(){
			return (defined(_target.left) ? _target.left-Style.Left() : undefined);
		}
		
		function calculateWidth(){
			return (defined(_target.width) ? calcScale(Style.Width(),_target.width) : undefined);
		}
		
		function calculateHeight(){
			return (defined(_target.height) ? calcScale(Style.Height(),_target.height) : undefined);
		}
		
		function calcScale(_o,_t){
			return ((100/(_o/_t))/100)*1;			
		}
		
		function defined(_val){
			return (_val !== undefined ? true : false);
		}
	}
}(KUBE));