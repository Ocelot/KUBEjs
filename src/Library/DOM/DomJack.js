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

    //Remove Animate from this, will be removing animations from it entirely as they don't belong here
    var dependancyArray = [
        '/Library/DOM/WinDocJack',
        '/Library/DOM/StyleJack',
        '/Library/DOM/FeatureDetect',
        '/Library/Tools/Convert',
        '/Library/Extend/Array',
        '/Library/Extend/Object',
        '/Library/Extend/RegExp'
    ];

	KUBE.LoadFactory('/Library/DOM/DomJack', DomJack,dependancyArray);
	
	//These are global cache variables
	var KUBENodeId,jackCache,cleanPointer,wordToKeyCodeMap,scheduleClean,cleanupCache,nodeInsertedStyleInit;
	
	KUBENodeId = 0;			//Current KUBE Node ID
	jackCache = {};			//Our cache
	jackCache.length = 0;	//Start our cache length
	cleanupCache = [];
	scheduleClean = false;
	nodeInsertedStyleInit = false;
	wordToKeyCodeMap = {
		'backspace':8,
		'tab':9,
		'enter':13,
		'shift':16,
		'ctrl':17,
		'alt':18,
        'left':37,
        'up':38,
        'right':39,
        'down':40
	};
	
	function cleanCache(){
		KUBE.console.log('clean cache fired');
		var offset,id,i,slice,slices = [];
		offset = 0;
		slice = [undefined,0];
		for(i=0;i<cleanupCache.length;i++){
			id = cleanupCache[i];
			if(jackCache[id] && !jackCache[id].GetNode().KUBEDJ.save){
				deleteDJ(id);
				if(slice[0] === undefined){
					slice[0] = i;
					slice[1]++;
				}
			}
			else{
				if(slice[0] !== undefined){
					slices.push(slice);
					slice = [undefined,0];
				}
			}
		}
		
		for(i=0;i<slices.length;i++){
			cleanupCache.splice(slices[0]-offset,slices[1]);
			offset = offset+slices[1];
		}
		scheduleClean = false;
	}
	
	function deleteDJ(id){
		jackCache[id].Emit('cleanup',id);
		jackCache[id].Clear();
		jackCache[id].destroy();
		jackCache[id] = undefined;
		delete jackCache[id];
		jackCache.length--;		
	}
	
	function memDebug(_output){
		var detached = {};
		jackCache.KUBE().each(function(_id,_dj){
			if(KUBE.Is(_dj) === 'object' && _dj.GetNode().KUBEDJ.save && _dj.IsDetached()){
				if(_output){
					KUBE.console.log(_id,_dj.GetRoot().GetInner());
				}
				else{
					detached[_id] = _dj;
				}
			}
		});
		return detached;
	}
	
	function cacheCount(){
		return jackCache.KUBE().count();
	}
	
	function handleClean(){
		if(!scheduleClean){
			scheduleClean = true;
			requestAnimationFrame(cleanCache);
		}
	}

	DomJack.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	// Primary class declaration
	function DomJack(initNode){
		var FeatureDetect,SJ,DJ,Events,Node,nodeType,StyleJack,domListeners,id,mapId,rawAPI,$DomJackAPI = {},animationAPI,prefix,keyListener,keyStore,keyComboTriggered,keyF;

        DJ = KUBE.Class('/Library/DOM/DomJack');
        SJ = KUBE.Class('/Library/DOM/StyleJack');
        FeatureDetect = KUBE.Class('/Library/DOM/FeatureDetect');

		if(!nodeInsertedStyleInit){
			nodeInsertedStyleInit = true;
			(function(){
				var S = SJ('@keyframes nodeInserted');
				S.From().Text().Indent(1);
				S.To().Text().Indent(0);
			}());

		}

		domListeners = {};
		keyListener = false;
		keyStore = {};
		keyComboTriggered = false;
		keyF = {};
		rawAPI = {
			'dumpCache': function(){ return jackCache; },
			'memDebug': memDebug,
			'cacheCount': cacheCount,
			'destroy':destroy,
			
			//Special
			'UpdateAPI':UpdateAPI,				//Utility: Mutates the contextAPI, with additional methods appropriate to Node type
			
			//Attribute handling
			'GetAttribute':GetAttribute,		//Get: returns key val, or if empty, returns object with all attributes
			'SetAttribute':SetAttribute,		//Set: accepts key val for setting attribute, or object for multi set
			
			//Node Management
			'GetNode':GetNode,					//Get: the raw dom node
			'GetParent':GetParent,				//Get: the nodes parent DomJack
			'GetChildren':GetChildren,			//Get: an array of Node children wrapped with DomJack
			'GetChild':GetChild,				//Get: the Node at _index wrapped with DomJack
			'GetFirstChild':GetFirstChild,
			'GetLastChild':GetLastChild,
			'GetType':GetType,					//Get: type of Node (tag type)
			'GetIndex':GetIndex,				//Get: index of placement within parent
			'GetRoot':GetRoot,

			//Children management
			'Insert':Insert,					//Utility: Inject a node at a specific index within the children list
			'Prepend':Prepend,					//Utility: Inject a node at the beginning of the children list
			'Append':Append,					//Utility: Inject a node at the end of the children list
			'InsertBefore':InsertBefore,		//Utility: Inject a node before another node/index
			'InsertAfter':InsertAfter,			//Utility: Inject a node after another node/index
			'Prune':Prune,						//Utility: Prune children past an Index
			
			//Event management
			'On':On,							//Set: Set a callback to fire on a certain event queue
            'OnState': OnState,                  //Set: Bind a callback to be fired on state event
			'Once':Once,						//Set: Set a callback that will only fire once on a certain event queue
			'Emit':Emit,						//Utility: Trigger an event queue
            'EmitState': EmitState,              //Utility: Trigger a state event on the DomJack
			'Clear':Clear,						//Set: Clear an individual event, or event queue
			'RemoveListener':RemoveListener,	//Set: **not sure what this does
			'Ready':Ready,						//Utility: A special function that can fire callbacks when the Node is reinjected into the DOM
			
			//Content management
			'GetInner':GetInner,				//Get: Get the raw innerHtml contents
			'SetInner':SetInner,				//Set: Set the innerHtml contents
            'BuildInner':BuildInner,            //Utility: Take an HTML string with buildKeys, build it into a DOM structure, return an Object reference to the keyed DomJacks
			'Dump':Dump,						//Utility: Perform a special operation to properly empty the innerHtml contents (clear from memory,etc)
			
			//General Information			
			'GetId':GetId,						//Get: **Currently gets the id, not sure about this
			'SetId':SetId,						//Set: **Currently sets the id, not sure about this
			'CacheId':CacheId,					//Get: Get the KUBE ID (read only)
			'IsDetached':IsDetached,			//Utility: Is the Node attached/detached within the DOM?
			
			//Utilities
			'Copy':Copy,						//Utility: Create a copy of the Node (detached) and return.
			'Delete':Delete,					//Utility: Detach the Node and set it to be cleaned from the Cache. Cleans internal state, external references still need to be released
			'Detach':Detach,
			'DetachChildren':DetachChildren,
			'GetDrawDimensions':GetDrawDimensions,	//Utility: This is probably going to replace CalcHeight and CalcWidth entirely
			'Rect': Rect,							//This is a shortcut to getBoundingRect
            'HasScrollBar': HasScrollBar,
            'GetScrollBarDimensions': GetScrollBarDimensions,
			
			//Style
			'Style':Style,						//Get: the StyleJack of the Node
			'GetClasses':GetClasses,			//Get: an array of classes (StyleJack wrapped) that are applied to the Node
			'AddClass':AddClass,				//Utility: Adds a class to Node (accepts string, or StyleJack object)
			'RemoveClass':RemoveClass,			//Utility: Removes a class from Node (accepts string, or StyleJack object)
			'ToggleClass':ToggleClass,			//Utility: Adds or Removes class from Node depending on current state
			'HasClass':HasClass,				//Utility: Quick check for whether a class is currently applied to Node
			
			//Mapping
			'SetMapId':SetMapId,
			'MapData':MapData
		};

		//Init and return our API
		init(initNode);
		return $DomJackAPI;
		
		//Init
		//Do I need to handle something that's already a DomJack?
		function destroy(){
			//Do I need this?
			Events = Node = nodeType = StyleJack = domListeners = id = rawAPI = $DomJackAPI = animationAPI = prefix = keyListener = keyStore = keyComboTriggered = keyF = undefined;
		}		
		
		function init(_initVar){
			initWinDocJack(_initVar) || initOldDJ(_initVar) || initNewDJ(_initVar);
		}
		
		function initWinDocJack(_initVar){
			var $return = false;
			if(!_initVar || _initVar === window || _initVar === document){
				$DomJackAPI = KUBE.Class('/Library/DOM/WinDocJack')();
				$return = true;
			}
			return $return;
		}
		
		function initOldDJ(_dj){
			var $return = false;
			if(isDJ(_dj)){
				$DomJackAPI = _dj;
				$return = true;
			}
			return $return;
		}

		function isDJ(_dj){
			return  (_dj instanceof DomJack ? true : false); //(rawAPI.KUBE().duckType(_dj) === true ? true : false);
		}
		
		function initNewDJ(_initVar){
			return initCache(validateAndInitNode(_initVar));
		}
				
		function validateAndInitNode(_initVar){
			var type = KUBE.Is(_initVar),$return;
			$return = initByString(_initVar,type) || initByObject(_initVar,type);
            if($return === false) {
                throw new Error('Attempted to initialize a DomJack on an object that is not an HTMLElement');
            }
            return $return;
		}
		
		function initByString(_initVar,_type){
			return (_type === 'string' ? (initNewIdNode(_initVar) || checkTypeAndCreate(_initVar)) : false);
		}
		
		function initNewIdNode(_id){
			var $return = false;
			if(isID(_id)){
				if(!idNodeExists(_id)){
					$return = document.createElement('div');
					$return.id = prepID(_id);
				}
			}
			return $return;
		}
		
		function initByObject(_initVar,_type){
			return (_type === 'object' && KUBE.Is(_initVar.ownerDocument) === 'object' ? _initVar : false);
		}
				
		function initCache(_obj){
			if(KUBE.Is(_obj) === 'object'){
				if(KUBE.Is(_obj.KUBEDJ) === 'object' && _obj.KUBEDJ.id){
					$DomJackAPI = jackCache[_obj.KUBEDJ.id] || null;
				}
				else{
					Node = _obj;
					Node.KUBEDJ = {};
					Node.KUBEDJ.id = id = ++KUBENodeId;
					Node.KUBEDJ.save = true;
					
					nodeType = (Node.nodeName || Node.tagName).toLowerCase();
					$DomJackAPI = rawAPI.KUBE().copy().KUBE().create(DomJack.prototype);
					UpdateAPI();
					
					jackCache[id] = {};
					jackCache[id] = $DomJackAPI;
					jackCache.length++;
					cleanupCache.push(id);
				}
			}
		}
		
		
		function checkTypeAndCreate(_type){
			var $return = false;
			//KUBE.console.log(_type+': '+KUBENodeId+1);
			try{
				$return = document.createElement(''+_type.toLowerCase());
			}
			catch(e){
				//No node for you
				throw new Error('Dom Jack could not create element. Invalid type: '+_type);
			}
			return $return;
		}
				
		// Special
		function UpdateAPI(){
			$DomJackAPI = BindCustomAPI($DomJackAPI,nodeType,rawAPI);
			jackCache[id] = $DomJackAPI;
			return $DomJackAPI;
		}
		
		// Attribute handling
		function GetAttribute(_key){
			return domGetAttribute(_key) || propertyGetAttribute(_key) || listGetAttribute(_key);
		}
		
		function domGetAttribute(_key){
			return (_key && KUBE.Is(Node.getAttribute) === 'function' ? Node.getAttribute(_key) : undefined);
		}
		
		function propertyGetAttribute(_key){
			return (_key && KUBE.Is(Node[_key]) !== 'undefined' ? Node[_key] : undefined);
		}
		
		function listGetAttribute(_key){
			return (_key ? findAttribute(_key) : parseAttributesIntoObject());
		}
		
		function parseAttributesIntoObject(){
			var $return;
            //TODO: this is probably broken, and should do what findAttribute does (check for NamedNodeMap)
			if(KUBE.Is(Node['attributes']) === 'object'){
				$return = {};
				Node.attributes.KUBE().each(function(_keyIndex,_attr){
					if(_attr.name !== undefined){
						$return[_attr.name] = _attr.value;
					}
				});
			}
			return $return;
		}
		
		function findAttribute(_key){
			var $return;
            if(KUBE.Is(Node['attributes'],true) === 'NamedNodeMap'){
                var length = Node['attributes'].length;
                for(var i=0;i<length;i++){
                    var tempAttr = Node['attributes'][i];
                    if(tempAttr.name.toLowerCase() === _key.toLowerCase()){
                        $return = tempAttr.value || tempAttr.nodeValue || tempAttr.textContent;
                        break;
                    }
                }
            }
			return $return;
		}
		
		function SetAttribute(_key,_val){
			return setMultiAttributes(_key) || setSingleAttribute(_key,_val);
		}
						
		function setMultiAttributes(_key){
			var $return;
			if(KUBE.Is(_key) === 'object'){
				_key.KUBE().each(function(_objKey,_objVal){
					setSingleAttribute(_objKey,_objVal);
				});
				$return = $DomJackAPI;
			}
			return $return;
		}
		
		function setSingleAttribute(_key,_val){
			(_val === false ? removeAttribute(_key) : trySetAttribute(_key,_val));
			return $DomJackAPI;
		}
		
		function removeAttribute(_key){
			var $return = false;
			try{
				Node.removeAttribute(_key);
				$return = true;
			}
			catch(e){
				throw new Error(e.message);
			}
			return $return;
		}
		
		function trySetAttribute(_key,_val){
			var $return = false;
			try{
				Node.setAttribute(_key,_val);
				$return = true;
			}
			catch(E){
				if(KUBE.Is(Node[_key]) !== 'function' && KUBE.Is(Node[_key]) !== 'object'){
					Node[_key] = _val;
					$return = false;
				}
				throw E;
			}
			return $return;
		}
		
		// Node Management
		function GetNode(){
			return Node;
		}
		
		function GetRoot(){
			return rGetRoot(Node);
			function rGetRoot(_N){
				return (_N.parentNode === null ? DJ(_N) : rGetRoot(_N.parentNode));
			}
		}
		
		function GetParent(){
			return (Node.parentNode !== null ? DJ(Node.parentNode) : false);
		}
		
		function GetChildren(){
			var i,$return = [];
			if(Node.children.length){
				for(i=0;i<Node.children.length;i++){
					$return.push(DJ(Node.children[i]));
				}
			}
			return $return;
		}
		
		function GetChild(_index){
			return (Node.children[_index] ? DJ(Node.children[_index]) : undefined);
		}
		
		function GetFirstChild(){
			return GetChild(0);
		}
		
		function GetLastChild(){
			return GetChild(Node.children.length-1);
		}
		
		function GetType(){
			return nodeType;
		}
		
		function GetIndex(){
			var $return;
			GetParent().GetChildren().KUBE().each(function(_child,_index){
				if(_child.GetNode() === Node){
					$return = _index;
					this.break;
				}
			});
			return $return;
		}
				
		// Children Management
		function Insert(_Node, _index){
			var Inject,$return = false;
			
			Inject = DJ(_Node);
			
			if(isDJ(Inject)){
				$return = insertAtNumber(Inject,_index) || insertAtObject(Inject,_index) || Append(Inject);
			}
			
			if($return){
				Inject.UpdateAPI();
				Inject.Ready();
				$return = (KUBE.Is(_Node) === 'string' ? Inject : $DomJackAPI);
			}
			return $return;
		}
		
		function insertAtNumber(_Inject,_index){
			var children,$return = false;
			
			if(KUBE.Is(_index) === 'number'){
				children = GetChildren();
				if(children[_index]){
					Node.insertBefore(_Inject.GetNode(),children[_index].GetNode());
					$return = true;
				}
			}
			return $return;
		}
		
		function insertAtObject(_Inject,_index){
			var target,$return = false;
			
			if(KUBE.Is(_index) === 'object'){
				target = DJ(_index);
				if(isDJ(target) && target.GetParent().GetNode() === Node){
					Node.insertBefore(_Inject.GetNode(),target.GetNode());
					$return = true;
				}
			}
			return $return;
		}
		
		function Prepend(_Node){
			return Insert(_Node, 0);
		}
				
		function Append(_Node){
			if(KUBE.Is(_Node) === 'array'){
				_Node.KUBE().each(Append);
			}
			else{
				var Inject,$return = false;
				Inject = (!isDJ(_Node) ? DJ(_Node) : _Node);
				if(Inject){
					Node.appendChild(Inject.GetNode());
					Inject.UpdateAPI();
					Inject.Ready();
					$return = (KUBE.Is(_Node) === 'string' ? Inject : $DomJackAPI);
				}
				return $return;
			}
		}
		
		//Not sure about Before/After yet, will have to use them first
		function InsertBefore(_Target){
			var Parent;
			_Target = (!isDJ(_Target) ? DJ(_Target) : _Target);
			if(_Target.GetParent()){
				Parent = _Target.GetParent();
				Parent.Insert($DomJackAPI,_Target.GetIndex());
			}
		}
		
		function InsertAfter(_Target){
			var Parent;
			_Target = (!isDJ(_Target) ? DJ(_Target) : _Target);
			if(_Target.GetParent()){
				Parent = _Target.GetParent();
				Parent.Insert($DomJackAPI,_Target.GetIndex()+1);
			}
		}
		
		function Prune(_index){
			GetChildren().KUBE().each(function(_Child,_childIndex){
				if(_childIndex >= _index){
					_Child.Delete();
				}
			});
			return $DomJackAPI;
		}
		
		
		//Event Management
		function On(_event,_callback){
			var $return;
			if(!multiOn(_event,_callback)){
				_event = translateEvent(_event);
				catchReady(_event,_callback) || catchKeys(_event,_callback) || bindOn(_event,_callback);
			}
			return $return;
		}
		
		function multiOn(_array,_callback){
			var $return = false;
			if(KUBE.Is(_array) === 'array'){
				$return = true;
				_array.KUBE().each(function(_e){
					On(_e,_callback);
				});
			}
			return $return;
		}
		
		function catchReady(_event,_callback){
			//Do not ever allow ready events to be bound to on.
			//Ready events are intended to only fire a single time when a Node is inserted into the DOM.
			//As those events may start manipulating the DOM, this results in runaway ready events being fired incorrectly, 
			//creating a loop of infinite madness.
			var $return = false;
			if(_event === 'ready'){
				Once(_event,_callback);
				$return = true;
			}
			return $return;
		}
		
		function catchKeys(_event,_callback){
			var $return = false;
			if(_event.substr(0,4) === 'key:'){
				initKeyListener();
				addKeyListenerEvent(_event,_callback);
				$return = true;
			}
			return $return;
		}
		
		function initKeyListener(){
			if(!keyListener){
				keyListener = true;
				On('keydown',pressKey);
				On('keyup',releaseKey);
			}
		}
		
		function pressKey(_e){
			var $return,codeString,tempArray = [];
			$return = true;
			keyStore[_e.keyCode] = true;
			if(!keyComboTriggered){
				keyStore.KUBE().each(function(_k,_v){
					tempArray.push(_k);
				});
				tempArray.sort();
				codeString = tempArray.join('+');
				if(keyF[codeString] && keyComboTriggered === false){
					keyComboTriggered = true;
					for(var i=0;i<keyF[codeString].length;i++){
						if(KUBE.Is(keyF[codeString][i]) === 'function'){
							if(keyF[codeString][i](_e) === false){
								$return = false;
								break;
							}
						}
					}
					keyComboTriggered = false;
				}
			}
			return $return;
		}
		
		function releaseKey(_e){
			delete keyStore[_e.keyCode];
			if(keyStore.KUBE().isEmpty()){
				keyComboTriggered = false;
			}
		}
		
		function addKeyListenerEvent(_event,_callback){
			var tempArray,keyArray,codeString;
			tempArray = [];
			keyArray = /[+|:]([^+]*)/.KUBE().matchAll(_event);
			keyArray.KUBE().each(function(_matchArray){
				if(_matchArray[1].length === 1){
					tempArray.push(_matchArray[1].toUpperCase().charCodeAt(0));
				}
				else{
					tempArray.push(wordToKeyCodeMap[_matchArray[1].toLowerCase()]);
				}
			});
			
			tempArray.sort();
			codeString = tempArray.join('+');
			if(!keyF[codeString]){
				keyF[codeString] = [];
			}
			keyF[codeString].push(_callback);
		}
		
		function bindOn(_event,_callback){
			Events.On(_event,_callback,undefined,$DomJackAPI);
		}

        function OnState(_event,_callback){
            initEventObj(); //This is done this way as OnState/EmitState can't use the DOM.
            Events.OnState(_event,_callback);
        }
		
		function Once(_event,_callback){
			_event = translateEvent(_event);
			Events.Once(_event,_callback, $DomJackAPI);
		}
		
		function Emit(_event){
			var args,i;
			args = [];
			args[0] = translateEvent(_event);
			if(arguments.length > 1){
				for (i = 1; i < arguments.length; i++){
					args[i] = arguments[i];
				}			
			}
			Events.Emit.apply($DomJackAPI,args);
		}

        function EmitState(_event){
            var args,i;
            initEventObj();
            args = [];
            args[0] = _event;
            if(arguments.length > 1){
                for (i = 1; i < arguments.length; i++){
                    args[i] = arguments[i];
                }
            }
            Events.EmitState.apply($DomJackAPI,args);
        }
		
		function Clear(_event,_recursive){
			_event = (_event === undefined ? undefined : translateEvent(_event));
            if(Events !== undefined){
                Events.Clear(_event);
            }
			cleanListeners(_event);
            if(_recursive === true){
                GetChildren().KUBE().each(function(_Child){
                    _Child.Clear(_event,true);
                });
            }
		}
		//TODO: I feel like we're leaking events. I think we could unbind the event from the DOM node when nothing else is bound.
		function RemoveListener(_event,_callback){
			_event = translateEvent(_event);
			Events.RemoveListener(_event,_callback);
			if(domListeners[_event] && !Events.ListenerCount(_event)){
				domListeners[_event] = false;
			}
		}
		
		//special event to allow structures to be created detached, and then trigger animations once inserted, etc
		function Ready(_readyVar){
			attachEvent(_readyVar) || fireReady(_readyVar);
		}
		
		function attachEvent(_callback){
			var $return = false;
			if(KUBE.Is(_callback) === 'function'){
				(IsDetached() ? Once('ready',_callback) : _callback.call($DomJackAPI));
				$return = true;
			}
			return $return;
		}

		function fireReady(_forceReady){
			if(_forceReady === true){
				GetChildren().KUBE().each(function(_Child){
					_Child.Ready(true);
				});
			}
			else{
                if(Node.nodeType === Node.ELEMENT_NODE){
                    On('animationstart',animationTriggerReady);
                    Style().Animation().Name('nodeInserted').Duration(0.001);
                }
                else{
                    //Things that aren't elements have to do something different.
                }

			}
		}

		function animationTriggerReady(event){
			if(event.animationName == "nodeInserted"){
				RemoveListener('animationstart',animationTriggerReady);
				Style().Animation().Name('').Duration('');
				Emit('ready', Node);
			}

		}

		function translateEvent(_event){
			//I intended toLowerCase this for friendliness. But webkit hates nice things. So yeah....
			_event = (''+_event.toLowerCase().substr(0,2) === 'on' ? ''+_event.substr(2) : ''+_event).toLowerCase();
			
			/************************* KILL THIS WITH FIRE AS SOON AS WEBKIT IS LESS STUPID ***********************/
			//Now I need to handle webkit stupidness for animations at least until it's properly implemented.
			//Apparently at one point firefox did use mozAnimationEnd, and I don't know if IE9 ever supported animations. But regardless
			//as of current testing, webkit is the only one who hasn't implemented it to spec
			if(_event.substr(0,9) === 'animation' || _event.substr(0,10) === 'transition'){
				prefix = prefix || FeatureDetect().Prefix();
				if(prefix === 'webkit'){
					switch(_event){
						case 'animationstart':
							if(!domListeners[_event]){
								initDomListener(_event);
								domListeners['webkitAnimationStart'] = domListeners['animationstart'];
								useAddEventListener('webkitAnimationStart',domListeners['animationstart']); 
							}
							break;
						case 'animationend': 
							if(!domListeners[_event]){
								initDomListener(_event);
								domListeners['webkitAnimationEnd'] = domListeners['animationend'];
								useAddEventListener('webkitAnimationEnd',domListeners['animationend']); 
							}
							break;
						case 'animationiteration': 
							if(!domListeners[_event]){
								initDomListener(_event);
								domListeners['webkitAnimationIteration'] = domListeners['animationiteration'];
								useAddEventListener('webkitAnimationIteration',domListeners['animationiteration']);
							}
							break;
							
						case 'transitionend':
							if(!domListeners[_event]){
								initDomListener(_event);
								domListeners['webkitTransitionEnd'] = domListeners['transitionend'];
								useAddEventListener('webkitTransitionEnd',domListeners['transitionend']);
							}							
							break;
							
						default:
							initDomListener(_event);
							break;
					}
				}
				else{
					initDomListener(_event);
				}
			}
			/*******************************************************************************************************/
			else{
				initDomListener(_event);
			}
			return _event;
		}
		
		function initDomListener(_event){
			var f;
			initEventObj();
			if(!domListeners[_event]){
				f = function(e){ domTrigger(_event,e); };
				domListeners[_event] = f;
				useAddEventListener(_event,f) || useAttachEvent(_event,f);
			}
		}
		
		function useAddEventListener(_event,_f){
			var $return = false;
			if(Node.addEventListener){
				$return = true;
				Node.addEventListener(_event,_f,true);
			}
			return $return;
		}
		
		function useAttachEvent(_event,_f){
			_event = (Node['on'+_event] !== undefined ? 'on'+_event : _event);
			Node.attachEvent(_event,_f);
		}
		
		
		function initEventObj(){
			if(KUBE.Is(Events) !== 'object'){
				Events = KUBE.Events();
				domListeners = {};
			}
		}
		
		function cleanListeners(_event){
			cleanAllListeners(_event) || cleanSingleListener(_event);
		}
		
		function cleanAllListeners(_event){
			var $return = false;
			if(!_event){
				domListeners.KUBE().each(function(_key){
					cleanSingleListener(_key);
				});
				$return = true;
			}
			return $return;
		}
		
		function cleanSingleListener(_event){
			if(domListeners[_event]){
				(Node.removeEventListener ? Node.removeEventListener(_event, domListeners[_event],true) : Node.detachEvent('on'+_event, domListeners[_event]));
				delete domListeners[_event];
			}
		}
		
		
		function domTrigger(_event, e){
			if(Events.Emit(_event, e) === false){
				if(e.preventDefault){
					e.preventDefault();
				}
				else{
					e.returnValue = false;
				}
			}
		}
	
		//Content Management
		function GetInner(){
			return Node.innerHTML;
			//Removed old implementation because I don't know if it's relevant. Look at github for past hackiness
		}
		
		function SetInner(_content,_asText){
            _asText = (_asText === false ? false : true);
			cleanChildren(Node);
			if(!Node){
				console.log('Attempted to operate on a destroyed Node');
				return;
			}
            if(_asText){
                Node.textContent = _content;
            }
            else{
                Node.innerHTML = _content;
            }

			return $DomJackAPI;
			//Removed old hacky implementation of this as well
		}

        function BuildInner(_html){
            if(KUBE.Is(_html) === "function"){
                _html = "".KUBE().multiLine(_html);
            }
            var $keyObj = {};
            var Temp = DJ('div');
            Temp.SetInner(_html,false);
            recurseBuild(Temp,$keyObj);
            Dump();
            Temp.GetChildren().KUBE().each(function(_MainChild){
                Append(_MainChild);
            });
            Temp.Delete();
            return $keyObj;
        }

        function recurseBuild(_DJ,_keyObj){
            var children = _DJ.GetChildren();
            children.KUBE().each(function(_Child){
                if(_Child.GetAttribute('buildKey')){
                    var buildKey = _Child.GetAttribute('buildKey');
                    if(_keyObj[buildKey]){
                        KUBE.console.error('Duplicate buildKey found in Template (DomJack Build Inner). Overwriting initial buildKey');
                    }
                    _keyObj[buildKey] = _Child;
					if(!KUBE.debugBuildInner){
						_Child.SetAttribute('buildKey',false);
					}

                }
                recurseBuild(_Child,_keyObj);
            });
        }

		function Dump(){ 
			SetInner('',false);
			return $DomJackAPI;
		}
		
		function cleanChildren(Node){
			var i,ChildNode;
			if(KUBE.Is(Node) === 'object' && KUBE.Is(Node.children) === 'object' && Node.children.length){
				for(i=0;i<Node.children.length;i++){
					ChildNode = Node.children[i];
					if(KUBE.Is(ChildNode.KUBEDJ) === 'object'){
						ChildNode.KUBEDJ.save = false;
					}
					cleanChildren(Node.children[i]);
				}
			}
		}
		
		//General Information
		function CacheId(){
			return id;
		}
				
		function GetId(){
			return Node.id;
		}
		
		function SetId(_id){
			if(!idNodeExists(_id)){
				Node.id = prepID(_id);
			}
			else{
				throw new Error('DomJack cannot set ID. Already exists in DOM or invalid String type');
			}
			return $DomJackAPI;
		}
		
		function prepID(_checkString){
			return (''+_checkString.charAt(0) === '#' ? ''+_checkString.substr(1) : _checkString);
		}
		
		function isID(_id){
			return (''+_id.charAt(0) === '#' ? true : false);
		}
		
		function idNodeExists(_id){
			var FoundNode,$return = false;
			if(KUBE.Is(_id) === 'string'){
				FoundNode = document.getElementById(prepID(_id));
				if(KUBE.Is(FoundNode) === 'object'){
					$return = FoundNode;
				}
			}
			return $return;
		}
		
		function IsDetached(){
			return recursiveDetachCheck(Node);
		}
		
		function recursiveDetachCheck(_node){
			var $return = false;
			if(_node.parentNode !== document){
				$return = (_node.parentNode === null ? true : recursiveDetachCheck(_node.parentNode));
			}
			return $return;
		}
		
		
		//Utilities		
		//Warning: Copies need to be Deleted() after they have been used just like any other DomJack or they will result in a memory leak (cached, never released, etc)
        //TODO: Node.cloneNode exists... that would probably make more sense than this insanity. And be faster.
		function Copy(_recursive){
			var Children,NewCopy = DJ(nodeType);
			NewCopy.SetAttribute(GetAttribute());
			NewCopy.SetMapId(mapId);
			
			if(_recursive){
				Children = GetChildren();
				if(Children.length){
					Children.KUBE().each(function(_Child){
						NewCopy.Append(_Child.Copy(true));
					});
				}
				else{
					NewCopy.SetInner(GetInner(),false);
				}
			}
			else{
				NewCopy.SetInner(GetInner(),false);
			}
			//Events? //Let's say no
			return NewCopy;
		}
		
		
		
		function Delete(){
			Detach(true);
			cleanChildren(Node);
			Node.KUBEDJ.save = false;
			handleClean();
			//cleanCache();
		}
		
		function Detach(_suppressDetach){
			var Parent,$return;
			Parent = Node.parentNode; //Using raw to avoid deletion race conditions
			if(Parent){
				$return = Parent.removeChild(Node);
				if(!_suppressDetach){
					Emit('detach', $DomJackAPI);
				}
			}
			return $return;
		}
		
		function DetachChildren(_suppressDetach, _recursive){
			GetChildren().KUBE().each(function(_Child){
				_Child.Detach(_suppressDetach);
				if(_recursive === true){
					_Child.DetachChildren(_suppressDetach,_recursive);
				}
			});
		}
		
		//This is very expensive function, needs to be managed to be used wisely
		function GetDrawDimensions(_Parent){
			var DJCopy,clientRect;
			
			//Where are we injecting?
			_Parent = _Parent || DJ(document.body);
			
			//Copy it
			DJCopy = Copy();
			
			//Set it up invisibly
			DJCopy.Style().Position('absolute').Visibility('hidden').Display('block').ZIndex('-100');
			
			//Inject
			_Parent.Append(DJCopy);
			
//			debugger;
			
			//Get the dimensions
			clientRect = DJCopy.GetNode().getBoundingClientRect();
			
			//Kill our copy with fire
			DJCopy.Delete();
			
			//Return our dimensions
			return {
				'width': clientRect.width,
				'height': clientRect.height,
				'top': clientRect.top,
				'right': clientRect.right,
				'bottom': clientRect.bottom,
				'left': clientRect.left
			};
		}
		
		function Rect(){
			return Node.getBoundingClientRect();
		}

        function HasScrollBar(_Parent){
            //This will simply detect for the given node if scroll<axis> is > clientRect.<axis> and return true/false
            //
            var _return = {},clientRect = (!Detached() ? Rect() : GetDrawDimensions(_Parent));
            _return['horizontal'] = (Node.scrollWidth > clientRect.width) ? true : false;
            _return['vertical'] = (Node.scrollHeight > clientRect.height) ? true : false;
            return _return;
        }
        function GetScrollBarDimensions(){
            var container = DJ('div'),
                inner = DJ('div'),
                body =  DJ(document.body),
                initialWidth = 200,
                scrollBarWidth;

            inner.Style().Width('100%');
            container.Append(inner).Style().Width(initialWidth).Visibility('hidden').Height(initialWidth).Overflow('scroll');
            body.Append(container);
            scrollBarWidth = inner.Rect().width;
            container.Delete();
            return initialWidth - scrollBarWidth;
        }
		
		//Style management
		function Style(){
			if(!StyleJack){
				StyleJack = SJ(Node);
			}
			return StyleJack;
		}

		function GetClasses(){
			var classes;
			classes = getFromClassList() || getFromClassName();
			return createClassObj(classes);
		}
		
		function GetClassArray(){
			var $classes;
			$classes = getFromClassList() || getFromClassName();			
			$classes.KUBE().each(function(_val){
				return SJ(_val);
			},true);
			return $classes;
		}

		function AddClass(_class){
			addClassArray(_class) || addClassSingle(_class);
			return $DomJackAPI;
		}
		
		function RemoveClass(_class){
			removeClassByArray(_class) || removeSingleClass(_class);
			return $DomJackAPI;
		}
		
		
		
		function getFromClassList(){
			var i,$return = false;
			if(KUBE.Is(Node.classList) !== 'undefined'){
				$return = [];
				for(i = 0; i<Node.classList.length;i++){
					$return.push(Node.classList[i]);
				}
			}
			return $return;
		}
		
		function getFromClassName(){
			return Node.className.split(" ");			
		}
		
		function createClassObj(_classes){
			var $return = {};
			_classes.KUBE().each(function(_val){
                var strVal = _val;
                //Added if statement to be slightly more resiliant against trailing spaces and other weird formatting.
                if(_val){
                    //This is possibly retarded, although possibly awesome.
					//This is absolutely retarded.  It breaks any cascading styles from working. XD
                    _val = (_val.substr(0,1) !== "." ? "." + _val : _val);
                    $return[strVal] = SJ(_val);
                }
			});
			return $return;
		}
				
		function addClassArray(_class){
			var $return = false;
			if(KUBE.Is(_class) === 'array'){
				_class.KUBE().each(function(_val){
					AddClass(_val);
				});
				$return = true;
			}
			return $return;
		}
		
		function addClassSingle(_class){
			var classes;
			classes = GetClasses();
			_class = identifyClass(_class);
			
			if(KUBE.Is(classes[_class]) === 'undefined'){
				addUsingClassList(_class) || addUsingClassString(_class);
			}
		}
		
		function identifyClass(_class){
			return getClassFromString(_class) || getClassFromStyleJack(_class);
		}
		
		function getClassFromString(_class){
			return (KUBE.Is(_class) === 'string' ? (_class.charAt(0) === '.' ? _class.substr(1) : _class) : false);
		}
		
		function getClassFromStyleJack(_class){
			//TODO: Fixor?
			return (KUBE.Is(_class,true) === 'StyleJack' && _class.GetSelectorText ? getClassFromString(_class.GetSelectorText()) : false);
		}
		
		function addUsingClassList(_className){
			var $return = false;
			if(KUBE.Is(Node.classList) !== 'undefined'){
				Node.classList.add(_className);
				$return = true;
			}
			return $return;
		}
		
		function addUsingClassString(_className){
			Node.className = getClassString(_className,'add');
		}
				
		function removeClassByArray(_class){
			var $return = false;
			if(KUBE.Is(_class) === 'array'){
				_class.KUBE().each(function(_val){
					RemoveClass(_val);
				});
				$return = true;
			}
			return $return;
		}
		
		function removeSingleClass(_class){
			var classes = GetClasses();
			_class = identifyClass(_class);
			if(KUBE.Is(classes[_class]) === 'object'){
				removeUsingClassList(_class) || removeUsingClassString(_class);
			}
		}
		
		function removeUsingClassList(_class){
			var $return = false;
			if(KUBE.Is(Node.classList) !== 'undefined'){
				Node.classList.remove(_class);
				$return = true;
			}
			return $return;
		}
		
		function removeUsingClassString(_class){
			Node.className = getClassString(_class,'remove');
		}
		
		function ToggleClass(_class){
			toggleClassByArray(_class) || toggleIndividualClass(_class);
			return $DomJackAPI;
		}
		
		function toggleClassByArray(_class){
			var $return = false;
			if(KUBE.Is(_class) === 'array'){
				_class.KUBE().each(function(_val){
					ToggleClass(_val);
				});
				$return = true;
			}
			return $return;
		}
		
		function toggleIndividualClass(_class){
			_class = identifyClass(_class);
			toggleUsingClassList(_class) || toggleUsingClassString(_class);
		}
		
		function toggleUsingClassList(_class){
			var $return = false;
			if(KUBE.Is(Node.classList) !== 'undefined'){
				Node.classList.toggle(_class);
				$return = true;
			}
			return $return;
		}
		
		function toggleUsingClassString(_class){
			Node.className = getClassString(_class,'toggle');
		}
		
		function HasClass(_class){
			return (Node.classList ? Node.classList.contains(identifyClass(_class)) : (KUBE.Is(GetClasses()[identifyClass(_class)]) === 'undefined' ? false : true));
		}
		
		function getClassString(_className,_action){
			return	addClassToString(_className,_action) || removeClassFromString(_className,_action) || toggleClassInString(_className,_action);			
		}
		
		function addClassToString(_className,_action){
			var classes,$return = false;
			if(_action === 'add'){
				classes = GetClasses();
				$return = (checkForExistance(_className,classes) === true ? Node.className : buildStringAdd(classes,_className));
			}
			return $return;
		}
		
		function checkForExistance(_className,_classes){
			return (KUBE.Is(_classes[_className]) !== 'undefined' ? true : false);
		}
		
		function buildStringAdd(_classes,_className){
			_classes[_className] = true;
			return buildClassString(_classes);
		}
		
		function buildClassString(_classes){
			var $return = [];
			_classes.KUBE().each(function(_val){
				$return.push(_val);
			});
			return $return.join(' ');			
		}
		
		function removeClassFromString(_className,_action){
			var classes,$return = false;
			if(_action === 'remove'){
				classes = GetClasses();
				$return = (checkForExistance(_className,classes) === false ? Node.className : buildStringRemove(classes,_className));
			}
			return $return;
		}
		
		function buildStringRemove(_classes,_className){
			delete _classes[_className];
			return buildClassString(_classes);
		}
		
		function toggleClassInString(_className,_action){
			var classes,$return = Node.className;
			if(_action === 'toggle'){
				classes = GetClasses();
				$return = (checkForExistance(_className,classes) === true ? buildStringRemove(classes,_className) : buildStringAdd(classes,_className));
			}
			return $return;
		}
		
		//Mapping
		function SetMapId(_mapId){
			if(KUBE.Is(_mapId) === 'string' || _mapId === undefined){
				mapId = _mapId;
			}
			return $DomJackAPI;
		}
		
		function MapData(_mapDataObj){
			var mapData;
			if(KUBE.Is(_mapDataObj) === 'object' && mapId && _mapDataObj[mapId] !== undefined){
				mapData = _mapDataObj[mapId];
				switch(KUBE.Is(mapData)){
					case 'object':
						mapInner(mapData.data);
						mapEvents(mapData.events);
						mapAttributes(mapData.attributes);
						mapClasses(mapData.classes);
						mapChildren(mapData.children);
						break;
						
					case 'string': case 'number':
						mapInner(mapData);
						break;
						
					default:
						//Throw an error?
						break;
				}				
			}
			else{
				mapChildren(_mapDataObj);
			}
			return $DomJackAPI;
		}
		
		function mapInner(_innerData){
			var type = KUBE.Is(_innerData);
			if(type === 'string' || type === 'number'){
				SetInner(_innerData,false);
			}
		}
		
		function mapEvents(_events){
			if(KUBE.Is(_events) === 'object'){
				_events.KUBE().each(function(_eventName,_event){
					//Does this make sense?
					Clear(_eventName);
					if(KUBE.Is(_event) === 'function'){
						On(_eventName,_event);
					}
				});
			}
		}
		
		function mapAttributes(_attributes){
			//Do I remove all, or just update/add
			if(KUBE.Is(_attributes) === 'object'){
				SetAttribute(_attributes);
			}
		}
		
		function mapClasses(_classes){
			var contains;
			if(KUBE.Is(_classes) === 'object'){
				_classes.KUBE().each(function(_className,_state){
					contains = Node.classList.contains(_className);
					if(contains && !_state){
						Node.classList.remove(_className);						
					}
					else if(!contains && _state){
						Node.classList.add(_className);
					}
				});
			}
		}
		
		function mapChildren(_map){
			if(KUBE.Is(_map) === 'object'){
				GetChildren().KUBE().each(function(_Child){
					_Child.MapData(_map);
				});
			}
		}

	}

	//Below is an abstraction for the mutation of our primary DJ API
	function BindCustomAPI(_DomJackAPI,_nodeType,_rawAPI){
		var typeAPI = {};
		cleanAPI();
		switch(_nodeType){
			case 'form':
				typeAPI.KUBE().merge({
					'Method':function(_method){ return Method(_DomJackAPI,_method); },
					'Action':function(_action){ return Action(_DomJackAPI,_action); },
					'Name':function(_name){ return Name(_DomJackAPI,_name); },
					'Gather':function(_recurse){ return Gather(_DomJackAPI,_recurse); },
					'Submit':function(_callback){ return Submit(_DomJackAPI,_callback); },
					'GetFields':function(){ return GetFields(_DomJackAPI); },
                    'Reset':function(){ return Reset(_DomJackAPI); }
				});
				Method(_DomJackAPI,'post');
				break;
				
			case 'input':
				typeAPI.KUBE().merge({
					'Name':function(_name){ return Name(_DomJackAPI,_name); },
					'Type':function(_type){ return Type(_DomJackAPI,_type); },
					'Value':function(_value){ return Value(_DomJackAPI,_value); }
				});
                var Node = _DomJackAPI.GetNode();
                if(Node.type === 'checkbox'){
                    typeAPI.KUBE().merge({
                       'Checked':function(_state){ return Checked(_DomJackAPI,_state); }
                    });
                }
				break;
				
			case 'select':
				typeAPI.KUBE().merge({
					'Name':function(_name){ return Name(_DomJackAPI,_name); },
					'AddOptions':function(_options){ return AddOptions(_DomJackAPI,_options); },
					'AddOption':function(_label,_value){ return AddOption(_DomJackAPI,_label,_value); },
					'AddOptionGroup': function(_label){ return AddOptionGroup(_DomJackAPI,_label); },
					'Select':function(_value){ return Select(_DomJackAPI,_value); },
                    'Value':function(_value){ return Value(_DomJackAPI,_value); },
                    'FindSelected':function(){ return FindSelected(_DomJackAPI); }
				});
				break;
				
			case 'optgroup':
				typeAPI.KUBE().merge({
					'Label':function(_label){ return Label(_DomJackAPI,_label); },
					'AddOptions':function(_options){ return AddOptions(_DomJackAPI,_options); },
					'AddOption':function(_label,_value){ return AddOption(_DomJackAPI,_label,_value); }
				});
				break;
				
			case 'textarea':
				typeAPI.KUBE().merge({
					'Name':function(_name){ return Name(_DomJackAPI,_name); },
					'Value':function(_value){ return Value(_DomJackAPI,_value); },
				});
				break;
				
			case 'option':
				typeAPI.KUBE().merge({
					'Text':function(_text){ return Text(_DomJackAPI,_text); },
					'Value':function(_value){ return Value(_DomJackAPI,_value); },
					'Selected':function(_bool){ return Selected(_DomJackAPI,_bool); },
					'OnSelect':function(_callback){ return OnSelect(_DomJackAPI,_callback); }
				});
				break;
				
			case 'datalist':
				typeAPI.KUBE().merge({
					'AddOption':function(_value){ return AddDatalistOption(_DomJackAPI,_value); },
					'AddOptions':function(_options){ return AddDatalistOptions(_DomJackAPI,_options); }
				});
				break;
				
			case 'img':
				typeAPI.KUBE().merge({
					'Src':function(_src){ return Src(_DomJackAPI,_src); }
				});
				break;

            case 'a':
                typeAPI.KUBE().merge({
                    'Href':function(_href){ return Href(_DomJackAPI,_href); }
                });
                break;
		}

		if(GetForm(_DomJackAPI)){
			//It lives in a form
			typeAPI.KUBE().merge({
				'GetForm':function(){ return GetForm(_DomJackAPI); },
				'SubmitForm':function(){ return SubmitForm(_DomJackAPI); }
			});
		}
		
		return _DomJackAPI.KUBE().merge(typeAPI);
		
		function cleanAPI(){
			_DomJackAPI.KUBE().each(function(_prop,_val){
				if(KUBE.Is(_rawAPI[_prop]) === 'undefined'){
					this.delete();
				}
				return _val;
			},true);
		}
	}
	
	//These are individual helper functions that mix in to the DomJackAPI
	function Gather(_DJ,_recurse){
		_recurse = (KUBE.Is(_recurse) === 'boolean' ? _recurse : true);
		var i,DomNode,element,$return = {};
		DomNode = _DJ.GetNode();
		if(DomNode.length){
			for(i=0;i<DomNode.length;i++){
				element = DomNode[i];
				if(element.name){
					if(element.type !== 'radio' && element.type !== 'checkbox' || element.type === 'radio' && element.checked === true || element.type === 'checkbox' && element.checked === true){
						$return[element.name] = element.value;
					}					
				}
			}
		}
		return (_recurse ? $return.KUBE().merge(findChildForms(_DJ)) : $return);
	}

    function Reset(_DJ){
        _DJ.GetNode().reset();
    }
	
	function findChildForms(_N,$return){
		$return = $return || {};
		_N.GetChildren().KUBE().each(function(_Child){
			if(_Child.GetType() === 'form'){
				$return[_Child.Name()] = _Child.Gather(true);
			}
			else{
				findChildForms(_Child,$return);
			}
		});
		return $return;
	}
	
	function Submit(_DJ,_callback){
		if(KUBE.Is(_callback) === 'function'){
			_DJ.On('submit',_callback);
		}
		else{
            var event = document.createEvent('HTMLEvents');
            event.initEvent('submit',true,true);
            if(_DJ.GetNode().dispatchEvent(event)){
                _DJ.GetNode().submit();
            }
		}
	}

	function SubmitForm(_DJ){
		var Form = GetForm(_DJ);
		if(KUBE.Is(Form) === 'object' && Form.Submit){
			Form.Submit();
		}
	}
	
	function Action(_DJ,_action){
		return (KUBE.Is(_action) !== 'undefined' ? _DJ.SetAttribute('action',_action) : _DJ.GetAttribute('action'));
	}

	function Method(_DJ,_method){
		return (KUBE.Is(_method) !== 'undefined' ? _DJ.SetAttribute('method',_method) : _DJ.GetAttribute('method'));
	}

    function Checked(_DJ,_state){
        if(_state === undefined){
            return _DJ.GetNode().checked;
        }
        else{
            _DJ.GetNode().checked = _state;
        }
    }
	
	
	function GetForm(_DJ){
		//Returns the Form DomJack
		function findForm(_Node){
			var $return = false;
			if(_Node.parentNode && KUBE.Is(_Node.parentNode) === 'object' && KUBE.Is(_Node.parentNode.tagName) === 'string'){
				$return = (_Node.parentNode.tagName.toLowerCase() === 'form' ? KUBE.Class('/Library/DOM/DomJack')(_Node.parentNode) : findForm(_Node.parentNode));
			}
			return $return;
		}
		return findForm(_DJ.GetNode());
	}
	
	function GetFields(_DJ){
		var i,DomNode,$return = [];
		DomNode = _DJ.GetNode();
		for(i=0;i<DomNode.length;i++){
			$return.push(DomJack(DomNode[i]));
		}
		return $return;
	}
	
	function Type(_DJ,_type){
		return (KUBE.Is(_type) !== 'undefined' ? _DJ.SetAttribute('type',_type) : _DJ.GetAttribute('type'));
	}

	function Name(_DJ,_name){
		return (KUBE.Is(_name) !== 'undefined' ? _DJ.SetAttribute('name',_name) : _DJ.GetAttribute('name'));
	}	
	
	function Label(_DJ,_label){
		return (KUBE.Is(_label) !== 'undefined' ? _DJ.SetAttribute('label',_label) : _DJ.GetAttribute('label'));
	}

	function Value(_DJ,_value){
		var $return = _DJ;
		if(KUBE.Is(_value) !== 'undefined'){
			_DJ.GetNode().value = _value;
		}
		else{
			$return = _DJ.GetNode().value;
		}
		return $return;
	}
	
	function Text(_DJ,_text){
		var $return = _DJ;
		if(KUBE.Is(_text) !== 'undefined'){
			_DJ.GetNode().text = _text;
		}
		else{
			$return = _DJ.GetNode().text;
		}
		return $return;
	}
	
	function AddOptions(_DJ,_options){
		switch(KUBE.Is(_options)){
			case 'array':
				_options.KUBE().each(function(_label){
                    AddOption(_DJ,_label,_label);
				});
				break;
				
			case 'object':
				_options.KUBE().each(function(_l,_v){
					AddOption(_DJ,_v,_l);
				});
				break;
		}
		return _DJ;
	}
	
	function AddOption(_DJ,_text,_value){
		var Option = DomJack('option');
		Option.Text(_text);
		Option.Value(_value);
		switch(KUBE.Is(_DJ.GetNode(),true)){
			case 'HTMLSelectElement': _DJ.GetNode().add(Option.GetNode()); break;
			default: _DJ.Append(Option); break;
		}
		return Option;
	}
	
	function AddOptionGroup(_DJ,_label){
		var OG = DomJack('optgroup');
		_DJ.Append(OG);
		OG.Label(_label);
		return OG;
	}
	
	function AddDatalistOption(_DJ,_value){
		return _DJ.Append('option').Value(_value);
	}
	
	function AddDatalistOptions(_DJ,_options){
		switch(KUBE.Is(_options)){
			case 'array':
				_options.KUBE().each(function(_val){
					AddDatalistOption(_DJ,_val);
				});
				break;
				
			case 'object':
				_options.KUBE().each(function(_key,_val){
					AddDatalistOption(_DJ,_val);
				});
				break;
		}
		return _DJ;
	}
	
	function Select(_DJ,_value){
		return findOptionToSelect(_DJ,_value);
        function findOptionToSelect(_DJ,_value){
            var $return = false;
            _DJ.GetChildren().KUBE().each(function(_Child){
                switch(_Child.GetType()){
                    case 'option':
                        if(_Child.Value() === _value){
                            _Child.Selected(true);
                            $return = _Child;
                        }
                        break;

                    case 'optgroup':
                        $return = findOptionToSelect(_Child,_value);
                        break;
                }
                if($return){
                    this.break();
                }
            });
            return $return;
        }

	}
	
	function Selected(_DJ,_bool){
        var currentStatus = _DJ.GetAttribute('selected');
        if(KUBE.Is(_bool) === 'boolean'){
            if(currentStatus !== _bool){
                _DJ.SetAttribute('selected',_bool);
                findSelect(_DJ).Emit('change');
            }
            return _DJ;
        }
        else{
            return currentStatus;
        }

        function findSelect(_DJ){
            var Parent = _DJ.GetParent();
            return (Parent.GetType() === 'select' || !Parent ? Parent : findSelect(Parent));
        }
	}

    function FindSelected(_DJ){
        return findSelectedOption(_DJ);
        function findSelectedOption(_DJ){
            var selected = false;
            var children = _DJ.GetChildren();
            children.KUBE().each(function(_ChildDJ){
                switch(_ChildDJ.GetType()){
                    case 'option':
                        if(_ChildDJ.Selected()){
                            selected = _ChildDJ;
                        }
                        break;

                    case 'optgroup':
                        selected = findSelectedOption(_DJ);
                        break;
                }

                if(selected){
                    this.break();
                }
            });
            return selected;
        }
    }
	
	function OnSelect(_DJ,_callback){
        if(KUBE.Is(_callback) === 'function'){
            var SelectParent = findSelect(_DJ);
            if(SelectParent){
                SelectParent.On('change',function(){
                    if(_DJ.Selected()){
                        _callback(_DJ);
                    }
                });
            }
        }

        function findSelect(_DJ){
            var Parent = _DJ.GetParent();
            return (Parent.GetType() === 'select' || !Parent ? Parent : findSelect(Parent));
        }
	}
		
	function Src(_DJ,_src){
		var DomNode;
		DomNode = _DJ.GetNode();
        if(_src === undefined){
            _DJ = _DJ.GetAttribute('src');
        }
        else{
            if(DomNode.src !== undefined){
                DomNode.src = _src;
            }
            else{
                _DJ.SetAttribute('src',_src);
            }
        }
		return _DJ;
	}

    function Href(_DJ,_href){
        var DomNode = _DJ.GetNode();
        if(_href === undefined){
            _DJ = _DJ.GetAttribute('href');
        }
        else{
            if(DomNode.href !== undefined){
                DomNode.href = _href;
            }
            else{
                _DJ.SetAttribute('href',_href);
            }
        }
        return _DJ;
    }
	
}(KUBE));