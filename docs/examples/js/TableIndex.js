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

    var uses = {
        "DJ":"/Library/DOM/DomJack",
        "SJ":"/Library/DOM/StyleJack",
        "XO":"/Library/Extend/Object",
        "XA":"/Library/Extend/Array",
        "XN":"/Library/Extend/Number",
        "ToC":"/KUBEjs/Examples/TableOfContents"
    };

    //KUBE.LoadFactory = Tells KUBE to be a factory, creating a new Object for this every time it is called
    KUBE.LoadFactory('/KUBEjs/Examples/TableIndex',TableIndex,uses);

    //We set our Object so that when toString is called it can return the proper constructor name (in this case IndexTest)
    TableIndex.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    //Our actual 'class'/function (arguments can be used, and will be passed in on construction
    function TableIndex(_TableOfContents,_name,_ParentIndex){
        var name,ToC,contents;
        contents = [];
        name = _name || 'Untitled';
        validateConstructor(_TableOfContents);

        //This is how we set up our public methods/properties in KUBE classes (the KUBE().create calls a native Object Extend method (/Library/Extend/Object.js)
        var $API = {
            "CreateNewIndex":CreateNewIndex
        }.KUBE().create(TableIndex.prototype); //KUBE().create() takes the non prototyped object, and merges it with a new object of the prototype.

        //Return the $API
        return $API;

        //Get

        //Set

        //Utilities
        function CreateNewIndex(_name){
            var Index = $K.Index($API,_name);
            if(KUBE.Is(Index,true) == 'TableIndex'){
                contents.push(Index);
            }
            return Index;
        }

        //Private
        function validateConstructor(_ToC){
            if(KUBE.Is(_ToC,true) == 'TableOfContents'){
                ToC = _ToC;
            }
            else{
                throw new Error('Cannot initialize TableIndex: Requires TableOfContents Object: '+KUBE.Is(_ToC,true));
            }
        }
    }
}(KUBE));