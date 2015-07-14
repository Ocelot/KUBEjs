(function(KUBE) {
    "use strict";

    /* Load class */
    KUBE.LoadSingletonFactory('/Library/Tools/Index', Index);

    Index.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function Index() {

        var __index = {},
            __ref = {},
            __expiry = [],
            __expiryTimer = false;

        return {
            "GetBy": GetBy,
            "GetAll": GetAll,
            "GetByIndexId": GetByIndexId,
            "GetRef": GetRef,
            "Clear": Clear,
            "Add": Add,
            "AddBy": AddBy,
            "Update": Update,
            "Remove": Remove,
            "RemoveById": RemoveById,
            "UpdateExpiry": UpdateExpiry,
            "GetExpiry": GetExpiry,
            "CheckFor": CheckFor,
            "GetIndexId": GetIndexId,
            "CrossReference": CrossReference,
            "OnExpiry": OnExpiry //Perhaps do this with event on Index object instead
        };


        function GetBy(key,val,returnFirst){
            var keys,index,_ret,objectKeys;
            returnFirst = (returnFirst === undefined ? true : returnFirst);
            if(
                KUBE.Is(__ref[(""+key).toLowerCase()]) === "object" &&
                KUBE.Is(__ref[(""+key).toLowerCase()][(""+val).toLowerCase()]) === "object"
            ){
                keys = __ref[(""+key).toLowerCase()][(""+val).toLowerCase()];
                if(returnFirst){
                    objectKeys = Object.keys(keys);
                    index = objectKeys.shift();
                    return __index[index] || null;
                }
                else{
                    _ret = [];
                    keys.KUBE().each(function(key, index,a){
                       if(__index[index]){
                           _ret.push(__index[index]);
                       }
                    });
                    return _ret;
                }
            }
            else{
                return (returnFirst ? null : []);
            }

        }

        function GetAll(){
            return __index;
        }

        function GetByIndexId(indexId){
            return __index[indexId];
        }

        function GetRef(){
            return __ref;
        }

        function Clear(){
            __index = [];
            __ref = {};
            __expiry = [];
            __expiryTimer = false;
        }

        function Add(item, expiry){
            var indexKey;
            if(expiry && expiry < Date.now()){
                throw new Error("Cannot add item to Index. Expiry has already passed.");
            }

            indexKey = GetIndexId(item);
            if(indexKey === undefined){
                indexKey = KUBE.UUID();
                __index[indexKey] = item;
                if(expiry){
                    __expiry[indexKey] = expiry;
                    //INIT EXPIRY TIMER THAT I DON'T DO YET?
                }
            }
            return indexKey;
        }

        function AddBy(key,val,indexItem){
            var indexKey;
            indexKey = GetIndexId(indexItem);

            if(indexKey === undefined){
                indexKey = Add(indexItem);
            }
            else{
                __ref[(""+key).toLowerCase()] = {};
                __ref[(""+key).toLowerCase()][(""+val).toLowerCase()] = {};
                __ref[(""+key).toLowerCase()][(""+val).toLowerCase()][indexKey] = indexKey;
            }
            return indexKey;

        }

        function Update(key,oldVal,newVal,indexItem){
            var indexKey;
            indexKey = GetIndexId(indexItem);
            if(indexKey !== undefined){
                delete __ref[(""+key).toLowerCase()][(""+oldVal).toLowerCase()][indexKey];
                __ref[(""+key).toLowerCase()][(""+newVal).toLowerCase()][indexKey] = indexKey;
            }
        }

        function Remove(indexItem){
            var indexKey;
            indexKey = GetIndexId(indexItem);

            if(indexKey !== undefined){
                __ref.KUBE().each(function(key,valObj){
                    if(KUBE.Is(valObj) === "object"){
                        valObj.KUBE().each(function(val, vals){
                           if(KUBE.Is(vals) === "object" && vals[indexKey] !== undefined){
                               delete __ref[key][val][indexKey];
                           }
                        });
                    }
                });
            }
            delete __index[indexKey];
            delete __expiry[indexKey];

        }

        function RemoveById(indexKey){
            if(__index[indexKey] !== undefined){
                var item = __index[indexKey];
                Remove(item);
            }
        }

        function UpdateExpiry(){
            //ToDo: Expiry not implemented yet
        }

        function GetExpiry(){
            //ToDo: Expiry not yet implemented.
        }

        function CheckFor(indexItem){
            return GetIndexId(indexItem) !== undefined;
        }

        function GetIndexId(indexItem){
            var indexKeys;
            indexKeys = __index.KUBE().map(function(k,v){
                if(v === indexItem){
                    return true;
                }
            });

            return Object.keys(indexKeys).shift();
        }

        function CrossReference(crossReference,returnFirst){
            returnFirst = !!returnFirst;
        }

        function OnExpiry(callback){
            //this is all wrong and I'm gonna rework expiry to make sense in JS.
            //for now, I do nothing with expiry.
        }

    }


}(KUBE));

