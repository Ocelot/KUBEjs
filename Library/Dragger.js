/**
 * Created by anyuzer on 2014-06-16.
 */

(function(KUBE){
    "use strict";
    KUBE.LoadSingletonFactory('Dragger', Dragger,['DomJack','StyleJack','ExtendObject','ExtendArray']);
    Dragger.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function Dragger(){
        var $API,handles,targets,drop,dragOver,dragStart,dragEnd,Dragging,LastHandle;
        handles = [];
        targets = [];

        $API = {
            'AddTarget':AddTarget,
            'RemoveTarget':RemoveTarget,
            'ClearTargets':ClearTargets,
            'AddHandle':AddHandle,
            'RemoveHandle':RemoveHandle,
            'ClearHandles':ClearHandles,
            'SetDrop':SetDrop,
            'SetDragOver':SetDragOver,
            'SetDragStart':SetDragStart,
            'SetDragEnd':SetDragEnd,
            'Reset':Reset
        }.KUBE().create(Dragger.prototype);
        return $API;

        //API Methods
        function SetDrop(_f){
            if(KUBE.Is(_f) === 'function'){
                drop = _f;
            }
        }

        function SetDragOver(_f){
            if(KUBE.Is(_f) === 'function'){
                dragOver = _f;
            }
        }

        function SetDragStart(_f){
            if(KUBE.Is(_f) === 'function'){
                dragStart = _f;
            }
        }

        function SetDragEnd(_f){
            if(KUBE.Is(_f) === 'function'){
                dragEnd = _f;
            }
        }

        function AddTarget(_DomJack,_targetData){
            if(KUBE.Is(_DomJack,true) === 'DomJack'){
                targets.push({
                    'DJ':_DomJack,
                    'data':_targetData,
                    'drop':function(){
                        dropWrapper(this);
                    },
                    'dragOver':function(){
                        return dragOverWrapper(this);
                    }
                });
//                _DomJack.On('drop',dropWrapper);
//                _DomJack.On('dragOver',dragOverWrapper);
            }
        }

        function RemoveTarget(_DomJack){
            targets.KUBE().each(function(_Target,_index){
                if(_Target.DJ === _DomJack){
                    _Target.DJ.Clear('drop');
                    _Target.DJ.Clear('dragOver');
                    targets.splice(_index,1);
                    this.break();
                }
            });
        }

        function ClearTargets(){
            targets.KUBE().each(function(_Target){
               _Target.DJ.Clear('drop');
               _Target.DJ.Clear('dragOver');
            });
            targets = [];
        }

        function AddHandle(_DomJack,_dropData){
            if(KUBE.Is(_DomJack,true) === 'DomJack'){
                handles.push({
                    'DJ':_DomJack,
                    'data':_dropData
                });

                _DomJack.SetAttribute('draggable',true);
                _DomJack.On('dragStart',dragStartWrapper);
                _DomJack.On('dragEnd',dragEndWrapper);
            }
        }


        function RemoveHandle(_DomJack){
            handles.KUBE().each(function(_Handle,_index){
                if(_Handle.DJ === _DomJack){
                    _Handle.DJ.Clear('dragStart');
                    _Handle.DJ.Clear('dragEnd');
                    handles.splice(_index,1);
                    this.break();
                }
            });
        }

        function ClearHandles(){
            handles.KUBE().each(function(_Handle){
                _Handle.DJ.Clear('dragStart');
                _Handle.DJ.Clear('dragEnd');
            });
            handles = [];
        }

        function Reset(){
            ClearTargets;
            ClearHandles;
            drop = undefined;
            dragOver = undefined;
            dragStart = undefined;
            dragEnd = undefined;
        }

        //Private
        function dragStartWrapper(){
            //Activate the targets
            activateTargets(this);
            if(dragStart){
                dragStart(LastHandle);
            }
        }

        function dragEndWrapper(){
            if(dragEnd){
                dragEnd(LastHandle);
            }
            deactivateTargets();
        }

        function dropWrapper(_DJ){
            if(drop){
                dragEndWrapper();
                drop(LastHandle,_DJ,getDropData(LastHandle),getTargetData(_DJ));
            }
        }

        function dragOverWrapper(_DJ){
            if(dragOver){
                dragOver(LastHandle,_DJ,getDropData(LastHandle),getTargetData(_DJ));
            }
            return false;
        }

        function getDropData(_DJ){
            //May not be the most optimized way to do this. Sort it out later.
            var $return;
            handles.KUBE().each(function(_Handle){
                if(_Handle.DJ === _DJ){
                    $return = _Handle.data;
                    this.break();
                }
            });
            return $return;
        }

        function getTargetData(_DJ){
            var $return;
            targets.KUBE().each(function(_Target){
               if(_Target.DJ === _DJ){
                   $return = _Target.data;
                   this.break();
               }
            });
            return $return;
        }

        function activateTargets(_Drag){
            if(!Dragging){
                Dragging = _Drag;
                LastHandle = _Drag;
                targets.KUBE().each(function(_Target){
                    _Target.DJ.On('drop',_Target.drop);
                    _Target.DJ.On('dragOver',_Target.dragOver);
                });
            }
        }

        function deactivateTargets(){
            if(Dragging){
                targets.KUBE().each(function(_Target){
                    _Target.DJ.RemoveListener('drop',_Target.drop);
                    _Target.DJ.RemoveListener('dragOver',_Target.dragOver);
                });
                Dragging = undefined;
            }
        }
    }
})(KUBE);