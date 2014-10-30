(function(KUBE){
	"use strict";
	KUBE.LoadFunction('/Library/Convert',Convert,['/Library/ExtendRegExp', '/Library/ConvertCheck']);

	function Convert(_originalValue,_from,_to){
        var ConvertCheck = KUBE.Class('/Library/ConvertCheck');
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


}(KUBE));