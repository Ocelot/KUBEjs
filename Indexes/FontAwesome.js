(function(KUBE){
    var Index = KUBE.AutoLoad().GetNewIndex();
    Index.SetNamespace('/Library/FontAwesome');
    Index.SetBaseURL(KUBE.Config().autoLoadPath+'Library/FontAwesome');
    Index.SetIndex([
        'FontAwesome'
    ]);

    KUBE.AutoLoad().AddIndex(Index);

}(KUBE));