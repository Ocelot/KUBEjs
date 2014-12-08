/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function(KUBE){
    KUBE.LoadFactory('/Library/Ajax/Client', Client,['/Library/Extend/Object','/Library/Ajax/Request','/Library/Ajax/Response']);

    Client.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Client(_target,_timeout,_freezeDelay) {
        var $API,target,timeout,freezeDelay,requestQ,auth;
        auth = {'username':'','password':''};
        requestQ = [];
        timeout = (KUBE.Is(_timeout) === 'number' ? _timeout : 10000);
        freezeDelay = (KUBE.Is(_freezeDelay) === 'number' ? _freezeDelay : 2500);

        $API = {
            "SetTarget":SetTarget,
            "SendRequest":SendRequest
        }.KUBE().create(Client.prototype);
        return $API;

        //Get

        //Set
        function SetTarget(_target){
            if(KUBE.Is(_target) === 'function' || KUBE.Is(_target) === 'string'){
                target = _target;
            }
        }

        function SetTimeout(_ms){
            if(KUBE.Is(_ms) === 'number'){
                timeout = _ms;
            }
        }

        function SetFreezeDelay(_ms){
            if(KUBE.Is(_ms) === 'number'){
                freezeDelay = _ms;
            }
        }

        function SetAuth(_username,_password){
            if(KUBE.Is(_username) === 'string' && KUBE.Is(_password) === 'string'){
                auth.username = _username;
                auth.password = _password;
            }
        }

        //Utilities
        function SendRequest(_Request){
            if(!_target){
                throw Error('Client cannot send AjaxRequest. Target not set in Client.');
            }
            if(KUBE.Is(_Request,true) === 'Request'){
                debugger;
            }
        }


    }
}(KUBE));
