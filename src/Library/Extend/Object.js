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

    /* Load functions */
    var ExtendAPI;
    KUBE.SetAsLoaded('/Library/Extend/Object');
    if(KUBE.Extend){
        ExtendAPI = KUBE.Extend();
        ExtendAPI.Load('object','merge',Merge);
        ExtendAPI.Load('object','mergeCopy',MergeCopy);
        ExtendAPI.Load('object','count',Count);
        ExtendAPI.Load('object','copy',Copy);
        ExtendAPI.Load('object','compare',Compare);
        ExtendAPI.Load('object','create',Create);
        ExtendAPI.Load('object','each',Each);
        ExtendAPI.Load('object','reverseEach',ReverseEach);
        ExtendAPI.Load('object','duckType',DuckType);
        ExtendAPI.Load('object','isEmpty',IsEmpty);
        ExtendAPI.Load('object','toJSON',toJSON);
        ExtendAPI.Load('object','fromJSON',fromJSON);
        ExtendAPI.Load('object','map',Map);
        ExtendAPI.Load('object','path',Path);
        ExtendAPI.Load('object','valueObjectSort',ValueObjectSort);
        KUBE.EmitState('/Library/Extend/Object');
        KUBE.console.log('/Library/Extend/Object Loaded');
    }

    /* Declare functions */
    function toJSON(){
        return JSON.stringify(this);
    }

    function fromJSON(_jsonString){
        var $this = this;
        var temp;
        temp = JSON.parse(_jsonString);
        for(var prop in temp){
            if(temp.hasOwnProperty(prop)){
                $this[prop] = temp[prop];
            }
        }
        return $this;
    }

    //The syntax is either an array of arrays specifying key/path,reverse (true false), isKeyPath(true false), or key/path,reverse,isKeyPath
    function ValueObjectSort(_arg1,_arg2,_isKeyPath,useNaturalSort){
        var origin = this;
        var sortBy = [];
        var order = [];
        var sorted = {};
        var natSort = undefined;
        useNaturalSort = !!useNaturalSort; //Giff boolean.

        natSort = naturalSort(false); //Get natural sort function;

        if(KUBE.Is(_arg1) !== 'array'){
            sortBy.push([_arg1,_arg2,_isKeyPath,useNaturalSort]);
        }
        else{
            sortBy = _arg1;
        }

        order = Object.keys(origin);
        order.sort(function(a,b){
            var objA,objB,aVal,bVal,natSortVal;
            if(sortBy.length === 1){
                objA = origin[a];
                objB = origin[b];

                aVal = (sortBy[0][2] ? findVal(objA,sortBy[0][0]) : objA[sortBy[0][0]]);
                bVal = (sortBy[0][2] ? findVal(objB,sortBy[0][0]) : objB[sortBy[0][0]]);

                //var aVal = origin[a][sortBy[0][0]];
                //var bVal = origin[b][sortBy[0][0]];
                if(sortBy[0][3]){
                    natSortVal = natSort(aVal,bVal);
                    switch(natSortVal){
                        case -1:
                            return (sortBy[0][1] ? 1 : -1);
                            break;

                        case 1:
                            return (sortBy[0][1] ? -1 : 1);
                            break;

                        default:
                            return 0;
                            break;
                    }
                }
                else{
                    if(aVal < bVal){
                        return (sortBy[0][1] ? 1 : -1);
                    }
                    if(aVal > bVal){
                        return (sortBy[0][1] ? -1 : 1);
                    }
                    return 0;
                }




            }
            else{
                objA = origin[a];
                objB = origin[b];
                for(var i=0;i<sortBy.length;i++){
                    aVal = (sortBy[0][2] ? findVal(objA,sortBy[i][0]) : objA[sortBy[i][0]]);
                    bVal = (sortBy[0][2] ? findVal(objB,sortBy[i][0]) : objB[sortBy[i][0]]);

                    //var aVal = objA[sortBy[i][0]];
                    //var bVal = objB[sortBy[i][0]];
                    if(sortBy[0][3]){
                        natSortVal = natSort(aVal,bVal);
                        switch(natSortVal){
                            case -1:
                                return (sortBy[i][1] ? 1 : -1);
                                break;

                            case 1:
                                return (sortBy[i][1] ? -1 : 1);
                                break;
                        }
                    }
                    else{
                        if(aVal < bVal){
                            return (sortBy[i][1] ? 1 : -1);
                        }
                        if(aVal > bVal){
                            return (sortBy[i][1] ? -1 : 1);
                        }
                    }
                }
                return 0; //All keys have resulted in the same?
            }
        });

        return order;
    }

    function findVal(_obj,_val,_split){
        var key,val;
        _split = _split || '.';
        if(KUBE.Is(_val) === 'string'){
            _val = _val.split(_split);
        }
        key = _val.splice(0,1);
        val = _obj[key];
        if(_val.length && KUBE.Is(val) === 'object'){
            return findVal(val,_val,_split);
        }
        else if(_val.length){
            return undefined;
        }
        else{
            return val;
        }
    }

    /*
     * Natural Sort algorithm for Javascript - Version 0.8 - Released under MIT license
     * Author: Jim Palmer (based on chunking idea from Dave Koelle)
     */
    function naturalSort (insensitive) {
        return function natSort(a, b) {
            var re = /(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[\da-fA-F]+$|\d+)/g,
                sre = /^\s+|\s+$/g,   // trim pre-post whitespace
                snre = /\s+/g,        // normalize all whitespace to single ' ' character
                dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
                hre = /^0x[0-9a-f]+$/i,
                ore = /^0/,
                i = function (s) {
                    return (insensitive && ('' + s).toLowerCase() || '' + s).replace(sre, '');
                },
            // convert all to strings strip whitespace
                x = i(a) || '',
                y = i(b) || '',
            // chunk/tokenize
                xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
                yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
            // numeric, hex or date detection
                xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
                yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
                normChunk = function (s, l) {
                    // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
                    return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
                },
                oFxNcL, oFyNcL;
            // first try and sort Hex codes or Dates
            if (yD) {
                if (xD < yD) {
                    return -1;
                }
                else if (xD > yD) {
                    return 1;
                }
            }
            // natural sorting through split numeric strings and default strings
            for (var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
                oFxNcL = normChunk(xN[cLoc] || '', xNl);
                oFyNcL = normChunk(yN[cLoc] || '', yNl);
                // handle numeric vs string comparison - number < string - (Kyle Adams)
                if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
                    return (isNaN(oFxNcL)) ? 1 : -1;
                }
                // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                else if (typeof oFxNcL !== typeof oFyNcL) {
                    oFxNcL += '';
                    oFyNcL += '';
                }
                if (oFxNcL < oFyNcL) {
                    return -1;
                }
                if (oFxNcL > oFyNcL) {
                    return 1;
                }
            }
            return 0;
        }
    }

    function Path(_val,_split){
        return findVal(this,_val,_split);
    }

    function Map(compareFunction,negate){
        var prop, newObj = {}, keys, valid;
        valid = !negate; //If negate is true, I want to include false values instead.
        keys = Object.keys(this);
        for(var i = 0; i < keys.length; i++){
            prop = keys[i];
            if(compareFunction(prop,this[prop]) == valid){
                newObj[prop] = this[prop];
            }
        }
        return newObj;
    }

    function Each(_f,_useOriginal){
        var prop,$return,eachBreak,eachDelete, keys;
        $return = (!_useOriginal ? {} : this);

        if(KUBE.Is(_f) === 'function'){
            keys = Object.keys(this);
            for(var i = 0; i < keys.length; i++){
                prop = keys[i];
                eachDelete = false;
                $return[prop] = _f.call({'break':_break,'delete':_delete},prop,this[prop]);
                if(eachDelete){
                    delete $return[prop];
                }
                if(eachBreak){
                    break;
                }
            }
        }
        return $return;

        function _break(){
            eachBreak = true;
        }

        function _delete(){
            eachDelete = true;
        }
    }

    function ReverseEach(_f,_useOriginal){
        var prop, i,$return,eachBreak,eachDelete;
        $return = (!_useOriginal ? {} : this);
        var keys = Object.keys(this);
        keys.reverse();
        if(KUBE.Is(_f) === 'function'){
            for(i = 0; i < keys.length; i++){
                prop = keys[i];
                eachDelete = false;
                $return[prop] = _f.call({'break':_break,'delete':_delete},prop,this[prop]);
                if(eachDelete){
                    delete $return[prop];
                }
                if(eachBreak){
                    break;
                }
            }
        }
        return $return;

        function _break(){
            eachBreak = true;
        }

        function _delete(){
            eachDelete = true;
        }
    }



    function Merge(){
        var i,$target;
        $target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);

        for(i=0;i<arguments.length;i++){
            if(KUBE.Is(arguments[i]) === 'object'){
                merge($target,copy(arguments[i]));
            }
        }
        return $target;
    }

    function MergeCopy(){
        var i,target,$newObj;
        target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);
        $newObj = copy(target);

        for(i=0;i<arguments.length;i++){
            if(KUBE.Is(arguments[i]) === 'object'){
                merge($newObj,copy(arguments[i]));
            }
        }
        return $newObj;
    }

    function Count(){
        return Object.keys(this).length;
    }

    function Copy(){
        var $target = (KUBE.Is(arguments[arguments.length-1]) === 'boolean' ? {} : this);
        return copy($target);
    }

    function Create(_p){
        var prop,n = Object.create(_p);
        for(prop in this){
            if(this.hasOwnProperty(prop)){
                n[prop] = this[prop];
            }
        }
        return n;
    }

    function DuckType(_duck){
        var prop,$return = false;
        if(KUBE.Is(_duck) === 'object'){
            $return = true;
            for(prop in this){
                if(this.hasOwnProperty(prop)){
                    if(_duck[prop] === undefined){
                        $return = false;
                        break;
                    }
                }
            }
        }
        return $return;
    }

    function IsEmpty(){
        var prop,$return = true;;
        for(prop in this){
            if(this.hasOwnProperty(prop)){
                $return = false;
                break;
            }
        }
        return $return;
    }

    function Compare(_obj){
        return (this === _obj ? true : (check(this,_obj) && check(_obj,this) ? true : false));

        function check(_1,_2){
            var type1,type2,checkMethods,$return;

            type1 = KUBE.Is(_1);
            type2 = KUBE.Is(_2);
            checkMethods = {'array':checkArray,'object':checkObject};
            $return = false;

            if(type1 === type2){
                $return = (checkMethods[type1] ? checkMethods[type1](_1,_2) : checkValue(_1,_2));
            }
            return $return;
        }

        function checkArray(_a1,_a2){
            var i,$return;
            $return = false;

            if(_a1.length === _a2.length){
                $return = true;
                for(i=0;i<_a1.length;i++){
                    if(!check(_a1[i],_a2[i])){
                        $return = false;
                        break;
                    }
                }
            }
            return $return;
        }

        function checkObject(_o1,_o2){
            var prop,$return;
            $return = true;

            for(prop in _o1){
                if(KUBE.Is(_o1[prop]) !== 'function'){
                    if(_o1.hasOwnProperty(prop) && _o2.hasOwnProperty(prop)){
                        if(!check(_o1[prop],_o2[prop])){
                            $return = false;
                            break;
                        }
                    }
                    else{
                        $return = false;
                        break;
                    }
                }
            }
            return $return;
        }

        function checkValue(_v1,_v2){
            return (_v1 === _v2 ? true : false);
        }
    }

    /* Utility functions */
    function merge(_target,_obj){
        var prop;
        for(prop in _obj){
            if(_obj.hasOwnProperty(prop) && _target[prop] === undefined){
                _target[prop] = _obj[prop];
            }
        }
        return _target;
    }

    function copy(_obj){
        var copier,circleCache,$return;

        copier = {'object':copyObject,'array':copyArray,'date':copyDate,'regExp':copyRegExp};
        circleCache = {'array':[],'object':[]};
        $return = copyObject(_obj);

        circleCache = null;
        return $return;

        function checkCircle(_ref,_type){
            var i,$ref;
            for(i=0;i<circleCache[_type].length;i++){
                if(circleCache[_type][i].ref === _ref){
                    $ref = circleCache[_type][i].copy;
                    break;
                }
            }
            if($ref === undefined){
                $ref = copier[_type](_ref);
            }
            return $ref;
        }

        function copyObject(_obj){
            var prop,type,newObj = {};

            circleCache.object.push({'ref':_obj,'copy':newObj});
            for(prop in _obj){
                if(_obj.hasOwnProperty(prop)){
                    if(_obj[prop] !== _obj){
                        type = KUBE.Is(_obj[prop]);
                        newObj[prop] = (copier[type] ? checkCircle(_obj[prop],type) : _obj[prop]);
                    }
                    else{
                        newObj[prop] = newObj;
                    }
                }
            }
            return newObj;
        }

        function copyArray(_array){
            var i,type,$newArray = [];

            circleCache.array.push({'ref':_array,'copy':$newArray});
            for(i=0;i<_array.length;i++){
                if(_array[i] !== _array){
                    type = KUBE.Is(_array[i]);
                    $newArray.push((copier[type] ? checkCircle(_array[i],type) : _array[i]));
                }
                else{
                    $newArray.push($newArray);
                }
            }
            return $newArray;
        }

        function copyDate(_date){
            return new Date(_date.getTime());
        }

        function copyRegExp(_regExp){
            return new RegExp(_regExp);
        }

    }
}(KUBE));