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
        var $API = {}.KUBE().create(Response.prototype);
        return $API;
    }
}(KUBE));
