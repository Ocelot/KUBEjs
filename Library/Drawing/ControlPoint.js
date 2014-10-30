(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/Drawing/ControlPoint',ControlPoint,['/Library/Extend/Object']);

    ControlPoint.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function ControlPoint(_x,_y,clipBounds){
        var x,y;
        clipBounds = !!clipBounds;
        x = checkBounds(_x,clipBounds);
        y = checkBounds(_y,clipBounds);
        var api = {
            'X' : X,
            'Y': Y,
            'Get': Get
        }

        return api.KUBE().create(ControlPoint.prototype);

        function X(){
            return x;
        }

        function Y(){
            return y;
        }

        function Get(){
            return {'x': x, 'y': y}
        }

        function checkBounds(v,clipBounds){
            if(clipBounds){
                var $return = v;
                if(v > 1){ $return = 1; }
                else if(v < 0){ $return = 0 }
                return $return;
            }
            else{
                return v;
            }

        }

    }
}(KUBE));