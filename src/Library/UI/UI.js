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
	KUBE.LoadFactory('/Library/UI/UI',UI,['/Library/UI/Loader','/Library/Ajax/Client','/Library/DOM/DomJack','/Library/Extend/Object','/Library/Extend/Array','/Library/Extend/Date','/Library/Extend/Math']);

	UI.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function UI(_DomJack){
        if(KUBE.Is(_DomJack,true) !== 'DomJack'){
            throw new Error('Failed to initialize User Interface, constructor must be a valid DomJack object');
        }
        var Root,Client,NotifyClient,nRequestManager,nResponseHandler,RequestTemplate,$API,UILoader,requestManager,responseHandler,notifications,lastNRun,nState,nPause,nThreshold;
        UILoader = KUBE.Class('/Library/UI/Loader')();
        notifications = {};
        lastNRun = 0;
        nState = false;
        nPause = false;

        //Our API
        $API = {
            'SetClient':SetClient,
            'SendRequest':SendRequest,
            'SetRequestManager':SetRequestManager,
            'SetResponseHandler':SetResponseHandler,
            'Send':Send,
            'ProcessInstructions':ProcessInstructions,
            'SetNotificationClient':SetNotificationClient,
            'AddNotification':AddNotification,
            'CancelNotification':CancelNotification
        }.KUBE().create(UI.prototype);

        Root = UILoader.Create(undefined,'Root','Root','Root');

        var rootDimensions = getRootDimensions(_DomJack);

        Root.Init({
            'UI':$API,
            'DomJackRoot':_DomJack
        },rootDimensions[0],rootDimensions[1]);

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

        function SetNotificationClient(_Client,_notifyThreshold){
            if(KUBE.Is(_Client,true) === 'Client'){
                nThreshold = _notifyThreshold || 500;
                NotifyClient = _Client;
            }
            else{
                throw new Error('UI Client object must be a valid /Library/Ajax/Client object.');
            }
        }

        function SendRequest(_Request){
            if(KUBE.Is(_Request,true) === 'Request' && Client){
                var ResponsePromise = Client.SendRequest(_Request);
                ResponsePromise.then(handleClientResponse).catch(handleClientError);
                return ResponsePromise.then(function(_Response){
                    return {'code':_Response.GetStatusCode(),'reason':_Response.GetStatusText()};
                });
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

        function AddNotification(_UIView,_callCallback,_receiveCallback,_interval){
            if(KUBE.Is(NotifyClient,true) !== 'Client'){
                throw new Error();
            }
            if(KUBE.Is(_UIView,true) === 'UIView' && KUBE.Is(_callCallback) === 'function' && KUBE.Is(_receiveCallback) === 'function'){
                var notifyId = generateNotifyId();
                _interval = _interval || 1000;

                //I could probably optimize this if it becomes a burden on the system
                notifications[notifyId] = {
                    'interval':_interval,
                    'callCallback':_callCallback,
                    'receiveCallback':_receiveCallback,
                    'lastRun':0
                };

                //I'm fairly sure this will stack and clear properly, but might be worth double checking
                _UIView.Once('delete',function(){
                    CancelNotification(notifyId);
                });

                if(!nState){
                    nState = setInterval(runNotifications,nThreshold);
                }
                return notifyId;
            }
        }

        function CancelNotification(_notifyId){
            if(notifications[_notifyId]){
                delete notifications[_notifyId];
            }
        }

        function Send(_data){
            if(KUBE.Is(requestManager) === 'function'){
                return SendRequest(requestManager(_data));
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

        function getRootDimensions(_RootDJ){
            //So... what should I do with this? For now, take its width/height if they exist, otherwise go full screen. It is likely this should be more robust in the future to handle a variety of spaces
            var width,height;
            width = _RootDJ.Style().Width() || KUBE.Class('/Library/DOM/WinDocJack')().WindowWidth();
            height = _RootDJ.Style().Height() || KUBE.Class('/Library/DOM/WinDocJack')().WindowHeight();
            return [width,height];
        }

        function generateNotifyId(){
            var id = genId();
            while(notifications[id]){
                id = genId();
            }
            return id;

            function genId() {
                var $return = [], index, char;
                for (var i = 0; i < 52; i++) {
                    index = Math.floor(Math.random() * 26) + 65;
                    char = String.fromCharCode(index);
                    char = (Math.random() > 0.5 ? char.toLowerCase() : char);
                    $return.push(char);
                }
                return $return.join("");
            }
        }

        function runNotifications(){
            //SetInterval will try to run this pretty fast, but we do wait for the server notification to finish, this way we don't stack up weird.
            // Individual notifications will always execute if the time inbetween their last run and current time is longer than their interval
            if(!nPause){
                nPause = true;
                lastNRun = Date.now();
                var send = false;
                var Request = KUBE.Class('/Library/Ajax/Request')();
                Request.SetMethod('post');
                Request.SetResponseType('json');

                notifications.KUBE().each(function(_notifyId,_notifyObj){
                    if(Date.now()-_notifyObj.lastRun > _notifyObj.interval){
                        _notifyObj.lastRun = Date.now();
                        var payloadData = _notifyObj.callCallback();
                        if(payloadData){
                            Request.AddData(_notifyId,payloadData);
                            send = true;
                        }
                    }
                });

                if(send){
                    NotifyClient.SendRequest(Request).then(function(_Response){
                        if(_Response.GetStatusCode() === 200){
                            var responseData = _Response.GetData();
                            responseData.KUBE().each(function(_notifyId,_notification){
                                //Just making sure it's still around
                                if(notifications[_notifyId]){
                                    notifications[_notifyId].receiveCallback(_notification);
                                }
                            });
                        }
                        nPause = false;
                    }).catch(function(_Err){
                        setTimeout(function(){
                            nPause = false;
                        },5000);
                    });
                }
                else{
                    nPause = false;
                }
            }
        }

	}

}(KUBE));
