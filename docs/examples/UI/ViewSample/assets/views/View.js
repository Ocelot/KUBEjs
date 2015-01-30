(function(KUBE){
    "use strict";
    var uses = {
        'Loader':'/Library/UI/Loader',
        'DJ':'/Library/DOM/DomJack',
        'SJ':'/Library/DOM/StyleJack'
    };

    KUBE.Uses(uses).then(function($K){
        $K.Loader().Load('/View/View',View);
    });

    function View(CoreView,_numChildren){
        var height, width, DomView, $K;
        $K = KUBE.Class(uses);

        return CoreView.KUBE().merge({
            'Get':Get,
            'Init': Init,
            'Read':Read,
            'Update':Update,
            'Delete':Delete,
            'Add':Add,
            'AddFinish':AddFinish,
            'Width':Width,
            'Height':Height,
            'Resize':Resize
        });

        function Init(_data,_allocatedWidth,_allocatedHeight){

        }


        function Read(){
            return data;
        }

        function Update(_data){

        }

        function Delete(){
            DomView.Delete();
            DomView = undefined;
            CoreView.Emit('delete');
        }

        function Add(_NewView){
            KUBE.console.log('ADD CALLED ON VIEW');
        }


        function AddFinish(){

        }

        function Get(){
            return DomView;
        }

        function Width(){
            return width;
        }

        function Height(){
            return height;
        }

        function Resize(){
            width = CoreView.Parent().Width();
            height = CoreView.Parent().Width();
            CoreView.ResizeChildren();
        }

        function create(){
            width = CoreView.Parent().Width();
            height = CoreView.Parent().Width();

            DomView = $K.DJ('div');
            DomView.Style().Height(height).Width(width);
        }
    }

}(KUBE));
