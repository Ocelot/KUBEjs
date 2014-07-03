(function(KUBE){
	"use strict";
	KUBE.LoadFunction('Convert',Convert,['ExtendRegExp']);
	KUBE.LoadFunction('ConvertCheck',ConvertCheck,['ExtendRegExp']);
	
	function Convert(_originalValue,_from,_to){
		var conversionMethods = {
			'px':px,
			'number':number,
			'deg':deg,
			'url':url,
			'string':string,
            'ms': ms
		};
		
		return (ConvertCheck(_from,_originalValue) && KUBE.Is(conversionMethods[_to]) === 'function' ? conversionMethods[_to](_originalValue) : _originalValue);
		
		function px(_val){
			return _val+'px';
		}

		function number(_val){
			return parseInt(_val);
		}
		
		function deg(_val){
			return _val+'deg';
		}
		
		function url(_string){
			return (!isCSSFunction(_string) && _string !== 'none' && _string !== '' ? 'url('+String(_string)+')' : _string);
		}
		
		function string(_val){
			return ''+_val;
		}
		
		function ms(_val){
			return _val+'ms';
		}
		
		function isCSSFunction(_string){
			return (/[^\(]*\(/.exec(_string) === null ? false : true);
		}

	}

	function ConvertCheck(_from,_val){
		var $return = false,
			str = ""+_val;
		switch(_from){
			case 'px':
				$return = (str.substr(''+str.length-2) === 'px' ? true : false);
				break;

			case 'deg':
				$return = (str.substr(str.length-3) === 'deg' ? true : false);
				break;

			case 'ms':
				$return = (str.substr(''+str.length-2) === 'ms' ? true : false);
				break;

			case 'number': case 'int': case 'num':
			$return = (KUBE.Is(_val) === 'number' ? true : false);
			break;

			case 'url':
				$return = /url\(([^\)]*)\)/.KUBE().matchAll(str.toLowerCase());
				$return = ($return[0] ? $return[0][1] : _val);
				break;

			case 'string':
				$return = (KUBE.Is(_val) === 'string' ? true : false);
				break;

			default:
				$return = true;
				break;
		}
		return $return;
	}

}(KUBE));