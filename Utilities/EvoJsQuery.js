//This is a hack to be able to use jQuery plugs with KUBEjs:
//Referenced from http://api.jquery.com/
(function(KUBE){
	"use strict";
	var initPromise,jFns,jQ,dependancies;
	dependancies = ['Select','DomJack','StyleJack','ArrayKUBE','ObjectKUBE','StringKUBE'];
	initPromise = KUBE.Uses(dependancies);
	
	KUBE.LoadFactory('jQuery',jQuery,dependancies);
	
	jFns = {
				'Animation':Animation,'Callbacks':Callbacks,'Deferred':Deferred,'Event':Event,'Tween':Tween,
				'_data':_data,'_evalUrl':_evalUrl,'_queueHooks':_queueHooks,'_removeData':_removeData,
				'acceptData':acceptData,'access':access,'active':active,
				'ajax':ajax,'ajaxPrefilter':ajaxPrefilter,'ajaxSettings':ajaxSettings,'ajaxSetup':ajaxSetup,'ajaxTransport':ajaxTransport,
				'attr':attr,'attrHooks':attrHooks,'buildFragment':buildFragment,
				'cache':{},'camelCase':camelCase,'cleanData':cleanData,'clone':clone,'contains':contains,
				'css':css,'cssHooks':cssHooks,'cssNumber':cssNumber,'cssProps':cssProps,
				'data':data,'dequeue':dequeue,'dir':dir,
				'each':each,'easing':easing,'error':error,'etag':{},'event':{},'expr':{},'extend':extend,
				'filter':filter,'find':find,'fn':{},'fx':fx,
				'get':get,'getJSON':getJSON,'getScript':getScript,'globalEval':globalEval,'grep':grep,
				'hasData':hasData,'holdReady':holdReady,
				'inArray':inArray,'isArray':isArray,'isEmptyObject':isEmptyObject,'isFunction':isFunction,'isNumeric':isNumeric,
				'isPlainObject':isPlainObject,'isReady':isReady,'isWindow':isWindow,'isXMLDoc':isXMLDoc,
				'lastModified':{},
				'makeArray':makeArray,'map':map,'merge':merge,
				'noConflict':noConflict,'noData':{},'nodeName':nodeName,'noop':noop,'now':now,
				'offset':{},
				'param':param,'parseHTML':parseHTML,'parseJSON':parseJSON,'parseXML':parseXML,'post':post,'prop':prop,'propFix':{},'propHooks':{},'proxy':proxy,
				'queue':queue,
				'ready':ready,'removeAttr':removeAttr,'removeData':removeData,'removeEvent':removeEvent,'sibling':sibling,'speed':speed,'style':style,'support':support,'swap':swap,
				'text':text,'timers':[],'trim':trim,'type':type,
				'unique':unique,'valHooks':{},'when':when
			};
			
	jQ = function(_select){
		//This caries the selection scope and returns the API that responds to that selection context
	};
			
	initPromise.then(function(){
		jFns.KUBE().each(function(_key,_val){
			jQ[_key] = _val;
		});
	});
	
	function jQuery(){
		//Jquery is a surprisingly ugly object. It presents as a function, which as an object has additional methods bound, giving it a quasi state between function and object		
		return jQ;
				
		
		var $jQueryAPI = {
			'add':add,
			'addBack':addBack,				
			'addClass':addClass,
			'after':after,
			'ajaxComplete':ajaxComplete,
			'ajaxError':ajaxError,
			'ajaxSend':ajaxSend,
			'ajaxStart':ajaxStart,
			'ajaxStop':ajaxStop,
			'ajaxSuccess':ajaxSuccess,
			'andSelf':andSelf,
			'animate':animate,
			'append':append,
			'appendTo':appendTo,
			'attr':attr,
			'before':before,
			'bind':bind,
			'blur':blur,
			'callbacks':{
				'add': callbacksAdd,
				'disable': callbacksDisable,
				'disabled': callbacksDisabled,
				'empty': callbacksEmpty,
				'fire': callbacksFire,
				'fired': callbacksFired,
				'fireWidth': callbacksFireWith,
				'has': callbacksHas,
				'lock': callbacksLock,
				'locked': callbacksLocked,
				'remove': callbacksRemove
			}
		};
		return $jQueryAPI;
		
		function add(){
			//Add elements to the set of matched elements.			
		}
		
		function addBack(){
			//Add the previous set of elements on the stack to the current set, optionally filtered by a selector.
		}
		
		function addClass(){
			//Adds the specified class(es) to each of the set of matched elements.
		}
		
		function after(){}
		function ajaxComplete(){}
		function ajaxError(){}
		function ajaxSend(){}
		function ajaxStart(){}
		function ajaxStop(){}
		function ajaxSuccess(){}
		function andSelf(){}
		function animate(){}
		function append(){}
		function appendTo(){}
		function attr(){}
		function before(){}
		function bind(){}
		function blur(){}
		function callbacks(){
			//Add,Disable,Disabled,Empty,Fire,Fired,FireWith,Has,Lock,Locked,Remove
		}
		function change(){}
		function children(){}
		function clearQueue(){}
		function click(){}
		function clone(){}
		function closest(){}
		function contents(){}
		//Context
		function css(){}
		function data(){}
		function dblclick(){}
		function deferred(){
			//Always,Done,Fail,isRejected,isResolved,notify,notifyWith,pipeprogress,promise,reject,rejectWith,resolve,resolveWith,state,then
		}
		function delay(){}
		function delegate(){}
		function dequeue(){}
		function detach(){}
		function die(){}
		function each(){}
		function empty(){}
		function end(){}
		function eq(){}
		function error(){}
		//event (is this just a DOM event?)
		function fadeIn(){}
		function fadeOut(){}
		function fadeTo(){}
		function fadeToggle(){}
		function filter(){}
		function find(){}
		function finish(){}
		function first(){}
		function focus(){}
		function focusin(){}
		function focusout(){}
		function get(){}
		function has(){}
		function hasClass(){}
		function height(){}
		function hide(){}
		function hover(){}
		function html(){}
		function index(){}
		function innerHeight(){}
		function innerWidth(){}
		function insertAfter(){}
		function insertBefore(){}
		function is(){}
		function jQuery(){
			//ajax,ajaxPrefilter,ajaxSetup,ajaxTransport,Callbacks,contains,cssHooks,data,Deferred,dequeue,each,error,extend,fn.extend,fx.interval,fx.off
			//get,getJSON,getScript,globalEval,grep,hasData,holdReady,inArray,isArray,isEmptyObject,isFunction,isNumeric,isPlainObject,isWindow,isXMLDoc
			//makeArray,map,merge,noConflict,noop,now,param,parseHTML,parseJSON,parseXML,post,proxy,queue,removeData,sub,support,trim,type,unique
			//when
		}
		function keydown(){}
		function keypress(){}
		function keyup(){}
		function last(){}
		function live(){}
		function load(){}
		function map(){}
		function mousedown(){}
		function mouseenter(){}
		function mouseleave(){}
		function mousemove(){}
		function mouseout(){}
		function mouseover(){}
		function mouseup(){}
		function next(){}
		function nextAll(){}
		function nextUntil(){}
		function not(){}
		function off(){}
		function offset(){}
		function offsetParent(){}
		function on(){}
		function one(){}
		function outerHeight(){}
		function outerWidth(){}
		function parent(){}
		function parents(){}
		function parentUntil(){}
		function position(){}
		function prepend(){}
		function prependTo(){}
		function prev(){}
		function prevAll(){}
		function prevUntil(){}
		function promise(){}
		function prop(){}
		function pushStack(){}
		function queue(){}
		function ready(){}
		function remove(){}
		function removeAttr(){}
		function removeClass(){}
		function removeData(){}
		function removeProp(){}
		function replaceAll(){}
		function replaceWidth(){}
		function resize(){}
		function scroll(){}
		function scrollLeft(){}
		function scrollTop(){}
		function select(){}
		function serialize(){}
		function serializeArray(){}
		function show(){}
		function siblings(){}
		function size(){}
		function slice(){}
		function slideDown(){}
		function slideToggle(){}
		function slideUp(){}
		function stop(){}
		function submit(){}
		function text(){}
		function toArray(){}
		function toggle(){}
		function toggleClass(){}
		function trigger(){}
		function triggerHandler(){}
		function unbind(){}
		function undelegate(){}
		function unload(){}
		function unwrap(){}
		function val(){}
		function width(){}
		function wrap(){}
		function wrapAll(){}
		function wrappInner(){}
	}
	
	//JQuery global function dump
	function Animation( elem, properties, options ) {}
	function Callbacks( options ) {}
	function Deferred ( func ) {}
	function Event( src, props ) {}
	function Tween( elem, options, prop, end, easing ) {}
	function _data( elem, name, data ) {}
	function _evalUrl( url ) {}
	function _queueHooks( elem, type ) {}
	function _removeData( elem, name ) {}
	function acceptData( elem ) {}
	function access( elems, fn, key, value, chainable, emptyGet, raw ) {}
	function ajax( url, options ) {}
	function ajaxPrefilter( dataTypeExpression, func ) {}
	//function ajaxSettings: Object
	function ajaxSetup( target, settings ) {}
	function ajaxTransport( dataTypeExpression, func ) {}
	//function arguments: null
	function attr( elem, name, value ) {}
	//function attrHooks: Object
	function buildFragment( elems, context, scripts, selection ) {}
//	cache: Object
//	caller: null
	function camelCase( string ) {}
	function cleanData( elems, /* internal */ acceptData ) {}
	function clone( elem, dataAndEvents, deepDataAndEvents ) {}
	function contains( context, elem ) {}
	function css( elem, name, extra, styles ) {}
//	function cssHooks: Object
//	function cssNumber: Object
//	function cssProps: Object
	function data( elem, name, data ) {}
	function dequeue( elem, type ) {}
	function dir( elem, dir, until ) {}
	function each( obj, callback, args ) {}
//	function easing: Object
	function error( msg ) {}
//	etag: Object
//	event: Object
//	expando: "jQuery1102029854934592731297"
//	expr: Object
	function extend() {}
	function filter( expr, elems, not ) {}
	function findSizzle( selector, context, results, seed ) {}
	//fn: Object[0]
	function fx( elem, options, prop, end, easing, unit ) {}
	function get( url, data, callback, type ) {}
	function getJSON( url, data, callback ) {}
	function getScript( url, callback ) {}
	function globalEval( data ) {}
	function grep( elems, callback, inv ) {}
	//guid: 1
	function hasData( elem ) {}
	function holdReady( hold ) {}
	
	function inArray(_searchFor, _array, _fromIndex) {
		var $return,i;
		$return = false;
		if(KUBE.Is(_array) === 'array'){
			i = _fromIndex || 0;
			for(;i<_array.length;i++){
				if(_array[i] === _searchFor){
					$return = i;
					break;
				}
			}
		}
		return $return;
	}
	
	function isArray(_arg){ 
		return (KUBE.Is(_arg) === 'array' ? true : false); 
	}
	
	function isEmptyObject(_obj) {
		var $return = false;
		if(KUBE.Is(_obj) === 'object'){
			$return = _obj.KUBE().isEmpty();
		}
		return $return;
	}
	function isFunction(_f){
		return (KUBE.Is(_f) === 'function' ? true : false);
	}
	
	function isNumeric(_n){
		return (KUBE.Is(_n) === 'number' ? true : false);
	}
	
	function isPlainObject(_obj){
		return (KUBE.Is(_obj,true) === 'object' ? true : false);
	}
	
	//isReady: true
	function isWindow(_obj){
		//return (_obj === window ? true : false);
	}
	
	function isXMLDoc(elem) {}
	
	//lastModified: Object
	//length: 2
	function makeArray(_obj,_results){
		var $return,i;
		$return = [];
		if(KUBE.Is(_obj) === 'object' && _obj.length){
			for(i=0;i<_obj.length;i++){
				$return.push(_obj[i]);
			}
		}
		return $return;
	}
	
	function map( elems, callback, arg ) {}
	function merge( first, second ) {}
	//name: ""
	function noConflict( deep ) {}
	//noData: Object
	function nodeName( elem, name ) {}
	
	function noop() {}
	
	function now() {}
	//offset: Object
	function param( a, traditional ) {}
	function parseHTML( data, context, keepScripts ) {}
	
	function parseJSON(_jsonString){
		var $return;
		if(KUBE.Is(_jsonString) === 'string'){
			$return = KUBE.JSON().parse(_jsonString);
		}
		else{
			throw new Error('parseJSON cannot parse a non string type');
		}
		return $return;
	}
	
	function parseXML( data ) {}
	function post( url, data, callback, type ) {}
	function prop( elem, name, value ) {}
	//function propFix: Object
	//propHooks: Object
	//prototype: Object[0]
	function proxy( fn, context ) {}
	function queue( elem, type, data ) {}
	function ready( wait ) {}
	//readyWait: 0
	function removeAttr( elem, value ) {}
	function removeData( elem, name ) {}
	function removeEvent( elem, type, handle ) {}
	function sibling( n, elem ) {}
	function speed( speed, easing, fn ) {}
	function style( elem, name, value, extra ) {}
	//support: Object
	function swap( elem, options, callback, args ) {}
	function text( elem ) {}
	//timers: Array[0]
	
	function trim(_text){
		var $return = _text;
		if(KUBE.Is(_text) === 'string'){
			$return = _text.KUBE().trim();
		}
		else{
			throw new Error('Cannot trim non string value');
		}
		return $return;
	}
	
	function type( obj ) {}
	function unique( results ) {}
	//valHooks: Object
	function when( subordinate /* , ..., subordinateN */ ){}
}(KUBE));


