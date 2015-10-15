(function(KUBE) {
    "use strict";
    /* Load class */
    KUBE.LoadSingletonFactory('/Library/Tools/KeyVal', KeyVal);

    KeyVal.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function KeyVal() {
        var store = {};
        var lock = {};
        var Events = KUBE.Events();

        return {
            "On": Events.On,
            "Once": Events.Once,
            "Emit": Events.Emit,
            "Clear": Events.Clear,
            "RemoveListener": Events.RemoveListener,
            "ListenerCount": Events.ListenerCount,
            "EmitState": Events.EmitState,
            "OnState": Events.OnState,
            "ClearState": Events.ClearState,
            "CheckState": Events.CheckState,
            "Set": Set,
            "Get": Get,
            "GetAll": GetAll
        };

        function Set(k,v,_lock){
            if(_lock !== undefined && !validateLock(k,_lock)){
                return false;
            }

            if(store[k] && v === undefined){
                Events.Emit('delete:' + k);
                delete store[k];
                delete lock[k];
            }
            else{
                Events.Emit('change:' + k, v);
                store[k] = v;
            }
        }

        function Get(k){
            return store[k];
        }

        function GetAll(){
            return store;
        }

        function validateLock(k,_lock){
            if(lock[k] === undefined){
                return true;
            }
            return (lock[k] === _lock);
        }

    }
}(KUBE));