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
	KUBE.SetAsLoaded('/Library/Extend/Number');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('number','debug',Debugger);
        ExtendAPI.Load('number','roman',romanize);

		KUBE.EmitState('/Library/Extend/Number');
		KUBE.console.log('/Library/Extend/Number Loaded');
	}
	
	/* Declare functions */
	function Debugger(){
		debugger;
		return this;
	}

    //Adapted From: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
    function romanize () {
        var digits,roman,i,key,num;
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"];
        roman = '';
        i=3;
        num = (KUBE.Is(this) === 'number' && this > 0 ? this : 'nulla');
        if(num != 'nulla'){
            digits = String(num).split("");
            while(i--){
                roman = (key[+digits.pop() + (i * 10)] || "") + roman;
            }
            num = Array(+digits.join("") + 1).join("M") + roman;
        }
        return num;
    }

    function alpha(){
    }


}(KUBE));