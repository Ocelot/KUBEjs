(function(KUBE) {
    "use strict";
    /* Load class */
    KUBE.LoadFactory('/Library/Tools/Sync', Sync,['/Library/DOM/DomJack','/Library/Tools/Hash']);

    Sync.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function Sync(_Into,_templateString) {
        var Events,ParentDJ,template,data,DJ,jobs,serverJobs,Hash;
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
            "Init":Init,
            "AddNew":AddNew,
            "Sync":Sync,
            "Add":Add,
            "Remove":Remove,
            "Update":Update,
            "Sort":Sort
        };

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

        function Into(_DJ){
            if(KUBE.Is(_DJ,true) === 'DomJack'){
                ParentDJ = _DJ;
            }
        }

        function Init(_obj){
            if(KUBE.Is(_obj) === 'object'){
                _obj.KUBE().each(function(_key,_val){
                    addItem(_key,_val);
                });
            }
        }

        function AddNew(_key,_dataObj){
            if(data[_key] === undefined){
                serverJobs.new[_key] = _dataObj;
                var obj = {};
                obj[_key] = _dataObj;
                Add(obj);
            }
        }

        function Sync(_obj){
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
                    addItem(_key,_val);
                }
            });
        }

        function Add(_obj){
            //We only add missing items from this object
            _obj.KUBE().each(function(_key,_val){
                addItem(_key,_val);
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
        function addItem(_key,_val){
            if(data[_key] === undefined){
                var Node = DJ('div');
                var Template = Node.BuildInner(template);
                data[_key] = {
                    'key':_key,
                    'val':_val,
                    'valHash':Hash.DeepHash(_val),
                    'Template':Template,
                    'Node':Node
                };
                Events.Emit('new',_key,_val,Template,Node,changeFunc(_key));
                jobs.push(function(){
                    ParentDJ.Append(Node);
                });
            }
        }

        function updateItem(_key,_val){
            if(data[_key] !== undefined){
                var checkHash = Hash.DeepHash(_val);
                if(data[_key].valHash !== checkHash){
                    var syncObj = data[_key];
                    syncObj.val = _val;
                    syncObj.valHash = checkHash;
                    jobs.push(function(){
                        Events.Emit('update',_key,_val,_syncObj.Template,_syncObj.Node);
                    });
                };
            }
        }

        function deleteItem(_key,_val){
            if(data[_key] !== undefined){
                delete data[_key];
                Events.Emit('delete',_key,_val.val,_val.Template,_val.Node);
                jobs.push(function(){
                    _syncObj.Node.Delete();
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
                runJobs();
            });
        }
    }
}(KUBE));