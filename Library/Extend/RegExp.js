/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
	//"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('/Library/Extend/RegExp');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('regExp','matchAll',MatchAll);
		ExtendAPI.Load('regExp','matchAndReplace',MatchAndReplace);
		ExtendAPI.Load('regExp','replaceCallback',ReplaceCallback);
		KUBE.EmitState('/Library/Extend/RegExp');
		KUBE.console.log('/Library/Extend/RegExp Loaded');
	}
	
	/* Declare functions */
	function MatchAll(_string){
		var i,x,$return = [];
		if(KUBE.Is(_string) === 'string'){
			this.global = false;
			while(_string && this.exec(_string)){
				x = this.exec(_string);
				if(x[0] !== ''){
					var tArray = [];
					for(i=0;i<x.length;i++){
						tArray.push(x[i]);
					}
					$return.push(tArray);
				}
				_string = _string.substr(x['index']+x[0].length);
			}
		}
		return $return;
	}

	function MatchAndReplace(_string,_replace,_limit){
		var i,x,count,tArray,$matches,$newString;
		$matches = [];
		$newString = '';
		
		_replace = (KUBE.Is(_replace) === 'string' ? _replace : '');
		if(KUBE.Is(_string) === 'string'){
			this.global = false;
			count = 0;
			while(_string && this.exec(_string)){
				x = this.exec(_string);
				if(x[0] !== ''){
					tArray = [];
					for(i=0;i<x.length;i++){
						tArray.push(x[i]);
					}
					$matches.push(tArray);
				}
				$newString = $newString+_string.substr(0,x['index'])+_replace;
				_string = _string.substr(x['index']+x[0].length);
				count++;
				if(count >= _limit){
					break;
				}
			}
			if(_string){
				$newString = $newString+_string;
			}
		}
		return [$newString,$matches];
	}

	function ReplaceCallback(_string,_callback){
		var x,i,tArray,$matches,$newString;
		$matches = [];
		$newString = '';
		
		if(KUBE.Is(_string) === 'string' && KUBE.Is(_callback) === 'function'){
			this.global = false;
			while(_string && this.exec(_string)){
				x = this.exec(_string);
				if(x[0] !== ''){
					tArray = [];
					for(i=0;i<x.length;i++){
						tArray.push(x[i]);
					}
					$matches.push(tArray);
				}
				$newString = $newString+_string.substr(0,x['index'])+_callback(tArray);
				_string = _string.substr(x['index']+x[0].length);
			}
			if(_string){
				$newString = $newString+_string;
			}
		}
		return [$newString,$matches];	
	}
}(KUBE));