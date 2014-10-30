(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/Test/Test',Test,['/Library/Test/Test2']);

    function Test(){
        var Test2 = KUBE.Classes('/Library/Test/Test2');
        return {
            'Call':function(){
                console.log(Test2.Get()+' from Test');
            },
            'Get':function(){
                return 'Test';
            }
        };
    }

}(KUBE));