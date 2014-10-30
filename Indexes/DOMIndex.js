(function(KUBE){
    var DOMIndex = KUBE.AutoLoad().GetNewIndex();
    DOMIndex.SetNamespace('/Library/DOM');
    DOMIndex.SetBaseURL('KUBEjs/Library/DOM');
    DOMIndex.SetIndex([
        'Ajax',
        'DomJack',
        'Dragger',
        'FeatureDetect',
        'Scroll',
        'Select',
        'StyleJack',
        'TextKing',
        'Upload',
        'Velocity',
        'WinDocJack'
    ]);

    KUBE.AutoLoad().AddIndex(DOMIndex);
}(KUBE));