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
            viewIndex[_id] = {'view':View,'id':_id,'pid':undefined};
            View.On('delete',function(){
                //Also call delete on any children...
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
            //var spinDJ;
            //spinner = Spin();
            //spinner.Color('#FFF');
            //spinDJ = spinner.Get();
            //spinDJ.Style().Position('fixed').Top('50%').Left('50%').Margin().Top(-53).Left(-53);
            //
            //blackout = DJ(document.body).Append('div');
            //blackout.Append(spinDJ);
            //blackout.Detach();
            //
            //blackout.Style().Position('fixed');
            //blackout.Style().Top(0).Bottom(0).Left(0).Right(0).Background().Color('rgba(0,0,0,0.9)').api.ZIndex(999);
            //blackout.Style().Padding(10);
            DJ().Window().On('resize',function(){
                if(resizePause){
                    clearTimeout(resizePause);
                }
                else{
                    Resize();
                    //spinner.Play();
                    //DJ(document.body).Append(blackout);
                }
                resizePause = setTimeout(function(){
                    $RootAPI.Resize();
                    //spinner.Pause();
                    //blackout.Detach();
                    resizePause = undefined;
                },50);
            });
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


//If they were promises I can do an All...
//Now link them...
//var temp2 = [];
//var stop = false;
//var linkTarget;
////This is stupid, I can definitely do this more efficiently
//var count = 0;
//while(!stop){
//    count++;
//    stop = true;
//    for(var i=0;i<temp.length;i++){
//        if(!temp[i].linked){
//            stop = false;
//            linkTarget = temp[i];
//            break;
//        }
//    }
//
//    if(!stop){
//        for(var i=0;i<temp.length;i++){
//            if(linkTarget.paid !== undefined && linkTarget.paid === temp[i].aid){
//                temp[i].View.Add(linkTarget.View,linkTarget.data);  //Add the child to the parent
//                linkTarget.linked = true;
//                break;
//            }
//            else if(linkTarget.paid === undefined){
//                linkTarget.linked = true;
//                linkTarget.root = true;
//                break;
//            }
//        }
//    }
//    if(count > 500){
//        throw new Error('FAILED TO RESOLVE VIEW PACKAGE...');
//    }
//}

//Example
//var vp = [
//    {
//        //ID2
//        "paid":"window",
//        "view":"/RedScotch/KOS/Environment/WindowLayout"
//        "aid":"xxx"
//    },
//    { //FIND THIS BECAUSE TRUE PARENT (root)
//        //ID1
//        "root":true,
//        "pid":"123123132",
//        "aid":"window",
//        "view":"/RedScotch/KOS/Environment/Window",
//        "data":{
//            'title':'stupid'
//        }
//    },
//    {
//        //ID3
//        "paid":"xxx"
//        "view":"/RedScotch/FileStache/Cabinet",
//        "data":{
//            "xxx":"xxx"
//        }
//    }
//];

//return KUBE.Promise(handleAdd);
//function handleAdd(_resolve){
//    if(KUBE.Is(_NewView,true) === 'UIView'){
//        _NewView.Init(_initData,width,height);
//        _NewView.OnState('drawFinish',function(){
//            View.Append(_NewView.Get());
//            _resolve();
//        });
//    }
//    else{
//        throw new Error('Unacceptable View passed into Root');
//    }
//}

//UIView.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
//    function UIView(_Parent,_viewName,_viewType,_id){
//        var Children,$ViewAPI,UpdateResolver,CSSClass = null;
//        Children = [];
//        UpdateResolver = KUBE.Class('Patience')();
//
//        $ViewAPI = {
////            'Find':Find,
////            'Check':Check,
////            'UpdateChildren':UpdateChildren,
////            'Delay':Delay,
////            'Parent':Parent,          //Passed in on construct
//            'GenCSSClass': GenCSSClass, //On root
//            'Root':Root,                //Passed in
//            'Type':Type,                //On the view itself //Exposed
//            'Name':Name,                //On the view itself //Exposed
//            'Id':Id,                    //Passed on construct (with method exposing)
////            'DeepRead':DeepRead,
////            'ResizeChildren': ResizeChildren,
////            'Reset':Reset,
//            'UUID':UUID                 //On KUBE
//        }.KUBE().create(UIView.prototype);
//
//        $ViewAPI = KUBE.Events($ViewAPI);
//        $ViewAPI.Once('delete',function(){
//            Children.KUBE().each(function(_C){
//                _C.Delete();
//            });
//            _Parent = _viewName = _id = Children = $ViewAPI = UpdateResolver = undefined;
//        });
//        return $ViewAPI;
//
//        function Parent(){
//            return _Parent;
//        }
//
//        function Root(){
//            return findRoot($ViewAPI);
//        }
//
//        function Reset(){
//            var TempChildren = Children;
//            Children = [];
//            if(KUBE.Is(TempChildren) === 'array'){
//                var deleteCount = TempChildren.length-1;
//                TempChildren.KUBE().each(function(_Child){
//                    _Child.On('delete',function(){
//                        deleteCount--;
//                        if(!deleteCount){
//                            $ViewAPI.Emit('reset');
//                        }
//                    });
//                    _Child.Delete();
//                });
//            }
//        }
//
//        //Find logic
//        function Find(_ViewInstructions){
//            if(KUBE.Is(_ViewInstructions,true) === 'ViewInstructions'){
//                return checkRoot(_ViewInstructions) || isSelf(_ViewInstructions) || inChildren(_ViewInstructions);
//            }
//        }
//
//        function Check(_ViewInstructions){
//            var $return = true;
//
//            //if(_comparisonObject.parent && Parent){
//            //    $return = Parent.Check(_comparisonObject.parent); //Does our parent chain match?
//            //}
//
//            if(_ViewInstructions.GetId() && _ViewInstructions.GetId() !== Id()){
//                $return = false; //Does our Id match
//            }
//
//            if($return && _ViewInstructions.GetType() && _ViewInstructions.GetType() !== Type()){
//                $return = false; //Does our type match
//            }
//
//            if($return && _ViewInstructions.GetName() && _ViewInstructions.GetName() !== Name()){
//                $return = false; //Does our viewName (class) match
//            }
//
//            return $return;
//        }
//
//        function UUID(_includeDashes){
//            _includeDashes = (_includeDashes === false ? false : true);
//            var r = [
//                Math.KUBE().random(0,65535).toString(16),
//                Math.KUBE().random(0,65535).toString(16),
//                Math.KUBE().random(0,65535).toString(16),
//                Math.KUBE().random(16384,20479).toString(16),
//                Math.KUBE().random(32768,49151).toString(16),
//                Math.KUBE().random(0,65535).toString(16),
//                Math.KUBE().random(0,65535).toString(16),
//                Math.KUBE().random(0,65535).toString(16)
//            ];
//            if(_includeDashes){
//                return (r[0]+r[1]+'-'+r[2]+'-'+r[3]+'-'+r[4]+'-'+r[5]+r[6]+r[7]).toUpperCase();
//            }
//            else{
//                return r.join('').toUpperCase();
//            }
//        }
//
//        function checkRoot(_ViewInstructions){
//            return (_ViewInstructions.GetName() === 'Root' ? findRoot($ViewAPI) : false);
//        }
//
//        function isSelf(_ViewInstructions){
//            return (Check(_ViewInstructions) ? $ViewAPI : false);
//        }
//
//        function inChildren(_ViewInstructions){
//            var c,$return;
//            if(Children.length){
//                for(c=0;c<Children.length;c++){
//                    $return = Children[c].Find(_ViewInstructions);
//                    if($return){
//                        break;
//                    }
//                }
//            }
//            return $return;
//        }
//
//        function findRoot(_View){
//            return (!_View.Parent() ? _View : findRoot(_View.Parent()));
//        }
//
//        //Process Instruction Logic
//        function UpdateChildren(_views,_behavior){
//            UpdateResolver.Wait(function(){
//                if($ViewAPI !== undefined){
//                    var viewResolver = this;
//                    if(KUBE.Is(_views) === 'array' && KUBE.Is($ViewAPI.Add) === 'function'){
//                        _behavior = _behavior || 'loose';
//                        if(_behavior === 'strict'){
//                            syncChildren(_views);
//                        }
//                        processUpdate(_views,_behavior,viewResolver);
//                    }
//                    else if(KUBE.Is(_views) === 'array' && KUBE.Is($ViewAPI.Add) !== 'function' && _views.length){
//                        throw new Error('Children views cannot be added to View that does not support Add method: '+$ViewAPI.Name());
//                        viewResolver.resolve();
//                    }
//                    else if(KUBE.Is(_views) !== 'array'){
//                        throw new Error('views must be an array!  Passed in a '+KUBE.Is(_views));
//                        viewResolver.resolve();
//                    }
//                    else{
//                        viewResolver.resolve();
//                    }
//                }
//                else{
//                    throw new Error('It is likely that a view was added to a parent, and then refused (wrong type?). At this point in the resolution chain the $ViewAPI has already been destroyed.');
//                }
//            });
//
//            return $ViewAPI;
//        }
//
//        function Delay(_f){
//            if(KUBE.Is(_f) === 'function'){
//                UpdateResolver.Wait(function(){
//                    _f();
//                    this.resolve();
//                });
//            }
//            return $ViewAPI;
//        }
//
//        function GenCSSClass(){
//            if(!CSSClass){
//                CSSClass = Root().CSSClass($ViewAPI);
//            }
//            return CSSClass;
//        }
//
//        function processUpdate(_views,_behavior,viewResolver){
//            //Create/Update only
//            var createArray,vCount,viewNameIncrement,deleteArray,skipVar;
//            createArray = [];
//            deleteArray = [];
//            viewNameIncrement = {};
//
//            for(vCount = 0;vCount<_views.length;vCount++){
//                if(!viewNameIncrement[_views[vCount].GetName()]){
//                    viewNameIncrement[_views[vCount].GetName()] = 0;
//                }
//
//                skipVar = childMatchUpdate(_views[vCount],_behavior,viewNameIncrement[_views[vCount].GetName()]);
//                if(skipVar === false){
//                    createArray.push(_views[vCount]);
//                }
//                else{
//                    viewNameIncrement[_views[vCount].GetName()] = skipVar;
//                }
//            }
//
//            if(createArray.length){
//                createChildren(createArray,viewResolver);
//            }
//            else{
//                viewResolver.resolve();
//            }
//        }
//
//        function createFreezeTimer(){
//            //var timeoutObj = setTimeout(function(){ KUBE.Class('/Library/DOM/Ajax')('Action').Emit('freeze',true); },250);
//            var timeoutObj = setTimeout(function(){ },250);
//            this.resolve(timeoutObj);
//        }
//
//        function yieldChildren(i,_views,timeoutObj,resolver,choke){
//            var NewChild,Child;
//            choke = choke || 1;
//            resolver = resolver || this;
//            NewChild = _views[i];
//            if(KUBE.Is(NewChild,true) === 'ViewInstructions'){
//                try{
//                    Child = createNewChildView(NewChild);
//                }
//                catch(E){
//                    if(E.message === 'UI Could not create new view. Has not been loaded' && choke < 50){
//                        KUBE.Class('/Library/UI/Loader')().Uses([NewChild.GetName()],function(){
//                            yieldChildren(i,_views,timeoutObj,resolver,++choke);
//                        });
//                    }
//                    else{
//                        throw new Error(E.message+" :"+NewChild.GetName());
//                        (resolver.last() ? resolver.resolve(timeoutObj) : resolver.next());
//                    }
//                }
//            }
//
//            if(Child){
//                if(KUBE.Is(NewChild.GetChildViews()) === 'array'){
//                    Child.UpdateChildren(NewChild.GetChildViews());
//                }
//
//                var P = $ViewAPI.Add(Child,NewChild.GetData())
//
//                //THIS DID NOT WORK AT ALL
//                //KUBE.Promise().race([P,KUBE.Promise(function(_rej,_res){
//                //    setTimeout(function(){
//                //        console.log('REJECTED BY YIELDCHILDREN IN UI/LOADER');
//                //        Child.Delete();
//                //        _rej();
//                //    },5000);
//                //})]);
//
//                if(KUBE.Is(P,true) === 'Promise'){
//                    P.then(function(){
//                        Children.push(Child);
//                        Child.Once('delete',function(){
//                            deleteChild(Child);
//                        });
//                    },function(_Err){
//                        debugger; //Our Add Promise was rejected along the way. Why?
//                        Child.Delete();
//                    });
//                }
//                else{
//                    debugger; //Add must return a promise
//                    Child.Delete();
//                }
//
//                (resolver.last() ? resolver.resolve(timeoutObj) : resolver.next());
//            }
//        }
//
//        function finishUpdate(_timeoutObj){
//            clearTimeout(_timeoutObj);
//            //KUBE.Class('/Library/DOM/Ajax')('Action').Emit('freeze',false);
//            if(KUBE.Is($ViewAPI.AddFinish) === 'function'){
//                $ViewAPI.AddFinish();
//            }
//        }
//
//        function createChildren(_createArray,viewResolver){
//            var P = KUBE.Class('Patience')();
//            P.Wait(createFreezeTimer);
//            P.LazyLoop(_createArray,yieldChildren);
//            P.Wait(function(_tObj){
//                finishUpdate(_tObj);
//                this.resolve();
//                viewResolver.resolve();
//            });
//        }
//
//        function syncChildren(_matchArray){
//            var c,v,safe,match,OldChildren;
//            OldChildren = Children;
//            Children = [];
//            safe = {};
//            match = {};
//            var deleteCounter = 0;
//
//            for(c=0;c<OldChildren.length;c++){
//                if(!match[c]){
//                    deleteCounter++;
//                    OldChildren[c].On('delete',function(){
//                        deleteCounter--;
//                        if(!deleteCounter){
//                            syncAddChildren();
//                        }
//                    });
//                }
//            }
//
//            for(c=0;c<OldChildren.length;c++){
//                if(!match[c]){
//                    OldChildren[c].Delete();
//                }
//            }
//
//            function syncAddChildren(){
//                for(c=0;c<OldChildren.length;c++){
//                    for(v=0;v<_matchArray.length;v++){
//                        if(!safe[v] && !match[c]){
//                            if(OldChildren[c].Check(_matchArray[v])){
//                                safe[v] = true;
//                                match[c] = true;
//                                Children.push(OldChildren[c]);
//                                break;
//                            }
//                        }
//                    }
//                }
//            }
//        }
//
//        function deleteChild(_Child){
//            var c,OldChildren;
//            OldChildren = Children;
//            Children = [];
//
//            for(c=0;c<OldChildren.length;c++){
//                if(OldChildren[c] !== _Child){
//                    Children.push(OldChildren[c]);
//                }
//            }
//        }
//
//        function childMatchUpdate(_ViewInstructions,_behavior,_skip){
//            var cObj,cCount,skipCheck,$return;
//
//            //Init vars
//            _skip = _skip || 0;
//            skipCheck = 0;
//            $return = false;
//
//            for(cCount=0;cCount<Children.length;cCount++){
//                if(Children[cCount].Check(_ViewInstructions)){
//                    if(_ViewInstructions.GetId()){
//                        updateChildView(Children[cCount],_ViewInstructions.GetData(),_ViewInstructions.GetChildViews(),_behavior);
//                        $return = _skip;
//                        break;
//                    }
//                    else{
//                        if(_skip > skipCheck){
//                            skipCheck++;
//                        }
//                        else{
//                            updateChildView(Children[cCount],_ViewInstructions.GetData(),_ViewInstructions.GetChildViews(),_behavior);
//                            $return = _skip+1;
//                            break;
//                        }
//                    }
//                }
//            }
//            return $return;
//        }
//
//        function createNewChildView(_ViewInstructions){
//            //_Parent,_type,_createId,_data
//            var childrenViews = _ViewInstructions.GetChildViews();
//            var numChildren = (KUBE.Is(childrenViews) === 'array' && childrenViews.length ? childrenViews.length : 0);
//            return KUBE.Class('/Library/UI/Loader')().Create($ViewAPI,_ViewInstructions.GetName(),_ViewInstructions.GetType(),_ViewInstructions.GetId(),numChildren);
//        }
//
//        function updateChildView(_ChildView,_data,_views,_behavior){
//            _ChildView.Update(_data);
//            if(KUBE.Is(_views) === 'array'){
//                _ChildView.UpdateChildren(_views,_behavior);
//            }
//        }
//
//        //Core information
//        function Type(){
//            return String(_viewType); //).toLowerCase();
//        }
//
//        function Name(){
//            return String(_viewName);
//        }
//
//        function Id(){
//            return _id;
//        }
//
//        function DeepRead(){
//            return {
//                'type':Type(),
//                'name':Name(),
//                'id':Id(),
//                'data':$ViewAPI.Read(),
//                'views':readChildren()
//            };
//        }
//
//        function readChildren(){
//            var $return = [];
//            if(Children.length){
//                Children.KUBE().each(function(_Child){
//                    $return.push(_Child.DeepRead());
//                });
//            }
//            return $return;
//        }
//
//        function ResizeChildren(){
//            var $return = [];
//            if(Children.length){
//                Children.KUBE().each(function(_Child){
//                    try{
//                        _Child.Resize();
//                    }
//                    catch(e){
//                        KUBE.console.log(_Child.Name() + ' failed to resize');
//                    }
//
//                });
//            }
//            return $return;
//        }
//    }