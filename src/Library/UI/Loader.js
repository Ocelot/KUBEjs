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
    KUBE.LoadSingleton('/Library/UI/Loader',Loader,['/Library/DOM/DomJack','/Library/DOM/StyleJack','/Library/Drawing/Spinner','/Library/Extend/Object','/Library/Extend/Math']);

    Loader.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Loader(){
        var loadedViews,$API,UIAutoLoader;
        UIAutoLoader = KUBE.Class('Loader')();
        loadedViews = {};
        $API = {
            'Load':Load,
            'AutoLoad':AutoLoad,
            'Uses':Uses,
            'LoadAutoIndex':UIAutoLoader.LoadAutoIndex,
            'Create':Create
        }.KUBE().create(Loader.prototype);
        KUBE.Events($API);
        UIAutoLoader.SetEmitter($API);
        Load('Root',RootView);
        return $API;

        //View Loading
        function Load(_viewName,_viewClass,_needs){
            if(checkValidView(_viewName, _viewClass)){
                UIAutoLoader.SetAsLoaded(_viewName);
                (KUBE.Is(_needs) === 'array' ? UIAutoLoader.Uses(_needs,function(){ loadView(_viewName,_viewClass); }) : loadView(_viewName,_viewClass));
            }
        }

        function checkValidView(_viewName, _viewClass){
            return (KUBE.Is(_viewClass) === 'function' && KUBE.Is(_viewName) === 'string' && !loadedViews[_viewName] ? true : false);
        }

        function loadView(_viewName, _viewClass){
            loadedViews[_viewName] = _viewClass;
            $API.EmitState(_viewName);
            KUBE.console.log('UI Loaded: '+_viewName);
        }

        function AutoLoad(){
            return UIAutoLoader;
        }

        function Uses(_dependancies,_callback){
            return UIAutoLoader.Uses(_dependancies,_callback);
        }

        //View Instantiation
        function Create(_name,_Root,_id){
            var $return = (KUBE.Is(loadedViews[_name]) === 'function' ? initView(_name,_Root,_id) : undefined);
            if(!$return){
                throw new Error('UI Could not create new view. Has not been loaded');
            }
            return $return;
        }

        function initView(_viewName,_Root,_id){
            return KUBE.Events(new loadedViews[_viewName](_Root,_id));
        }
    }

    //This is the coreView that gets passed into each view. Contains the core UI functionality framework. Mixes in with each view.

    //This view is created once per new UI and is used at the root Node for the UI object
    function RootView(){
        var Delegate,View,UI,SJ,DJ,Spin,SendHandler,responseCall,width,height,deleteQ, CSSClassCache = [],resizePause, blackout, spinner,data,$RootAPI,viewIndex,children;

        SJ = KUBE.Class('/Library/DOM/StyleJack');
        DJ = KUBE.Class('/Library/DOM/DomJack');
        Spin = KUBE.Class('/Library/Drawing/Spinner');
        viewIndex = {};
        children = {};

        $RootAPI = {
            'Type':Type,
            'Name':Name,
            'Id':Id,
            'AddViews':AddViews,
            'QuickAdd':QuickAdd,
            'View': GetViewObj,
            'Cleanup':Cleanup,
            'Init':Init,
            'Get':Get,
            'GetViewById':GetViewById,
            'Read':Read,
            'Update':Update,
            'Delete':Delete,
            'Add':Add,
            'Connect':Connect,
            'BinaryTransmission':BinaryTrasmission,
            'Broadcast':Broadcast,
            'Width':Width,
            'Height':Height,
            'Resize':Resize,
            'CSSClass': CSSClass
        };
        return $RootAPI;

        //Public
        function Type(){
            return 'Root';
        }

        function Name(){
            return 'Root';
        }

        function Id(){
            return 'Root';
        }

        function Init(_data,_allocatedViewWidth,_allocatedViewHeight){
            data = _data;
            width = _allocatedViewWidth;
            height = _allocatedViewHeight;

            if(KUBE.Is(data.UI,true) !== 'UI' || KUBE.Is(data.DomJackRoot,true) !== 'DomJack'){
                throw new Error('Cannot initialize UI RootView. Required UI Object or DomJack object not properly supplied');
            }

            View = data.DomJackRoot;
            UI = data.UI;

            create();
            bindResizeEvent();
        }

        function Get(){
            return View;
        }

        function Read(){
            return {};
        }

        function Update(_data){
            if(KUBE.Is(_data) === 'object'){
                if(_data.reset){
                    $RootAPI.Reset();
                }
            }
        }

        function Delete(){
            var $return = false;
            if(View){
                View.Delete();
                $return = true;
            }
            return $return;
        }

        function CSSClass(_CoreView){
            var classUsed;
            var genClass;

            do{
                genClass = generateCSSClass();
                classUsed = isClassUsed(genClass);
            } while(classUsed.found === true);

            CSSClassCache.push(genClass);

            _CoreView.Once('delete',function(){
                var classUse = isClassUsed(genClass);
                CSSClassCache.splice(classUse.index,1);
            });

            return genClass;

            function isClassUsed(_class){
                var index = CSSClassCache.indexOf(_class);
                return (index !== -1 ? {'found': true, 'index': index} : {'found': false, 'index' : false});
            }

            function generateCSSClass(){
                var $return = [], index, char;
                for(var i = 0; i < 52; i++){
                    index = Math.floor(Math.random() * 26) + 65;
                    char = String.fromCharCode(index);
                    char = (Math.random() > 0.5 ? char.toLowerCase() : char);
                    $return.push(char);
                }
                return $return.join("");
            }
        }

        function Add(_NewView,_data){
            return KUBE.Promise(handleAdd);
            function handleAdd(_resolve){
                children[_NewView.Id()] = _NewView;
                _NewView.Init($RootAPI,_data,width,height);
                _NewView.OnState('drawFinish',function(){
                    var Child = _NewView.Get();
                    Child.Style().Position('absolute').Top(0).Left(0);
                    View.Append(Child);
                    _resolve();
                });
                _NewView.On('delete',function(){
                    delete children[_NewView.Id()];
                });
            };
        }

        function Cleanup(_keepArray){
            viewIndex.KUBE().each(function(_id,_View){
                if(KUBE.Is(_keepArray === 'array') && _keepArray.indexOf(_id) > -1){
                    //Keep it?
                }
                else{
                    if(_View !== undefined && _View.view !== Delegate){
                        _View.view.Delete();
                    }
                }
            });
        }

        function GetViewById(_id){
            return viewIndex[_id];
        }

        function addViewToIndex(_id,_obj){
            var data;
            var View = KUBE.Class('/Library/UI/Loader')().Create(_obj.view,$RootAPI,_id); //Thinking I might make this return a promise...
            data = {
                'view':View,
                'root':(!_obj.pid ? true : false),
                'pid':_obj.pid,
                'data':_obj.data,
                'id':_id
            };
            if(_obj.delegate && !Delegate){
                Delegate = View;
            }
            viewIndex[_id] = {'view':View,'id':_id,'pid':_obj.pid};
            View.On('delete',function(){
                //Also call delete on any children...
                viewIndex.KUBE().each(function(_key,_val){
                    if(_val && _val.pid === _id){
                        _val.view.Delete();
                    }
                });
                delete viewIndex[_id];
            });
            return data;
        }

        function QuickAdd(_parentId,_viewName,_data,_newId){
            var viewPkg = [
                {
                    'pid':_parentId,
                    'view':_viewName,
                    'id':_newId || KUBE.UUID(),
                    'data':_data || {}
                }
            ];
            AddViews(viewPkg);
        }

        function AddViews(_viewPkg){
            if(KUBE.Is(_viewPkg) === 'array'){
                var viewPs = [];
                _viewPkg.KUBE().each(function(_obj){
                    viewPs.push(KUBE.Class('/Library/UI/Loader')().Uses(_obj.view));
                });

                return KUBE.Promise().all(viewPs).then(function(){
                    var id,temp=[];
                    //First let's go and assign new IDs to everything
                    _viewPkg.KUBE().each(function(_obj){
                        if(KUBE.Is(_obj) === 'object'){
                            id = _obj.id || getAvailableId();
                            _obj.id = id;
                            if(viewIndex[id] === undefined){
                                temp.push(addViewToIndex(id,_obj));
                            }
                        }
                        else{
                            throw new Error('View packages must be valid data objects: '+KUBE.Is(_obj)+' given');
                        }
                    });

                    //Now I just find the roots, and either add them to the root view, or to a PID if it's set...
                    var returnPs = [];
                    for(var i=0;i<temp.length;i++){
                        if(temp[i].root === true){
                            if(Delegate && temp[i].view !== Delegate){
                                returnPs.push(Delegate.Add(temp[i].view,temp[i].data));
                            }
                            else{
                                returnPs.push(Add(temp[i].view,temp[i].data));
                            }
                        }
                        else{
                            if(viewIndex[temp[i].pid] !== undefined){
                                returnPs.push(viewIndex[temp[i].pid].view.Add(temp[i].view,temp[i].data));
                            }
                        }
                    }
                    return KUBE.Promise().all(returnPs).then(function(){ return true; });
                });
            }
        }

        function GetViewObj(viewName){
            return KUBE.Promise().all([KUBE.Class('/Library/UI/Loader')().Uses(viewName)]).then(function(){
                return KUBE.Class('/Library/UI/Loader')().Create(viewName,$RootAPI,'');
            });
        }

        function getAvailableId(){
            var id;
            do{
                id = KUBE.UUID(true);
            } while(viewIndex[id] !== undefined);

            return id;
        }

        function Connect(_blockAddress,_target,_targetId){
            return UI.Connect(_blockAddress,_target,_targetId);
        }

        function Broadcast(_blockAddress,_target,_targetId,_msg){
            return UI.Broadcast(_blockAddress,_target,_targetId,_msg);
        }

        function BinaryTrasmission(_blockAddress,_target,_targetId,_data){
            return UI.BinaryTransmission(_blockAddress,_target,_targetId,_data);
        }


        function Width(){
            return width;
        }

        function Height(){
            return height;
        }

        function Resize(){
            width = DJ().WindowWidth();
            height = DJ().WindowHeight();
            View.Style().Height(height).Width(width);
            children.KUBE().each(function(_id,_Child){
                _Child.Resize(width,height);
            });
            //$RootAPI.ResizeChildren();
        }

        //Private methods
        function bindResizeEvent(){
            DJ().Window().On('resize',function(){
                if(resizePause){
                    clearTimeout(resizePause);
                }
                else{
                    Resize();
                }
                resizePause = setTimeout(function(){
                    $RootAPI.Resize();
                    resizePause = undefined;
                },50);
            });
			
			DJ().Window().On('orientationchange',function(){
				setTimeout(function(){
                    Resize();
                },1000);
			})
        }

        //For the view
        function create(){
            //Possibly wait for Ready to occur?
            DJ().Ready(function(){
                assignDimensions();
                initRootStyle();
                $RootAPI.EmitState('drawFinish');
            });
        }

        function initRootStyle(){
            var rootId = ($RootAPI.Id() == 'body') ? 'body' : '#' + $RootAPI.Id();
            //SJ('*').Margin(0).Padding(0);//.Box().Sizing('border-box');
            SJ(rootId).Overflow('hidden');//.Set(['hidden','auto']); //This is DD messing around, Probably not the right place.
            SJ('.rootClear').Position('relative').Width('100%').Height(0).Clear('both');
        }

        function assignDimensions(){
            (View.GetNode() === document.body ? assignWindowDimensions() : assignNodeDimensions());
        }

        function assignWindowDimensions(){
            width = DJ().WindowWidth();
            height = DJ().WindowHeight();
        }

        function assignNodeDimensions(){
            var r = View.Rect();
            width = r.width;
            height = r.height;
        }
    }
}(KUBE));