//My experimental attempt at integrating our old QuickFlow into Sync...

(function(KUBE) {
    "use strict";
    /* Load class */
    KUBE.LoadFactory('/Library/Tools/SyncFlow2', SyncFlow2,['/Library/DOM/DomJack','/Library/Tools/Hash','/Library/DOM/StyleJack','/Library/Extend/Object','/Library/Extend/Array']);

    SyncFlow2.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function SyncFlow2(_Into,_templateString) {
        //Original Sync
        var Events,ParentDJ,TallBlock,template,data,DJ,jobs,serverJobs,Hash,Pusher;
        data = {};
        jobs = [];
        serverJobs = {
            'delete':[],
            'update':{},
            'new':{}
        };
        DJ = KUBE.Class('/Library/DOM/DomJack');
        Hash = KUBE.Class('/Library/Tools/Hash')();
        Events = KUBE.Events();

        //QuickFlow additions
        var viewableItems,initRowHeight,intoHeight,totalItems,order,reflow,currentPosition,Rows,pauseScroll,inView,positionCache,rangeStart,rangeEnd,totalHeight;

        totalItems = 0;
        viewableItems = 0;
        initRowHeight = 0;
        order = [];
        reflow = false;
        Rows = [];
        inView = [];
        rangeStart = 0;

        positionCache = {
            'x10':[],
            'x100':[],
            'x1000':[],
            'x10000':[]
        };

        if(_Into){
            Into(_Into);
        }

        if(_templateString){
            SetTemplate(_templateString);
        }

        runJobs();

        return {
            "SetTemplate":SetTemplate,
            "SetSortKeys":SetSortKeys,
            "On": Events.On,
            "Into":Into,
            "AddNew":AddNew,
            "Sync":Sync,
            "Add":Add,
            "Remove":Remove,
            "Update":Update,
            "Sort":Sort,
            "Reflow":Reflow
        };

        //QuickFlow
        function Reflow(){
            //Get the scrollPosition
            inView = [];
            var scrollPos = ParentDJ.GetNode().scrollTop;

            //Find our startIndex
            //How many rows will we populate?
            var pops = [];
            var spaceUsed = 0;

            if(scrollPos < intoHeight/2){
                closestIndex = 0;
                closestPosition = 0;

                Pusher.Style().Height(0);

                var rows = 0;
                var height = 0;
                var index = closestIndex;
                var pops = [];

                while(height < (intoHeight*2) && order[index] !== undefined){
                    pops.push(index);
                    height += data[order[index]].height;
                    inView.push(index);
                    index++;
                }

                if(Rows.length < pops.length){
                    for(var newRows = Rows.length-1;newRows<pops.length;newRows++){
                        var R = DJ('div');
                        R.Style().Position('relative').Width('100%');
                        Rows.push({
                            'R':R,
                            'T': R.BuildInner(template)
                        });
                        TallBlock.Append(R);
                    }
                }

                pops.KUBE().each(function(_orderIndex,_index){
                    var R = Rows[_index].R;
                    var T = Rows[_index].T;
                    var obj = data[order[_orderIndex]];
                    R.Clear(undefined,true);
                    R.Style().Height(obj.height);
                    Events.Emit('populate',obj,T,R);
                });
            }
            else{
                var pushPosition = scrollPos-Math.floor(intoHeight/2);
                var closest = calcClosest(pushPosition);
                var closestIndex = closest[0];
                var closestPosition = closest[1];

                Pusher.Style().Height(closestPosition);

                var index = closestIndex;
                var height = 0;
                while(height < intoHeight+(Math.ceil(intoHeight/2)) && order[index] !== undefined){
                    pops.push(index);
                    height += data[order[index]].height;
                    inView.push(index);
                    index++;
                }

                for(var i=0;i<Rows.length;i++){
                    if(i < pops.length){
                        if(Rows[i].R.IsDetached()){
                            TallBlock.Append(Rows[i].R);
                        }
                    }
                    else if(i >= pops.length){
                        if(!Rows[i].R.IsDetached()){
                            Rows[i].R.Detach();
                        }
                    }
                }

                pops.KUBE().each(function(_orderIndex,_index){
                    var R = Rows[_index].R;
                    var T = Rows[_index].T;
                    var obj = data[order[_orderIndex]];
                    R.Clear(undefined,true);
                    R.Style().Height(obj.height);
                    Events.Emit('populate',obj,T,R);
                });
            }

            //We use inView for Sync
        }

        function calcClosest(_scrollPos){
            return calcIndex(_scrollPos);
        }

        function findPosition(_startIndex,_position,_scrollPos){
            while(true){
                _startIndex++;
                if(data[order[_startIndex]] !== undefined){
                    if(_position >= _scrollPos){
                        return [_startIndex-1,_position];
                    }
                    else{
                        _position += data[order[_startIndex]].height;
                    }
                }
                else{
                    return false;
                }
            }
        }

        function calcIndex(_scrollPos){
            if(_scrollPos === 0){
                return [0,0];
            }

            var calcIndexOps = 0;

            var indexPointer = 0;
            var position = 0;
            var checkPosition = 0;
            for(var i=0;i<positionCache.x10000.length;i++){
                calcIndexOps++;
                checkPosition += positionCache.x10000[i];
                if(checkPosition > _scrollPos){
                    checkPosition = position;
                    break;
                }
                else{
                    position = checkPosition;
                    indexPointer++;
                }
            }

            indexPointer *= 10;
            for(var i=0;i<positionCache.x1000.length;i++){
                calcIndexOps++;
                checkPosition += positionCache.x1000[i];
                if(checkPosition > _scrollPos){
                    checkPosition = position;
                    break;
                }
                else{
                    position = checkPosition;
                    indexPointer++;
                }
            }

            indexPointer *= 10;
            for(var i=0;i<positionCache.x100.length;i++){
                calcIndexOps++;
                checkPosition += positionCache.x100[i];
                if(checkPosition > _scrollPos){
                    checkPosition = position;
                    break;
                }
                else{
                    position = checkPosition;
                    indexPointer++;
                }
            }

            indexPointer *= 10;
            for(var i=0;i<positionCache.x10.length;i++){
                calcIndexOps++;
                checkPosition += positionCache.x10[i];
                if(checkPosition > _scrollPos){
                    checkPosition = position;
                    break;
                }
                else{
                    position = checkPosition;
                    indexPointer++;
                }
            }

            //THIS IS WHERE WE ARE FAILING SOME HOW...
            //debugger;
            indexPointer *= 10;
            //console.log('calcIndexOpts: '+calcIndexOps);
            return findPosition(indexPointer,position,_scrollPos);
        }

        function recalcScroll(){
            var boxHeight = 0;
            data.KUBE().each(function(_key,_obj){
                boxHeight += _obj.height;
            });
            totalHeight = boxHeight;
            TallBlock.Style().Height(boxHeight);
        }

        //This is silly, but temporary as I work through understanding how stable this is (isn't) and opportunities for optimization
        function cachePositions(){
            var counters = {
                "x10":0,
                "x100":0,
                "x1000":0,
                "x10000":0
            };

            positionCache = {
                'x10':[],
                'x100':[],
                'x1000':[],
                'x10000':[]
            };

            order.KUBE().each(function(_key,_index){
                if(_index%10 === 0 && _index){
                    positionCache.x10.push(counters.x10);
                    counters.x10 = 0;
                }

                if(_index%100 === 0 && _index){
                    positionCache.x100.push(counters.x100);
                    counters.x100 = 0;
                }

                if(_index%1000 === 0 && _index){
                    positionCache.x1000.push(counters.x1000);
                    counters.x1000 = 0;
                }

                if(_index%10000 === 0 && _index){
                    positionCache.x10000.push(counters.x10000);
                    counters.x10000 = 0;
                }

                //I know this is stupid. I will derive properly later
                counters.x10 += data[_key].height;
                counters.x100 += data[_key].height;
                counters.x1000 += data[_key].height;
                counters.x10000 += data[_key].height;
            });
        }

        function initQF(){
            if(ParentDJ){
                //viewableItems = Math.ceil(intoHeight/_initRowHeight)+5;
                ParentDJ.Style().Overflow(['hidden','auto']);
                TallBlock = ParentDJ.Append('div');
                TallBlock.Style().Width('100%').Position('relative').Height(intoHeight);
                Pusher = TallBlock.Append('div');
                Pusher.Style().Width('100%').Height(0).Position('relative');
                ParentDJ.GetNode().style.webkitOverflowScrolling = 'touch';
                ParentDJ.On('scroll',Reflow);
            }
        }

        //Sync
        function SetTemplate(_string){
            if(_string && KUBE.Is(_string) === 'string'){
                template = _string;
            }
            else if(KUBE.Is(_string) === 'function'){
                template = ''.KUBE().multiLine(_string);
            }
        }

        function SetSortKeys(_obj){
            //Not yet
        }

        function Into(_DJ,_initRowHeight){
            if(KUBE.Is(_DJ,true) === 'DomJack'){
                ParentDJ = _DJ;
                intoHeight = ParentDJ.GetDrawDimensions().height;
                initRowHeight = _initRowHeight;
                rangeEnd = Math.floor(intoHeight/2);
                initQF();
            }
        }

        function AddNew(_key,_dataObj,_prepend){
            if(data[_key] === undefined){
                serverJobs.new[_key] = _dataObj;
                var obj = {};
                obj[_key] = _dataObj;
                Add(obj,_prepend);
            }
        }

        function Sync(_obj,_prepend){
            //First we call Updates
            _obj.KUBE().each(function(_key,_val){
                if(data[_key] !== undefined){
                    updateItem(_key,_val);
                }
            });

            //Then Deletes
            data.KUBE().each(function(_key,_syncObj){
                if(_obj[_key] === undefined){
                    deleteItem(_key,_syncObj);
                }
            });

            //Add Adds
            _obj.KUBE().each(function(_key,_val){
                if(data[_key] === undefined){
                    addItem(_key,_val,_prepend);
                }
            });
        }

        function Add(_obj,_prepend){
            //We only add missing items from this object
            _obj.KUBE().each(function(_key,_val){
                addItem(_key,_val,_prepend);
            });
            recalcScroll();
            cachePositions();
            reflow = true;
        }

        function Remove(_obj){
            //We only remove items that are not in this object (this tends to be what you actually want to do, though may seem odd at first)
            data.KUBE().each(function(_key,_val){
                if(_obj[_key] === undefined){
                    deleteItem(_key,_val);
                }
            });
        }

        function Update(_obj){
            //We look for items that have changed, and we update them
            _obj.KUBE().each(function(_key,_val){
                updateItem(_key,_val);
            });
        }

        function Sort(_obj){
            //Not yet
        }

        //For server jobs
        function addItem(_key,_val,_prepend){
            if(data[_key] === undefined){
                data[_key] = {
                    'key':_key,
                    'data':_val,
                    'dataHash':Hash.DeepHash(_val),
                    'height':initRowHeight,
                    'reflow':function(){
                        reflowItem(_key);
                    }
                };
                Events.Emit('calcHeight',data[_key]);
                order.push(_key);
            }
        }

        function reflowItem(_key){
            var index = order.indexOf(_key);
            var obj = data[_key];

            //Reflow the positionCaches (lazy for now)
            cachePositions();
            recalcScroll();
            Reflow();
        }

        function updateItem(_key,_val){
            if(data[_key] !== undefined){
                var checkHash = Hash.DeepHash(_val);
                if(data[_key].dataHash !== checkHash){
                    var syncObj = data[_key];
                    syncObj.data = _val;
                    syncObj.dataHash = checkHash;

                    inView.KUBE().each(function(_key){
                        if(_obj.key === _key){
                            reflow = true;
                        }
                    });
                };
            }
        }

        function deleteItem(_key,_val){
            if(data[_key] !== undefined){
                var syncObj = data[_key];
                delete data[_key];
                Events.Emit('delete',_key,syncObj.val,syncObj.Template,syncObj.Node);
                jobs.push(function(){
                    syncObj.Node.Delete();
                });
            }
        }

        function changeFunc(_key){
            return {
                'delete':function(){
                    var obj = data[_key];
                    delete data[_key];
                    jobs.push(function(){
                        obj.Node.Delete();
                    });
                    serverJobs.delete.push(_key);
                },
                'update':function(_newObj){
                    var checkHash = Hash.DeepHash(_newObj);
                    if(data[_key].dataHash !== checkHash){
                        data[_key].dataHash = checkHash;
                        data[_key].data = _newObj;
                        serverJobs.update[_key] = _newObj;
                    }
                }
            };
        }

        function runJobs(){
            requestAnimationFrame(function(){
                if(jobs.length){
                    var jobBatch = jobs;
                    jobs = [];
                    jobBatch.KUBE().each(function(_f){
                        _f();
                    });
                }
                if(serverJobs.delete.length || !serverJobs.new.KUBE().isEmpty() || !serverJobs.update.KUBE().isEmpty()){
                    var sJobs = serverJobs;
                    serverJobs = {
                        'delete':[],
                        'update':{},
                        'new':{}
                    };
                    Events.Emit('submit',sJobs);
                }
                if(reflow){
                    reflow = false;
                    Reflow();
                }
                runJobs();
            });
        }
    }
}(KUBE));