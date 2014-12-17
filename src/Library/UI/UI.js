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
	KUBE.LoadFactory('/Library/UI/UI',UI,['/Library/UI/Loader','/Library/Ajax/Client','/Library/DOM/DomJack','/Library/Extend/Object','/Library/Extend/Array','/Library/Extend/Date']);

	UI.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function UI(_DomJack){
        if(KUBE.Is(_DomJack,true) !== 'DomJack'){
            throw new Error('Failed to initialize User Interface, constructor must be a valid DomJack object');
        }
        var Root,Client,RequestTemplate,$API,UILoader;
        UILoader = KUBE.Class('/Library/UI/Loader')();

        //Our API
        $API = {
            'SetClient':SetClient,
            'SendRequest':SendRequest
        }.KUBE().create(UI.prototype);

        Root = UILoader.Create(undefined,'Root','Root','Root',{
            'UI':$API,
            'DomJackRoot':_DomJack
        });

        Root.Once('delete',function(){
            throw new Error('The Root Node of the UI was deleted. This is an irrecoverable UI state.');
            Root = undefined;
        });

        $API.Root = Root;
        return $API;

        //Instruction processing
        function SetClient(){

        }

        function SendRequest(){

        }

        function Send(_actionObj,_f){
            //This has the ability to communicate directly with the View that is sending the request, otherwise instructions are processed accordingly
            //SendHandler.Send(_actionObj,true);
            //if(KUBE.Is(_f) === 'function'){
            //    responseCall = _f;
            //}
        }

        function SetSendHandler(_Send){
            //if(KUBE.Is(_Send,true) === 'Ajax'){
            //    SendHandler = _Send;
            //    SendHandler.On('response',handleInstructions);
            //    SendHandler.On('error',handleAjaxError);
            //}
            //else{
            //    throw new Error('Set send handler failed. Not an KUBE Ajax Object?');
            //}
            //return CoreView;
        }

        function handleInstructions(_response){
            var rCall;
            if(KUBE.Is(_response) === 'object'){
                if(responseCall){
                    rCall = responseCall;
                    responseCall = undefined;
                    try{
                        rCall(_response.response);
                    }
                    catch(E){
                        //Response call resulted in javascript error. PROGRAM MOAR BETTAR!?
                        throw E;
                    }
                }

                if(_response.autoLoad){
                    processAutoLoad(_response.autoLoad);
                }

                if(_response.indexes && _response.indexes.length > 0){
                    _response.indexes.KUBE().each(processIndexes);
                }

                if(_response.instructions){
                    switch(KUBE.Is(_response.instructions)){
                        case 'array':
                            _response.instructions.KUBE().each(processInstructions);
                            break;

                        case 'object':
                            processInstructions(_response.instructions);
                            break;
                    }
                }
            }
        }

        function processInstructions(_instructions){
            var FoundView;
            if(KUBE.Is(_instructions) === 'object'){
                //Autoload?
                FoundView = Root.Find(_instructions.find);
                if(FoundView){
                    if(KUBE.Is(_instructions.data) !== 'null'){
                        FoundView.Update(_instructions.data);
                    }

                    if(
                        FoundView.Parent() !== undefined && KUBE.Is(_instructions.views) === 'array' && _instructions.views.length > 0 ||
                        FoundView.Parent() !== undefined && KUBE.Is(_instructions.views) === 'array' && _instructions.behavior === 'strict'
                    ){
                        FoundView.UpdateChildren(_instructions.views,_instructions.behavior);
                    }
                }
            }
        }

        function processIndexes(indexObj){
            if(indexObj.namespace && indexObj.indexURL){
                UILoader.LoadAutoIndex(indexObj.namespace,indexObj.indexURL);
            }
        }

        //This allows for autoloading of UI components
        function autoLoad(_autoLoadInstructions){
            if(KUBE.Is(_autoLoadInstructions) === 'object'){
                UILoader.LoadAutoIndex(_autoLoadInstructions.namespace,_autoLoadInstructions.indexURL);
            }
        }

        function processAutoLoad(_autoLoad){
            if(KUBE.Is(_autoLoad) === 'array'){
                _autoLoad.KUBE().each(autoLoad);
            }
        }
	}

}(KUBE));

//var instructions = 
//{
//	'loadViews':[], //Autoload?
//	'find':{}, //Find the parent
//	'behavior':'loose/strict/inherited', //loose/strict (loose creates/updates only, strict creates/updates/removes)
//	'data': {},
//	'views':[
//		{
//			'type':'xxx',
//			'id':'xxx',
//			'data':{},
//			'behavior':'loose/strict/inherited',
//			'views':[
//				
//			]
//		}
//	]
//};
//
//RootView = UI.CreateRoot('Node/Id');
//FoundView = RootView.Find(find);
//FoundView.Update(data);
//FoundView.UpdateChildren(views,behavior);

//
//var View = UI.Find(find);
//View.Update(data);
//View.UpdateChildren(views,behavior);