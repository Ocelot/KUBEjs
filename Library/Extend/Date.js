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
	
	// Load functions here 
	var ExtendAPI;
	KUBE.SetAsLoaded('/Library/Extend/Date');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('date','format',Format);
		KUBE.EmitState('/Library/Extend/Date');
		KUBE.console.log('/Library/Extend/Date Loaded');
	}
	
	// Declare functions here
	function Format(_formatString){
		var strings,formatFunctions,$return;
		strings = {
			"shortDays":["Sun","Mon","Tues","Weds","Thurs","Fri","Sat"],
			"longDays":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
			"shortMonths":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
			"longMonths":["January","February","March","April","May","June","July","August","September","October","November","December"]
		};
		
		formatFunctions = {
			"d":d,	//Day: 01-31
			"D":D,	//Day: Sun-Sat
			"j":j,	//Day: 1-31
			"l":l,	//Day: Sunday-Saturday
			"N":N,	//Day: 1-7 (day of week)
			"S":S,	//Day: Suffix (st,nd,rd,th)
			"w":w,	//Day: 0-6 (for arrays!)
			"z":z,	//Day: 0-365 (0?)
			"W":W,	//Week: 1-52 (of the year)
			"F":F,	//Month: January - December
			"m":m,	//Month: 01-12
			"M":M,	//Month: Jan - Dec,
			"n":n,	//Month: 1-12
			"t":t,	//Months: 28-31 (days in month)
			"L":L,	//Year: 0-1 (Leap year)
			"o":Y,	//Year: 1993 (same as Y, should be slightly different if following PHP)
			"Y":Y,	//Year: 1993
			"y":y,	//Year: 93
			"a":a,	//Time: am-pm
			"A":A,	//Time: AM-PM
			"g":g,	//Time: 1-12 (hours)
			"G":G,	//Time: 0-23 (hours)
			"h":h,	//Time: 01-12 (hours)
			"H":H,	//Time: 00-23 (hours)
			"i":i,	//Time: 00-59 (minutes)
			"s":s,	//Time: 00-59 (seconds)
		}
		
		$return = '';
		for(var charCount=0;charCount<_formatString.length;charCount++){
			if(KUBE.Is(formatFunctions[_formatString.charAt(charCount)]) === 'function'){
				$return += String(formatFunctions[_formatString.charAt(charCount)](this,strings));
			}
			else{
				$return += _formatString.charAt(charCount);
			}
		}
		return $return;		
	}
	
	function d(_DateObj){
		var $return = _DateObj.getDate();
		return ($return.length === 1 ? "0"+String($return) : $return);
	}
	
	function D(_DateObj,_strings){
		return _strings.shortDays[_DateObj.getDay()];
	}
	
	function j(_DateObj){
		return _DateObj.getDate();
	}
	
	function l(_DateObj,_strings){
		return _strings.longDays[_DateObj.getDay()];
	}
	
	function N(_DateObj){
		return _DateObj.getDay()+1;
	}
	
	function S(_DateObj){
		var $return = 'th';
		switch(_DateObj.getDate()){
			case 1: case 21: case 31: $return = 'st'; break;
			case 2: case 22: $return = 'nd'; break;
			case 3: case 23: $return = 'rd'; break;						
		}
		return $return;
	}
	
	function w(_DateObj){
		return _DateObj.getDay();
	}
	
	function z(_DateObj){
		return Math.floor(getMSThisYear(_DateObj)/(86400*1000));
	}
		
	function W(_DateObj){
		return Math.floor(getMSThisYear(_DateObj)/((86400*1000)*7));		
	}
	
	function F(_DateObj,_strings){
		return _strings.longMonths[_DateObj.getMonth()];
	}
	
	function m(_DateObj){
		var $return = _DateObj.getMonth()+1;
		return ($return.length === 1 ? "0"+String($return) : $return);	
	}
	
	function M(_DateObj,_strings){
		return _strings.shortMonths[_DateObj.getMonth()];		
	}
	
	function n(_DateObj){
		return _DateObj.getMonth()+1;		
	}
	
	function t(_DateObj){
		return (getMSThisMonth(_DateObj)/(86400*1000));
	}
	
	function L(_DateObj){
		var tempDate = new Date();
		tempDate.setTime(_DateObj.getTime());
		tempDate.setMonth(1);
		return (t(tempDate) === 29 ? true : false);
	}
		
	function Y(_DateObj){
		return _DateObj.getFullYear();
	}
	
	function y(_DateObj){
		return String(_DateObj.getFullYear()).charAt(2)+String(_DateObj.getFullYear()).charAt(3);
	}
	
	function a(_DateObj){
		return (_DateObj.getHours() >= 12 ? 'pm':'am');
	}
	
	function A(_DateObj){
		return a(_DateObj).toUpperCase();
	}
	
	function g(_DateObj){
		var hour = _DateObj.getHours()+1
		return (hour > 12 ? hour-12 : hour);
	}
	
	function G(_DateObj){
		return _DateObj.getHours();
	}
	
	function h(_DateObj){
		var $return = g(_DateObj);
		return ($return.length === 1 ? "0"+String($return) : $return);		
	}
	
	function H(_DateObj){
		var $return = _DateObj.getHours();
		return ($return.length === 1 ? "0"+String($return) : $return);				
	}
	
	function i(_DateObj){
		return _DateObj.getMinutes();
	}
	
	function s(_DateObj){
		return _DateObj.getSeconds();
	}
	
	function getMSThisYear(_DateObj){
		var stupid = new Date();
		stupid.setHours(0);
		stupid.setMinutes(0);
		stupid.setDate(0);
		stupid.setMonth(0);
		stupid.setFullYear(_DateObj.getFullYear());
		return (_DateObj.getTime()-stupid.getTime());
	}
	
	function getMSThisMonth(_DateObj){
		var mStart,mEnd,nextMonth,nextYear;
		
		nextMonth = (_DateObj.getMonth() === 11 ? 0 : _DateObj.getMonth());
		nextYear = (_DateObj.getMonth() === 11 ? _DateObj.getFullYear()+1 : _DateObj.getFullYear());
		
		var stupid = new Date();
		stupid.setHours(0);
		stupid.setMinutes(0);
		stupid.setDate(0);
		stupid.setMonth(_DateObj.getMonth());
		stupid.setFullYear(_DateObj.getFullYear());
				
		mStart = stupid.getTime();
		stupid.setMonth(nextMonth);
		stupid.setFullYear(nextYear);
		mEnd = stupid.getTime();
		
		return (mEnd-mStart);		
	}
	
//		function getStandardDateFormat(_ts){
//			var D = new Date();
//			D.setTime(_ts*1000);
//			return D.getFullYear()+'-'+(D.getMonth()+1)+'-'+D.getDate();
//		}	
	
}(KUBE));