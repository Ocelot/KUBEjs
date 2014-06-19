// This utility measures text.  Because Ruler == King.  So TextRuler == TextKing.  So laugh.
(function(KUBE){
    var measureChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890-=!@#$%^&*()_+{}[]:";\'<>,.?|\\/~`';
    var fallBackCharcode = 87; //capital W

    KUBE.LoadSingletonFactory('TextKing', TextKing,['ExtendObject','DomJack','Convert']);
    TextKing.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    //Argument passed in should be an Array.  Font first, then size
    function TextKing(fontArg){
        //I’m here to measure glyphs and chew bubblegum and I’m all out of bubblegum
        var font = fontArg[0];
        var fontSize = fontArg[1];
        var cachedChars = {};
        var DJ = KUBE.DomJack;
        doInitialCache();

        var $return = {
            "MeasureString": MeasureString
        }.KUBE().create(TextKing.prototype);
        return $return;

        function doInitialCache(){
            var newDiv;
            var destDiv = DJ('div');
                destDiv.Style().Font().Size(fontSize);
                destDiv.Style().Font().Family(font);

            for(var i=0; i<measureChars.length; i++){
                newDiv = DJ('span').SetInner(measureChars.slice(i, i+1)).SetAttribute('x-charcode',measureChars.charCodeAt(i));
                destDiv.Append(newDiv);
            }
            DJ(document.body).Append(destDiv);

            destDiv.GetChildren().KUBE().each(function(v,k,i){
                var dim = v.Rect();
                var cc = parseInt(v.GetAttribute('x-charcode'));
                cachedChars[cc] = {'width': dim.width, 'height': dim.height};
            });

            destDiv.Delete();
        }

        function MeasureString(string){
            var curChar, i, $retDim;
            $retDim = {'width':0,'height':0};
            string = String(string);
            for(i = 0; i < string.length; i++){
                curChar = string.charCodeAt(i);
                curChar = (curChar in cachedChars ? curChar : 87);
                if(curChar in cachedChars){
                    $retDim.width = $retDim.width + cachedChars[curChar].width;
                    $retDim.height = (cachedChars[curChar].height > $retDim.height ? cachedChars[curChar].height : $retDim.height);
                }
                else{
                    $retDim.width = $retDim.width + cachedChars[fallBackCharcode].width;
                    $retDim.width = (cachedChars[fallBackCharcode].height > $retDim.height ? cachedChars[fallBackCharcode].height : $retDim.height);
                }
            }
            return $retDim;
        }
    }
}(KUBE));