(function(KUBE) {
    "use strict";
    /* Load class */
    KUBE.LoadFactory('/Library/Tools/SyncData', SyncData,['/Library/DOM/DomJack']);

    SyncData.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function SyncData(_obj) {
        var data,Events,fs;

        data = (KUBE.Is(_obj) === 'object' ? _obj : {});
        Events = KUBE.Events();

        return {
            "Get":Get,
            "Set":Set,
            "On": Events.On,
            "Sync":Sync,
            "Add":Add,
            "Remove":Remove,
            "Delete":Delete,
            "Update":Update
        };

        function Get(_id){
            return (_id !== undefined ? data[_id] : data);
        }

        function Set(_obj){
            if(KUBE.Is(_obj) === 'object'){
                data = _obj;
            }
        }

        //CRUD type operations
        function Add(_obj){
            _obj.KUBE().each(function(_key,_val){
                addItem(_key,_val);
            });
        }

        function Remove(_obj){
            data.KUBE().each(function(_key,_val){
                if(_obj[_key] === undefined){
                    deleteItem(_key,_val);
                }
            });
        }

        //Basically the opposite of remove. We remove the items that you pass. This makes sense for spot removal by the server (as opposed to sync type operations)
        function Delete(_obj){
            _obj.KUBE().each(function(_key,_val){
                if(data[_key] !== undefined){
                    deleteItem(_key,_val);
                }
            });
        }

        function Update(_obj){
            _obj.KUBE().each(function(_key,_val){
                updateItem(_key,_val);
            });
        }

        //Magic
        function Sync(_obj){
            //Update matching
            _obj.KUBE().each(function(_key,_val){
                if(data[_key] !== undefined){
                    updateItem(_key,_val);
                }
            });

            //Delete items that don't exist
            data.KUBE().each(function(_key,_syncObj){
                if(_obj[_key] === undefined){
                    deleteItem(_key,_syncObj);
                }
            });

            //Add new items that do exists
            _obj.KUBE().each(function(_key,_val){
                if(data[_key] === undefined){
                    addItem(_key,_val,_prepend);
                }
            });
        }

        //The underlying pieces
        function addItem(_key,_val){
            if(data[_key] === undefined){
                data[_key] = _val;
                Events.Emit('create',_key,_val);
            }
        }

        function updateItem(_key,_val){
            if(data[_key] !== undefined){
                data[_key] = _val;
                Events.Emit('update',_key,_val);
            }
        }

        function deleteItem(_key){
            if(data[_key] !== undefined){
                var dObj = data[_key];
                delete data[_key];
                Events.Emit('delete',_key,dObj);
            }
        }
    }
}(KUBE));