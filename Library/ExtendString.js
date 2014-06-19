/* 
 * Name: StringKUBE
 * Type: KUBEExtendFunctions
 */

(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('ExtendString');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('string','trim',Trim);
		ExtendAPI.Load('string','trimChar',TrimChar);
		ExtendAPI.Load('string','debugger',Debugger);
		ExtendAPI.Load('string','ucFirst',UpperCaseFirst);
        ExtendAPI.Load('string','stripNonNumeric',StripNonNumeric);
		
		KUBE.EmitState('ExtendString');
		console.log('ExtendString Loaded');
	}
	
	/* Declare functions */
	function Trim(){
		return (String.prototype.trim ? String.prototype.trim.call(this) : this.replace(/^\s+|\s+$/g,''));
	}
	
	function TrimChar(_char){
		//Pretty sure this is the wrong way to do this. Look for more performant solution later.
		var tString = this;
		switch(KUBE.Is(_char)){
			case 'string':
				_char = _char || ' ';
				tString = (tString.charAt(0) === _char ? tString.substr(1) : tString);
				tString = (tString.charAt(tString.length-1) === _char ? tString.substr(0,tString.length-1) : tString);
				break;
				
			case 'array':
				for(var i=0;i<_char.length;i++){
					if(tString.charAt(0) === _char[i]){
						tString = tString.substr(1);
						break;
					}		
				}
				
				for(var i=0;i<_char.length;i++){
					if(tString.charAt(tString.length-1) === _char[i]){
						tString = tString.substr(0,tString.length-1);
						break;
					}
				}
				break;
		}
		return tString;		
	}
	
	function UpperCaseFirst(){
		return this.charAt(0).toUpperCase()+this.substr(1);
	}
    function StripNonNumeric(){
        return parseInt(/[^0-9]{1}/.KUBE().matchAndReplace(this)[0]);
    }
	
	function Debugger(){
		debugger;
		return this;
	}
}(KUBE));