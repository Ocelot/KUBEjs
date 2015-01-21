(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/DOM/Dragger/DraggerHandle', DraggerHandle,['/Library/Extend/Object']);
    DraggerHandle.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function DraggerHandle(_DomJack){
        var _eventFunctionStorage = {
                "drag": undefined,
                "dragStart": undefined,
                "dragEnd": undefined
            },
            voidFunction = function(){},
            data,
            drag,
            dragStart,
            dragEnd;

        if(KUBE.Is(_DomJack,true) !== "DomJack"){
            throw new Exception('You must pass a DomJack into DraggerTarget');
        }

        var $api = {
            'GetDomJack': GetDomJack,
            'SetData': SetData, 'GetData': GetData,
            'SetDrag': SetDrag, 'GetDrag': GetDrag,
            'SetDragStart': SetDragStart, 'GetDragStart': GetDragStart,
            'SetDragEnd': SetDragEnd, 'GetDragEnd': GetDragEnd,
        }.KUBE().create(DraggerHandle.prototype);


        Object.defineProperty($api,'DJ',{get: GetDomJack});
        Object.defineProperty($api,'data',{get: GetData});
        Object.defineProperty($api,'drag',{get: GetDrag});
        Object.defineProperty($api,'dragStart',{get: GetDragStart});
        Object.defineProperty($api,'dragEnd',{get: GetDragEnd});

        Object.defineProperty($api,'__events', {
            "enumerable": false,
            "get": _GetEventFunctionStorage
        });

        return $api;

        //API Methods

        function GetDomJack(){ return _DomJack; }

        function SetData(val){
            data = val;
            return $api;
        }
        function GetData(){
            return data;
        }

        function SetDrag(val){
            if(isFunction(val)) {
                drag = val;
            }
            return $api;
        }
        function GetDrag(){
            return drag || voidFunction;
        }

        function SetDragStart(val){
            if(isFunction(val)) {
                dragStart = val;
            }
            return $api;
        }
        function GetDragStart(){
            return dragStart || voidFunction;
        }

        function SetDragEnd(val){
            if(isFunction(val)) {
                dragEnd = val;
            }
            return $api;
        }
        function GetDragEnd(){
            return dragEnd || voidFunction;
        }


        //These methods are used for event storage.  They are so that we can reliably unbind the correct function.

        function _GetEventFunctionStorage(){
            var $ret = {};
            Object.defineProperty($ret,'drag',{get: _GetDragFunction, set: _StoreDragFunction});
            Object.defineProperty($ret,'dragStart',{get: _GetDragStartFunction, set: _StoreDragStartFunction});
            Object.defineProperty($ret,'dragEnd',{get: _GetDragEndFunction, set: _StoreDragEndFunction});

            return $ret;
        }

        function _GetDragFunction(){
            return _eventFunctionStorage.drag;
        }

        function _StoreDragFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.drag = _f;
            }
        }

        function _GetDragStartFunction(){
            return _eventFunctionStorage.dragStart;
        }

        function _StoreDragStartFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.dragStart = _f;
            }
        }

        function _GetDragEndFunction(){
            return _eventFunctionStorage.dragEnd;
        }

        function _StoreDragEndFunction(_f){
            if(isFunction(_f)){
                _eventFunctionStorage.dragEnd = _f;
            }
        }

        //Shortcut because repetitive
        function isFunction(val){return (KUBE.Is(val) === "function");}
    }

}(KUBE));
