(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/DOM/Dragger/DraggerTarget', DraggerTarget,['/Library/Extend/Object']);
    DraggerTarget.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function DraggerTarget(_DomJack){
        var _eventFunctionStorage = {
                "drop": undefined,
                "drag": undefined,
                "dragOver": undefined,
                "dragEnter": undefined,
                "dragLeave": undefined,
                "dragStart": undefined,
                "dragEnd": undefined
            },
            voidFunction = function(){},
            falseFunction = function(){return false},
            data,
            drop,
            dragEnter,
            dragLeave,
            dragOver;
        if(KUBE.Is(_DomJack,true) !== "DomJack"){
            throw new Exception('You must pass a DomJack into  DraggerTarget');
        }

        var $api = {
            'GetDomJack': GetDomJack,
            'SetData': SetData, 'GetData': GetData,
            'SetDrop': SetDrop, 'GetDrop': GetDrop,
            'SetDragEnter': SetDragEnter, 'GetDragEnter': GetDragEnter,
            'SetDragLeave': SetDragLeave, 'GetDragLeave': GetDragLeave,
            'SetDragOver': SetDragOver, 'GetDragOver': GetDragOver,
        }.KUBE().create(DraggerTarget.prototype);


        Object.defineProperty($api,'DJ',{get: GetDomJack});
        Object.defineProperty($api,'data',{get: GetData});
        Object.defineProperty($api,'drop',{get: GetDrop});
        Object.defineProperty($api,'dragEnter',{get: GetDragEnter});
        Object.defineProperty($api,'dragLeave',{get: GetDragLeave});
        Object.defineProperty($api,'dragOver',{get: GetDragOver});

        Object.defineProperty($api,'__events', {
            "enumerable": false,
            "get": _GetEventFunctionStorage
        });

        return $api;

        function GetDomJack(){ return _DomJack; }

        function SetData(val){
            data = val;
            return $api;
        }
        function GetData(){
            return data;
        }

        function SetDrop(val){
            if(isFunction(val)) {
                drop = val;
            }
            return $api;
        }
        function GetDrop(){
            return drop || voidFunction;
        }

        function SetDragEnter(val){
            if(isFunction(val)) {
                dragEnter = val;
            }
            return $api;
        }
        function GetDragEnter(){
            return dragEnter || voidFunction;
        }

        function SetDragLeave(val){
            if(isFunction(val)) {
                dragLeave = val;
            }
            return $api;
        }
        function GetDragLeave(){
            return dragLeave || voidFunction;
        }

        function SetDragOver(val){
            if(isFunction(val)) {
                dragOver = val;
            }
            return $api;
        }
        function GetDragOver(){
            return dragOver || falseFunction;
        }


        //These methods are used for event storage.  They are so that we can reliably unbind the correct function.

        function _GetEventFunctionStorage(){
            var $ret = {};
            Object.defineProperty($ret,'drop',{get: _GetDropFunction, set: _StoreDropFunction});
            Object.defineProperty($ret,'dragEnter',{get: _GetDragEnterFunction, set: _StoreDragEnterFunction});
            Object.defineProperty($ret,'dragLeave',{get: _GetDragLeaveFunction, set: _StoreDragLeaveFunction});
            Object.defineProperty($ret,'dragOver',{get: _GetDragOverFunction, set: _StoreDragOverFunction});

            return $ret;
        }

        function _GetDropFunction(){
            return _eventFunctionStorage.drop;
        }

        function _StoreDropFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.drop = _f;
            }
        }

        function _GetDragOverFunction(){
            return _eventFunctionStorage.dragOver;
        }

        function _StoreDragOverFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.dragOver = _f;
            }
        }

        function _GetDragEnterFunction(){
            return _eventFunctionStorage.dragEnter;
        }

        function _StoreDragEnterFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.dragEnter = _f;
            }
        }

        function _GetDragLeaveFunction(){
            return _eventFunctionStorage.dragLeave;
        }

        function _StoreDragLeaveFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.dragLeave = _f;
            }
        }

        //Shortcut because repetitive
        function isFunction(val){return (KUBE.Is(val) === "function");}

    }

}(KUBE));
