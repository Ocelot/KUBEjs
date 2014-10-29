(function(KUBE){
	KUBE.LoadFactory('/Library/Timer', Timer,['/Library/ExtendObject']);
	
	Timer.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Timer(){
		var timerData = {};
		timerData.timeCount = 0;
		timerData.timeout = 0;
		
		var $public = {
			'Set':Set,
			'Get':Get,
			'Refresh':Refresh
		}.KUBE().create(Timer.prototype);
		return $public;
		
		/* Public methods */
		function Set(seconds, timeoutCallback){
			timerData.timeout = seconds;
			timerData.callback = timeoutCallback;
			if(!checkInterval()){
				//Setup our initial interval
				timerData.Interval = setInterval(countInterval, 1000);
			}
		};
		
		function Get(){
			return timerData.timeout-timerData.timeCount;
		};
		
		function Refresh(){
			timerData.timeCount = 0;
		};
		
		/* private methods */
		function checkInterval(){
			var $return;
			if(typeof timerData.Interval === 'object'){
				$return = true;
			}
			else{
				$return = false;
			}
			return $return;
		};
		
		function countInterval(){
			timerData.timeCount++;
			if(timerData.timeout && timerData.timeCount >= timerData.timeout){
				triggerTimeout();
			}
		};
		
		function triggerTimeout(){
			if(typeof timerData.callback === 'function'){
				clearInterval(timerData.Interval);
				timerData.callback();
			}
			else{
				//Invalid callback passed
			}
		};
    };
})(KUBE);