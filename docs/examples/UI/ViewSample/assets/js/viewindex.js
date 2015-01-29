KUBE.Uses(['/Library/UI/Loader']).then(function(Loader){
    var Index = Loader().AutoLoad().GetNewIndex();
    Index.SetNamespace('/View');
    Index.SetBaseURL('assets/views');
    Index.SetIndex(["View"]);
    Loader().AutoLoad().AddIndex(Index);
});