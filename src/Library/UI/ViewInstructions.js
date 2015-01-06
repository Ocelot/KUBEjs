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
    KUBE.LoadFactory('/Library/UI/ViewInstructions',ViewInstructions,['/Library/Extend/Object','/Library/Extend/Array']);
    ViewInstructions.prototype.toString = function(){ return '[object '+this.constructor.name+']' }

    function ViewInstructions(_instructionObj){
        var $API,behavior,data,views,type,id,name;

        behavior = 'loose';
        views = [];
        inflateFromObj(_instructionObj);

        $API = {
            'Get':Get,
            'GetType':GetType,
            'GetName':GetName,
            'GetId':GetId,
            'GetData':GetData,
            'GetBehavior':GetBehavior,
            'SetBehavior':SetBehavior,
            'SetType':SetType,
            'SetName':SetName,
            'SetId':SetId,
            'SetData':SetData,
            'AddViewInstructions':AddViewInstructions,
            'GetChildViews':GetChildViews
        }.KUBE().create(ViewInstructions.prototype);
        return $API;

        function Get(){
            //Should probably compile the subInstructions into Objects
            return {
                'behavior':behavior,
                'type':type,
                'name':name,
                'id':id,
                'data':data,
                'views':deflateChildViews()
            };
        }

        //Getters
        function GetType(){
            return type;
        }

        function GetName(){
            return name;
        }

        function GetId(){
            return id;
        }

        function GetData(){
            return data;
        }

        function GetBehavior(){
            return behavior;
        }

        function GetChildViews(){
            return views;
        }

        //Setters
        function SetData(_data){
            data = _data;
        }

        function SetBehavior(_behavior){
            if(_behavior === 'strict' || _behavior === 'loose'){
                behavior = _behavior;
            }
            else{
                throw new Error('Invalid behavior type passed into Instructions: '+_behavior);
            }
        }

        function SetType(_type){
            type = String(_type);
        }

        function SetName(_name){
            name = String(_name);
        }

        function SetId(_id){
            id = String(_id);
        }

        function AddViewInstructions(_ViewInstructions){
            if(KUBE.Is(_ViewInstructions,true) === 'ViewInstructions'){
                views.push(_ViewInstructions);
            }
        }

        //Inflate
        function inflateFromObj(_obj){
            if(KUBE.Is(_obj) === 'object'){
                name = (_obj.name !== undefined ? _obj.name : name);
                type = (_obj.type !== undefined ? _obj.type : type);
                id = (_obj.id !== undefined ? _obj.id : id);
                data = (_obj.data !== undefined ? _obj.data : data);

                if(String(_obj.behavior).toLowerCase() === 'strict' || String(_obj.behavior).toLowerCase() === 'loose'){
                    SetBehavior(_obj.behavior);
                }

                if(KUBE.Is(_obj.views) === 'array'){
                    _obj.views.KUBE().each(function(_viewInstructions){
                        var ViewInstructions = KUBE.Class('/Library/UI/ViewInstructions')(_viewInstructions);
                        views.push(ViewInstructions);
                    });
                }
            }
        }

        function deflateChildViews(){
            var $return = [];
            views.KUBE().each(function(_ViewInstructions){
                if(KUBE.Is(_ViewInstructions,true) === 'ViewInstructions'){
                    $return.push(_ViewInstructions.Get());
                }
            });
            return $return;
        }
    }
}(KUBE));