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

	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('/Library/Extend/Object');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('object','merge',Merge);
		ExtendAPI.Load('object','mergeCopy',MergeCopy);
		ExtendAPI.Load('object','count',Count);
		ExtendAPI.Load('object','copy',Copy);
		ExtendAPI.Load('object','compare',Compare);
		ExtendAPI.Load('object','create',Create);
		ExtendAPI.Load('object','each',Each);
        ExtendAPI.Load('object','reverseEach',ReverseEach);
		ExtendAPI.Load('object','duckType',DuckType);
		ExtendAPI.Load('object','isEmpty',IsEmpty);
        ExtendAPI.Load('object','toJSON',toJSON);
        ExtendAPI.Load('object','fromJSON',fromJSON);
		KUBE.EmitState('/Library/Extend/Object');
		KUBE.console.log('/Library/Extend/Object Loaded');
	}
	
	/* Declare functions */
    function toJSON(){
        return JSON.stringify(this);
    }

    function fromJSON(_jsonString){
        var $this = this;
        var temp;
        temp = JSON.parse(_jsonString);
        for(var prop in temp){
            if(temp.hasOwnProperty(prop)){
                $this[prop] = temp[prop];
            }
        }
        return $this;
    }

	function Each(_f,_useOriginal){
		var prop,$return,eachBreak,eachDelete;
		$return = (!_useOriginal ? {} : this);
	
		if(KUBE.Is(_f) === 'function'){
			for(prop in this){
				eachDelete = false;
				if(this.hasOwnProperty(prop)){
					$return[prop] = _f.call({'break':_break,'delete':_delete},prop,this[prop]);
					if(eachDelete){
						delete $return[prop];
					}
					if(eachBreak){
						break;
					}
				}
			}
		}
		return $return;
		
		function _break(){
			eachBreak = true;
		}
		
		function _delete(){
			eachDelete = true;
		}
	}

    function ReverseEach(_f,_useOriginal){
        var prop, i,$return,eachBreak,eachDelete;
        $return = (!_useOriginal ? {} : this);
        var keys = Object.keys(this);
        keys.reverse();
        if(KUBE.Is(_f) === 'function'){
            for(i = 0; i < keys.length; i++){
                prop = keys[i];
                eachDelete = false;
                if(this.hasOwnProperty(prop)){
                    $return[prop] = _f.call({'break':_break,'delete':_delete},prop,this[prop]);
                    if(eachDelete){
                        delete $return[prop];
                    }
                    if(eachBreak){
                        break;
                    }
                }
            }
        }
        return $return;

        function _break(){
            eachBreak = true;
        }

        function _delete(){
            eachDelete = true;
        }
    }



    function Merge(){
		var i,$target;
		$target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);
	
		for(i=0;i<arguments.length;i++){
			if(KUBE.Is(arguments[i]) === 'object'){
				merge($target,copy(arguments[i]));
			}
		}
		return $target;
	}

	function MergeCopy(){
		var i,target,$newObj;
		target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);
		$newObj = copy(target);
	
		for(i=0;i<arguments.length;i++){
			if(KUBE.Is(arguments[i]) === 'object'){
				merge($newObj,copy(arguments[i]));
			}
		}
		return $newObj;
	}

	function Count(){
		var prop, $return = 0;
		for(prop in this){
			if(this.hasOwnProperty(prop)){
				$return++;
			}
		}
		return $return;
	}

	function Copy(){
		var $target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);
		return copy($target);
	}
	
	function Create(_p){
		var prop,n = Object.create(_p);
		for(prop in this){
			if(this.hasOwnProperty(prop)){
				n[prop] = this[prop];
			}
		}
		return n;
	}

	function DuckType(_duck){
		var prop,$return = false;
		if(KUBE.Is(_duck) === 'object'){
			$return = true;
			for(prop in this){
				if(this.hasOwnProperty(prop)){
					if(_duck[prop] === undefined){
						$return = false;
						break;
					}
				}
			}
		}
		return $return;
	}
	
	function IsEmpty(){
		var prop,$return = true;;
		for(prop in this){
			if(this.hasOwnProperty(prop)){
				$return = false;
				break;
			}
		}
		return $return;
	}

	function Compare(_obj){
		return (this === _obj ? true : (check(this,_obj) && check(_obj,this) ? true : false));

		function check(_1,_2){
			var type1,type2,checkMethods,$return;
			
			type1 = KUBE.Is(_1);
			type2 = KUBE.Is(_2);
			checkMethods = {'array':checkArray,'object':checkObject};
			$return = false;

			if(type1 === type2){
				$return = (checkMethods[type1] ? checkMethods[type1](_1,_2) : checkValue(_1,_2));
			}
			return $return;
		}

		function checkArray(_a1,_a2){
			var i,$return;
			$return = false;
			
			if(_a1.length === _a2.length){
				$return = true;
				for(i=0;i<_a1.length;i++){
					if(!check(_a1[i],_a2[i])){
						$return = false;
						break;
					}
				}
			}
			return $return;
		}

		function checkObject(_o1,_o2){
			var prop,$return;
			$return = true;
			
			for(prop in _o1){
				if(KUBE.Is(_o1[prop]) !== 'function'){
					if(_o1.hasOwnProperty(prop) && _o2.hasOwnProperty(prop)){
						if(!check(_o1[prop],_o2[prop])){
							$return = false;
							break;
						}
					}
					else{
						$return = false;
						break;
					}
				}
			}
			return $return;
		}

		function checkValue(_v1,_v2){
			return (_v1 === _v2 ? true : false);
		}
	}

	/* Utility functions */
	function merge(_target,_obj){
		var prop;
		for(prop in _obj){
			if(_obj.hasOwnProperty(prop) && _target[prop] === undefined){
				_target[prop] = _obj[prop];
			}
		}
		return _target;
	}

	function copy(_obj){
		var copier,circleCache,$return;
		
		copier = {'object':copyObject,'array':copyArray,'date':copyDate,'regExp':copyRegExp};
		circleCache = {'array':[],'object':[]};
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
			var prop,type,newObj = {};
			
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
			var i,type,$newArray = [];
			
			circleCache.array.push({'ref':_array,'copy':$newArray});
			for(i=0;i<_array.length;i++){
				if(_array[i] !== _array){
					type = KUBE.Is(_array[i]);
					$newArray.push((copier[type] ? checkCircle(_array[i],type) : _array[i]));
				}
				else{
					$newArray.push($newArray);
				}
			}
			return $newArray;
		}

		function copyDate(_date){
			return new Date(_date.getTime());
		}

		function copyRegExp(_regExp){
			return new RegExp(_regExp);
		}
	}	
}(KUBE));