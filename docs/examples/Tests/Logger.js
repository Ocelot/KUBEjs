/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

//See KUBEjs: Core Loading example for explanation of structure
(function(KUBE){
    "use strict";
    KUBE.LoadFactory('/KUBEjs/Examples/Logger',Logger,['/Library/DOM/DomJack','/Library/Extend/Object']);
    Logger.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function Logger(){
        var log = [];

        var $API = {
            'Add':Add,
            'Log':Log
        }.KUBE().create(Logger.prototype);

        return $API;

        function Add(_msg){
            log.push(_msg);
        }

        function Log(){
            console.log(log);
        }
    }
}(KUBE));