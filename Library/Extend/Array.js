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
	var ExtendAPI;
	
	/* Load functions into Extend */
	KUBE.SetAsLoaded('/Library/Extend/Array');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('array','joinCallback',JoinCallback);
		ExtendAPI.Load('array','each',Each);
		ExtendAPI.Load('array','copy',Copy);
		ExtendAPI.Load('array','sum',Sum);
		ExtendAPI.Load('array','rand',Rand);
		ExtendAPI.Load('array','args',Args);
		KUBE.EmitState('/Library/Extend/Array');
		KUBE.console.log('/Library/Extend/Array Loaded');
	}
	
	/* Declare functions here */
	function Args(_argObj){
		return (KUBE.Is(_argObj,true) === 'Arguments' ? Array.prototype.slice.call(_argObj) : []);
	}
	
	function Copy(){
		var target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);
		return copy(target);
	}

	function JoinCallback(_f,_s){
		var i,
			$return = '';
		
		if(this.length && KUBE.Is(_f) === 'function'){
			_s = (KUBE.Is(_s) === 'string' ? _s : ',');
			for(i=0;i<this.length;i++){
				$return = $return+(!i ? _f(this[i]) : _s+_f(this[i]));
			}
		}
		return $return;
	}

	function Each(_f,_useOriginal,_preserveIndex){
		var eVal,eachBreak,i,$return; //= (_useOriginal ? [] : this);
		$return = (!_useOriginal ? [] : this);
		
		if(this.length && KUBE.Is(_f) === 'function'){
			eachBreak = false;
			for(i=0;i<this.length;i++){
				eVal = _f.call({'break':_break},this[i],i,this);
				if(!_useOriginal){
					if(_preserveIndex){
						$return[i] = eVal;
					}
					else if(eVal !== undefined){
						$return.push(eVal);
					}
				}
				else{
					$return[i] = (eVal !== undefined ? eVal : this[i]);
				}
				if(eachBreak){
					break;
				}
			}
		}
		return $return;

		function _break(){
			eachBreak = true;
		}
	}
	
	function Sum(){
		var i,$return = 0;
		for(i=0;i<this.length;i++){
			if(KUBE.Is(this[i]) === 'number'){
				$return = $return+this[i];
			}
		}
		return $return;
	}
	
	function Rand(){
		var $return,min,max;
		$return = 0;
		if(KUBE.Is(this[0]) === 'number' && KUBE.Is(this[1]) !== 'number'){
			min = 0;
			max = this[0];
		}
		else if(KUBE.Is(this[0]) === 'number' && KUBE.Is(this[1]) === 'number'){
			min = this[0];
			max = this[1];
		}
		
		if(max){
			$return = Math.floor((Math.random()*max)+(min || 0));
		}
		return $return;
	}

	/* Direct copy from the object.copy */
	function copy(_obj){
		var copier = {'object':copyObject,'array':copyArray,'date':copyDate,'regExp':copyRegExp},
			circleCache = {'array':[],'object':[]},
			$return = copyObject(_obj);

		circleCache = null;
		return $return;

		function checkCircle(_ref,_type){
			var i,$ref;
			for(i=0;i<circleCache[_type].length;i++){
				if(circleCache[_type][i].ref === _ref){
					$ref = circleCache[_type][i].copy;
					break;
				}
			}
			if($ref === undefined){
				$ref = copier[_type](_ref);
			}
			return $ref;
		}

		function copyObject(_obj){
			var type,prop,
				newObj = {};
		
			circleCache.object.push({'ref':_obj,'copy':newObj});

			for(prop in _obj){
				if(_obj.hasOwnProperty(prop)){
					if(_obj[prop] !== _obj){
						type = KUBE.Is(_obj[prop]);
						newObj[prop] = (copier[type] ? checkCircle(_obj[prop],type) : _obj[prop]);
					}
					else{
						newObj[prop] = newObj;
					}
				}
			}
			return newObj;
		}

		function copyArray(_array){
			var type,i,
				newArray = [];
		
			circleCache.array.push({'ref':_array,'copy':newArray});

			for(i=0;i<_array.length;i++){
				if(_array[i] !== _array){
					type = KUBE.Is(_array[i]);
					newArray.push((copier[type] ? checkCircle(_array[i],type) : _array[i]));
				}
				else{
					newArray.push(newArray);
				}
			}
			return newArray;
		}

		function copyDate(_date){
			return new Date(_date.getTime());
		}

		function copyRegExp(_regExp){
			return new RegExp(_regExp);
		}
	}
}(KUBE));