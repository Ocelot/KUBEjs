(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/Library/Test/Test2',Test2,['/Library/Test/Test','/Library/DOM/DomJack']);

    function Test2(){
        var DJ = KUBE.Class('/Library/DOM/DomJack');
        return {
            'Draw':function(){
                DJ().Ready(function(){
                    var Box = DJ('div');
                    Box.Style().Width(100).Height(100).Position('relative').Background().Color('black');
                    DJ(document.body).Dump().Append(Box);
                });
            }
        };
    }

}(KUBE));