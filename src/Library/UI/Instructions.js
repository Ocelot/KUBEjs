(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/UI/Instructions',Instructions,['/Library/Extend/Object']);
    Instructions.prototype.toString = function(){ return '[object '+this.constructor.name+']' }

    //Temporary fill in, will properly build it out later
    function Instructions(_instructionObj){
        var $API;
        $API = {
            'Get':Get
        }.KUBE().create(Instructions.prototype);
        return $API;

        function Get(){
            return _instructionObj;
        }
    }
}(KUBE));