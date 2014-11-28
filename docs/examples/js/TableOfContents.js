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

    //If we intend to use multiple classes, we usually define this at the top, so we can use it twice
    var uses = {
        "DJ":"/Library/DOM/DomJack",
        "SJ":"/Library/DOM/StyleJack",
        "Index":"/KUBEjs/Examples/TableIndex",
        "XO":"/Library/Extend/Object",
        "XA":"/Library/Extend/Array",
        "XN":"/Library/Extend/Number"
    };

    //arg1:string   = Namespace (accessible through KUBE.Class(var namespace)) or autoloaded through Uses/Dependancy etc
    //arg2:function = Function of class
    //arg3:array    = Array of Namespace dependancies

    //KUBE.LoadFactory = Tells KUBE to be a factory, creating a new Object for this every time it is called
    KUBE.LoadFactory('/KUBEjs/Examples/TableOfContents',TableOfContents,uses);

    //We set our Object so that when toString is called it can return the proper constructor name (in this case IndexTest)
    TableOfContents.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    //Our actual 'class'/function (arguments can be used, and will be passed in on construction
    function TableOfContents(_title){
        var title,contents,indentSize,listFormat,$K,$API,TitleDJ,ContentsDJ;
        title = _title || 'Unknown';
        indentSize = 5;

        contents = [];

        //Now all of our expected KUBE Classes are loaded, bound and aliased
        $K = KUBE.Class(uses);

        //This is how we set up our public methods/properties in KUBE classes (the KUBE().create calls a native Object Extend method (/Library/Extend/Object.js)
        $API = {
            'GetContents':GetContents,
            'GetTitle':GetTitle,
            'SetIndentSize':SetIndentSize,
            'SetListFormat':SetListFormat,
            'RenderToContainer':RenderToContainer,
            'CreateNewIndex':CreateNewIndex
        }.KUBE().create(TableOfContents.prototype); //KUBE().create() takes the non prototyped object, and merges it with a new object of the prototype.

        //Return the $API
        return $API;

        //Getters
        function GetContents(){
            return contents;
        }

        function GetTitle(){
            return title;
        }

        //Setters
        function SetIndentSize(_width){
            if(KUBE.Is(_width) === 'number'){
                indentSize = _width;
            }
            return $API;
        }

        function SetListFormat(_format){
            switch(String(_format).toLowerCase()){
                case 'num':case '#': listFormat = '#'; break;
                case 'alpha':case 'a': listFormat = 'a'; break;
                case 'roman':case 'r': listFormat = 'r'; break;
            }
            return $API;
        }

        function SetTitle(_newTitle){
            if(KUBE.Is(_newTitle) === 'string'){
                title = _newTitle;
            }

            if(KUBE.Is(TitleDJ,true) === 'DomJack'){
                TitleDJ.SetInner(title);
            }
            return $API;
        }

        //Utilities
        function RenderToContainer(_DJNode){
            if(KUBE.Is(_DJNode,true) == 'DomJack'){
                _DJNode.Append(buildTitle());
                _DJNode.Append(buildContents());
            }
        }

        function CreateNewIndex(_name){
            var Index = $K.Index($API,_name);
            if(KUBE.Is(Index,true) == 'TableIndex'){
                contents.push(Index);
            }
            return Index;
        }

        //Private methods would go here if we had any
        function buildTitle(){
            if(KUBE.Is(TitleDJ,true) !== 'DomJack'){
                TitleDJ = $K.DJ('div');
                TitleDJ.AddClass(['.toc','.main','.title']);
                TitleDJ.SetInner(title);
            }
            return TitleDJ;
        }

        function buildContents(){
            var count = 0;
            if(KUBE.Is(ContentsDJ,true) !== 'DomJack'){
                ContentsDJ = $K.DJ('div');
                ContentsDJ.AddClass(['.toc','.main','.contents']);

                contents.KUBE().each(function(_TableIndex){
                    count++;
                    //_TableIndex.Render()
                });
            }
            return ContentsDJ;
        }


    }
}(KUBE));