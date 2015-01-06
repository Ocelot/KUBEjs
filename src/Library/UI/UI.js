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
        var Root,Client,RequestTemplate,$API,UILoader,requestManager,responseHandler;
        UILoader = KUBE.Class('/Library/UI/Loader')();

        //Our API
        $API = {
            'SetClient':SetClient,
            'SendRequest':SendRequest,
            'SetRequestManager':SetRequestManager,
            'SetResponseHandler':SetResponseHandler,
            'Send':Send,
            'ProcessInstructions':ProcessInstructions
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
        function SetClient(_Client){
            if(KUBE.Is(_Client,true) === 'Client'){
                Client = _Client;
            }
            else{
                throw new Error('UI Client object must be a valid /Library/Ajax/Client object.');
            }
        }

        function SendRequest(_Request){
            if(KUBE.Is(_Request,true) === 'Request' && Client){
                Client.SendRequest(_Request).then(handleClientResponse).catch(handleClientError);
            }
        }

        function SetRequestManager(_managerCallback){
            if(KUBE.Is(_managerCallback) === 'function'){
                requestManager = _managerCallback;
            }
        }

        function SetResponseHandler(_handlerCallback){
            if(KUBE.Is(_handlerCallback) === 'function'){
                responseHandler = _handlerCallback;
            }
        }

        function Send(_data){
            if(KUBE.Is(requestManager) === 'function'){
                SendRequest(requestManager(_data));
            }
        }

        function ProcessInstructions(_InstructionsObj){
            if(KUBE.Is(_InstructionsObj,true) === 'ViewInstructions'){
                var FoundView = Root.Find(_InstructionsObj);
                if(KUBE.Is(FoundView,true) === 'UIView'){
                    if(_InstructionsObj.GetData()){
                        FoundView.Update(_InstructionsObj.GetData());
                    }

                    if(KUBE.Is(_InstructionsObj.GetChildViews()) === 'array'){
                        FoundView.UpdateChildren(_InstructionsObj.GetChildViews(),_InstructionsObj.GetBehavior());
                    }
                }
            }
        }

        function handleClientError(_Error){
            throw _Error;
        }

        function handleClientResponse(_Response){
            if(KUBE.Is(responseHandler) === 'function'){
                responseHandler(_Response);
            }
            else{
                throw new Error('UI requires a Response Handler to translate Client Responses to Instructions. No response handler set');
            }
        }

	}

}(KUBE));
