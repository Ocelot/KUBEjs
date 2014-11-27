/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

//Always scoped, with wherever KUBE is bound being passed in
(function(KUBE){
    "use strict"; //We always set this at the top

    //arg1:string   = Namespace (accessible through KUBE.Class(var namespace)) or autoloaded through Uses/Dependancy etc
    //arg2:function = Function of class
    //arg3:array    = Array of Namespace dependancies

    //KUBE.LoadFactory = Tells KUBE to be a factory, creating a new Object for this every time it is called
    KUBE.LoadFactory('/KUBEjs/Examples/TableIndex',TableIndex,['/Library/DOM/DomJack','/Library/Extend/Object']);

    //We set our Object so that when toString is called it can return the proper constructor name (in this case IndexTest)
    TableIndex.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    //Our actual 'class'/function (arguments can be used, and will be passed in on construction
    function TableIndex(_TableOfContents,_name){
        var name,ToC;

        if(KUBE.Is(ToC,true) == 'TableOfContents'){
            ToC = _TableOfContents;
        }
        else{
            throw new Error('Cannot initialize TableIndex: Requires TableOfContents Object: '.KUBE.Is(_TableOfContents,true));
        }

        name = _name || 'Untitled';

        //This is how we set up our public methods/properties in KUBE classes (the KUBE().create calls a native Object Extend method (/Library/Extend/Object.js)
        var $API = {
        }.KUBE().create(TableIndex.prototype); //KUBE().create() takes the non prototyped object, and merges it with a new object of the prototype.

        //Return the $API
        return $API;

        //Our public methods
        function Get(){
            return msg;
        }

        function Set(_newMsg){
            msg = _newMsg;
        }

        //Private methods would go here if we had any
    }
}(KUBE));