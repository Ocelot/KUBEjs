(function(KUBE){
    "use strict";

    /* Load functions */
    var ExtendAPI;
    KUBE.SetAsLoaded('ExtendConsole');
    if(KUBE.Extend){
        ExtendAPI = KUBE.Extend();
        KUBE.EmitState('ExtendConsole');
        console.log('ExtendConsole Loaded');
    }

    /* Declare functions */

}(KUBE));