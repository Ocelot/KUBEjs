//My experimental attempt at integrating our old QuickFlow into Sync...

(function(KUBE) {
    "use strict";
    /* Load class */
    KUBE.LoadFactory('/Library/Tools/SyncFlow', SyncFlow,['/Library/DOM/DomJack','/Library/Tools/Hash','/Library/DOM/StyleJack','/Library/Extend/Object','/Library/Extend/Array']);

    SyncFlow.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function SyncFlow(_Into,_templateString) {
        //Original Sync
        var Events,ParentDJ,TallBlock,template,data,DJ,jobs,serverJobs,Hash;
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
        var viewableItems,initRowHeight,intoHeight,totalItems,order,reflow,currentPosition,Rows,pauseScroll,inView;

        totalItems = 0;
        viewableItems = 0;
        initRowHeight = 0;
        order = [];
        reflow = false;
        Rows = [];
        inView = [];

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
            var scrollPos = TallBlock.GetNode().scrollHeight;

            //Find our startIndex
            var startIndex = calcIndex(scrollPos);

            //How many rows will we populate?
            var pops = [];
            var spaceUsed = 0;
            for(;spaceUsed<(intoHeight+(initRowHeight*5));startIndex++){
                if(startIndex > order.length-1){
                    break;
                }
                else{
                    spaceUsed += data[order[startIndex]].height;
                    pops.push(startIndex);
                }
            }

            for(var i=Rows.length;i<pops.length;i++){
                var NewRow = DJ('div')
                Rows.push(NewRow);
                NewRow.Position('absolute');
            }

            pops.KUBE().each(function(_orderIndex,_index){
                var N = Rows[_index];
                var obj = data[order[_orderIndex]];
                var Template = N.BuildInner(template);
                inView.push({
                    'key':_key,
                    'N':N,
                    'T':Template
                });
                Events.Emit('populate',_key,obj,Template,N);
                reflowJob(N,_orderIndex);
            });

            //Move the appropriate 'rows'
            //Call populate on the appropriate items
        }

        function reflowJob(_N,_orderIndex){
            jobs.push(function(){
                _N.Style().Top(calcPosition(_orderIndex));
            });
        }

        function calcIndex(_scrollPos){
            if(_scrollPos = 0){
                return 0;
            }
            var index,position = 0;
            order.KUBE().each(function(_key,_index){
                position += data[_key].height
                if(position >= _scrollPos){
                    index = _index;
                    this.break();
                }
            });
            return index;
        }

        //I can create a positionCache later. For now just get it moving correctly
        function calcPosition(_orderIndex){
            var position = 0;
            order.KUBE().each(function(_key,_index){
                position += data[_key].height
                if(_index == _orderIndex){
                    this.break();
                }
            });
            return position;
        }

        function initQF(){
            if(ParentDJ){
                viewableItems = Math.ceil(intoHeight/_initRowHeight)+5;
                ParentDJ.Style().Overflow(['hidden','auto']);
                TallBlock = ParentDJ.Append('div');
                TallBlock.Style().Width('100%').Position('relative').Height(intoHeight);
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
                    'val':_val,
                    'valHash':Hash.DeepHash(_val),
                    'height':initRowHeight
                };
                order.push(_key);
                reflow = true;
            }
        }

        function updateItem(_key,_val){
            if(data[_key] !== undefined){
                var checkHash = Hash.DeepHash(_val);
                if(data[_key].valHash !== checkHash){
                    var syncObj = data[_key];
                    syncObj.val = _val;
                    syncObj.valHash = checkHash;

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
                    if(data[_key].valHash !== checkHash){
                        data[_key].valHash = checkHash;
                        data[_key].val = _newObj;
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