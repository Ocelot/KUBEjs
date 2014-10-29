(function(KUBE){
	"use strict";
	KUBE.LoadSingleton('/Library/Console',Console,['/Library/ExtendArray','/Library/ExtendObject']);
	
	Console.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Console(){
		var $consoleAPI,logStore;
		logStore = [];
		$consoleAPI = {
			"assert": Assert,
            "count": Count,
            "debug": Log,
            "dir": Dir,
            "error": _Error,
            "_exception": _Error,
            "group": Group,
            "groupCollapsed": GroupCollapsed,
            "groupEnd": GroupEnd,
            "info": Info,
            "log": Log,
            "profile": Profile,
            "profileEnd": ProfileEnd,
            "table": Table,
            "time": Time,
            "timeEnd": TimeEnd,
            "trace": Trace,
            "warn": Warn
		};
		
		return $consoleAPI;

        function Assert(){
            if(checkDebug() && KUBE.Is(console().assert) === "function"){
                console().assert.apply(console(),transformArgs(arguments));
            }
        }

        function Count(){
            if(checkDebug() && KUBE.Is(console().count) === "function"){
                console().count.apply(console(),transformArgs(arguments));
            }
        }

        function Log(){
            if(checkDebug() && KUBE.Is(console().log) === "function"){
                console().log.apply(console(),transformArgs(arguments));
            }
        }

        function Dir(){
            if(checkDebug() && KUBE.Is(console().dir) === "function"){
                console().dir.apply(console(),transformArgs(arguments));
            }
        }

        function _Error(){
            if(checkDebug() && KUBE.Is(console().error) === "function"){
                console().error.apply(console(),transformArgs(arguments))
            }
        }

        function Group(){
            if(checkDebug() && KUBE.Is(console().group) === "function"){
                console().group.apply(console(),transformArgs(arguments))
            }
        }

        function GroupCollapsed(){
            if(checkDebug() && KUBE.Is(console().groupCollapsed) === "function"){
                console().groupCollapsed.apply(console(),transformArgs(arguments))
            }
        }

        function GroupEnd(){
            if(checkDebug() && KUBE.Is(console().groupEnd) === "function"){
                console().groupEnd.apply(console(),transformArgs(arguments))
            }
        }

        function Info(){
            if(checkDebug() && KUBE.Is(console().info) === "function"){
                console().info.apply(console(),transformArgs(arguments))
            }
        }

        function Profile(){
            if(checkDebug() && KUBE.Is(console().profile) === "function"){
                console().profile.apply(console(),transformArgs(arguments))
            }
        }

        function ProfileEnd(){
            if(checkDebug() && KUBE.Is(console().profileEnd) === "function"){
                console().profileEnd.apply(console(),transformArgs(arguments))
            }
        }

        function Table(){
            if(checkDebug() && KUBE.Is(console().table) === "function"){
                console().table.apply(console(),transformArgs(arguments))
            }
        }

        function Time(){
            if(checkDebug() && KUBE.Is(console().time) === "function"){
                console().time.apply(console(),transformArgs(arguments))
            }
        }

        function TimeEnd(){
            if(checkDebug() && KUBE.Is(console().timeEnd) === "function"){
                console().timeEnd.apply(console(),transformArgs(arguments))
            }
        }

        function Trace(){
            if(checkDebug() && KUBE.Is(console().trace) === "function"){
                console().trace.apply(console(),transformArgs(arguments))
            }
        }

        function Warn(){
            if(checkDebug() && KUBE.Is(console().warn) === "function"){
                console().warn.apply(console(),transformArgs(arguments))
            }
        }

        function checkDebug(){
            var $return = false;
            if(KUBE.Config().debug || 1 == 1){
                $return = true;
            }
            return $return;
        }

        function console(){
            return window.console || false;
        }

        function transformArgs(argumentObj){
            var $return = [];
            for(var i = 0; i < argumentObj.length; i++){
                $return.push(argumentObj[i]);
            }
            return $return;
        }


		

	}	
}(KUBE));