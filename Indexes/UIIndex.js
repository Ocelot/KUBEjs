(function(KUBE){
    var UIIndex = KUBE.AutoLoad().GetNewIndex();
    UIIndex.SetNamespace('/Library/UI');
    UIIndex.SetBaseURL('KUBEjs/Library/UI');
    UIIndex.SetIndex([
        'Appearance',
        'Theme',
        'ThemeManager',
        'UI'
    ]);

    KUBE.AutoLoad().AddIndex(ToolsIndex);

}(KUBE));