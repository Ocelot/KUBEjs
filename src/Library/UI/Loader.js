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
        function Create(_Parent,_name,_type,_createId,_children){
            var $return = (KUBE.Is(loadedViews[_name]) === 'function' ? initView(_Parent,_name,_type,_createId,_children) : undefined);
            if(!$return){
                throw new Error('UI Could not create new view. Has not been loaded');
            }
            return $return;
        }

        function initView(_Parent,_viewName,_viewType,_createId,_children){
            return new loadedViews[_viewName](UIView(_Parent,_viewName,_viewType,_createId),_children);
        }

    }

    //This is the coreView that gets passed into each view. Contains the core UI functionality framework. Mixes in with each view.
    UIView.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function UIView(_Parent,_viewName,_viewType,_id){
        var Children,$ViewAPI,UpdateResolver,CSSClass = null;
        Children = [];
        UpdateResolver = KUBE.Class('Patience')();

        $ViewAPI = {
            'Find':Find,
            'Check':Check,
            'UpdateChildren':UpdateChildren,
            'Delay':Delay,
            'Parent':Parent,
            'GenCSSClass': GenCSSClass,
            'Root':Root,
            'Type':Type,
            'Name':Name,
            'Id':Id,
            'DeepRead':DeepRead,
            'ResizeChildren': ResizeChildren,
            'Reset':Reset,
            'UUID':UUID
        }.KUBE().create(UIView.prototype);

        $ViewAPI = KUBE.Events($ViewAPI);
        $ViewAPI.Once('delete',function(){
            Children.KUBE().each(function(_C){
                _C.Delete();
            });
            _Parent = _viewName = _id = Children = $ViewAPI = UpdateResolver = undefined;
        });
        return $ViewAPI;

        function Parent(){
            return _Parent;
        }

        function Root(){
            return findRoot($ViewAPI);
        }

        function Reset(){
            var TempChildren = Children;
            Children = [];
            if(KUBE.Is(TempChildren) === 'array'){
                var deleteCount = TempChildren.length-1;
                TempChildren.KUBE().each(function(_Child){
                    _Child.On('delete',function(){
                        deleteCount--;
                        if(!deleteCount){
                            $ViewAPI.Emit('reset');
                        }
                    });
                    _Child.Delete();
                });
            }
        }

        //Find logic
        function Find(_ViewInstructions){
            if(KUBE.Is(_ViewInstructions,true) === 'ViewInstructions'){
                return checkRoot(_ViewInstructions) || isSelf(_ViewInstructions) || inChildren(_ViewInstructions);
            }
        }

        function Check(_ViewInstructions){
            var $return = true;

            //if(_comparisonObject.parent && Parent){
            //    $return = Parent.Check(_comparisonObject.parent); //Does our parent chain match?
            //}

            if(_ViewInstructions.GetId() && _ViewInstructions.GetId() !== Id()){
                $return = false; //Does our Id match
            }

            if($return && _ViewInstructions.GetType() && _ViewInstructions.GetType() !== Type()){
                $return = false; //Does our type match
            }

            if($return && _ViewInstructions.GetName() && _ViewInstructions.GetName() !== Name()){
                $return = false; //Does our viewName (class) match
            }

            return $return;
        }

        function UUID(_includeDashes){
            _includeDashes = (_includeDashes === false ? false : true);
            var r = [
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(16384,20479).toString(16),
                Math.KUBE().random(32768,49151).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16)
            ];
            if(_includeDashes){
                return (r[0]+r[1]+'-'+r[2]+'-'+r[3]+'-'+r[4]+'-'+r[5]+r[6]+r[7]).toUpperCase();
            }
            else{
                return r.join('').toUpperCase();
            }
        }

        function checkRoot(_ViewInstructions){
            return (_ViewInstructions.GetName() === 'Root' ? findRoot($ViewAPI) : false);
        }

        function isSelf(_ViewInstructions){
            return (Check(_ViewInstructions) ? $ViewAPI : false);
        }

        function inChildren(_ViewInstructions){
            var c,$return;
            if(Children.length){
                for(c=0;c<Children.length;c++){
                    $return = Children[c].Find(_ViewInstructions);
                    if($return){
                        break;
                    }
                }
            }
            return $return;
        }

        function findRoot(_View){
            return (!_View.Parent() ? _View : findRoot(_View.Parent()));
        }

        //Process Instruction Logic
        function UpdateChildren(_views,_behavior){
            UpdateResolver.Wait(function(){
                if($ViewAPI !== undefined){
                    var viewResolver = this;
                    if(KUBE.Is(_views) === 'array' && KUBE.Is($ViewAPI.Add) === 'function'){
                        _behavior = _behavior || 'loose';
                        if(_behavior === 'strict'){
                            syncChildren(_views);
                        }
                        processUpdate(_views,_behavior,viewResolver);
                    }
                    else if(KUBE.Is(_views) === 'array' && KUBE.Is($ViewAPI.Add) !== 'function' && _views.length){
                        throw new Error('Children views cannot be added to View that does not support Add method: '+$ViewAPI.Name());
                        viewResolver.resolve();
                    }
                    else if(KUBE.Is(_views) !== 'array'){
                        throw new Error('views must be an array!  Passed in a '+KUBE.Is(_views));
                        viewResolver.resolve();
                    }
                    else{
                        viewResolver.resolve();
                    }
                }
                else{
                    throw new Error('It is likely that a view was added to a parent, and then refused (wrong type?). At this point in the resolution chain the $ViewAPI has already been destroyed.');
                }
            });

            return $ViewAPI;
        }

        function Delay(_f){
            if(KUBE.Is(_f) === 'function'){
                UpdateResolver.Wait(function(){
                    _f();
                    this.resolve();
                });
            }
            return $ViewAPI;
        }

        function GenCSSClass(){
            if(!CSSClass){
                CSSClass = Root().CSSClass($ViewAPI);
            }
            return CSSClass;
        }

        function processUpdate(_views,_behavior,viewResolver){
            //Create/Update only
            var createArray,vCount,viewNameIncrement,deleteArray,skipVar;
            createArray = [];
            deleteArray = [];
            viewNameIncrement = {};

            for(vCount = 0;vCount<_views.length;vCount++){
                if(!viewNameIncrement[_views[vCount].GetName()]){
                    viewNameIncrement[_views[vCount].GetName()] = 0;
                }

                skipVar = childMatchUpdate(_views[vCount],_behavior,viewNameIncrement[_views[vCount].GetName()]);
                if(skipVar === false){
                    createArray.push(_views[vCount]);
                }
                else{
                    viewNameIncrement[_views[vCount].GetName()] = skipVar;
                }
            }

            if(createArray.length){
                createChildren(createArray,viewResolver);
            }
            else{
                viewResolver.resolve();
            }
        }

        function createFreezeTimer(){
            //var timeoutObj = setTimeout(function(){ KUBE.Class('/Library/DOM/Ajax')('Action').Emit('freeze',true); },250);
            var timeoutObj = setTimeout(function(){ },250);
            this.resolve(timeoutObj);
        }

        function yieldChildren(i,_views,timeoutObj,resolver,choke){
            var NewChild,Child;
            choke = choke || 1;
            resolver = resolver || this;
            NewChild = _views[i];
            if(KUBE.Is(NewChild,true) === 'ViewInstructions'){
                try{
                    Child = createNewChildView(NewChild);
                }
                catch(E){
                    if(E.message === 'UI Could not create new view. Has not been loaded' && choke < 50){
                        KUBE.Class('/Library/UI/Loader')().Uses([NewChild.GetName()],function(){
                            yieldChildren(i,_views,timeoutObj,resolver,++choke);
                        });
                    }
                    else{
                        throw new Error(E.message+" :"+NewChild.GetName());
                        (resolver.last() ? resolver.resolve(timeoutObj) : resolver.next());
                    }
                }
            }

            if(Child){
                if(KUBE.Is(NewChild.GetChildViews()) === 'array'){
                    Child.UpdateChildren(NewChild.GetChildViews());
                }

                var P = $ViewAPI.Add(Child,NewChild.GetData())

                //THIS DID NOT WORK AT ALL
                //KUBE.Promise().race([P,KUBE.Promise(function(_rej,_res){
                //    setTimeout(function(){
                //        console.log('REJECTED BY YIELDCHILDREN IN UI/LOADER');
                //        Child.Delete();
                //        _rej();
                //    },5000);
                //})]);

                if(KUBE.Is(P,true) === 'Promise'){
                    P.then(function(){
                        Children.push(Child);
                        Child.Once('delete',function(){
                            deleteChild(Child);
                        });
                    },function(_Err){
                        debugger; //Our Add Promise was rejected along the way. Why?
                        Child.Delete();
                    });
                }
                else{
                    debugger; //Add must return a promise
                    Child.Delete();
                }

                (resolver.last() ? resolver.resolve(timeoutObj) : resolver.next());
            }
        }

        function finishUpdate(_timeoutObj){
            clearTimeout(_timeoutObj);
            //KUBE.Class('/Library/DOM/Ajax')('Action').Emit('freeze',false);
            if(KUBE.Is($ViewAPI.AddFinish) === 'function'){
                $ViewAPI.AddFinish();
            }
        }

        function createChildren(_createArray,viewResolver){
            var P = KUBE.Class('Patience')();
            P.Wait(createFreezeTimer);
            P.LazyLoop(_createArray,yieldChildren);
            P.Wait(function(_tObj){
                finishUpdate(_tObj);
                this.resolve();
                viewResolver.resolve();
            });
        }

        function syncChildren(_matchArray){
            var c,v,safe,match,OldChildren;
            OldChildren = Children;
            Children = [];
            safe = {};
            match = {};
            var deleteCounter = 0;

            for(c=0;c<OldChildren.length;c++){
                if(!match[c]){
                    deleteCounter++;
                    OldChildren[c].On('delete',function(){
                        deleteCounter--;
                        if(!deleteCounter){
                            syncAddChildren();
                        }
                    });
                }
            }

            for(c=0;c<OldChildren.length;c++){
                if(!match[c]){
                    OldChildren[c].Delete();
                }
            }

            function syncAddChildren(){
                for(c=0;c<OldChildren.length;c++){
                    for(v=0;v<_matchArray.length;v++){
                        if(!safe[v] && !match[c]){
                            if(OldChildren[c].Check(_matchArray[v])){
                                safe[v] = true;
                                match[c] = true;
                                Children.push(OldChildren[c]);
                                break;
                            }
                        }
                    }
                }
            }
        }

        function deleteChild(_Child){
            var c,OldChildren;
            OldChildren = Children;
            Children = [];

            for(c=0;c<OldChildren.length;c++){
                if(OldChildren[c] !== _Child){
                    Children.push(OldChildren[c]);
                }
            }
        }

        function childMatchUpdate(_ViewInstructions,_behavior,_skip){
            var cObj,cCount,skipCheck,$return;

            //Init vars
            _skip = _skip || 0;
            skipCheck = 0;
            $return = false;

            for(cCount=0;cCount<Children.length;cCount++){
                if(Children[cCount].Check(_ViewInstructions)){
                    if(_ViewInstructions.GetId()){
                        updateChildView(Children[cCount],_ViewInstructions.GetData(),_ViewInstructions.GetChildViews(),_behavior);
                        $return = _skip;
                        break;
                    }
                    else{
                        if(_skip > skipCheck){
                            skipCheck++;
                        }
                        else{
                            updateChildView(Children[cCount],_ViewInstructions.GetData(),_ViewInstructions.GetChildViews(),_behavior);
                            $return = _skip+1;
                            break;
                        }
                    }
                }
            }
            return $return;
        }

        function createNewChildView(_ViewInstructions){
            //_Parent,_type,_createId,_data
            var childrenViews = _ViewInstructions.GetChildViews();
            var numChildren = (KUBE.Is(childrenViews) === 'array' && childrenViews.length ? childrenViews.length : 0);
            return KUBE.Class('/Library/UI/Loader')().Create($ViewAPI,_ViewInstructions.GetName(),_ViewInstructions.GetType(),_ViewInstructions.GetId(),numChildren);
        }

        function updateChildView(_ChildView,_data,_views,_behavior){
            _ChildView.Update(_data);
            if(KUBE.Is(_views) === 'array'){
                _ChildView.UpdateChildren(_views,_behavior);
            }
        }

        //Core information
        function Type(){
            return String(_viewType); //).toLowerCase();
        }

        function Name(){
            return String(_viewName);
        }

        function Id(){
            return _id;
        }

        function DeepRead(){
            return {
                'type':Type(),
                'name':Name(),
                'id':Id(),
                'data':$ViewAPI.Read(),
                'views':readChildren()
            };
        }

        function readChildren(){
            var $return = [];
            if(Children.length){
                Children.KUBE().each(function(_Child){
                    $return.push(_Child.DeepRead());
                });
            }
            return $return;
        }

        function ResizeChildren(){
            var $return = [];
            if(Children.length){
                Children.KUBE().each(function(_Child){
                    try{
                        _Child.Resize();
                    }
                    catch(e){
                        KUBE.console.log(_Child.Name() + ' failed to resize');
                    }

                });
            }
            return $return;
        }
    }


    //This view is created once per new UI and is used at the root Node for the UI object
    function RootView(CoreView,numChildren){
        var View,UI,SJ,DJ,Spin,SendHandler,responseCall,width,height,deleteQ, CSSClassCache = [],resizePause, blackout, spinner,data;

        SJ = KUBE.Class('/Library/DOM/StyleJack');
        DJ = KUBE.Class('/Library/DOM/DomJack');
        Spin = KUBE.Class('/Library/Drawing/Spinner');

        CoreView.KUBE().merge({
            'Init':Init,
            'Get':Get,
            'Read':Read,
            'Update':Update,
            'Delete':Delete,
            'Add':Add,
            'Send':Send,
            'Width':Width,
            'Height':Height,
            'Resize':Resize,
            'CSSClass': CSSClass
        });
        return CoreView;

        //Public
        function Init(_data,_allocatedViewWidth,_allocatedViewHeight){
            data = _data;
            width = _allocatedViewHeight;
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
                    CoreView.Reset();
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

        function Add(_NewView,_initData){
            return KUBE.Promise(handleAdd);
            function handleAdd(_resolve){
                if(KUBE.Is(_NewView,true) === 'UIView'){
                    _NewView.Init(_initData,width,height);
                    _NewView.OnState('drawFinish',function(){
                        View.Append(_NewView.Get());
                        _resolve();
                    });
                }
                else{
                    throw new Error('Unacceptable View passed into Root');
                }
            }
        }

        function Send(_UIView,_actionObj,_type,_callback){
            //This has the ability to communicate directly with the View that is sending the request, otherwise instructions are processed accordingly
            _type = _type || 'action';
            return UI.Send(_UIView,_actionObj,_type,_callback);
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
            CoreView.ResizeChildren();
        }

        //Private methods
        function bindResizeEvent(){
            var spinDJ;
            spinner = Spin();
            spinner.Color('#FFF');
            spinDJ = spinner.Get();
            spinDJ.Style().Position('fixed').Top('50%').Left('50%').Margin().Top(-53).Left(-53);

            blackout = DJ(document.body).Append('div');
            blackout.Append(spinDJ);
            blackout.Detach();

            blackout.Style().Position('fixed');
            blackout.Style().Top(0).Bottom(0).Left(0).Right(0).Background().Color('rgba(0,0,0,0.9)').api.ZIndex(999);
            blackout.Style().Padding(10);
            DJ().Window().On('resize',function(){
                if(resizePause){
                    clearTimeout(resizePause);
                }
                else{
                    Resize();
                    spinner.Play();
                    DJ(document.body).Append(blackout);
                }
                resizePause = setTimeout(function(){
                    CoreView.Resize();
                    spinner.Pause();
                    blackout.Detach();
                    resizePause = undefined;
                },1000);
            });
        }

        //For the view
        function create(){
            //Possibly wait for Ready to occur?
            DJ().Ready(function(){
                assignDimensions();
                initRootStyle();
                CoreView.EmitState('drawFinish');
            });
        }

        function initRootStyle(){
            var rootId = (CoreView.Id() == 'body') ? 'body' : '#' + CoreView.Id();
            SJ('*').Margin(0).Padding(0);//.Box().Sizing('border-box');
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