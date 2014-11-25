(function(KUBE){
    var DrawingIndex = KUBE.AutoLoad().GetNewIndex();
    DrawingIndex.SetNamespace('/Library/Drawing');
    DrawingIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Drawing');
    DrawingIndex.SetIndex([
        'Arrow',
        'Bezier',
        'Color',
        'ControlPoint',
        'LinearGradient',
        'Spinner'
    ]);

    KUBE.AutoLoad().AddIndex(DrawingIndex);
}(KUBE));