//AnimationAnimation( elem, properties, options ) {
//Callbacks( options ) {
//Deferred( func ) {
//Event( src, props ) {
//TweenTween( elem, options, prop, end, easing ) {
//_data( elem, name, data ) {
//_evalUrl( url ) {
//_queueHooks( elem, type ) {
//_removeData( elem, name ) {
//acceptData( elem ) {
//access( elems, fn, key, value, chainable, emptyGet, raw ) {
//active: 0
//ajax( url, options ) {
//ajaxPrefilter( dataTypeExpression, func ) {
//ajaxSettings: Object
//ajaxSetup( target, settings ) {
//ajaxTransport( dataTypeExpression, func ) {
//arguments: null
//attr( elem, name, value ) {
//attrHooks: Object
//buildFragment( elems, context, scripts, selection ) {
//cache: Object
//caller: null
//camelCase( string ) {
//cleanData( elems, /* internal */ acceptData ) {
//clone( elem, dataAndEvents, deepDataAndEvents ) {
//contains( context, elem ) {
//css( elem, name, extra, styles ) {
//cssHooks: Object
//cssNumber: Object
//cssProps: Object
//data( elem, name, data ) {
//dequeue( elem, type ) {
//dir( elem, dir, until ) {
//each( obj, callback, args ) {
//easing: Object
//error( msg ) {
//etag: Object
//event: Object
//expando: "jQuery1102029854934592731297"
//expr: Object
//extend() {
//filter( expr, elems, not ) {
//findSizzle( selector, context, results, seed ) {
//fn: Object[0]
//fx( elem, options, prop, end, easing, unit ) {
//get( url, data, callback, type ) {
//getJSON( url, data, callback ) {
//getScript( url, callback ) {
//globalEval( data ) {
//grep( elems, callback, inv ) {
//guid: 1
//hasData( elem ) {
//holdReady( hold ) {
//inArray( elem, arr, i ) {
//isArrayisArray() { [native code] }
//isEmptyObject( obj ) {
//isFunction( obj ) {
//isNumeric( obj ) {
//isPlainObject( obj ) {
//isReady: true
//isWindow( obj ) {
//isXMLDoc( elem ) {
//lastModified: Object
//length: 2
//makeArray( arr, results ) {
//map( elems, callback, arg ) {
//merge( first, second ) {
//name: ""
//noConflict( deep ) {
//noData: Object
//nodeName( elem, name ) {
//noop() {}
//now() {
//offset: Object
//param( a, traditional ) {
//parseHTML( data, context, keepScripts ) {
//parseJSON( data ) {
//parseXML( data ) {
//post( url, data, callback, type ) {
//prop( elem, name, value ) {
//propFix: Object
//propHooks: Object
//prototype: Object[0]
//proxy( fn, context ) {
//queue( elem, type, data ) {
//ready( wait ) {
//readyWait: 0
//removeAttr( elem, value ) {
//removeData( elem, name ) {
//removeEvent( elem, type, handle ) {
//sibling( n, elem ) {
//speed( speed, easing, fn ) {
//style( elem, name, value, extra ) {
//support: Object
//swap( elem, options, callback, args ) {
//text( elem ) {
//timers: Array[0]
//trim( text ) {
//type( obj ) {
//unique( results ) {
//valHooks: Object
//when( subordinate /* , ..., subordinateN */ )