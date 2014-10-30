(function(KUBE){
    var ExtendIndex = KUBE.AutoLoad().GetNewIndex();
    ExtendIndex.SetNamespace('/Library/Extend');
    ExtendIndex.SetBaseURL('KUBEjs/Library/Extend');
    ExtendIndex.SetIndex([
        'Array',
        'Date',
        'Function',
        'Math',
        'Number',
        'Object',
        'RegExp',
        'String'
    ]);

    KUBE.AutoLoad().AddIndex(ExtendIndex);

}(KUBE));