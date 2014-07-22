(function(KUBE){
    "use strict";

    /* Load functions */
    var ExtendAPI;
    KUBE.SetAsLoaded('ExtendConsole');
    if(KUBE.Extend){
        ExtendAPI = KUBE.Extend();
        ExtendAPI.Load('Console','todo',Todo);
        KUBE.EmitState('ExtendConsole');
        console.log('ExtendConsole Loaded');
    }

    /* Declare functions */

    function Todo(_message){
        //The sorta ironic part is that I need this method to describe this method. It's incomplete, but is a start.
        var style = "color: green;";
        var message = [];

        if(KUBE.Is(_message) === "array"){
            message = _message;
            message.unshift("%cTODO: ");
        }
        else{
            message.push("%cTODO: " + _message);

        }
        message.push(style);
        console.log.apply(this,message);
    }

}(KUBE));