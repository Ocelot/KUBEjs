(function(KUBE){
    var DOMIndex = KUBE.AutoLoad().GetNewIndex();
    DOMIndex.SetNamespace('/Library/DOM');
    DOMIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/DOM');
    DOMIndex.SetIndex([
        'Ajax',
        'DomJack',
        'Dragger',
        'FeatureDetect',
        'Scroll',
        'Select',
        'StyleJack',
        'TextKing',
        'Velocity',
        'WinDocJack'
    ]);

    KUBE.AutoLoad().AddIndex(DOMIndex);
}(KUBE));