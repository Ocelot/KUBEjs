(function(KUBE){
    var TestIndex = KUBE.AutoLoad().GetNewIndex();
    TestIndex.SetNamespace('/Library/Test');
    TestIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Test');
    TestIndex.SetIndex([
        'Test',
        'Test2'
    ]);

    KUBE.AutoLoad().AddIndex(TestIndex);

}(KUBE));