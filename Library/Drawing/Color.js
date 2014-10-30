/* 
 * Name: Color
 * Type: KUBESingletonClass
 */
(function(KUBE){
	"use strict";
	KUBE.LoadSingleton('/Library/Drawing/Color', Color,['/Library/DOM/FeatureDetect','/Library/Extend/RegExp','/Library/Extend/Object']);
	
	Color.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Color(){
        var FD = KUBE.Class('/Library/DOM/FeatureDetect')();
		var $public = {
			'Format':Format,
			'GetWebColors':stringColorTable,
			'Identify':identifyColorString,
			'NumToHex':numToHex,
			'ParseHSL':parseHSL,
			'ParseRGB':parseRGB,
			'HexToRGB':hexToRgb,
			'HexToString':hexToString,
			'StringToHex':stringToHex,
			'RGBToHex':rgbToHex,
			'RGBToHSL':rgbToHsl,
			'HSLToRGB':hslToRgb,
			'RGBString':RGBString,
			'HSLString':HSLString,
			'AHexToRGBA':AHexToRGBA,
			'RGBAToAHex':RGBAToAHex,
			'ParseColor':ParseColor,
			'IsValidColor':IsValidColor
		}.KUBE().create(Color.prototype);
		return $public;

		/* Definitely have not decided on what functionality belongs in this method: very beta */
		function ParseColor(_string,_format,_stringify){
			var result, matchCount = 0, results = [], origString = _string;

			/* Hex */
			if(result = parseHex()){
				_string = result[0];
				assignAndFormat(result[1],results);
			}

			/* Rgb */
			if(result = parseRgb()){
				_string = result[0];
				assignAndFormat(result[1],results);
			}

			/* Hsl */
			if(result = parseHsl()){
				_string = result[0];
				assignAndFormat(result[1],results);
			}

			/* Word */
			if(result = parseWord()){
				_string = result[0];
				assignAndFormat(result[1],results);
			}

			return (!results.length ? [origString,[]] : [_string,results]);
			
			function assignAndFormat(_resultArray,_targetArray){
				for(var i=0;i<_resultArray.length;i++){
					_targetArray.push((_format ? Format(_resultArray[i][0],_format,_stringify) : _resultArray[i][0]));
				}
			}
			
			function countColors(){
				var $return = '['+matchCount+']';
				matchCount++;
				return $return;
			}
			
			function parseHex(){
				var result = /#[^ ]*/.KUBE().replaceCallback(_string,countColors);
				return (!result[1].length ? false : result);
			}
			
			function parseRgb(){
				var result = /rgb[a]{0,1}\([^\)]*\)/.KUBE().replaceCallback(_string,countColors);
				return (!result[1].length ? false : result);
			}
			
			function parseHsl(){
				var result = /hsl[a]{0,1}\([^\)]*\)/.KUBE().replaceCallback(_string,countColors);
				return (!result[1].length ? false : result);				
			}
			
			function parseWord(){
				var colorTable = stringColorTable();
				var colorArray = [];
				for(var prop in colorTable){
					if(colorTable.hasOwnProperty(prop)){
						colorArray.push(prop);
					}
				}
				var result = RegExp(colorArray.join('|')).KUBE().replaceCallback(_string,countColors);
				return (!result[1].length ? false : result);				
			}
		}

		function AHexToRGBA(hexA){
			var $color;
			$color.a = parseInt(hexA.substring(0,2),16);
			$color.r = parseInt(hexA.substring(2,4),16);
			$color.g = parseInt(hexA.substring(4,6),16);
			$color.b = parseInt(hexA.substring(6,8),16);
			return $color;
		};
		
		function RGBAToAHex(rgb){
			var parsed = parseRGB(rgb);
			parsed.a = parsed.a || 255;
			return "#"+numToHex(parsed.a)+numToHex(parsed.r)+numToHex(parsed.g)+numToHex(parsed.b);
		};

		function RGBString(r,g,b,a){
			r = (KUBE.Is(r) === 'undefined' || r > 255 ? 255 : r);
			g = (KUBE.Is(g) === 'undefined' || g > 255 ? 255 : g);
			b = (KUBE.Is(b) === 'undefined' || b > 255 ? 255 : b);
			a = (KUBE.Is(a) === 'undefined' || a > 1 ? 1 : a);
			return (KUBE.Is(a) !== 'undefined' && FD.rgba() ? "rgba("+r+","+g+","+b+","+a+")" : "rgb("+r+","+g+","+b+")");
		};
		
		function HSLString(h,s,l,a){
			//h = (typeof h == 'undefined' || h > 255 ? 255 : r);
			s = (KUBE.Is(s) === 'undefined' || s > 100 ? 100 : s);
			l = (KUBE.Is(l) === 'undefined' || l > 100 ? 100 : l);
			a = (KUBE.Is(a) === 'undefined' || a > 1 ? 1 : a);
			return (KUBE.Is(a) !== 'undefined' && FD.hsla() ? "hsla("+h+","+s+","+l+","+a+")" : "hsl("+h+","+s+","+l+")");
		};

		function Format(colorString, format, stringify){
			stringify = stringify || false;
			format = (!format ? 'rgb' : format);
			
			var $return,is = KUBE.Is(colorString);
			if(is === 'object'){
				if(defined(colorString.r) && defined(colorString.g) && defined(colorString.b)){
					$return = Format(RGBString(colorString.r,colorString.g,colorString.b,colorString.a),format,stringify);
				}
				else if(defined(colorString.h) && defined(colorString.s) && defined(colorString.l)){
					$return = Format(HSLString(colorString.h,colorString.s,colorString.l,colorString.a),format,stringify);
				}
			}
			else if(is === 'array'){
				$return = Format(RGBString(colorString[0],colorString[1],colorString[2],colorString[3]),format,stringify);
			}
			else{
				var colorFormat = {'#':{},'string':{},'rgb':{},'hsl':{}};
				var colorStringFormat = identifyColorString(colorString);			

				colorFormat['#']['string'] = hexToString;
				colorFormat['#']['rgb'] = hexToRgb;
				colorFormat['#']['#'] = function(x){return x;};
				colorFormat['#']['hsl'] = function(x){ return rgbToHsl(hexToRgb(x, 1)); };

				colorFormat['rgb']['string'] = function(x){ return hexToString(rgbToHex(x)); };
				colorFormat['rgb']['#'] = rgbToHex;
				colorFormat['rgb']['rgb'] = function(x){return parseRGB(x);};
				colorFormat['rgb']['hsl'] = rgbToHsl;

				colorFormat['string']['rgb'] = function(x){ return hexToRgb(stringToHex(x)); };
				colorFormat['string']['#'] = stringToHex;
				colorFormat['string']['string'] = function(x){ return x; };
				colorFormat['string']['hsl'] = function(x){ return rgbToHsl(hexToRgb(stringToHex(x), 1)); };

				colorFormat['hsl']['rgb'] = hslToRgb;
				colorFormat['hsl']['#'] = function(x){ return rgbToHex(hslToRgb(x)); };
				colorFormat['hsl']['hsl'] = function(x){ return parseHSL(x, false); };
				colorFormat['hsl']['string'] = function(x){ return hexToString(rgbToHex(hslToRgb(x))); };

				if(KUBE.Is(colorFormat[colorStringFormat]) === 'object' && KUBE.Is(colorFormat[colorStringFormat][format]) == 'function'){
					$return = colorFormat[colorStringFormat][format](colorString);
				}
				if(stringify){
					switch(format){
						case 'rgb': $return = RGBString($return.r,$return.g,$return.b,$return.a); break;
						case 'hsl': $return = HSLString($return.h,$return.s,$return.l,$return.a); break;
					}
				}
			}
			return $return;
		};

		function hslToRgb(hsl){
			var m1,m2;
			var $colors = {};
			var parsed = parseHSL(hsl, true);
			if(parsed.l<=0.5){
				m2 = parsed.l*(parsed.s+1);
			}
			else{
				m2 = parsed.l+parsed.s-(parsed.l*parsed.s);
			}

			m1 = (parsed.l*2)-m2;
			$colors.r = hueToRgb(m1,m2,parsed.h+(1/3));
			$colors.g = hueToRgb(m1,m2,parsed.h);
			$colors.b = hueToRgb(m1,m2,parsed.h-(1/3));
			
			if(KUBE.Is(parsed.a) !== 'undefined'){
				$colors.a = parsed.a;
			}
			return $colors;

			function hueToRgb(_m1,_m2,_h){
				if(_h<0){
					_h = _h+1;
				}
				else if(_h>1){
					_h = _h-1;
				}

				if(_h*6<1){
					_m1 = _m1+(_m2-_m1)*_h*6;
				}
				else if (_h*2<1){
					_m1 = _m2;
				}
				else if (_h*3<2){
					_m1 = _m1+(_m2-_m1)*(2/3-_h)*6;
				}
				return Math.round((_m1*100)*(255/100));
			};
		};

		function rgbToHsl(rgb) {
			var $parsed = parseRGB(rgb);

			$parsed.r = $parsed.r/255;
			$parsed.g = $parsed.g/255;
			$parsed.b = $parsed.b/255;

			var max = Math.max($parsed.r, $parsed.g, $parsed.b);
			var min = Math.min($parsed.r, $parsed.g, $parsed.b);
			var h, s, l = (max + min) / 2;

			if(max === min) {
				h = 0;
				s = 0;
			}
			else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch(max) {
					case $parsed.r: h = ($parsed.g - $parsed.b) / d + ($parsed.g < $parsed.b ? 6 : 0); break;
					case $parsed.g: h = ($parsed.b - $parsed.r) / d + 2; break;
					case $parsed.b: h = ($parsed.r - $parsed.g) / d + 4; break;
				}
				h /= 6;
			}

			var $colors = {'h':Math.round((h*3.6)*100), 's':Math.round(s*100),'l':Math.round(l*100)};
			if(KUBE.Is($parsed.a) !== 'undefined'){
				$colors.a = $parsed.a;
			}
			return $colors;
		};


		function rgbToHex(rgb){
			var parsed = parseRGB(rgb);
			return "#"+numToHex(parsed.r)+numToHex(parsed.g)+numToHex(parsed.b);
		};
		
		function stringToHex(string){
			var $return = '#FFFFFF';
			var colorTable = stringColorTable();
			if(KUBE.Is(colorTable[String(string).toLowerCase()]) !== 'undefined'){
				$return = colorTable[String(string).toLowerCase()];
			}
			return $return;
		};

		function hexToString(hex){
			var $return = 'unknown';
			var colorTable = stringColorTable();
			for(var prop in colorTable){
				if(KUBE.Is(colorTable[prop]) !== 'undefined'){
					if(colorTable[prop].toLowerCase() === String(hex).toLowerCase()){
						$return = prop;
						break;
					}
				}
			}
			return $return;
		};

		function hexToRgb(hex, stringify){
			var $color = {};
			hex = String(hex);
			if(hex.substring(0,1) === '#'){
				hex = hex.substring(1);
			}

			if(hex.length === 3){
				//Shorthand
				$color.r = hex.substring(0,1);
				$color.g = hex.substring(1,2);
				$color.b = hex.substring(2,3);

				//Double
				$color.r = parseInt(($color.r+$color.r), 16);
				$color.g = parseInt(($color.g+$color.g), 16);
				$color.b = parseInt(($color.b+$color.b), 16);
			}
			else{
				$color.r = parseInt(hex.substring(0,2),16);
				$color.g = parseInt(hex.substring(2,4),16);
				$color.b = parseInt(hex.substring(4,6),16);
			}
			if(stringify){
				$color = "rgb("+$color.r+","+$color.g+","+$color.b+")";
			}
			return $color;
		};

		function parseRGB(rgb){
			var $colors = {};
			if(KUBE.Is(rgb) === 'object'){
				$colors = rgb;
			}
			else{
				var match = /\(([^,]*),([^,]*),([^,|\)]*)[,]{0,1}([^,|\)]*)\)/i.exec(String(rgb));
				$colors.r = (parseInt(match[1]) > 255 ? 255 : parseInt(match[1]));
				$colors.g = (parseInt(match[2]) > 255 ? 255 : parseInt(match[2]));
				$colors.b = (parseInt(match[3]) > 255 ? 255 : parseInt(match[3]));
				if(match[4] !== '' && KUBE.Is(match[4]) !== 'undefined'){
					$colors.a = (parseFloat(match[4]) > 1 ? 1 : parseFloat(match[4]));
				}
			}
			return $colors;
		}

		function parseHSL(hsl, factor){
			factor = (KUBE.Is(factor) === 'undefined' || factor === false ? false : true);
			var $colors = {};
			if(KUBE.Is(hsl) === 'object'){
				$colors = hsl;
			}
			else{
				var match = /\(([^,]*),([^,]*),([^,|\)]*)[,]{0,1}([^,|\)]*)\)/i.exec(hsl);
				$colors.h = (factor ? ((((parseInt(match[1])%360)+360)%360)/3.6)/100 : ((parseInt(match[1])%360)+360)%360);
				$colors.s = (factor ? parseInt(match[2])/100 : parseInt(match[2]));
				$colors.l = (factor ? parseInt(match[3])/100 : parseInt(match[3]));
				if(match[4] !== ''){
					$colors.a = parseFloat(match[4]);
				}
			}
			return $colors;
		};

		function numToHex(num, pad){
			num = num || 0;
			var pad = (pad === false ? false : true);
			var $hex = parseInt(num).toString(16).toUpperCase();
			if(pad && $hex.length === 1){
				$hex = "0"+$hex;
			}
			return $hex;
		};
		
		function identifyColorString(colorString){
			var $return;
			colorString = String(colorString);
			if(colorString.substring(0,1) === '#'){
				$return = '#';
			}
			else if (colorString.substring(0,3) === 'rgb'){
				$return = 'rgb';
			}
			else if (colorString.substring(0,3) === 'hsl'){
				$return = 'hsl';
			}
			else{
				$return = 'string';
			}
			return $return;
		};

		function IsValidColor(_color){
			var $return = false;
			var identification = identifyColorString(_color);
			switch(identification){
				case "#":case "rgb":case "hsl":
					$return = true;
					break;
				case "string":
					if(_color && stringColorTable()[_color.toLowerCase()]){
						$return = true;
					}
					break;
			}
			return $return;
		}

		function stringColorTable(){
			var $colors = {'aliceblue':'#F0F8FF', 'antiquewhite':'#FAEBD7','aqua':'#00FFFF','aquamarine':'#7FFFD4','azure':'#F0FFFF','beige':'#F5F5DC',
				'bisque':'#FFE4C4','black':'#000000','blanchedalmond':'#FFEBCD','blue':'#0000FF','blueviolet':'#8A2BE2','brown':'#A52A2A','burlywood':'#DEB887',
				'cadetblue':'#5F9EA0','chartreuse':'#7FFF00','chocolate':'#D2691E','coral':'#FF7F50','cornflowerblue':'#6495ED','cornsilk':'#FFF8DC',
				'crimson':'#DC143C','cyan':'#00FFFF','darkblue':'#00008B','darkcyan':'#008B8B','darkgoldenrod':'#B8860B','darkgray':'#A9A9A9','darkgrey':'#A9A9A9',
				'darkgreen':'#006400','darkkhaki':'#BDB76B','darkmagenta':'#8B008B','darkolivegreen':'#556B2F','darkorange':'#FF8C00','darkorchid':'#9932CC',
				'darkred':'#8B0000','darksalmon':'#E9967A','darkseagreen':'#8FBC8F','darkslateblue':'#483D8B','darkslategray':'#2F4F4F','darkslategrey':'#2F4F4F',
				'darkturquoise':'#00CED1','darkviolet':'#9400D3','deeppink':'#FF1493','deepskyblue':'#00BFFF','dimgray':'#696969','dimgrey':'#696969','dodgerblue':'#1E90FF',
				'firebrick':'#B22222','floralwhite':'#FFFAF0','forestgreen':'#228B22','fuchsia':'#FF00FF','gainsboro':'#DCDCDC','ghostwhite':'#F8F8FF',
				'gold':'#FFD700','goldenrod':'#DAA520','gray':'#808080','grey':'#808080','green':'#008000','greenyellow':'#ADFF2F','honeydew':'#F0FFF0',
				'hotpink':'#FF69B4','indianred':'#CD5C5C','indigo':'#4B0082','ivory':'#FFFFF0','khaki':'#F0E68C','lavender':'#E6E6FA','lavenderblush':'#FFF0F5',
				'lawngreen':'#7CFC00','lemonchiffon':'#FFFACD','lightblue':'#ADD8E6','lightcoral':'#F08080','lightcyan':'#E0FFFF','lightgoldenrodyellow':'#FAFAD2',
				'lightgray':'#D3D3D3','lightgrey':'#D3D3D3','lightgreen':'#90EE90','lightpink':'#FFB6C1','lightsalmon':'#FFA07A','lightseagreen':'#20B2AA',
				'lightskyblue':'#87CEFA','lightslategray':'#778899','lightslategrey':'#778899','lightsteelblue':'#B0C4DE','lightyellow':'#FFFFE0',
				'lime':'#00FF00','limegreen':'#32CD32','linen':'#FAF0E6','magenta':'#FF00FF','maroon':'#800000','mediumaquamarine':'#66CDAA','mediumblue':'#0000CD',
				'mediumorchid':'#BA55D3','mediumpurple':'#9370DB','mediumseagreen':'#3CB371','mediumslateblue':'#7B68EE','mediumspringgreen':'#00FA9A',
				'mediumturquoise':'#48D1CC','mediumvioletred':'#C71585','midnightblue':'#191970','mintcream':'#F5FFFA','mistyrose':'#FFE4E1','moccasin':'#FFE4B5',
				'navajowhite':'#FFDEAD','navy':'#000080','oldlace':'#FDF5E6','olive':'#808000','olivedrab':'#6B8E23','orange':'#FFA500','orangered':'#FF4500',
				'orchid':'#DA70D6','palegoldenrod':'#EEE8AA','palegreen':'#98FB98','paleturquoise':'#AFEEEE','palevioletred':'#DB7093','papayawhip':'#FFEFD5',
				'peachpuff':'#FFDAB9','peru':'#CD853F','pink':'#FFC0CB','plum':'#DDA0DD','powderblue':'#B0E0E6','purple':'#800080','red':'#FF0000',
				'rosybrown':'#BC8F8F','royalblue':'#4169E1','saddlebrown':'#8B4513','salmon':'#FA8072','sandybrown':'#F4A460','seagreen':'#2E8B57',
				'seashell':'#FFF5EE','sienna':'#A0522D','silver':'#C0C0C0','skyblue':'#87CEEB','slateblue':'#6A5ACD','slategray':'#708090','slategrey':'#708090',
				'snow':'#FFFAFA','springgreen':'#00FF7F','steelblue':'#4682B4','tan':'#D2B48C','teal':'#008080','thistle':'#D8BFD8','tomato':'#FF6347', 'transparent': 'transparent',
				'turquoise':'#40E0D0','violet':'#EE82EE','wheat':'#F5DEB3','white':'#FFFFFF','whitesmoke':'#F5F5F5','yellow':'#FFFF00','yellowgreen':'#9ACD32'};
			
			return $colors;
		}
		
		function defined(_val){
			return (_val === undefined ? false : true);
		}		
	}
	
	Color.prototype.class = 'Color';
	
}(KUBE));