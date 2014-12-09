/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function(KUBE){
    KUBE.LoadFactory('/Library/Ajax/Response', Response,['/Library/Extend/Object']);

    /* Currently this is an ugly piece of code and required refactoring and cleanup */
    Response.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Response() {
        var $API,data,headers,responseType,statusCode,statusText;
        headers = {};
        $API = {
            "GetData":GetData,
            "GetHeaders":GetHeaders,
            "GetHeader":GetHeader,
            "GetResponseType":GetResponseType,
            "GetStatusCode":GetStatusCode,
            "GetStatusText":GetStatusText,
            "SetData":SetData,
            "SetResponseType":SetResponseType,
            "SetHeaders":SetHeaders,
            "SetStatusCode":SetStatusCode,
            "SetStatusText":SetStatusText,
            "AddHeader":AddHeader
        }.KUBE().create(Response.prototype);
        return $API;

        //Get
        function GetData(){
            return data;
        }

        function GetHeaders(){
            return headers;
        }

        function GetHeader(_headerName){
            return headers[_headerName];
        }

        function GetResponseType(){
            return responseType;
        }

        function GetStatusCode(){
            return statusCode;
        }

        function GetStatusText(){
            return statusText;
        }

        //Set
        function SetData(_data){
            data = _data;
        }

        function SetResponseType(_responseType){
            responseType = _responseType;
        }

        function SetHeaders(_headerObj){
            //As in Request, this overwrites the current headerObj
            if(KUBE.Is(_headerObj,true) === 'Object'){
                headers = _headerObj;
            }
        }

        function SetStatusCode(_statusCode){
            statusCode = _statusCode;
        }

        function SetStatusText(_statusText){
            statusText = _statusText;
        }

        //Utilities
        function AddHeader(_name,_data){
            headers[_name] = _data;
        }
    }
}(KUBE));
