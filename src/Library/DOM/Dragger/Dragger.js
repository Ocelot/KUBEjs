/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    "use strict";
    KUBE.LoadSingletonFactory('/Library/DOM/Dragger/Dragger', Dragger,['/Library/DOM/DomJack','/Library/DOM/StyleJack','/Library/Extend/Object','/Library/Extend/Array']);


    function Dragger(){
        var $API,handles,targets,Dragging,LastHandle;
        handles = [];
        targets = [];

        $API = {
            'AddTarget':AddTarget,
            'RemoveTarget':RemoveTarget,
            'ClearTargets':ClearTargets,
            'AddHandle':AddHandle,
            'RemoveHandle':RemoveHandle,
            'ClearHandles':ClearHandles,
            'Reset':Reset
        }.KUBE().create(Dragger.prototype);
        return $API;

        //API Methods

        function AddTarget(DraggerTarget,_acceptFiles){

            if(KUBE.Is(DraggerTarget,true) === 'DraggerTarget'){
                if(_acceptFiles){
                    initializeFileTarget(DraggerTarget);
                }

                DraggerTarget.DJ.On('cleanup',function(){
                    RemoveTarget(this)
                });
                targets.push(DraggerTarget);
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

        function AddHandle(_Handle){
            if(KUBE.Is(_Handle,true) === "DraggerHandle"){
                _Handle.DJ.SetAttribute('draggable',true);
                _Handle.DJ.On('dragStart',dragStartWrapper(_Handle));
                _Handle.DJ.On('dragEnd',dragEndWrapper(_Handle));
                _Handle.DJ.On('drag',dragWrapper(_Handle));
                _Handle.DJ.On('cleanup',function(){
                    RemoveHandle(this);
                });
                handles.push(_Handle);
            }
        }


        function RemoveHandle(_DJ){
            if(KUBE.Is(_DJ,true) === "DomJack") {
                handles.KUBE().each(function (_Handle, _index) {
                    if (_Handle.DJ === _DJ) {
                        _Handle.DJ.Clear('dragStart',_Handle.__events.dragStart);
                        _Handle.DJ.Clear('dragEnd',_Handle.__events.dragEnd);
                        _Handle.DJ.Clear('drag',_Handle.__events.drag);
                        handles.splice(_index, 1);
                        this.break();
                    }
                });
            }
        }

        function ClearHandles(){
            handles.KUBE().each(function(_Handle){
                _Handle.DJ.Clear('dragStart',_Handle.__events.dragStart);
                _Handle.DJ.Clear('dragEnd',_Handle.__events.dragEnd);
                _Handle.DJ.Clear('drag',_Handle.__events.drag);
            });
            handles = [];
        }

        function Reset(){
            ClearTargets();
            ClearHandles();
        }

        //Private
        function dragStartWrapper(_Handle){
            var f = function(_domEvent){
                //Activate the targets
                _Handle.dragStart.call(this,_domEvent);
                activateTargets(this);
            };
            _Handle.__events.dragStart = f;
            return f;
        }

        function dragEndWrapper(_Handle){
            var f = function(_domEvent){
                if(_domEvent){
                    //If there's no domEvent, it's because we called it on drop.
                    _Handle.dragEnd.call(this,_domEvent);
                }
                deactivateTargets(this);
            };
            _Handle.__events.dragEnd = f;
            return f;
        }

        function dragWrapper(_Handle){
            var f = function(_domEvent){
                _Handle.drag.call(this,_domEvent);
            };
            _Handle.__events.drag = f;
            return f;
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

        function getDropHandle(_DJ){
            var $return;
            handles.KUBE().each(function(_Handle){
                if(_Handle.DJ === _DJ){
                    $return = _Handle;
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
                    _Target.DJ.On('drop',generateDropFunction(_Target));
                    _Target.DJ.On('dragOver',generateDragOverFunction(_Target));
                    _Target.DJ.On('dragEnter',generateDragEnterFunction(_Target));
                    _Target.DJ.On('dragLeave',generateDragLeaveFunction(_Target));
                });
            }
        }

        function deactivateTargets(){
            if(Dragging){
                targets.KUBE().each(function(_Target){
                    _Target.DJ.RemoveListener('drop',_Target.__events.drop);
                    _Target.DJ.RemoveListener('dragOver',_Target.__events.dragOver);
                    _Target.DJ.RemoveListener('dragEnter',_Target.__events.dragEnter);
                    _Target.DJ.RemoveListener('dragLeave',_Target.__events.dragLeave);
                });
                Dragging = undefined;
            }
        }

        function generateDropFunction(_target){
            var f = function(_domEvent) {
                var dropHandle,dragEndFunction;
                if (KUBE.Is(_target.drop) === 'function') {
                    dropHandle = getDropHandle(LastHandle);
                    dragEndFunction = dragEndWrapper(dropHandle);
                    dragEndFunction.apply(LastHandle.DJ);
                    var droppedItem = {
                        "domjack": LastHandle,
                        "data": getDropData(LastHandle)
                    };
                    var targetItem = {
                        "domjack": _target.DJ,
                        "data": _target.data
                    };

                    var dragData = {
                        'dragged': droppedItem,
                        'target': targetItem,
                        'event': _domEvent
                    };

                    return _target.drop.call(this,dragData);

                }
            }
            _target.__events.drop = f;
            return f;
        }

        function generateDragOverFunction(_target){
            var f = function(_domEvent){

                var draggedItem = {
                    "domjack": LastHandle,
                    "data": getDropData(LastHandle)
                };
                var targetItem = {
                    "domjack": _target.DJ,
                    "data": _target.data
                };

                var dragData = {
                    'dragged': draggedItem,
                    'target': targetItem,
                    'event': _domEvent
                };

                return _target.dragOver.call(this,dragData);
            };
            _target.__events.dragOver = f;
            return f;
        }

        function generateDragEnterFunction(_target){
            var f = function(_domEvent){
                var draggedItem = {
                    "domjack": LastHandle,
                    "data": getDropData(LastHandle)
                };
                var targetItem = {
                    "domjack": _target.DJ,
                    "data": _target.data
                };

                var dragData = {
                    'dragged': draggedItem,
                    'target': targetItem,
                    'event': _domEvent
                };

                return _target.dragEnter.call(this,dragData);
            };
            _target.__events.dragEnter = f;
            return f;
        }

        function generateDragLeaveFunction(_target){
            var f = function(_domEvent){
                var draggedItem = {
                    "domjack": LastHandle,
                    "data": getDropData(LastHandle)
                };
                var targetItem = {
                    "domjack": _target.DJ,
                    "data": _target.data
                };

                var dragData = {
                    'dragged': draggedItem,
                    'target': targetItem,
                    'event': _domEvent
                };
                return _target.dragLeave.call(this,dragData);
            };
            _target.__events.dragLeave = f;
            return f;
        }

        function initializeFileTarget(_DraggerTarget){
            _DraggerTarget.DJ.On('dragover',function(_e){
                if(_e.dataTransfer && _e.dataTransfer.types.indexOf('Files') >= 0){
                    _e.dataTransfer.dropEffect = "copy";
                    return false;
                }
            });

            _DraggerTarget.DJ.On('drop',function(_e){
                if(_e.dataTransfer.files.length){
                    var droppedItem = {
                        "domjack": false,
                        "data": _e.dataTransfer
                    };

                    var targetItem = {
                        "domjack": _DraggerTarget.DJ,
                        "data": _DraggerTarget.data
                    };

                    var dragData = {
                        'dragged': droppedItem,
                        'target': targetItem,
                        'event': _e
                    };

                    return _DraggerTarget.drop.call(this,dragData);
                }
            });
        }

        Dragger.prototype.toString = function(){ return '[object '+this.constructor.name+']' };


    }
})(KUBE);