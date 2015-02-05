/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function(KUBE){
    KUBE.LoadFactory('/Library/Ajax/Request', Request,['/Library/Extend/Object']);

    /* Currently this is an ugly piece of code and required refactoring and cleanup */
    Request.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Request(_headers,_method) {
        var $API,customHeaders,method,data,responseType;
        responseType = '';
        customHeaders = (KUBE.Is(_headers,true) === 'object' ? _headers : {});
        method = (KUBE.Is(_method) === 'string' ? _method : 'post');
        data = {};

        $API = {
            "GetHeaders":GetHeaders,
            "GetHeader":GetHeader,
            "GetMethod":GetMethod,
            "GetData":GetData,
            "GetResponseType":GetResponseType,
            "SetMethod":SetMethod,
            "SetData":SetData,
            "SetResponseType":SetResponseType,
            "AddData":AddData,
            "AddHeader":AddHeader
        }.KUBE().create(Request.prototype);
        return $API;

        //Get
        function GetHeaders(){
            return customHeaders;
        }

        function GetHeader(_key){
            return customHeaders[_key];
        }

        function GetMethod(){
            return method;
        }

        function GetData(){
            return data;
        }

        function GetResponseType(){
            return responseType;
        }

        //Set
        function SetMethod(_method){
            //TODO: Validate method before setting
            method = _method;
            return $API;
        }

        function SetData(_data){
            //This overwrites anything in the current data object when used
            if(KUBE.Is(_data) === 'object'){
                data = _data;
            }
            return $API;
        }

        function SetResponseType(_type){
            switch(_type.toLowerCase()){
                case 'arraybuffer':
                case 'blob':
                case 'document':
                case 'json':
                case 'text':
                case '':
                    responseType = _type.toLowerCase();
                    break;

                default:
                    throw new Error('An invalid request type was set in Request. Please check Request object for accepted types.');
                    break;
            }
            return $API;
        }

        //Utilities
        function AddData(_key,_val){
            data[_key] = _val;
            return $API;
        }

        function AddHeader(_headerName,_headerData){
            customHeaders[_headerName] = _headerData;
            return $API;
        }

    }
}(KUBE));
