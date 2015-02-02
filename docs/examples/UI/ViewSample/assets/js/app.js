KUBE.Uses(['/Library/DOM/DomJack','/Library/UI/UI','/Library/UI/ViewInstructions']).then(function(DJ,UI,VI){
    DJ(document.body).Style().MinHeight('100%').MinWidth('100%');
    var UIDiv = DJ(document.body).Append('div');
    UIDiv.Style().Height('100%').Width('100%');
    var UIInstance = UI(UIDiv);


    UIInstance.Root.UpdateChildren(
        [
            VI({"type": "View", "name": "/View/View"})
        ]
    );


});