(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/Test2',Test2,['/Library/Test']);

    function Test2(){
        var Test = KUBE.Classes('/Library/Test');
        return {
            'Call':function(){
                console.log(Test.Get()+' from Test2');
            },
            'Get':function(){
                return 'Test2';
            }
        };
    }

}(KUBE));