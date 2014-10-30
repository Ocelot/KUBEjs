(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/Test/Test',Test,['/Library/Test/Test2']);

    function Test(){
        var Test2 = KUBE.Class('/Library/Test/Test2');
        return {
            'Call':function(){
                Test2().Draw();
            }
        };
    }

}(KUBE));