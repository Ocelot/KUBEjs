(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/Test/Test2',Test2,['/Library/Test/Test']);

    function Test2(){
        var Test = KUBE.Classes('/Library/Test/Test');
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