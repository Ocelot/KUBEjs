/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
	
	//This is totally v3
    var dependancyArray = [
        '/Library/DOM/DomJack',
        '/Library/DOM/FeatureDetect',
        '/Library/Drawing/Color',
        '/Library/Tools/Convert',
        '/Library/Extend/String',
        '/Library/Extend/Object',
        '/Library/Extend/RegExp'
    ];
	KUBE.LoadFactory('/Library/DOM/StyleJack',StyleJack,dependancyArray);
	
	//If we are Superman, StyleJack is Lex Luthor AND KRYPTONITE
	var prefix, Convert, DJSJCache = {}, StyleSJCache = {};
	
	/*******************************************************************
	 * StyleJack is our actual KUBE Class it fundamentally acts
	 * as a Router to individual Object handlers. It is responsible
	 * for identifying what type of rule is required, and either finding
	 * it, or creating it if required. Before passing it off to the
	 * indiviudal handler object.
	 *******************************************************************/	
	StyleJack.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function StyleJack(_selector){
		//Here we want to simply decide what we're dealing with
		initConvert();
		assignPrefix();
		return processSelection(_selector);
		
		function initConvert(){
			if(!Convert){
				Convert = KUBE.Class('/Library/Tools/Convert');
			}
		}
		
		function assignPrefix(){
			if(prefix === undefined){
				prefix = KUBE.Class('/Library/DOM/FeatureDetect')().Prefix();
			}
		}
	
		function processSelection(_selector){
			return processObject(_selector) || processString(_selector) || false;
		}
		
		function processObject(_obj){
			var $return = false, DJ, DJID;
            if(KUBE.Is(_obj,true) === "DomJack" && DJSJCache[_obj.CacheId()] !== undefined ){
                //DomJack caches style internally already. Return that
                $return = _obj.Style();
            }
            else if(KUBE.Is(_obj) === 'object'){
                //This happens when a DOM Node or Style gets passed in directly.
                //I don't know when this gets hit.
                if(inheritsStyleDeclaration(_obj.style)){
                    //This means it's a DOM Node initially. We just want to return a DomJack.
                    try{
                        DJ = KUBE.Class('/Library/DOM/DomJack')(_obj);
                        DJID = DJ.CacheId();
                        if(!DJSJCache[DJID]){
                            DJSJCache[DJID] = assignStyleDeclaration(_obj);
                        }
                        $return = DJSJCache[DJID];
                    }
                    catch(e){
                        //This was not a DOMNode but something masquerading as one.
                        //As below, this doesn't get caching.
                        $return = assignStyleDeclaration({'style': _obj})
                    }
                }
                else if(inheritsStyleDeclaration(_obj)){
                    //This means that is directly a CSSStyleDeclaration. We cannot cache this with DomJack.
                    //There's a weird situation that someone could
                    //This means that events won't work (right now. we might fix this one day?)
                    $return = assignStyleDeclaration({'style':_obj});
                }

            }
			return $return;
		}

		function inheritsStyleDeclaration(_obj){
			return (_obj instanceof CSSStyleDeclaration);
		}
		
		function assignStyleDeclaration(_obj){
            var $return = false;
			$return =  (inheritsStyleDeclaration(_obj.style) ? new CSSStyleRuleHandler(_obj) : false);
            return $return;
        }

		function processString(_string){
			var $return = false;
			if(KUBE.Is(_string) === 'string'){
				$return = specialRule(_string) || styleRule(_string) || false;
			}
			return $return;
		}
	
		function specialRule(_string){
			var rule,ruleType,$return = false;
			ruleType = identifyRule(_string);
			switch(ruleType){
				case '@keyframes':
					rule = searchForRule('CSSKeyframesRule',_string.split(' ')[1].KUBE().trim(),true);
					if(rule){
						$return = new CSSKeyframesRuleHandler(rule);
					}
					break;
                case "@font-face":
                    createStylesheetIfNoneExists();
                    $return = new CSSFontFaceRuleHandler();
                    break;
			}
			return $return;
		}
		
		function normalizeRule(_string){
			_string = /\[([^=|~|\|]*)(\~|\|)?=([^\]]*)\]/.KUBE().replaceCallback(_string,function(_match){
				return '['+_match[1]+(_match[2] !== undefined ? _match[2] : '')+'="'+_match[3].KUBE().trimChar(['"',"'"])+'"]';
			})[0];
			_string = /(:?:)(after|before|first-letter|first-line)/.KUBE().replaceCallback(_string,function(_match){
				return "::"+_match[2];
			})[0];
			_string = /( ?(\+|<|>) ?)/.KUBE().replaceCallback(_string,function(_match){
				return " "+_match[1].KUBE().trim()+" ";
			})[0];
			return _string.KUBE().trim();
		}
		
		function styleRule(_string){
			var rule;
			_string = normalizeRule(_string);
			rule = searchForRule('CSSStyleRule',_string);
			if(rule && StyleSJCache[rule.selectorText] === undefined){
                StyleSJCache[rule.selectorText] = new CSSStyleRuleHandler(rule);
                StyleSJCache[rule.selectorText].Once('delete',function(){
                    delete StyleSJCache[rule.selectorText];
                });
			}
			return StyleSJCache[rule.selectorText] || false;
		}
		
		function checkPrefix(_string, _check){
			return (_string.charAt(0) === _check ? true : false);
		}

		function identifyRule(_string){
			return (checkPrefix(_string,'@') ? _string.split(' ')[0].KUBE().trim() : false);
		}
		
		function searchForRule(_type,_matchData,_checkPrefix){
			return searchGlobalStylesheets(_type,_matchData,_checkPrefix) || initRule(_type,_matchData);
		}

		
		function searchGlobalStylesheets(_type,_matchData,_checkPrefix){
			var i,$return = false;

            if(!createStylesheetIfNoneExists()){
                for(i=0;i<document.styleSheets.length;i++){
                    if(document.styleSheets[i].href){
                        //This is a stylesheet that gets linked in from a link element.
                        continue;
                    }
                    $return = searchStylesheet(document.styleSheets[i],_type,_matchData,_checkPrefix);
                    if($return){
                        break;
                    }
                }
            }
			return $return;
		}
		
		function searchStylesheet(_styleSheet,_type,_matchData,_checkPrefix){
			var i,rules,$return = false;
			rules = (KUBE.Is(_styleSheet.cssRules) !== 'undefined' ? _styleSheet.cssRules : _styleSheet.rules);
            for(i=0; i<rules.length;i++){
                $return = checkRule(rules[i],_type,_type,_matchData) || checkRule(rules[i],classPrefix(prefix)+_type,_type,_matchData);
                if($return){
                    break;
                }
            }
			return $return;
		}

        function createStylesheetIfNoneExists() {
			var dss = document.styleSheets;
			if (dss.length == 0) {
				return create();
			}
			else{
				var stylesheetFound = false;
				for(var i = 0; i < dss.length; i++){
					if(!dss[i].href){
						stylesheetFound = true;
						break;
					}
				}
				if(!stylesheetFound){
					return create();
				}
				return false;
			}

			function create(){
				document.head.appendChild(document.createElement('style'));
				return true;
			}
        }


		function classPrefix(){
			switch(prefix){
				case 'webkit': return 'WebKit'; break;
				case 'moz': return 'Moz'; break;
				default: return prefix; break;
			}
		}
		
		function checkRule(_rule,_ruleType,_type,_matchData){
			return (KUBE.Is(_rule,true) === _ruleType && validateRuleMatch(_type,_matchData,_rule) ? _rule : false);
		}
		
		function validateRuleMatch(_type,_matchData,_rule){
			return validateCSSStyleRule(_type,_matchData,_rule) || validateCSSKeyframesRule(_type,_matchData,_rule);
		}
		
		function validateCSSStyleRule(_type,_matchData,_rule){
			var $return = false;
			if(_type === 'CSSStyleRule'){
				if(_rule.selectorText === _matchData || _rule.selectorText === _matchData.toUpperCase() || _rule.selectorText === _matchData.toLowerCase() || validatePseudoSelector(_rule.selectorText,_matchData)){
					$return = true;
				}
			}
			return $return;
		}

        function validatePseudoSelector(_rule, _matchData){
            var $return = false;
            if(/:/.test(_rule) && /:/.test(_matchData)){
                //We have rules with colons
                var split1 = _rule.split(":");
                var split2 = _matchData.split(":");
                var cleanArray1 = [];
                var cleanArray2 = [];
                for(var i=0;i<split1.length;i++){
                    if(split1[i]){
                        cleanArray1.push(split1[i].toLowerCase());
                    }
                }

                for(var i=0;i<split2.length;i++){
                    if(split2[i]){
                        cleanArray2.push(split2[i].toLowerCase());
                    }
                }

                if(cleanArray1.length && cleanArray1.length === cleanArray2.length){
                    $return = true;
                    for(var i=0;i<cleanArray1.length;i++){
                        if(cleanArray1[i] != cleanArray2[i]){
                            $return = false;
                            break;
                        }
                    }
                }
            }
            return $return;
        }


		function validateCSSKeyframesRule(_type,_matchData,_rule){
			return (_type === 'CSSKeyframesRule' && _rule.name === _matchData ? true : false);
		}

		function initRule(_type,_initData){
			var styleSheet = (!document.styleSheets.length ? initStylesheet() : findValidStyleSheetForRule());
			return initCSSStyleRule(styleSheet,_type,_initData) || initCSSKeyframesRule(styleSheet,_type,_initData) || false;
		}

        function findValidStyleSheetForRule(){
            //We need to exclude stylesheets that are from a <link> stylesheet;
            for(var i = 0; i < document.styleSheets.length; i++){
                var cur = document.styleSheets[i];
                if(cur.href){
                    continue;
                }
                return cur;
            }
            return initStylesheet(); //This should be impossible
        }
		
		function initCSSStyleRule(_styleSheet,_type,_initData){
			var $return = false;
			if(_type === 'CSSStyleRule'){
				try{
					//This has a fairly high rate of psychosis
					(_styleSheet.insertRule ? _styleSheet.insertRule(_initData+'{}',0) : _styleSheet.addRule(_initData,'{}',0));
                    $return = _styleSheet.cssRules[0]; //Lets try this.
					//$return = searchForRule(_type,_initData);
				}
				catch(E){
                    KUBE.console.log('CSSStyleRule failed to create, Trying again');
					throw E;
				}
			}
			return $return;
		}


		function initCSSKeyframesRule(_styleSheet,_type,_initData,_prefix){
			var keyframeInit,$return = false;
			if(_type === 'CSSKeyframesRule'){
				keyframeInit = (_prefix ? '@-'+_prefix.toLowerCase()+'-keyframes '+_initData : '@keyframes '+_initData);
				try{
					(_styleSheet.insertRule ? _styleSheet.insertRule(keyframeInit+'{}',0) : _styleSheet.addRule(keyframeInit,'{}'));
					$return = searchForRule(_type,_initData,_prefix);
				}
				catch(E){
					KUBE.console.log('CSSKeyframesRule failed to create, Trying again');
					if(!_prefix){
						$return = initCSSKeyframesRule(_styleSheet,_type,_initData,prefix);
					}
					throw E;
				}
			}
			return $return;
		}
		
		function initStylesheet(){
			//This is triggered when styleSheets length is 0
			KUBE.console.log('initStylesheet called');
		}
	}


	
	/*********************************
	 * Our @keyframes Object Handler
	 *********************************/
	function CSSKeyframesRuleHandler(_styleObj){
		var keyframes = {};
		var Events = KUBE.Events();
		var $api = {
			'Index':Index,
			'Clear':Clear,
			'Delete':Delete,
			'Debug':Debug,
            'From':From,
            'To':To,
			'On':Events.On,
			'Once':Events.Once,
			'Emit':Events.Emit,
			'RemoveListener':Events.RemoveListener,
			'ClearEvent':Events.Clear
		};
		return $api;

		function Index(_index){
			_index = Convert(_index,'number','percent');
			if(!checkForKey(_index)){
				addKeyFrame(_index);
			}
			return keyframes[_index];
		}

        function From(){
            return Index(0);
        }

        function To(){
            return Index(100);
        }
		
		function Clear(_index){
			//Eh...
		}
		
		function Delete(){
			var $return = false;
			var parentRules = _styleObj.parentStyleSheet.rules;
			for(var i=0;i<parentRules.length;i++){
				if(parentRules[i] === _styleObj){
					_styleObj.parentStyleSheet.deleteRule(i);
					$return = true;
					break;
				}
			}
			return $return;
		}
				
		function Debug(){
			return _styleObj;
		}
		
		/* private utilities */
		function checkForKey(_index){
            var $return = false;
			if(defined(keyframes[_index])){
				$return = true;
			}
			else{
				for(var i=0;i<_styleObj.cssRules.length;i++){
					if(_styleObj.cssRules[i].keyText === _index){
						keyframes[_index] = new CSSStyleRuleHandler(_styleObj.cssRules[i]);
						$return = true;
						break;
					}
				}
			}
			return $return;
		}
		
		function addKeyFrame(_index){
			(_styleObj.insertRule ? _styleObj.insertRule(_index+'{}',0) : _styleObj.appendRule(_index+'{}'));
			for(var i=0;i<_styleObj.cssRules.length;i++){
				if(_styleObj.cssRules[i].keyText === _index){
					/* Now find the rule, and assign it to the keyframe */
					keyframes[_index] = new CSSStyleRuleHandler(_styleObj.cssRules[i]);
                    return keyframes[_index];
					break;
				}
			}
		}
		
		function defined(_val){
			return (_val === undefined ? false : true);
		}
	}

    /*************************************
     * Our FontFace Handler
     *************************************/
	function CSSFontFaceRuleHandler(_styleObj){
        var $API, _styleObj, Events, fontProperties = {"fontFamily":'',"src": '',"fontStretch": '',"fontStyle":'',"unicodeRange":'',"fontWeight": ''};

        Events = KUBE.Events();

        $API = {
            'On': Events.On,
            'Once': Events.Once,
            'Emit': Events.Emit,
            'RemoveListener': Events.RemoveListener,
            'ClearEvent': Events.Clear,
            'Family': Family,
            'Src': Src,
            'Stretch': Stretch,
            'Style': Style,
            'UnicodeRange': UnicodeRange,
            'Weight': Weight

        };

        return $API;


        function Family(_family){
            fontProperties.fontFamily = _family;
            initFontRuleIfNeeded();
            return $API;
        }

        function Src(_src){
            fontProperties.src = normalizeSrc(_src);
            initFontRuleIfNeeded();
            return $API;
        }

        function Stretch(_stretch){
            if(validateStretch(_stretch)){
                fontProperties.fontStretch = _stretch;
                initFontRuleIfNeeded();
            }
            else{
                KUBE.console.log('Fail: Font Stretch was not valid value for font-face');
            }
            return $API;
        }

        function Style(_style){
            if(validateStyle(_style)){
                fontProperties.fontStyle = _style;
                initFontRuleIfNeeded();
            }
            else{
                KUBE.console.log('Fail: Font Style was not valid value for font-face');
            }
            return $API;
        }

        function UnicodeRange(_unicodeRange){
            if(validateUnicodeRange(_unicodeRange)){
                fontProperties.unicodeRange = _unicodeRange;
                initFontRuleIfNeeded();
            }
            return $API;
        }

        function Weight(_weight){
            if(validateWeight(_weight)){
                fontProperties.fontWeight = _weight;
                initFontRuleIfNeeded();
            }
            else{
                KUBE.console.log('Fail: Font Weight was not valid value for font-face');
            }
            return $API;
        }

        function normalizeSrc(_src){
            var $return = _src;
            //Check if it starts with url, if it doesn't, wrap it
            if(_src.KUBE().trim().substr(0,4).toLowerCase() !== "url("){
                $return = "url('" + _src + "')";
            }
            return $return;
        }

        function validateWeight(_weight){
            var validOptions = ["normal","bold","lighter","bolder","100","200","300","400","500","600","700","800","900"];
            return (validOptions.indexOf((""+_weight).toLowerCase()) > -1); //String cast is intentional
        }

        function validateStyle(_style){
            var validOptions = ["normal","italic","oblique"];
            return (validOptions.indexOf((""+_style).toLowerCase()) > -1);
        }

        function validateStretch(_stretch){
            var validOptions = ["normal","condensed","ultra-condensed","extra-condensed","semi-condensed","expanded","ultra-expanded","extra-expanded","semi-expanded"];
            return (validOptions.indexOf((""+_stretch).toLowerCase()) > -1);
        }

        function validateUnicodeRange(_unicodeRange){
            var $return = true;
            if(KUBE.Is(_unicodeRange) !== "string"){
                return false;
            }

            var unicodeRanges = _unicodeRange.split(",");
                unicodeRanges.KUBE().each(validate);

            function validate(_range){
                var testRegex = /u\+[0-9a-f?]{1,6}(-[0-9a-f]{1,6})?/i;
                if(!testRegex.test(_range)){
                    $return = false;
                    this.break();
                }
            }
            return $return;
        }

        function initFontRuleIfNeeded(){
            var styleSheet = document.styleSheets[0];
            if(!_styleObj && fontProperties.fontFamily && fontProperties.src){
                try{
                    (styleSheet.insertRule ? styleSheet.insertRule('@font-face { }',0) : styleSheet.addRule('@font-face','{ }',0));
                    //TODO: Validate to ensure that this is a CSSFontFaceRule
                    _styleObj = styleSheet.cssRules[0];
                }
                catch(E){
                    throw E;
                }
            }
            if(_styleObj){
                for(prop in fontProperties){
                    if(!fontProperties.hasOwnProperty(prop)){continue;}
                    applyProperty(prop,fontProperties[prop]);

                }
            }

            function applyProperty(propertyName,value){
                _styleObj.style[propertyName] = value;
            }
        }



    }

	
	/*************************************
	 * Our CSSStyleRule Object Handler
	 *************************************/
	function CSSStyleRuleHandler(_styleObj){
		var $API,Events,DJID;
		
		Events = KUBE.Events();
		
		if(_styleObj instanceof HTMLElement){
            DJID = KUBE.Class('/Library/DOM/DomJack')(_styleObj).CacheId();
			KUBE.Class('/Library/DOM/DomJack')(_styleObj).Once('cleanup',function(){
				_styleObj = undefined;
                delete DJSJCache[DJID];
			});
		}
		
		$API = {
			'Delete':Delete,
            'Debug': Debug,
			'On':Events.On,
			'Once':Events.Once,
			'Emit':Events.Emit,
			'RemoveListener':Events.RemoveListener,
			'ClearEvent':Events.Clear,
			'GetStyleObj':GetStyleObj,
            'GetSelectorText':GetSelectorText,
            'Apply':Apply,

			//Our Property List
			'Animation' : Animation,
			'Appearance' : Appearance,
			'BackfaceVisibility' : BackfaceVisibility,
			'Background' : Background,
			'Border' : Border,
			'Bottom' : Bottom,
			'Box' : Box,
			'CaptionSide' : CaptionSide,
			'Clear' : Clear,
			'Clip' : Clip,
			'Color' : Color,
//			'Column' : Column,
			'Content' : Content,
//			'Counter' : Counter,
			'Cursor' : Cursor,
			'Direction' : Direction,
			'Display' : Display,
			'EmptyCells' : EmptyCells,
			'Float' : Float,
			'Font' : Font,
			'Height' : Height,
			'Left' : Left,
			'LetterSpacing' : LetterSpacing,
			'LineHeight' : LineHeight,
//			'ListStyle' : ListStyle,
			'Margin' : Margin,
			'MinHeight': MinHeight,
			'MinWidth': MinWidth,
            'MaxHeight': MaxHeight,
            'MaxWidth': MaxWidth,
			'Opacity' : Opacity,
			'Outline' : Outline,
			'Overflow' : Overflow,
			'Padding' : Padding,
			'Position' : Position,
			'Resize' : Resize,
			'Right' : Right,
			'TableLayout' : TableLayout,
			'Text' : Text,
			'Top' : Top,
			'Transform' : Transform,
			'Transition' : Transition,
            'UserSelect': UserSelect,
			'VerticalAlign' : VerticalAlign,
			'Visibility' : Visibility,
			'Width' : Width,
			'WhiteSpace' : WhiteSpace,
			'WordSpacing' : WordSpacing,
			'WordBreak' : WordBreak,
			'WordWrap' : WordWrap,
			'ZIndex' : ZIndex
		}.KUBE().create(StyleJack.prototype);
		
		$API.api = $API;
		
		return $API;
		
		//Core methods
		function Delete(){
            if(KUBE.Is(_styleObj,true) === 'CSSStyleRule' && _styleObj.parentStyleSheet){
                var rules = _styleObj.parentStyleSheet.cssRules;
                for(var i=0;i<rules.length;i++){
                    if(rules[i] === _styleObj){
                        _styleObj.parentStyleSheet.deleteRule(i);
                        $API.Emit('delete');
                    }
                }
            }
		}


        function Apply(_styleObj){
            _styleObj.KUBE().each(function(_property,_style){
                /*
                    Currently Unsupported:
                    alignContent, alignItems, alignSelf, alignmentBaseline, all, backgroundBlendMode, baselineShift, borderCollapse, borderImage,
                    borderImageOutset, borderImageRepeat, borderImageSlice, borderImageSource, borderImageWidth, borderSpacing, bufferedRendering, captionSide,
                    clipPath, clipRule, colorInterpolation, colorInterpolationFilters, colorRendering, counterIncrement, counterReset, dominantBaseline,
                    fill, fillOpacity, fillRule, filter, flex, flexBasis, flexDirection, flexFlow, flexGrow, flexShrink, flexWrap, floodColor, floodOpacity,
                    fontKerning, fontStretch, fontVariantLigatures, glyphOrientationHorizontal, glyphOrientationVertical, imageRendering, isolation, justifyContent,
                    lightingColor, listStyle, listStyleImage, listStylePosition, listStyleType, marker, markerEnd, markerMid, markerStart, mask, maskType, maxZoom,
                    minZoom, mixBlendMode, motion, motionOffset, motionPath, motionRotation, objectFit, objectPosition, order, orientation, orphans, overflowWrap,
                    page, pageBreakAfter, pageBreakBefore, pageBreakInside, paintOrder, perspective, perspectiveOrigin, pointerEvents, shapeImageThreshold, shapeMargin,
                    shapeOutside, shapeRendering, size, speak, src, stopColor, stopOpacity, stroke, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin,
                    strokeMiterlimit, strokeOpacity, strokeWidth, tabSize, textAlignLast, textAnchor, textRendering, touchAction, transformOrigin, transformStyle,
                    unicodeBidi, unicodeRange, userZoom, vectorEffect, widows, writingMode, zoom
                 */

                switch(_property){
                    case 'animation':               $API.Animation(_style);                      break;
                    case 'animationDelay':          $API.Animation().Delay(_style);              break;
                    case 'animationDuration':       $API.Animation().Duration(_style);           break;
                    case 'animationFillMode':       $API.Animation().FillMode(_style);           break;
                    case 'animationIterationCount': $API.Animation().IterationCount(_style);     break;
                    case 'animationName':           $API.Animation().Name(_style);               break;
                    case 'animationPlayState':      $API.Animation().PlayState(_style);          break;
                    case 'animationTimingFunction': $API.Animation().TimingFunction(_style);     break;
                    case 'backfaceVisibility':      $API.BackfaceVisibility(_style);             break;
                    case 'background':              $API.Background(_style);                     break;
                    case 'backgroundAttachment':    $API.Background().Attachment(_style);        break;
                    case 'backgroundClip':          $API.Background().Clip(_style);              break;
                    case 'backgroundColor':         $API.Background().Color(_style);             break;
                    case 'backgroundImage':         $API.Background().Image(_style);             break;
                    case 'backgroundOrigin':        $API.Background().Origin(_style);            break;
                    case 'backgroundPosition':      $API.Background().Position(_style);          break;
                    case 'backgroundPositionX':     $API.Background().Position({'x':_style});    break;
                    case 'backgroundPositionY':     $API.Background().Position({'y':_style});    break;
                    case 'backgroundRepeat':        $API.Background().Repeat(_style);            break;
                    case 'backgroundRepeatX':       $API.Background().Repeat({'x':_style});      break;
                    case 'backgroundRepeatY':       $API.Background().Repeat({'y':_style});      break;
                    case 'backgroundSize':          $API.Background().Size(_style);              break;
                    case 'border':                  $API.Border(_style);                         break;
                    case 'borderBottom':            $API.Border().Bottom(_style);                break;
                    case 'borderBottomColor':       $API.Border().Bottom({'color':_style});      break;
                    case 'borderBottomLeftRadius':  $API.Border().Radius().BottomLeft(_style);   break;
                    case 'borderBottomRightRadius': $API.Border().Radius().BottomRight(_style);  break;
                    case 'borderBottomStyle':       $API.Border().Bottom({'style':_style});      break;
                    case 'borderBottomWidth':       $API.Border().Bottom({'color':_style});      break;
                    case 'borderColor':             $API.Border({'color':_style});               break;
                    case 'borderLeft':              $API.Border().Left(_style);                  break;
                    case 'borderLeftColor':         $API.Border().Left({'color':_style});        break;
                    case 'borderLeftStyle':         $API.Border().Left({'style':_style});        break;
                    case 'borderLeftWidth':         $API.Border().Left({'color':_style});        break;
                    case 'borderRadius':            $API.Border().Radius(_style);                break;
                    case 'borderRight':             $API.Border().Right(_style);                 break;
                    case 'borderRightColor':        $API.Border().Right({'color':_style});       break;
                    case 'borderRightStyle':        $API.Border().Right({'style':_style});       break;
                    case 'borderRightWidth':        $API.Border().Right({'color':_style});       break;
                    case 'borderStyle':             $API.Border({'style':_style});               break;
                    case 'borderTop':               $API.Border().Top(_style);                   break;
                    case 'borderTopColor':          $API.Border().Top({'color':_style});         break;
                    case 'borderTopLeftRadius':     $API.Border().Radius().TopLeft(_style);      break;
                    case 'borderTopRightRadius':    $API.Border().Radius().TopRight(_style);     break;
                    case 'borderTopStyle':          $API.Border().Top({'style':_style});         break;
                    case 'borderTopWidth':          $API.Border().Top({'color':_style});         break;
                    case 'borderWidth':             $API.Border({'width':_style});               break;
                    case 'bottom':                  $API.Bottom(_style);                         break;
                    case 'boxShadow':               $API.Box().Shadow(_style);                   break;
                    case 'boxSizing':               $API.Box().Sizing(_style);                   break;
                    case 'clear':                   $API.Clear(_style);                          break;
                    case 'clip':                    $API.Clip(_style);                           break;
                    case 'color':                   $API.Color(_style);                          break;
                    case 'content':                 $API.Content(_style);                        break;
                    case 'cursor':                  $API.Cursor(_style);                         break;
                    case 'direction':               $API.Direction(_style);                      break;
                    case 'display':                 $API.Display(_style);                        break;
                    case 'emptyCells':              $API.EmptyCells(_style);                     break;
                    case 'float':                   $API.Float(_style);                          break;
                    case 'font':                    $API.Font(_style);                           break;
                    case 'fontFamily':              $API.Font().Family(_style);                  break;
                    case 'fontSize':                $API.Font().Size(_style);                    break;
                    case 'fontSmoothing':           $API.Font().Smoothing(_style);               break;
                    case 'fontStyle':               $API.Font().Style(_style);                   break;
                    case 'fontVariant':             $API.Font().Variant(_style);                 break;
                    case 'fontWeight':              $API.Font().Weight(_style);                  break;
                    case 'height':                  $API.Height(_style);                         break;
                    case 'left':                    $API.Left(_style);                           break;
                    case 'letterSpacing':           $API.LetterSpacing(_style);                  break;
                    case 'lineHeight':              $API.LineHeight(_style);                     break;
                    case 'margin':                  $API.Margin(_style);                         break;
                    case 'marginBottom':            $API.Margin().Bottom(_style);                break;
                    case 'marginLeft':              $API.Margin().Left(_style);                  break;
                    case 'marginRight':             $API.Margin().Right(_style);                 break;
                    case 'marginTop':               $API.Margin().Top(_style);                   break;
                    case 'maxHeight':               $API.MaxHeight(_style);                      break;
                    case 'maxWidth':                $API.MaxWidth(_style);                       break;
                    case 'minHeight':               $API.MinHeight(_style);                      break;
                    case 'minWidth':                $API.MinWidth(_style);                       break;
                    case 'opacity':                 $API.Opacity(_style);                        break;
                    case 'outline':                 $API.Outline(_style);                        break;
                    case 'outlineColor':            $API.Outline().Color(_style);                break;
                    case 'outlineOffset':           $API.Outline().Offset(_style);               break;
                    case 'outlineStyle':            $API.Outline().Style(_style);                break;
                    case 'outlineWidth':            $API.Outline().Width(_style);                break;
                    case 'overflow':                $API.Overflow(_style);                       break;
                    case 'overflowX':               $API.Overflow().X(_style);                   break;
                    case 'overflowY':               $API.Overflow().Y(_style);                   break;
                    case 'padding':                 $API.Padding(_style);                        break;
                    case 'paddingBottom':           $API.Padding().Bottom(_style);               break;
                    case 'paddingLeft':             $API.Padding().Left(_style);                 break;
                    case 'paddingRight':            $API.Padding().Right(_style);                break;
                    case 'paddingTop':              $API.Padding().Top(_style);                  break;
                    case 'position':                $API.Position(_style);                       break;
                    case 'quotes':                  $API.Quotes(_style);                         break;
                    case 'resize':                  $API.Resize(_style);                         break;
                    case 'right':                   $API.Right(_style);                          break;
                    case 'tableLayout':             $API.TableLayout(_style);                    break;
                    case 'textAlign':               $API.Text().Align(_style);                   break;
                    case 'textDecoration':          $API.Text().Decoration(_style);              break;
                    case 'textIndent':              $API.Text().Indent(_style);                  break;
                    case 'textOverflow':            $API.Text().Overflow(_style);                break;
                    case 'textShadow':              $API.Text().Shadow(_style);                  break;
                    case 'textTransform':           $API.Text().Transform(_style);               break;
                    case 'top':                     $API.Top(_style);                            break;
                    case 'transform':               $API.Transform(_style);                      break;
                    case 'transition':              $API.Transition(_style);                     break;
                    case 'transitionDelay':         $API.Transition().Delay(_style);             break;
                    case 'transitionDuration':      $API.Transition().Duration(_style);          break;
                    case 'transitionProperty':      $API.Transition().Property(_style);          break;
                    case 'transitionTimingFunction':$API.Transition().Timing(_style);            break;
                    case 'verticalAlign':           $API.VerticalAlign(_style);                  break;
                    case 'visibility':              $API.Visibility(_style);                     break;
                    case 'whiteSpace':              $API.WhiteSpace(_style);                     break;
                    case 'width':                   $API.Width(_style);                          break;
                    case 'wordBreak':               $API.WordBreak(_style);                      break;
                    case 'wordSpacing':             $API.WordSpacing(_style);                    break;
                    case 'wordWrap':                $API.WordWrap(_style);                       break;
                    case 'zIndex':                  $API.ZIndex(_style);                         break;
                    default:
                        console.log('StyleJack Appy: Property Not Supported - '+_property);
                        break;
                }
            });
            return $API;
        }

        function Debug(){
            console.group('STYLEJACK DEBUG');
            console.log(DJSJCache);
            console.log(StyleSJCache);
            console.groupEnd('STYLEJACK DEBUG');
        }

		function getArgsArray(_arguments){
			var args = Array.prototype.slice.call(_arguments);
			args.unshift($API);
			args.unshift(_styleObj);
			return args;
		}
		
		function GetStyleObj(){
			return _styleObj;
		}

        function GetSelectorText(){
            return _styleObj.selectorText;
        }
				
		//Hard named functions for optimization. Originally was calling Plugins for each one of these. Decided this was better.
		function Animation(){	
			return AnimationHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Appearance(){
			return AppearanceHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function BackfaceVisibility(){
			return BackfaceVisibilityHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Background(){
			return BackgroundHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Border(){
			return BorderHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Bottom(){
			return BottomHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Box(){
			return BoxHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function CaptionSide(){
			return CaptionSideHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Clear(){
			return ClearHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Clip(){
			return ClipHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Color(){
			return ColorHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Column(){
			return ColumnHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Content(){
			return ContentHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Counter(){
			return CounterHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Cursor(){
			return CursorHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Direction(){
			return DirectionHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Display(){
			return DisplayHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function EmptyCells(){
			return EmptyCellsHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Float(){
			return FloatHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Font(){
			return FontHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Height(){
			return HeightHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Left(){
			return LeftHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function LetterSpacing(){
			return LetterSpacingHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function LineHeight(){
			return LineHeightHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function ListStyle(){
			return ListStyleHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Margin(){
			return MarginHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function MinHeight(){
			return MinHeightHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function MinWidth(){
			return MinWidthHandler.apply(undefined,getArgsArray(arguments));
		}

        function MaxHeight(){
            return MaxHeightHandler.apply(undefined,getArgsArray(arguments));
        }

        function MaxWidth(){
            return MaxWidthHandler.apply(undefined,getArgsArray(arguments));
        }

		function Opacity(){
			return OpacityHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Outline(){
			return OutlineHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Overflow(){
			return OverflowHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Padding(){
			return PaddingHandler.apply(undefined,getArgsArray(arguments));
		}
				
		function Position(){
			return PositionHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Quotes(){
			return QuotesHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Resize(){
			return ResizeHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Right(){
			return RightHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function TableLayout(){
			return TableLayoutHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Text(){
			return TextHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Top(){ 
			return TopHandler.apply(undefined,getArgsArray(arguments)); 
		}
		
		function Transform(){
			return TransformHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Transition(){
			return TransitionHandler.apply(undefined,getArgsArray(arguments));
		}

        function UserSelect(){
            return UserSelectHandler.apply(undefined,getArgsArray(arguments));
        }

		function VerticalAlign(){
			return VerticalAlignHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Visibility(){
			return VisibilityHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function Width(){
			return WidthHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function WhiteSpace(){
			return WhitespaceHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function WordSpacing(){
			return WordSpacingHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function WordBreak(){
			return WordBreakHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function WordWrap(){
			return WordWrapHandler.apply(undefined,getArgsArray(arguments));
		}
		
		function ZIndex(){
			return ZIndexHandler.apply(undefined,getArgsArray(arguments));
		}

	} //END OF CSSStyleRule
	
	
	
	/*****************************************************
	 * Below this are what amounts to Plugin Methods
	 * They all exist outside of the CSSStyleHandler
	 * They are non scoped as far as variable access goes
	 ******************************************************/
	function AnimationHandler(_styleObj,_API,_animation){
        var $animationAPI = {
            'Get':Get,
            'Set':Set,
            'Delay':Delay,
            'Direction':Direction,
            'Duration':Duration,
            'FillMode':FillMode,
            'IterationCount':IterationCount,
            'Name':Name,
            'PlayState':PlayState,
            'TimingFunction':TimingFunction,
            'api':_API
        };
        return (_animation === undefined ? $animationAPI : quickHandler(_animation));

        function Get(){
            return quickHandler();
        }

        function Set(_animation){
            quickHandler(_animation);
            return $animationAPI;
        }

        function Delay(_delay){
            var $return = $animationAPI;
            if(_delay === '$' || _delay === undefined){
                $return = Convert(RawStyleGet(_styleObj,'animationDelay'),'ms','number');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationDelay',Convert(_delay,'number','ms'));
            }
            return $return;
        }

        function Direction(_direction){
            var $return = $animationAPI;
            if(_direction === '$' || _direction === undefined){
                $return = RawStyleGet(_styleObj,'animationDirection');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationDirection',_direction);
            }
            return $return;
        }

        function Duration(_duration){
            var $return = $animationAPI;
            if(_duration === '$' || _duration === undefined){
                $return = Convert(RawStyleGet(_styleObj,'animationDuration'),'ms','number');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationDuration',Convert(_duration,'number','ms'));
            }
            return $return;
        }

        function FillMode(_fillMode){
            var $return = $animationAPI;
            if(_fillMode === '$' || _fillMode === undefined){
                $return = RawStyleGet(_styleObj,'animationFillMode');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationFillMode',_fillMode);
            }
            return $return;
        }

        function IterationCount(_iterationCount){
            var $return = $animationAPI;
            if(_iterationCount === '$' || _iterationCount === undefined){
                $return = RawStyleGet(_styleObj,'animationIterationCount');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationIterationCount',_iterationCount);
            }
            return $return;
        }

        function Name(_name){
            var $return = $animationAPI;
            if(_name === '$' || _name === undefined){
                $return = RawStyleGet(_styleObj,'animationName');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationName',_name);
            }
            return $return;
        }

        function PlayState(_playState){
            var $return = $animationAPI;
            if(_playState === '$' || _playState === undefined){
                $return = RawStyleGet(_styleObj,'animationPlayState');
            }
            else{
                RawStyleSet(_styleObj,_API,'animationPlayState',_playState);
            }
            return $return;
        }

        function TimingFunction(_timingFunction){
            var $return = $animationAPI;
            if(_timingFunction === '$' || _timingFunction === undefined){
                //We can support CubicBezier in an array ideally...
                $return = RawStyleGet(_styleObj,'animationTimingFunction');
            }
            else{
                switch(KUBE.Is(_timingFunction)){
                    case 'array':
                        //For CubicBezier
                        break;
                }
                RawStyleSet(_styleObj,_API,'animationTimingFunction',_timingFunction);
            }
            return $return;
        }

        function quickHandler(_animation){
            var delay,direction,duration,fillMode,iterationCount,name,playState,timingFunction,$return = _API;
            if(_animation === undefined){
                delay = Delay();
                direction = Direction();
                duration = Duration();
                fillMode = FillMode();
                iterationCount = IterationCount();
                name = Name();
                playState = PlayState();
                timingFunction = TimingFunction();
                $return = {
                    0:name,1:duration,2:timingFunction,3:delay,4:iterationCount,5:direction,6:fillMode,7:playState,
                    'delay':delay,
                    'direction':direction,
                    'duration':duration,
                    'fillMode':fillMode,
                    'iterationCount':iterationCount,
                    'name':name,
                    'playState':playState,
                    'timingFunction':timingFunction
                };
            }
            else if(_animation === '$'){
                $return = RawStyleGet(_styleObj,'animation');
            }
            else{
                switch(KUBE.Is(_animation)){
                    case 'array':
                        (_animation[0] !== undefined ? Name(_animation[0]) : false);
                        (_animation[1] !== undefined ? Duration(_animation[1]) : false);
                        (_animation[2] !== undefined ? TimingFunction(_animation[2]) : false);
                        (_animation[3] !== undefined ? Delay(_animation[3]) : false);
                        (_animation[4] !== undefined ? IterationCount(_animation[4]) : false);
                        (_animation[5] !== undefined ? Direction(_animation[5]) : false);
                        (_animation[6] !== undefined ? FillMode(_animation[6]) : false);
                        (_animation[7] !== undefined ? PlayState(_animation[7]) : false);
                        break;

                    case 'object':
                        (_animation.delay !== undefined ? Delay(_animation.delay) : false);
                        (_animation.direction !== undefined ? Direction(_animation.direction) : false);
                        (_animation.duration !== undefined ? Duration(_animation.duration) : false);
                        (_animation.fillMode !== undefined ? FillMode(_animation.fillMode) : false);
                        (_animation.iterationCount !== undefined ? IterationCount(_animation.iterationCount) : false);
                        (_animation.name !== undefined ? Name(_animation.name) : false);
                        (_animation.playState !== undefined ? PlayState(_animation.playState) : false);
                        (_animation.timingFunction !== undefined ? TimingFunction(_animation.timingFunction) : false);
                        break;

                    case 'string':
                        RawStyleSet(_styleObj,_API,'animation',_animation);
                        break;
                }
            }
            return $return;
        }

	}
	
	function AppearanceHandler(_styleObj,_API,_appearance){
		var $return = _API;
		if(_appearance === undefined || _appearance === '$'){
			$return = RawStyleGet(_styleObj,'appearance');
		}
		else{
			RawStyleSet(_styleObj,_API,'appearance',_appearance);
		}
		return $return;
	}		//APPEARANCE:END
	
	function BackfaceVisibilityHandler(_styleObj,_API,_backfaceVisibility){
		var $return = _API;
		if(_backfaceVisibility === undefined || _backfaceVisibility === '$'){
			$return = RawStyleGet(_styleObj,'backfaceVisibility');
		}
		else{
			RawStyleSet(_styleObj,_API,'backfaceVisibility',_backfaceVisibility);
		}
		return $return;
	}//BACKFACE-VISIBILITY:END
	
	function BackgroundHandler(_styleObj,_API,_background){
		var $backgroundAPI = {
			'Get':Get,
			'Set':Set,
			'Color':Color,
			'Attachment':Attachment,
			'Image':Image,
			'Position':Position,
			'Repeat':Repeat,
			'Clip':Clip,
			'Origin':Origin,
			'Size':Size,
			'api':_API
		};
		return (_background === undefined ? $backgroundAPI : quickHandler(_background));
		
		function Get(){
			return quickHandler();
		}
		
		function Set(_background){
			quickHandler(_background);
			return $backgroundAPI;
		}
		
		function Color(_color){
			var $return = $backgroundAPI;
			if(_color === '$' || _color === undefined){
				$return = RawStyleGet(_styleObj,'backgroundColor');
			}
			else{
				RawStyleSet(_styleObj,_API,'backgroundColor', (_color === "" ? "" : KUBE.Class('/Library/Drawing/Color')().Format(_color,'rgb',true)));
			}
			return $return;			
		}
		
		function Attachment(_attachment){
			var $return = $backgroundAPI;
			if(_attachment === undefined || _attachment === '$'){
				$return = RawStyleGet(_styleObj,'backgroundAttachment');
			}
			else{
				RawStyleSet(_styleObj,_API,'backgroundAttachment',_attachment);
			}
			return $return;
		}
		
		function Image(_image){
			var $return = $backgroundAPI;
			if(_image === undefined || _image === '$'){
				$return = RawStyleGet(_styleObj,'backgroundImage');
				if(_image === undefined){
					$return = Convert($return,'url','string');
				}
			}
			else{
				RawStyleSet(_styleObj,_API,'backgroundImage',Convert(_image,'string','url'));
			}
			return $return;
		}
		
		function Position(_position){
			var bgPos,$return = $backgroundAPI;
			if(_position === '$' || _position === undefined){
				$return = RawStyleGet(_styleObj,'backgroundPosition');
				if(_position === undefined){
					bgPos = $return.split(' ');
					if(bgPos[1] === undefined){
						bgPos[1] = getYPosVal(bgPos[0]);
						bgPos[0] = Convert(bgPos[0],'px','number');						
					}
					else{
						bgPos = bgPos.KUBE().each(function(_v){ return Convert(_v,'px','number'); });
					}
					$return = {
						0:bgPos[0],1:bgPos[1],
						'x':bgPos[0],'y':bgPos[1]
					};
				}
			}
			else{
				bgPos = Position();
				switch(KUBE.Is(_position)){
					case 'array':
						bgPos[0] = (_position[0] !== undefined ? _position[0] : bgPos[0]);
						bgPos[1] = (_position[1] !== undefined ? _position[1] : bgPos[1]);
						_position = Convert(bgPos[0],'number','px')+" "+Convert(bgPos[1],'number','px');
						break;
					
					case 'object':
						bgPos.x = (_position.x !== undefined ? _position.x : bgPos.x);
						bgPos.y = (_position.y !== undefined ? _position.y : bgPos.y);
						_position = Convert(bgPos.x,'number','px')+" "+Convert(bgPos.y,'number','px');
						break;
				}
				RawStyleSet(_styleObj,_API,'backgroundPosition',_position);
			}
			return $return;
		}
		
		function Repeat(_repeat){
			var $return = $backgroundAPI;
			if(_repeat === undefined || _repeat === '$'){
				$return = RawStyleGet(_styleObj,'backgroundRepeat');
			}
			else{
				switch(_repeat){
					case '': case 'no': case 'none':
						_repeat = 'no-repeat';
						break;
						
					case 'x':
						_repeat = 'repeat-x';
						break;
						
					case 'y':
						_repeat = 'repeat-y';
						break;				
				}
				RawStyleSet(_styleObj,_API,'backgroundRepeat',_repeat);
			}
			return $return;
		}	
		
		function Clip(_clip){
			var $return = $backgroundAPI;
			if(_clip === undefined || _clip === '$'){
				$return = RawStyleGet(_styleObj,'backgroundClip');
			}
			else{
				RawStyleSet(_styleObj,_API,'backgroundClip',_clip);
			}
			return $return;
		}
		
		function Origin(_origin){
			var $return = $backgroundAPI;
			if(_origin === undefined || _origin === '$'){
				$return = RawStyleGet(_styleObj,'backgroundOrigin');
			}
			else{
				RawStyleSet(_styleObj,_API,'backgroundOrigin',_origin);
			}
			return $return;			
		}
		
		function Size(_size){
			var sizeArray, $return = $backgroundAPI;
			if(_size === undefined || _size === '$'){
				$return = RawStyleGet(_styleObj,'backgroundSize');
				sizeArray = $return.split(' ').KUBE().each(function(_v){ return Convert(_v,'px','number'); });
				if(sizeArray.length === 2){
					$return = {0:sizeArray[0],1:sizeArray[1],'width':sizeArray[0],'height':sizeArray[1]};
				}
			}
			else{
				sizeArray = Size();
				if(sizeArray === ""){
					sizeArray = ['initial','initial'];
				}
				switch(KUBE.Is(_size)){
					case 'array':
						sizeArray[0] = (_size[0] !== undefined ? _size[0] : sizeArray[0]);
						sizeArray[1] = (_size[1] !== undefined ? _size[1] : sizeArray[1]);
						_size = Convert(sizeArray[0],'number','px')+" "+Convert(sizeArray[1],'number','px');
						break;
						
					case 'object':
						sizeArray.width = (_size.width !== undefined ? _size.width : sizeArray.width);
						sizeArray.height = (_size.height !== undefined ? _size.height : sizeArray.height);
						_size = Convert(sizeArray.width,'number','px')+" "+Convert(sizeArray.height,'number','px');
						break;
				}
				
				RawStyleSet(_styleObj,_API,'backgroundSize',_size);
			}
			return $return;
		}
		
		function getYPosVal(_x){
			return (_x === 'left' || _x === 'center' || _x === 'right' ? 'center' : '50%');
		}
		
		function quickHandler(_background){
			var color,position,size,repeat,origin,clip,attachment,image,$return = _API;
			if(_background === undefined){
				color = Color();
				position = Position();
				size = Size();
				repeat = Repeat();
				origin = Origin();
				clip = Clip();
				attachment = Attachment();
				image = Image();
				$return = {
					0:color,1:position,2:size,3:repeat,4:origin,5:clip,6:attachment,7:image,
					'color':color,
					'position':position,
					'size':size,
					'repeat':repeat,
					'origin':origin,
					'clip':clip,
					'attachment':attachment,
					'image':image
				};				
			}
			else if(_background === '$'){
				$return = RawStyleGet(_styleObj,'background');
			}
			else{
				switch(KUBE.Is(_background)){
					case 'array':
						(_background[0] !== undefined ? Color(_background[0]) : false);
						(_background[1] !== undefined ? Position(_background[1]) : false);
						(_background[2] !== undefined ? Size(_background[2]) : false);
						(_background[3] !== undefined ? Repeat(_background[3]) : false);
						(_background[4] !== undefined ? Origin(_background[4]) : false);
						(_background[5] !== undefined ? Clip(_background[5]) : false);
						(_background[6] !== undefined ? Attachment(_background[6]) : false);
						(_background[7] !== undefined ? Image(_background[7]) : false);
						break;
						
					case 'object':
						(_background.color !== undefined ? Color(_background.color) : false);
						(_background.position !== undefined ? Position(_background.position) : false);
						(_background.size !== undefined ? Size(_background.size) : false);
						(_background.repeat !== undefined ? Repeat(_background.repeat) : false);
						(_background.origin !== undefined ? Origin(_background.origin) : false);
						(_background.clip !== undefined ? Clip(_background.clip) : false);
						(_background.attachment !== undefined ? Attachment(_background.attachment) : false);
						(_background.image !== undefined ? Image(_background.image) : false);
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'background',_background);
						break;
				}
			}
			return $return;
		}
	}
	
	function BorderHandler(_styleObj,_API,_border,_radius){
		var $borderAPI = {
			'Get':Get,
			'Set':Set,
			'Top':Top,
			'Right':Right,
			'Bottom':Bottom,
			'Left':Left,
			'Radius':Radius,
			'api':_API
		};
		if(_radius !== undefined){
			Radius(_radius);
		}
		return (_border === undefined ? $borderAPI : simpleHandler(_border));
		
		//Basic Border and Side Handling
		function Get(){
			return simpleHandler();
		}
		
		function Set(_border){
			simpleHandler(_border);
			return $borderAPI;
		}
		
		function Top(_top){
			var $return = $borderAPI;
			if(_top === '$'){
				$return = RawStyleGet(_styleObj,'borderTop');
			}
			else if(_top === undefined){
				$return = getObj(Convert(RawStyleGet(_styleObj,'borderTopWidth'),'px','number'),RawStyleGet(_styleObj,'borderTopStyle'),RawStyleGet(_styleObj,'borderTopColor'));
			}
			else{
				switch(KUBE.Is(_top)){
					case 'array':
						(_top[0] !== undefined ? RawStyleSet(_styleObj,_API,'borderTopWidth',Convert(_top[0],'number','px')) : false);
						(_top[1] !== undefined ? RawStyleSet(_styleObj,_API,'borderTopStyle',_top[1]) : false);
						(_top[2] !== undefined ? RawStyleSet(_styleObj,_API,'borderTopColor',_top[2]) : false);
						break;
					
					case 'object':
						(_top.width !== undefined ? RawStyleSet(_styleObj,_API,'borderTopWidth',Convert(_top.width,'number','px')) : false);
						(_top.style !== undefined ? RawStyleSet(_styleObj,_API,'borderTopStyle',_top.style) : false);
						(_top.color !== undefined ? RawStyleSet(_styleObj,_API,'borderTopColor',_top.color) : false);
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'borderTop',_top);
						break;
				}				
			}
			return $return;
		}
		
		function Right(_right){
			var $return = $borderAPI;
			if(_right === '$'){
				$return = RawStyleGet(_styleObj,'borderRight');
			}
			else if(_right === undefined){
				$return = getObj(Convert(RawStyleGet(_styleObj,'borderRightWidth'),'px','number'),RawStyleGet(_styleObj,'borderRightStyle'),RawStyleGet(_styleObj,'borderRightColor'));
			}
			else{
				switch(KUBE.Is(_right)){
					case 'array':
						(_right[0] !== undefined ? RawStyleSet(_styleObj,_API,'borderRightWidth',Convert(_right[0],'number','px')) : false);
						(_right[1] !== undefined ? RawStyleSet(_styleObj,_API,'borderRightStyle',_right[1]) : false);
						(_right[2] !== undefined ? RawStyleSet(_styleObj,_API,'borderRightColor',_right[2]) : false);
						break;
					
					case 'object':
						(_right.width !== undefined ? RawStyleSet(_styleObj,_API,'borderRightWidth',Convert(_right.width,'number','px')) : false);
						(_right.style !== undefined ? RawStyleSet(_styleObj,_API,'borderRightStyle',_right.style) : false);
						(_right.color !== undefined ? RawStyleSet(_styleObj,_API,'borderRightColor',_right.color) : false);
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'borderRight',_right);
						break;
				}				
			}
			return $return;
		}
		
		function Bottom(_bottom){
			var $return = $borderAPI;
			if(_bottom === '$'){
				$return = RawStyleGet(_styleObj,'borderBottom');
			}
			else if(_bottom === undefined){
				$return = getObj(Convert(RawStyleGet(_styleObj,'borderBottomWidth'),'px','number'),RawStyleGet(_styleObj,'borderBottomStyle'),RawStyleGet(_styleObj,'borderBottomColor'));
			}
			else{
				switch(KUBE.Is(_bottom)){
					case 'array':
						(_bottom[0] !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomWidth',Convert(_bottom[0],'number','px')) : false);
						(_bottom[1] !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomStyle',_bottom[1]) : false);
						(_bottom[2] !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomColor',_bottom[2]) : false);
						break;
					
					case 'object':
						(_bottom.width !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomWidth',Convert(_bottom.width,'number','px')) : false);
						(_bottom.style !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomStyle',_bottom.style) : false);
						(_bottom.color !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomColor',_bottom.color) : false);
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'borderBottom',_bottom);
						break;
				}				
			}
			return $return;
			
		}
		
		function Left(_left){
			var $return = $borderAPI;
			if(_left === '$'){
				$return = RawStyleGet(_styleObj,'borderLeft');
			}
			else if(_left === undefined){
				$return = getObj(Convert(RawStyleGet(_styleObj,'borderLeftWidth'),'px','number'),RawStyleGet(_styleObj,'borderLeftStyle'),RawStyleGet(_styleObj,'borderLeftColor'));
			}
			else{
				switch(KUBE.Is(_left)){
					case 'array':
						(_left[0] !== undefined ? RawStyleSet(_styleObj,_API,'borderLeftWidth',Convert(_left[0],'number','px')) : false);
						(_left[1] !== undefined ? RawStyleSet(_styleObj,_API,'borderLeftStyle',_left[1]) : false);
						(_left[2] !== undefined ? RawStyleSet(_styleObj,_API,'borderLeftColor',_left[2]) : false);
						break;
					
					case 'object':
						(_left.width !== undefined ? RawStyleSet(_styleObj,_API,'borderLeftWidth',Convert(_left.width,'number','px')) : false);
						(_left.style !== undefined ? RawStyleSet(_styleObj,_API,'borderLeftStyle',_left.style) : false);
						(_left.color !== undefined ? RawStyleSet(_styleObj,_API,'borderLeftColor',_left.color) : false);
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'borderLeft',_left);
						break;
				}				
			}
			return $return;			
		}
		
		function simpleHandler(_border){
			var $return = _API;
			if(_border === '$'){
				$return = RawStyleGet(_styleObj,'border');
			}
			else if(_border === undefined){
				$return = getObj(Convert(RawStyleGet(_styleObj,'borderWidth'),'px','number'),RawStyleGet(_styleObj,'borderStyle'),RawStyleGet(_styleObj,'borderColor'));
			}
			else{
				switch(KUBE.Is(_border)){
					case 'array':
						(_border[0] !== undefined ? RawStyleSet(_styleObj,_API,'borderWidth',Convert(_border[0],'number','px')) : false);
						(_border[1] !== undefined ? RawStyleSet(_styleObj,_API,'borderStyle',_border[1]) : false);
						(_border[2] !== undefined ? RawStyleSet(_styleObj,_API,'borderColor',_border[2]) : false);
						break;
					
					case 'object':
						(_border.width !== undefined ? RawStyleSet(_styleObj,_API,'borderWidth',Convert(_border.width,'number','px')) : false);
						(_border.style !== undefined ? RawStyleSet(_styleObj,_API,'borderStyle',_border.style) : false);
						(_border.color !== undefined ? RawStyleSet(_styleObj,_API,'borderColor',_border.color) : false);
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'border',_border);
						break;
				}				
			}
			return $return;			
		}
		
		function getObj(width,style,color){
			return { 0:width, 1:style, 2:color, 'width':width, 'style':style, 'color':color,'length':3 };
		}
		
		//Radius Handling
		function Radius(_radius){
			var $radiusAPI = {
				'TopLeft':TopLeft,
				'TopRight':TopRight,
				'BottomRight':BottomRight,
				'BottomLeft':BottomLeft,
				'Get':Get,
				'Set':Set,
				'api':_API
			};
			return (_radius === undefined ? $radiusAPI : simpleRadiusHandler(_radius));
			
			function Get(){
				return simpleRadiusHandler();
			}
			
			function Set(_radius){
				return simpleRadiusHandler(_radius);
			}
			
			function TopLeft(_topLeft){
				var $return = $radiusAPI;
				if(_topLeft === '$' || _topLeft === undefined){
					$return = Convert(RawStyleGet(_styleObj,'borderTopLeftRadius'),'px','number');
				}
				else{
					RawStyleSet(_styleObj,_API,'borderTopLeftRadius',Convert(_topLeft,'number','px'));
				}
				return $return;
			}
			
			function TopRight(_topRight){
				var $return = $radiusAPI;
				if(_topRight === '$' || _topRight === undefined){
					$return = Convert(RawStyleGet(_styleObj,'borderTopRightRadius'),'px','number');
				}
				else{
					RawStyleSet(_styleObj,_API,'borderTopRightRadius',Convert(_topRight,'number','px'));
				}
				return $return;
			}
			
			function BottomRight(_bottomRight){
				var $return = $radiusAPI;
				if(_bottomRight === '$' || _bottomRight === undefined){
					$return = Convert(RawStyleGet(_styleObj,'borderBottomRightRadius'),'px','number');
				}
				else{
					RawStyleSet(_styleObj,_API,'borderBottomRightRadius',Convert(_bottomRight,'number','px'));
				}
				return $return;
			}

			function BottomLeft(_bottomLeft){
				var $return = $radiusAPI;
				if(_bottomLeft === '$' || _bottomLeft === undefined){
					$return = Convert(RawStyleGet(_styleObj,'borderBottomLeftRadius'),'px','number');
				}
				else{
					RawStyleSet(_styleObj,_API,'borderBottomLeftRadius',Convert(_bottomLeft,'number','px'));
				}
				return $return;
			}
					
			function simpleRadiusHandler(_radius){
				var topLeft,topRight,bottomRight,bottomLeft,$return = $radiusAPI;
				if(_radius === '$'){
					$return = RawStyleGet(_styleObj,'borderRadius');
				}
				else if(_radius === undefined){
					topLeft = Convert(RawStyleGet(_styleObj,'borderTopLeftRadius'),'px','number');
					topRight = Convert(RawStyleGet(_styleObj,'borderTopRightRadius'),'px','number');
					bottomRight = Convert(RawStyleGet(_styleObj,'borderBottomRightRadius'),'px','number');
					bottomLeft = Convert(RawStyleGet(_styleObj,'borderBottomLeftRadius'),'px','number');
					$return = {
						0:topLeft,
						1:topRight,
						2:bottomRight,
						3:bottomLeft,
						'topLeft':topLeft,
						'topRight':topRight,
						'bottomRight':bottomRight,
						'bottomLeft':bottomLeft
					};
				}
				else{
					switch(KUBE.Is(_radius)){
						case 'array':
							(_radius[0] !== undefined ? RawStyleSet(_styleObj,_API,'borderTopLeftRadius',Convert(_radius[0],'number','px')) : false);
							(_radius[1] !== undefined ? RawStyleSet(_styleObj,_API,'borderTopRightRadius',Convert(_radius[1],'number','px')) : false);
							(_radius[2] !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomRightRadius',Convert(_radius[2],'number','px')) : false);
							(_radius[3] !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomLeftRadius',Convert(_radius[3],'number','px')) : false);
							break;
							
						case 'object':
							(_radius.topLeft !== undefined ? RawStyleSet(_styleObj,_API,'borderTopLeftRadius',Convert(_radius.topLeft,'number','px')) : false);
							(_radius.topRight !== undefined ? RawStyleSet(_styleObj,_API,'borderTopRightRadius',Convert(_radius.topRight,'number','px')) : false);
							(_radius.bottomRight !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomRightRadius',Convert(_radius.bottomRight,'number','px')) : false);
							(_radius.bottomLeft !== undefined ? RawStyleSet(_styleObj,_API,'borderBottomLeftRadius',Convert(_radius.bottomLeft,'number','px')) : false);
							break;
							
						case 'string':
							RawStyleSet(_styleObj,_API,'borderRadius',_radius);
							break;
						case 'number':
							RawStyleSet(_styleObj,_API,'borderRadius',Convert(_radius,'number','px'));
							break;
					}
				}
				return $return;
			}
		}
	}				//BORDER: END
	
	function BottomHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'bottom'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'bottom',Convert(_val,'number','px'));
		}
		return $return;
	}				//BOTTOM: END
	
	function BoxHandler(_styleObj,_API){
        var $AdvancedAPI;

            $AdvancedAPI = {
                'Align':function(_val){ return fastGetSet('boxAlign',_val);},
                'Direction':function(_val){ return fastGetSet('boxDirection',_val);},
                'Flex':function(_val){ return  fastGetSet('boxFlex',_val);},
                'FlexGroup':function(_val){ return fastGetSet('boxFlexGroup',_val)},
                'Lines':function(_val){ return fastGetSet('boxLines',_val);},
                'OrdinalGroup':function(_val){ return fastGetSet('boxOrdinalGroup',_val);},
                'Orient':function(_val){ return fastGetSet('boxOrient',_val)},
                'Pack':function(_val){ return fastGetSet('boxPack',_val)},
                'Sizing':function(_val){ return fastGetSet('boxSizing',_val)},
                'Shadow':function(_val){ return (_val !== undefined ? fastGetSet('boxShadow',_val) : boxShadow()); },
                'api': _API
            };

            return $AdvancedAPI;

            function fastGetSet(_prop,_value){
                var $return = $AdvancedAPI;
                if(_value === '$' || _value === undefined){
                    $return = RawStyleGet(_styleObj,_prop);
                }
                else{
                    RawStyleSet(_styleObj,_API,_prop,_value);
                }
                return $return;
            }

        function boxShadow(_shadow){
            var $propertyAPI = {
                'Horizontal':function(_val){ return fastShadowGetSet('horizontal',_val); },
                'Vertical':function(_val){ return fastShadowGetSet('vertical',_val); },
                'H':function(_val){ return fastShadowGetSet('horizontal',_val);},
                'V':function(_val){ return fastShadowGetSet('vertical',_val);},
                'Blur':function(_val){ return fastShadowGetSet('blur',_val); },
                'Spread':function(_val){ return fastShadowGetSet('spread',_val); },
                'Color':function(_val){ return fastShadowGetSet('color',_val); },
                'Inset': function(_val){ return fastShadowGetSet('inset',(_val ? 'inset' : '')); },
                'Get':function(){ return getShadowValues(); },
                'Set':function(_val){ return setShadow(undefined,_val); },
                'api':_API
            };
            return $propertyAPI;

            function fastShadowGetSet(_param,_val){
                var $return = $propertyAPI;
                if(_val === "$" || _val === undefined){
                    $return = getShadow(_param);
                }
                else{
                    setShadow(_param,_val)
                }

                return $return;
            }

            function getShadow(_property){
                return (!_property ? _shadow : _shadow[_property]);
            }

            function setShadow(_property,_val){
                var props = ['horizontal','vertical','blur','spread','color','inset'];
                var shadow = getShadowValues();
                if(shadow[_property] !== _val){
                    if(!_property){
                        switch(KUBE.Is(_val)){
                            case 'array':
                                props.KUBE().each(function(_prop,_arrayIndex){
                                    (_val[_arrayIndex] !== undefined ? shadow[_prop] = _val[_arrayIndex] : undefined);
                                });
                                break;
                            case 'object':
                                props.KUBE().each(function(_prop){
                                    (_val[_prop] !== undefined ? shadows[_prop] = _val[_prop] : undefined);
                                });
                                break;
                            case 'string':
                                shadow = _val;
                                break;
                        }
                    }
                    else{
                        shadow[_property] = _val;
                    }
                    fastGetSet('boxShadow',objToString(shadow));
                }
                return (!_property ? _API : $propertyAPI);
            }
        }


        function getShadowValues(){
            var shadow, shadowString, initialParse, vals, color, result;
            initialParse = KUBE.Class('/Library/Drawing/Color')().ParseColor(fastGetSet('boxShadow'));
            shadowString = initialParse[0];

            result = /\[[^\]]*\]/.KUBE().matchAndReplace(shadowString);
            if(result[1].length){
                shadowString = result[0].trim();
                color = initialParse[1][result[1][0][0].KUBE().stripNonNumeric()];
            }

            vals = shadowString.trim().split(' ');
            vals.KUBE().each(function(_val){
                return Convert(_val.trim(),'px','int');
            },true);

            return {
                'horizontal': Convert(vals[0],'number','px'),
                'vertical': Convert(vals[1],'number','px'),
                'blur': Convert(vals[2],'number','px'),
                'spread': Convert(vals[3],'number','px'),
                'color':color,
                'inset': Convert(vals[4],'number','px')
            };
        }

        function normalizeObj(_obj){
            return {
                'horizontal': (_obj.horizontal !== undefined ? Convert(_obj.horizontal,'number','px') : Convert(0,'number','px')),
                'vertical': (_obj.vertical !== undefined ? Convert(_obj.vertical,'number','px') : Convert(0,'number','px')),
                'blur': (_obj.blur !== undefined ? Convert(_obj.blur,'number','px') : ''),
                'spread': (_obj.spread ? Convert(_obj.spread,'number','px') : ''),
                'color': (_obj.color ? _obj.color : ''),
                'inset': (_obj.inset ? 'inset' : '')
            };
        }

        function objToString(_obj){
            _obj = normalizeObj(_obj);
            var $return = '';
            $return = _obj.horizontal+' '+_obj.vertical;
            if(_obj.blur){
                $return = $return+' '+_obj.blur;
            }
            if(_obj.spread){
                $return = $return+' '+_obj.spread;
            }
            if(_obj.color){
                $return = $return+' '+_obj.color;
            }
            if(_obj.inset){
                $return = $return+' '+'inset';
            }
            return $return;
        }
    }
		
	function CaptionSideHandler(_styleObj,_API,_captionSide){
		var $return = _API;
		if(_captionSide === undefined || _captionSide === '$'){
			$return = RawStyleGet(_styleObj,'captionSide');
		}
		else{
			RawStyleSet(_styleObj,_API,'captionSide',_captionSide);
		}
		return $return;
	}	//CAPTION-SIDE:END
	
	function ClearHandler(_styleObj,_API,_val) {
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = RawStyleGet(_styleObj,'clear');
		}
		else{
			RawStyleSet(_styleObj,_API,'clear',''+_val);
		}
		return $return;
	}				//CLEAR:END
	
	function ClipHandler(_styleObj,_API,_clip){
		var $return = _API;
		if(_clip === undefined || _clip === '$'){
			//This is dumber than dumb. I'm ashamed I just wrote this, and double ashamed I'm leaving it. Plus I haven't even tested it...
			$return = RawStyleGet(_styleObj,'clip').KUBE().trimChar(['rect(',')']).split(',').KUBE().each(function(_v){ return Convert(_v,'px','number'); });
		}
		else{
			if(KUBE.Is(_clip) === 'array'){
				_clip = _clip.KUBE().joinCallback(function(_v){ return Convert(_v,'number','px'); },',');
			}
			RawStyleSet(_styleObj,_API,'clip',_clip);
		}
		return $return;
	}					//CLIP:END
	
	function ColorHandler(_styleObj,_API,_color){
		var $return = _API;
		if(_color === '$' || _color === undefined){
			$return = RawStyleGet(_styleObj,'color');
		}
		else{
			RawStyleSet(_styleObj,_API,'color', (_color === 'transparent' ? 'transparent' : KUBE.Class('/Library/Drawing/Color')().Format(_color,'rgb',true)));
		}
		return $return;
	}				//COLOR:END
	
	function ColumnHandler(_styleObj,_API,_arg){
		//TODO: This
	}
	
	function ContentHandler(_styleObj,_API,_content){
		var $return = _API;
		if(_content === undefined){
			$return = RawStyleGet(_styleObj,'content');
		}
		else{
			RawStyleSet(_styleObj,_API,'content',_content);
		}
		return $return;
	}			//CONTENT:END
	
	function CounterHandler(_styleObj,_API,_arg){
		//TODO: This
	}
	
	function CursorHandler(_styleObj,_API,_cursor){
		var $return = _API;
		if(_cursor === undefined || _cursor === '$'){
			$return = RawStyleGet(_styleObj,'cursor');
		}
		else{
			RawStyleSet(_styleObj,_API,'cursor',_cursor);
		}
		return $return;
	}				//CURSOR:END
	
	function DirectionHandler(_styleObj,_API,_direction){
		var $return = _API;
		if(_direction === undefined || _direction === '$'){
			$return = RawStyleGet(_styleObj,'direction');
		}
		else{
			RawStyleSet(_styleObj,_API,'direction',_direction);
		}
		return $return;
	}		//DIRECTION:END
	
	function DisplayHandler(_styleObj,_API,_display){
		var $return = _API;
		if(_display === undefined || _display === '$'){
			$return = RawStyleGet(_styleObj,'display');
		}
		else{
			RawStyleSet(_styleObj,_API,'display',_display);
		}
		return $return;
	}			//DISPLAY:END
	
	function EmptyCellsHandler(_styleObj,_API,_emptyCells){
		var $return = _API;
		if(_emptyCells === undefined || _emptyCells === '$'){
			$return = RawStyleGet(_styleObj,'emptyCells');
		}
		else{
			RawStyleSet(_styleObj,_API,'emptyCells',_emptyCells);
		}
		return $return;
	}		//EMPTY-CELLS:END
	
	function FloatHandler(_styleObj,_API,_float){
		var $return = _API;
		if(_float === '$' || _float === undefined){
			$return = RawStyleGet(_styleObj,'float');
		}
		else{
			RawStyleSet(_styleObj,_API,'float',''+_float);
		}
		return $return;
	}				//FLOAT:END
	
	function FontHandler(_styleObj,_API,_font){
		var $advancedAPI = {
			'Get':Get,
			'Set':Set,
			'Family':Family,
			'Size':Size,
            'Smoothing':Smoothing,
            'Style':Style,
			'Variant':Variant,
			'Weight':Weight,
			'api':_API
		};
		
		return (_font === undefined ? $advancedAPI : simpleHandler(_font));
		
		function Get(_array){
			return (_array ? [Style(),Variant(),Weight(),Size(),Family()] : simpleHandler('$'));
		}
		
		function Set(_font){
			if(KUBE.Is(_font) === 'array'){
				Style(_font[0]);
				Variant(_font[1]);
				Weight(_font[2]);
				Size(_font[3]);
				Family(_font[4]);
			}
			else{
				simpleHandler(_font);
			}
			return $advancedAPI;
		}
		
		function Family(_fontFamilies){
			var $return = $advancedAPI;
			if(_fontFamilies === undefined || _fontFamilies === '$'){
				$return = RawStyleGet(_styleObj,'fontFamily');
				if(_fontFamilies === undefined){
					$return = $return.split(',').KUBE().each(function(_font){
						return _font.KUBE().trimChar([' ',"'"]);
					});
				}
			}
			else{
				if(KUBE.Is(_fontFamilies) === 'array'){
                    _fontFamilies = _fontFamilies.KUBE().joinCallback(function(_family){
						return "'"+_family+"'";
					},',');
				}
				RawStyleSet(_styleObj,_API,'fontFamily',_fontFamilies);
			}
			return $return;
		}
		
		function Size(_size){
			var $return = $advancedAPI;
			if(_size === undefined || _size === '$'){
				$return = Convert(RawStyleGet(_styleObj,'fontSize'),'px','number');
			}
			else{
				RawStyleSet(_styleObj,_API,'fontSize',Convert(_size,'number','px'));
			}
			return $return;
		}
		
		function Style(_style){
			var $return = $advancedAPI;
			if(_style === undefined || _style === '$'){
				$return = RawStyleGet(_styleObj,'fontStyle');
			}
			else{
				RawStyleSet(_styleObj,_API,'fontStyle',_style);
			}
			return $return;
		}
		
		function Variant(_variant){
			var $return = $advancedAPI;
			if(_variant === undefined || _variant === '$'){
				$return = RawStyleGet(_styleObj,'fontVariant');
			}
			else{
				RawStyleSet(_styleObj,_API,'fontVariant',_variant);
			}
			return $return;
		}
		
		function Weight(_weight){
			var $return = $advancedAPI;
			if(_weight === undefined || _weight === '$'){
				$return = RawStyleGet(_styleObj,'fontWeight');
			}
			else{
				RawStyleSet(_styleObj,_API,'fontWeight',_weight);
			}
			return $return;
		}

        function Smoothing(_value){
            KUBE.console.log('warning: font smoothing is a non standard property. Not recommended for production.');
            var $return = $advancedAPI;
            if(_value === undefined || _value === '$'){
                $return = RawStyleGet(_styleObj,'fontSmoothing');
            }
            else{
                RawStyleSet(_styleObj,_API,'fontSmoothing',_value,true);
            }
            return $return;
        }
		
		function simpleHandler(_val){
			var $return = _API;
			if(_val === '$'){
				$return = RawStyleGet(_styleObj,'font');
			}
			else{
				RawStyleSet(_styleObj,_API,'font',_val);
			}
			return $return;
		}
	}					//FONT:END

	function HeightHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'height'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'height',Convert(_val,'number','px'));
		}
		return $return;
	}				//HEIGHT:END
	
	function LeftHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'left'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'left',Convert(_val,'number','px'));
		}		
		return $return;
	}					//LEFT:END
	
	function LetterSpacingHandler(_styleObj,_API,_letterSpacing){
		var $return = _API;
		if(_letterSpacing === undefined || _letterSpacing === '$'){
			$return = RawStyleGet(_styleObj,'letterSpacing');
		}
		else{
			RawStyleSet(_styleObj,_API,'letterSpacing',_letterSpacing);
		}
		return $return;
	} //LETTER-SPACING:END
	
	function LineHeightHandler(_styleObj,_API,_lineHeight){
		var $return = _API, lh;
		if(_lineHeight === '$' || _lineHeight === undefined){
			$return = RawStyleGet(_styleObj,'lineHeight');
		}
		else{
			switch(KUBE.Is(_lineHeight)){
				case "number":
					lh = Convert(_lineHeight,'number','px');
					break;
				default:
					lh = _lineHeight;
					break;
			}
			RawStyleSet(_styleObj,_API,'lineHeight',lh);
		}
		return $return;
	}		//LINE-HEIGHT:END
	
	function ListStyleHandler(_styleObj,_API,_arg){
		//TODO: THIS
	}
	
	function MarginHandler(_styleObj,_API,_margin){
		var $marginAPI = {
			'Get':Get,
			'Set':Set,
			'Top':Top,
			'Right':Right,
			'Bottom':Bottom,
			'Left':Left,
			'Center':Center,
			'api':_API
		};
		return (_margin === undefined ? $marginAPI : quickMarginHandler(_margin));
		
		function Get(){
			return quickMarginHandler();
		}
		
		function Set(_margin){
			quickMarginHandler(_margin);
			return $marginAPI;
		}
		
		function Top(_topMargin){
			var $return = $marginAPI;
			if(_topMargin === undefined || _topMargin === '$'){
				$return = Convert(RawStyleGet(_styleObj,'marginTop','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'marginTop',Convert(_topMargin,'number','px'));
			}
			return $return;
		}
		
		function Right(_rightMargin){
			var $return = $marginAPI;
			if(_rightMargin === undefined || _rightMargin === '$'){
				$return = Convert(RawStyleGet(_styleObj,'marginRight','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'marginRight',Convert(_rightMargin,'number','px'));
			}
			return $return;			
		}
		
		function Bottom(_bottomMargin){
			var $return = $marginAPI;
			if(_bottomMargin === undefined || _bottomMargin === '$'){
				$return = Convert(RawStyleGet(_styleObj,'marginBottom','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'marginBottom',Convert(_bottomMargin,'number','px'));
			}
			return $return;			
		}
		
		function Left(_leftMargin){
			var $return = $marginAPI;
			if(_leftMargin === undefined || _leftMargin === '$'){
				$return = Convert(RawStyleGet(_styleObj,'marginLeft','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'marginLeft',Convert(_leftMargin,'number','px'));
			}
			return $return;						
		}
		
		function Center(){
			Right('auto');
			Left('auto');
			return $marginAPI;
		}
		
		function quickMarginHandler(_val){
			var top,right,bottom,left,$return = _API;
			if(_val === '$'){
				$return = Convert(RawStyleGet(_styleObj,'margin'),'px','number');
			}
			else if(_val === undefined){
				top = Convert(RawStyleGet(_styleObj,'marginTop'),'px','number');
				right = Convert(RawStyleGet(_styleObj,'marginRight'),'px','number');
				bottom = Convert(RawStyleGet(_styleObj,'marginBottom'),'px','number');
				left = Convert(RawStyleGet(_styleObj,'marginLeft'),'px','number');
				$return = {
                    0:top,
                    1:right,
                    2:bottom,
                    3:left,
                    'top':top,
                    'right':right,
                    'bottom':bottom,
                    'left':left
                };
			}
			else{
				switch(KUBE.Is(_val)){
					case 'array':
                        if(_val.length === 1){
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginTop',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginRight',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginBottom',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginLeft',Convert(_val[0],'number','px')) : false);
                        }
                        else if(_val.length === 2){
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginTop',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginRight',Convert(_val[1],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginBottom',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginLeft',Convert(_val[1],'number','px')) : false);
                        }
                        else if(_val.length === 3){
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginTop',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginRight',Convert(_val[1],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginBottom',Convert(_val[2],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginLeft',Convert(_val[1],'number','px')) : false);
                        }
                        else{
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'marginTop',Convert(_val[0],'number','px')) : false);
                            (_val[1] !== undefined ? RawStyleSet(_styleObj,_API,'marginRight',Convert(_val[1],'number','px')) : false);
                            (_val[2] !== undefined ? RawStyleSet(_styleObj,_API,'marginBottom',Convert(_val[2],'number','px')) : false);
                            (_val[3] !== undefined ? RawStyleSet(_styleObj,_API,'marginLeft',Convert(_val[3],'number','px')) : false);
                        }
						break;
						
					case 'object':
						(_val.top !== undefined ? RawStyleSet(_styleObj,_API,'marginTop',Convert(_val.top,'number','px')) : false);
						(_val.right !== undefined ? RawStyleSet(_styleObj,_API,'marginRight',Convert(_val.right,'number','px')) : false);
						(_val.bottom !== undefined ? RawStyleSet(_styleObj,_API,'marginBottom',Convert(_val.bottom,'number','px')) : false);
						(_val.left !== undefined ? RawStyleSet(_styleObj,_API,'marginLeft',Convert(_val.left,'number','px')) : false);
						break;
						
					case 'string': case 'number':
						RawStyleSet(_styleObj,_API,'margin',Convert(_val,'number','px'));
						break;
				}
			}
			return $return;
		}
		
	}				//MARGIN:END
	
	function MinHeightHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'minHeight'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'minHeight',Convert(_val,'number','px'));
		}
		return $return;
	}				//MIN-HEIGHT:END
	
	function MinWidthHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'minWidth'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'minWidth',Convert(_val,'number','px'));
		}
		return $return;
	}				//MIN-WIDTH:END

    function MaxHeightHandler(_styleObj,_API,_val){
        var $return = _API;
        if(_val === '$' || _val === undefined){
            $return = Convert(RawStyleGet(_styleObj,'maxHeight'),'px','number');
        }
        else{
            RawStyleSet(_styleObj,_API,'maxHeight',Convert(_val,'number','px'));
        }
        return $return;
    }				//MAX-HEIGHT:END

    function MaxWidthHandler(_styleObj,_API,_val){
        var $return = _API;
        if(_val === '$' || _val === undefined){
            $return = Convert(RawStyleGet(_styleObj,'maxWidth'),'px','number');
        }
        else{
            RawStyleSet(_styleObj,_API,'maxWidth',Convert(_val,'number','px'));
        }
        return $return;
    }				//MAX-WIDTH:END

	
	function OpacityHandler(_styleObj,_API,_opacity){
		var $return = _API;
		if(_opacity === undefined || _opacity === '$'){
			$return = parseFloat(RawStyleGet(_styleObj,'opacity')) || 1;
		}
		else{
			RawStyleSet(_styleObj,_API,'opacity',String(_opacity));			
		}
		return $return;
	}			//OPACITY:END
	
	function OutlineHandler(_styleObj,_API,_outline){
		var $advancedAPI;

        $advancedAPI = {
            "Width": function(_width){ return fastGetSet('outlineWidth',_width)},
            "Style": function(_style){ return fastGetSet('outlineStyle',_style)},
            "Color": function(_color){ return fastGetSet('outlineColor', _color)},
            "Offset": function(_offset){ return fastGetSet('outlineOffset',_offset)},
            "api": _API
        };

        return (_outline === undefined ? $advancedAPI : fastGetSet('outline',_outline));

        function fastGetSet(_param, _value){
            var $return = $advancedAPI;
            if(_value === undefined){
                $return = RawStyleGet(_styleObj,_param);
            }
            else{
                RawStyleSet(_styleObj,_API,_param,_value);
            }
            return $return;
        }

	}
	
	function OverflowHandler(_styleObj,_API,_overflow){
		var $advancedAPI = { 'X':X,'Y':Y,'Get':Get,'Set':Set,'api':_API };
		return (_overflow === undefined ? $advancedAPI : simpleHandling(_overflow));
		
		//Set X
		function X(_x){
			var $return = $advancedAPI;
			if(_x === undefined){
				$return = RawStyleGet(_styleObj,'overflowX');
			}
			else{
				RawStyleSet(_styleObj,_API,'overflowX',_x);
			}
			return $return;
		}
		
		//Set Y
		function Y(_y){
			var $return = $advancedAPI;
			if(_y === undefined){
				$return = RawStyleGet(_styleObj,'overflowY');
			}
			else{
				RawStyleSet(_styleObj,_API,'overflowY',_y);
			}
            return $return;
		}
		
		function Get(_array){
			return (_array ? [X(),Y()] : simpleHandling('$'));
		}
		
		function Set(_x,_y){
			if(KUBE.Is(_x) === 'array'){
				simpleHandling(_x);
			}
			else{
				X(_x);
				Y(_y);
			}
			return $advancedAPI;
		}
		
		function simpleHandling(_val){
			var $return = _API;
			if(_val === '$'){
				$return = RawStyleGet(_styleObj,'overflow');
			}
			else{
				if(KUBE.Is(_val) === 'array'){
					X(_val[0]);
					Y(_val[1]);
				}
				else{
					RawStyleSet(_styleObj,_API,'overflow',_val);
				}
			}
			return $return;
		}
	}			//OVERFLOW:END
	
	function PaddingHandler(_styleObj,_API,_padding){
		var $paddingAPI = {
			'Get':Get,
			'Set':Set,
			'Top':Top,
			'Right':Right,
			'Bottom':Bottom,
			'Left':Left,
			'api':_API
		};
		return (_padding === undefined ? $paddingAPI : quickPaddingHandler(_padding));
		
		function Get(){
			return quickPaddingHandler();
		}
		
		function Set(_padding){
			quickPaddingHandler(_padding);
			return $paddingAPI;
		}
		
		function Top(_topPadding){
			var $return = $paddingAPI;
			if(_topPadding === undefined || _topPadding === '$'){
				$return = Convert(RawStyleGet(_styleObj,'paddingTop','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'paddingTop',Convert(_topPadding,'number','px'));
			}
			return $return;
		}
		
		function Right(_rightPadding){
			var $return = $paddingAPI;
			if(_rightPadding === undefined || _rightPadding === '$'){
				$return = Convert(RawStyleGet(_styleObj,'paddingRight','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'paddingRight',Convert(_rightPadding,'number','px'));
			}
			return $return;			
		}
		
		function Bottom(_bottomPadding){
			var $return = $paddingAPI;
			if(_bottomPadding === undefined || _bottomPadding === '$'){
				$return = Convert(RawStyleGet(_styleObj,'paddingBottom','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'paddingBottom',Convert(_bottomPadding,'number','px'));
			}
			return $return;			
		}
		
		function Left(_leftPadding){
			var $return = $paddingAPI;
			if(_leftPadding === undefined || _leftPadding === '$'){
				$return = Convert(RawStyleGet(_styleObj,'paddingLeft','px','number'));
			}
			else{
				RawStyleSet(_styleObj,_API,'paddingLeft',Convert(_leftPadding,'number','px'));
			}
			return $return;						
		}
		
		function quickPaddingHandler(_val){
			var top,right,bottom,left,$return = _API;
			if(_val === '$'){
				$return = Convert(RawStyleGet(_styleObj,'padding'),'px','number');
			}
			else if(_val === undefined){
				top = Convert(RawStyleGet(_styleObj,'paddingTop'),'px','number');
				right = Convert(RawStyleGet(_styleObj,'paddingRight'),'px','number');
				bottom = Convert(RawStyleGet(_styleObj),'paddingBottom','px','number');
				left = Convert(RawStyleGet(_styleObj),'paddingLeft','px','number');
				$return = { 0:top,1:right,2:bottom,3:left,'top':top,'right':right,'bottom':bottom,'left':left };
			}
			else{
				switch(KUBE.Is(_val)){
					case 'array':
                        if(_val.length === 1){
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingTop',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingRight',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingBottom',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingLeft',Convert(_val[0],'number','px')) : false);
                        }
                        else if(_val.length === 2){
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingTop',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingRight',Convert(_val[1],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingBottom',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingLeft',Convert(_val[1],'number','px')) : false);
                        }
                        else if(_val.length === 3){
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingTop',Convert(_val[0],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingRight',Convert(_val[1],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingBottom',Convert(_val[2],'number','px')) : false);
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingLeft',Convert(_val[1],'number','px')) : false);
                        }
                        else{
                            (_val[0] !== undefined ? RawStyleSet(_styleObj,_API,'paddingTop',Convert(_val[0],'number','px')) : false);
                            (_val[1] !== undefined ? RawStyleSet(_styleObj,_API,'paddingRight',Convert(_val[1],'number','px')) : false);
                            (_val[2] !== undefined ? RawStyleSet(_styleObj,_API,'paddingBottom',Convert(_val[2],'number','px')) : false);
                            (_val[3] !== undefined ? RawStyleSet(_styleObj,_API,'paddingLeft',Convert(_val[3],'number','px')) : false);
                        }
						break;
						
					case 'object':
						(_val.top !== undefined ? RawStyleSet(_styleObj,_API,'paddingTop',Convert(_val.top,'number','px')) : false);
						(_val.right !== undefined ? RawStyleSet(_styleObj,_API,'paddingRight',Convert(_val.right,'number','px')) : false);
						(_val.bottom !== undefined ? RawStyleSet(_styleObj,_API,'paddingBottom',Convert(_val.bottom,'number','px')) : false);
						(_val.left !== undefined ? RawStyleSet(_styleObj,_API,'paddingLeft',Convert(_val.left,'number','px')) : false);
						break;
						
					case 'string': case 'number':
						RawStyleSet(_styleObj,_API,'padding',Convert(_val,'number','px'));
						break;
				}
			}
			return $return;
		}		
	}			//PADDING:END
		
	function PositionHandler(_styleObj,_API,_position){
		var $return = _API;
		if(_position === undefined || _position === '$'){
			$return = RawStyleGet(_styleObj,'position');
		}
		else{
			RawStyleSet(_styleObj,_API,'position',_position);
		}
		return $return;
	}			//POSITION:END
		
	function ResizeHandler(_styleObj,_API,_resize){
		var $return = _API;
		if(_resize === undefined || _resize === '$'){
			$return = RawStyleGet(_styleObj,'resize');
		}
		else{
			RawStyleSet(_styleObj,_API,'resize',_resize);
		}
		return $return;
	}				//RESIZE:END
	
	function RightHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'right'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'right',Convert(_val,'number','px'));
		}		
		return $return;		
	}					//RIGHT:END
	
	function TableLayoutHandler(_styleObj,_API,_tableLayout){
		var $return = _API;
		if(_tableLayout === undefined || _tableLayout === '$'){
			$return = RawStyleGet(_styleObj,'tableLayout');
		}
		else{
			RawStyleSet(_styleObj,_API,'tableLayout',_tableLayout);
		}
		return $return;
	}	//TABLE-LAYOUT:END
	
	function TextHandler(_styleObj,_API){
		var $AdvancedAPI = {
			'Align': Align,
			'Decoration':Decoration,
			'Indent':Indent,
			'Overflow':Overflow,
			'Shadow':Shadow,
			'Transform':Transform,
			'api':_API
		};

		return $AdvancedAPI; //New Stylejack is awesome. :)

		function Align(_val){
			var $return = $AdvancedAPI;
			if(_val === '$' || _val === undefined){
				$return = RawStyleGet(_styleObj,'textAlign');
			}
			else{
				RawStyleSet(_styleObj,_API,'textAlign',_val);
			}
			return $return;
		}

		function Decoration(_val){
			var $return = $AdvancedAPI;
			if(_val === '$' || _value === undefined){
				$return = RawStyleGet(_styleObj,'textDecoration');
			}
			else{
				RawStyleSet(_styleObj,_API,'textDecoration',_value);
			}
			return $return;
		}
		function Indent(_val){
			var $return = $AdvancedAPI;
			if(_val === '$' || _val === undefined){
				$return = RawStyleGet(_styleObj,'textIndent');
			}
			else{
				RawStyleSet(_styleObj,_API,'textIndent',_val);
			}
			return $return;
		}
		function Overflow(_val){
			var $return = $AdvancedAPI;
			if(_val === '$' || _val === undefined){
				$return = RawStyleGet(_styleObj,'textOverflow');
			}
			else{
				RawStyleSet(_styleObj,_API,'textOverflow',_val);
			}
			return $return;
		}

        function Transform(_val){
            var $return = $AdvancedAPI;
            if(_val === '$' || _val === undefined){
                $return = RawStyleGet(_styleObj,'textTransform');
            }
            else{
                RawStyleSet(_styleObj,_API,'textTransform',_val);
            }
            return $return;
        }

		function Shadow(_val){

			return (_val === undefined ? shadowAPI() : fastShadow(_val));

			function fastShadow(_value){
				var $return = $AdvancedAPI;
				if(_val === '$' || _value === undefined){
					$return = RawStyleGet(_styleObj,'textShadow');
				}
				else{
					RawStyleSet(_styleObj,_API,'textShadow',_value);
				}
				return $return;
			}

			function shadowAPI(_shadow){
				var $propertyAPI = {
					'Horizontal':function(_val){ return fastGetSet('horizontal',_val); },
					'Vertical':function(_val){ return fastGetSet('vertical',_val); },
					'H':function(_val){ return fastGetSet('horizontal',_val);},
					'V':function(_val){ return fastGetSet('vertical',_val);},
					'Blur':function(_val){ return fastGetSet('blur',_val); },
					'Color':function(_val){ return fastGetSet('color',_val); },
					'Get':function(){ return getShadow(); },
					'Set':function(_val){ return setShadow(undefined,_val); },
					'api':_API
				};
				return $propertyAPI;

				function fastGetSet(_param,_val){
					var $return = $propertyAPI;
					if(_val === "$" || _val === undefined){
						$return = getShadow(_param);
					}
					else{
						setShadow(_param,_val)
					}

					return $return;
				}

				function getShadow(_property){
					return (!_property ? _shadow : _shadow[_property]);
				}

				function setShadow(_property,_val){
					var shadow = getShadowValues();
                    if(shadow[_property] !== _val){
                        if(!_property){
                            switch(KUBE.Is(_val)){
                                case "array":
                                    shadow = arrayToObj(_val);
                                    break;
                                case "object":
                                    if(_val.horizontal !== undefined){ shadow.horizontal = _val.horizontal; }
                                    if(_val.vertical !== undefined){ shadow.vertical = _val.vertical; }
                                    if(_val.blur !== undefined){ shadow.blur = _val.blur; }
                                    if(_val.color !== undefined){ shadow.color = _val.color; }
                                    break;
                            }
                        }
                        else{
                            shadow[_property] = _val;
                        }
                    }
                    fastShadow(objToString(shadow));
                }
                return (!_property ? _API : $propertyAPI);
			}


			function getShadowValues(){
				var shadow, shadowString, initialParse, vals, color, result;
                initialParse = KUBE.Class('/Library/Drawing/Color')().ParseColor(fastShadow());
				shadowString = initialParse[0];

                result = /\[[^\]]*\]/.KUBE().matchAndReplace(shadowString);
                if(result[1].length){
                    shadowString = result[0].trim();
                    color = initialParse[1][result[1][0][0].KUBE().stripNonNumeric()];
                }

                vals = shadowString.trim().split(' ');
                vals.KUBE().each(function(_val){
                    return Convert(_val.trim(),'px','int');
                },true);

                shadow = {'horizontal':vals[0],'vertical':vals[1],'blur':vals[2], 'color':color };
				return shadow;
			}

			function arrayToObj(_array){
				return {
					'horizontal': _array[0],
					'vertical': _array[1],
					'blur': _array[2],
					'color': _array[3]
				};
			}

			function normalizeObj(_obj){
				return {
					'horizontal': (_obj.horizontal !== undefined ? Convert(_obj.horizontal,'number','px') : Convert(0,'number','px')),
					'vertical': (_obj.vertical !== undefined ? Convert(_obj.vertical,'number','px') : Convert(0,'number','px')),
					'blur': (_obj.blur !== undefined ? Convert(_obj.blur,'number','px') : ''),
					'color': (_obj.color ? _obj.color : '')
				};
			}

			function objToString(_obj){
                var $return;
                _obj = normalizeObj(_obj);
				$return = _obj.horizontal+' '+_obj.vertical;
				if(_obj.blur){
					$return = $return+' '+_obj.blur;
				}
				if(_obj.color){
					$return = $return+' '+_obj.color;
				}
				return $return;
			}

		}

	}						//TEXT:END
	
	function TopHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'top'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'top',Convert(_val,'number','px'));
		}		
		return $return;		
	}					//TOP:END
	
	function TransformHandler(_styleObj,_API){
		var $transformAPI = {
			'Matrix':Matrix,
			'Translate':Translate,
			'TranslateX':TranslateX,
			'TranslateY':TranslateY,
			'Scale':Scale,
			'ScaleX':ScaleX,
			'ScaleY':ScaleY,
			'Rotate':Rotate,
			'Skew':Skew,
			'SkewX':SkewX,
			'SkewY':SkewY,
			'api':_API
		};
		return $transformAPI;
		
		function Matrix(_matrix){
			var $return = $transformAPI,
				tObj = getTransform(),
				mArray = tObj.matrix || [1,0,0,1,0,0];
		
			if(_matrix === undefined || _matrix === '$'){
				$return = mArray;
			}
			else{
				if(KUBE.Is(_matrix) === 'array'){
					_matrix.KUBE().each(function(_v,_index){
						mArray[_index] = (_v !== undefined ? _v : mArray[_index]);
					});
					tObj.matrix = mArray;
					setTransform(tObj);
				}
			}
			return $return;
		}
		
		function Translate(_translate){
			var $return = $transformAPI,
				mArray = Matrix();
		
			if(_translate === undefined || _translate === '$'){
				$return = [mArray[4],mArray[5]];
			}
			else{
				if(KUBE.Is(_translate) === 'array'){
					mArray[4] = (_translate[0] !== undefined ? _translate[0] : mArray[4]);
					mArray[5] = (_translate[1] !== undefined ? _translate[1] : mArray[5]);
					$return = Matrix(mArray);
				}
			}
			return $return;
		}
		
		function TranslateX(_x){
			var $return = $transformAPI,
				mArray = Matrix();
			if(_x === undefined || _x === '$'){
				$return = mArray[4];
			}
			else{
				$return = Translate([_x,mArray[5]]);
			}
			return $return;
		}
		
		function TranslateY(_y){
			var $return = $transformAPI,
				mArray = Matrix();
			if(_y === undefined || _y === '$'){
				$return = mArray[5];
			}
			else{
				$return = Translate([mArray[4],_y]);
			}
			return $return;
		}
		
		function Scale(_scale){
			var tObj = getTransform(),
				scaleArray = tObj.scale || [0,0],
				$return = $transformAPI;
		
			if(_scale === undefined || _scale === '$'){
				$return = scaleArray;
			}
			else{
				if(KUBE.Is(_scale) === 'array'){
					_scale.KUBE().each(function(_v,_index){
						scaleArray[_index] = (_v !== undefined ? _v : 0.0);
					});
					tObj.scale = scaleArray;
					setTransform(tObj);
				}
			}
			return $return;
		}
		
		function ScaleX(_x){
			var scaleArray,$return = $transformAPI;
			if(_x === undefined || _x === '$'){
				$return = Scale()[0];
			}
			else{
				scaleArray = Scale();
				scaleArray[0] = _x;
				Scale(scaleArray);
			}
			return $return;
		}
		
		function ScaleY(_y){
			var scaleArray,$return = $transformAPI;
			if(_y === undefined || _y === '$'){
				$return = Scale()[1];
			}
			else{
				scaleArray = Scale();
				scaleArray[1] = _y;
				Scale(scaleArray);
			}
			return $return;			
		}
		
		function Rotate(_rotate){
			var $return = $transformAPI,
				tObj = getTransform();
		
			if(_rotate === undefined || _rotate === '$'){
				$return = tObj.rotate || 0;
			}
			else{
				tObj.rotate = Convert(_rotate,'number','deg');
				setTransform(tObj);
			}
			return $return;
		}
		
		function Skew(_skew){
			var $return = $transformAPI,
				tObj = getTransform(),
				skewArray = tObj.skew || [0,0];
		
			if(_skew === undefined || _skew === '$'){
				$return = skewArray;
			}
			else{
				if(KUBE.Is(_skew) === 'array'){
					_skew.KUBE().each(function(_v,_index){
						skewArray[_index] = (_v !== undefined ? _v : skewArray[_index]);
					});
					tObj.skew = skewArray;
					setTransform(tObj);
				}
			}
			return $return;
		}
		
		function SkewX(_x){
			var skewArray,$return = $transformAPI;
			if($return === undefined || $return === '$'){
				$return = Skew()[0];
			}
			else{
				skewArray = Skew();
				skewArray[0] = _x;
				Skew(skewArray);
			}
			return $return;
		}
		
		function SkewY(_y){
			var skewArray,$return = $transformAPI;
			if($return === undefined || $return === '$'){
				$return = Skew()[1];
			}
			else{
				skewArray = Skew();
				skewArray[1] = _y;
				Skew(skewArray);
			}
			return $return;
		}
		
			
		function getTransform(){
			return parseTransform(RawStyleGet(_styleObj,'transform'));
		}

		function parseTransform(_transformString){
			var transformSplit,regX,$transformObj = {};
			regX = /([^\(]*)\(([^\)]*)\)/;
			transformSplit = regX.KUBE().matchAll(_transformString);
			transformSplit.KUBE().each(function(_transformArray,_index){
				var tName,tVals;
				tName = _transformArray[1].KUBE().trim();
				tVals = parseTransformValues(_transformArray[2]);
				$transformObj[tName] = tVals;
			});
			return (_transformString === 'none' || _transformString === undefined ? {'matrix':[1,0,0,1,0,0]} : $transformObj);
		}

		function parseTransformValues(_valString){
			var split,$return = [];
			split = _valString.split(',');
			split.KUBE().each(function(_val){
				var parsedVal = Convert(_val.KUBE().trim(),'','number');
				if(split.length > 1){
					$return.push(parsedVal);
				}
				else{
					$return = parsedVal;
				}
			});
			return $return;
		}		
		
		function setTransform(_transformObj){
			var transformString = '';
			if(KUBE.Is(_transformObj) === 'object'){
				_transformObj.KUBE().each(function(_key,_val){
					var vals;
					switch(_key){
						//case 'translate': vals = _val.KUBE().joinCallback(function(_tVal){ return intPx(_tVal); }); break;
						case 'scale': vals = _val.join(',');
						case 'rotate': vals = Convert(_val,'number','deg'); break;
						case 'skew': vals = _val.KUBE().joinCallback(function(_tVal){ return Convert(_tVal,'number','deg'); }); break;
						case 'matrix': vals = _val.join(','); break;
					}
					transformString = transformString+_key+'('+vals+') ';
				});
			}
			else{
				transformString = 'none';
			}
			RawStyleSet(_styleObj,_API,'transform',transformString,true);
			return $transformAPI;
		}		
	}					//TRANSFORM:END
	
	function TransitionHandler(_styleObj,_API,_transition){
		var $transitionAPI = {
			'Get':Get,
			'Set':Set,
			'Property':Property,
			'Duration':Duration,
			'Timing':Timing,
			'Delay':Delay,
			'api':_API
		};
		return (_transition === undefined ? $transitionAPI : simpleTransitionHandler(_transition));
		
		function Get(){
			return simpleTransitionHandler();
		}
		
		function Set(_transition){
			return simpleTransitionHandler(_transition);
		}
		
		function Property(_property){
			var $return = $transitionAPI;
			if(_property === undefined || _property === '$'){
				$return = RawStyleGet(_styleObj,'transitionProperty');
			}
			else{
				RawStyleSet(_styleObj,_API,'transitionProperty',_property);
			}
			return $return;			
		}
		
		function Duration(_duration){
			var $return = $transitionAPI;
			if(_duration === undefined || _duration === '$'){
				$return = Convert(RawStyleGet(_styleObj,'transitionDuration'),'ms','number');
			}
			else{
				RawStyleSet(_styleObj,_API,'transitionDuration',Convert(_duration,'number','ms'));
			}
			return $return;						
		}
		
		function Timing(_timing){
			var $return = $transitionAPI;
			if(_timing === undefined || _timing === '$'){
				$return = RawStyleGet(_styleObj,'transitionTiming');
			}
			else{
				RawStyleSet(_styleObj,_API,'transitionTiming',_timing);
			}
			return $return;
		}
		
		function Delay(_delay){
			var $return = $transitionAPI;
			if(_delay === undefined || _delay === '$'){
				$return = Convert(RawStyleGet(_styleObj,'transitionDelay'),'ms','number');
			}
			else{
				RawStyleSet(_styleObj,_API,'transitionDelay',Convert(_delay,'number','ms'));
			}
			return $return;			
		}
		
		function simpleTransitionHandler(_transition){
			var property,duration,timing,delay,$return = $transitionAPI;
			if(_transition === '$'){
				$return = RawStyleGet(_styleObj,'transition');
			}
			else if(_transition === undefined){
				property = Property();
				duration = Duration();
				timing = Timing();
				delay = Delay();
				
				$return = {
					0:property,1:duration,2:timing,3:delay,
					'property':property,
					'duration':duration,
					'timing':timing,
					'delay':delay
				};
			}
			else{
				switch(KUBE.Is(_transition)){
					case 'array':
						(_transition[0] !== undefined ? Property(_transition[0]) : false);
						(_transition[1] !== undefined ? Duration(_transition[1]) : false);
						(_transition[2] !== undefined ? Timing(_transition[2]) : false);
						(_transition[3] !== undefined ? Delay(_transition[3]) : false);
						break;
						
					case 'object':
						(_transition.property !== undefined ? Property(_transition.property) : false);
						(_transition.duration !== undefined ? Duration(_transition.duration) : false);
						(_transition.timing !== undefined ? Timing(_transition.timing) : false);
						(_transition.delay !== undefined ? Delay(_transition.delay) : false);						
						break;
						
					case 'string':
						RawStyleSet(_styleObj,_API,'transition',_transition);
						break;
				}
			}
			return $return;
		}
		
	}		//TRANSITION:END

    function UserSelectHandler(_styleObj,_API,_val){
        var $return = _API;
        if(_val === '$' || _val === undefined){
            $return = RawStyleGet(_styleObj,'userSelect',true);
        }
        else{
            RawStyleSet(_styleObj,_API,'userSelect',_val,true);
        }
        return $return;
    }

	function VerticalAlignHandler(_styleObj,_API,_vAlign){
		var $return = _API;
		if(_vAlign === undefined || _vAlign === '$'){
			$return = RawStyleGet(_styleObj,'verticalAlign');
		}
		else{
			RawStyleSet(_styleObj,_API,'verticalAlign',_vAlign);
		}
		return $return;
	}		//VERTICAL ALIGN:END
	
	function VisibilityHandler(_styleObj,_API,_visibility){
		var $return = _API;
		if(_visibility === undefined || _visibility === '$'){
			$return = RawStyleGet(_styleObj,'visibility');
		}
		else{
			RawStyleSet(_styleObj,_API,'visibility',_visibility);
		}
		return $return;
	}		//VISIBILITY:END
	
	function WidthHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'width'),'px','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'width',Convert(_val,'number','px'));
		}
		return $return;
	}					//WIDTH:END
	
	function WhitespaceHandler(_styleObj,_API,_whitespace){
		var $return = _API;
		if(_whitespace === undefined || _whitespace === '$'){
			$return = RawStyleGet(_styleObj,'whiteSpace');
		}
		else{
			RawStyleSet(_styleObj,_API,'whiteSpace',_whitespace);
		}
		return $return;
	}		//WHITE-SPACE:END
	
	function WordSpacingHandler(_styleObj,_API,_wordSpacing){
		var $return = _API;
		if(_wordSpacing === undefined || _wordSpacing === '$'){
			$return = RawStyleGet(_styleObj,'wordSpacing');
		}
		else{
			RawStyleSet(_styleObj,_API,'wordSpacing',_wordSpacing);
		}
		return $return;		
	}	//WORD-SPACE:END
	
	function WordBreakHandler(_styleObj,_API,_wordBreak){
		var $return = _API;
		if(_wordBreak === undefined || _wordBreak === '$'){
			$return = RawStyleGet(_styleObj,'wordBreak');
		}
		else{
			RawStyleSet(_styleObj,_API,'wordBreak',_wordBreak);
		}
		return $return;				
	}		//WORD-BREAK:END
	
	function WordWrapHandler(_styleObj,_API,_wordWrap){
		var $return = _API;
		if(_wordWrap === undefined || _wordWrap === '$'){
			$return = RawStyleGet(_styleObj,'wordWrap');
		}
		else{
			RawStyleSet(_styleObj,_API,'wordWrap',_wordWrap);
		}
		return $return;			
	}			//WORD-WRAP:END
	
	function ZIndexHandler(_styleObj,_API,_val){
		var $return = _API;
		if(_val === '$' || _val === undefined){
			$return = Convert(RawStyleGet(_styleObj,'zIndex'),'string','number');
		}
		else{
			RawStyleSet(_styleObj,_API,'zIndex',''+_val);
		}
		return $return;
	}				//ZINDEX:END


	
	/***********************************************************************************************
	 *  These are our low level handlers. All functionality essentially funnels towards these.
	 *  They do not have the responsibility for individual StyleObjects, properties, whatever.
	 *  They just want to take a valid Native Object and be able to handle it appropriately
	 ***********************************************************************************************/
	function RawStyleSet(_styleObj,_API,_property, _newSet, _prefix){
		var preProp,current,$return = false; //Return true on success. Leave individual methods with responsibilty of returning the API, or a subAPI.
		_prefix = _prefix || false;
		
		current = _styleObj.style[_property];
		if(current !== _newSet){
			try{
				_styleObj.style[_property] = _newSet;
				if(_styleObj.style[_property] === current){
                    //This is a weird state. It happens sometimes because StyleSheets are a bit insane
				}
				else{
                    _API.Emit('change',{'property':_property,'oldValue':current,'newValue':_newSet});
                    _API.Emit('change:'+_property.toLowerCase(),{'property':_property,'oldValue':current,'newValue':_newSet});
					$return = true;
				}
			}
			catch(E){
				//I actually errored. Why.
				debugger;
				throw E;
			}
		}
		
		if(_prefix){
			//Get the prefixed property and set it as well
			preProp = prefix.KUBE().ucFirst()+_property.KUBE().ucFirst();
			_styleObj.style[preProp] = _newSet;
		}
		if($return){
			//Emit an event, which actually insanely allows people to listen for changes on CSSRules...
			_API.Emit(_property.toLowerCase(),_newSet,current,_prefix);
		}
		return $return;
	}
	
	function RawStyleGet(_styleObj,_property,_prefix){
		_prefix = _prefix || false;
		var $return = _styleObj.style[_property];
		if($return === 'inherit' && _styleObj.parentNode instanceof HTMLElement){
			$return = RawStyleGet(_styleObj.parentNode,_property,_prefix);
		}
		return $return;
	}
}(KUBE));
