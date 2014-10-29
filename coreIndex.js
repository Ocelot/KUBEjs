(function(KUBE){

    //function initDefaultConfig(){
    //    var config = {
    //        "autoLoadPath" : getAutoLoadPath(),
    //        "debug": true
    //    };
    //    return config;
    //
    //    function getAutoLoadPath() {
    //        var src = srcFromCurrentScript() || srcFallback();
    //        return parseAutoLoadPath(src);
    //    }
    //
    //    function parseAutoLoadPath(_src) {
    //        var paths = _src.split('/');
    //        return paths.splice(0,paths.length-1).join('/');
    //    }
    //
    //    function srcFromCurrentScript(){
    //        return (document.currentScript !== undefined) ? document.currentScript.getAttribute('src') : false;
    //    }
    //
    //    function srcFallback(){
    //        var scripts;
    //        scripts = document.getElementsByTagName('script');
    //        return scripts[scripts.length - 1].src;
    //    }
    //}

    var ToolIndex = KUBE.AutoLoad.GetNewIndex();
    ToolIndex.SetNamespace('/Library/Tools');
    ToolIndex.SetBaseURL('KUBEjs/Library/Tools');
    LibraryIndex.SetIndex([
        'Ajax',
        'Appearance',
        'Arrow',
        'Bezier',
        'Color',
        'Console',
        'Convert',
        'DomJack',
        'Dragger',
        'FeatureDetect',
        'FontAwesome',
        'Gradient',
        'Handlebars',
        'Hash',
        'HighlightPHP',
        'JSON',
        'QuickFlow',
        'Scroll',
        'Select',
        'StyleJack',
        'TextKing',
        'Theme',
        'ThemeManager',
        'Timer',
        'UI',
        'Upload',
        'Velocity',
        'ViewFlow',
        'WinDocJack'
    ]);
    KUBE.AutoLoad.AddIndex(LibraryIndex);



    var LibraryDomIndex = KUBE.AutoLoad.GetNewIndex();
    LibraryDomIndex.SetNamespace('/Library/DOM');
    LibraryDomIndex.SetBaseURL('/KUBEjs/Library');
    LibraryDomIndex.SetIndex([]);

    var libraryIndex = {
        'namespace':'/Library'
        'baseUrl':'/KUBEjs/Library',
        'index':[
            'Ajax',
            'Animate',
            'AnimateTo',
            'Appearance',
            'Arrow',
            'Bezier',
            'Color',
            'Console',
            'Convert',
            'DomJack',
            'Dragger',
            'FeatureDetect',
            'FontAwesome',
            'Gradient',
            'Handlebars',
            'Hash',
            'HighlightPHP',
            'JSON',
            'QuickFlow',
            'Scroll',
            'Select',
            'StyleJack',
            'TextKing',
            'Theme',
            'ThemeManager',
            'Timer',
            'UI',
            'Upload',
            'Velocity',
            'ViewFlow',
            'WinDocJack'
        ]
    };

    var libraryDomIndex = {
        'namespace':'/Library/DOM',
        'baseUrl':'/KUBEjs/Library/DOM',
        'index':[
            'DomJack',
            'WinDocJack',
            'StyleJack'
        ]
    };



    var extendIndex = {
        'namespace':'/Extend',
        'baseUrl':'/KUBEjs/Extend',
        'index':[
            'Array',
            'Date',
            'Function',
            'Math',
            'Number',
            'Object',
            'RegExp',
            'String'
        ]
    }

    //KUBE.AutoLoad.DynamicMap('/Library',libraryIndex);
    //KUBE.AutoLoad.DynamicMap('/Extend',extendIndex)

    KUBE.AutoLoad.AutoIndex('/Library','libraryIndex.js')
    KUBE.AutoLoad.AutoIndex('/Extend','extendIndex.js')

}(KUBE));


KUBE.Uses([]);

KUBE.Class('/')