(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/UI/Instructions',Instructions,['/Library/Extend/Object']);
    Instructions.prototype.toString = function(){ return '[object '+this.constructor.name+']' }
    function Instructions(_dataObj){
        var $API;
        $API = {

        }.KUBE().create(Instructions.prototype);
        return $API;
    }
}(KUBE));