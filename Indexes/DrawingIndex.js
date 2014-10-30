(function(KUBE){
    var DrawingIndex = KUBE.AutoLoad().GetNewIndex();
    DrawingIndex.SetNamespace('/Library/Drawing');
    DrawingIndex.SetBaseURL('KUBEjs/Library/Drawing');
    DrawingIndex.SetIndex([
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

    KUBE.AutoLoad().AddIndex(DrawingIndex);
}(KUBE));