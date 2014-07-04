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
        ExtendAPI.Load('string','b64Encode',B64Encode);
        ExtendAPI.Load('string','b64Decode',B64Decode);

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

    function B64Encode(){
        return Base64.encode(this);
    }

    function B64Decode(){
        return Base64.decode(this);
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

    //LICENSE CHECK: http://www.webtoolkit.info/javascript-base64.html
    var Base64 = {
        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var c1,c2,c3;
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    }

}(KUBE));