(function(){

    function initDefaultConfig(){
        var config = {
            "autoLoadPath" : getAutoLoadPath(),
            "debug": true
        };
        return config;

        function getAutoLoadPath() {
            var src = srcFromCurrentScript() || srcFallback();
            return parseAutoLoadPath(src);
        }

        function parseAutoLoadPath(_src) {
            var paths = _src.split('/');
            return paths.splice(0,paths.length-1).join('/');
        }

        function srcFromCurrentScript(){
            return (document.currentScript !== undefined) ? document.currentScript.getAttribute('src') : false;
        }

        function srcFallback(){
            var scripts;
            scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1].src;
        }
    }

    var relativePath = '';
    var map = {
        '/Library/Ajax':''
    };

    KUBE.AutoLoad.DynamicMap('/Library',map);
}(KUBE));