(function(KUBE){
    var ToolsIndex = KUBE.AutoLoad().GetNewIndex();
    ToolsIndex.SetNamespace('/Library/Tools');
    ToolsIndex.SetBaseURL('KUBEjs/Library/Tools');
    ToolsIndex.SetIndex([
        'Convert',
        'ConvertCheck',
        'Handlebars',
        'Hash'
    ]);

    KUBE.AutoLoad().AddIndex(ToolsIndex);

}(KUBE));