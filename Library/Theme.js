/**
 * Created by anyuzer on 2014-06-16.
 */

(function(KUBE){
    KUBE.LoadSingleton('Theme', Theme,['Appearance','DomJack','StyleJack','Hash','ExtendObject','Color']);
    Theme.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function Theme(){
        var $ThemeAPI,themes,currentTheme,SJ;
        SJ = KUBE.StyleJack;
        themes = {};
        currentTheme = 'KUBEDefault';

        $ThemeAPI = {
            'LoadFromCSS':LoadFromCSS,
            'GetClass':GetClass,
            'New':New,
            'Fonts':Fonts(),
            'Background':Background(),
            'Border':Border(),
            'ChangeTheme':ChangeTheme,
            'GetAppearanceList':GetAppearanceList
        }.KUBE().create(Theme.prototype);

        return $ThemeAPI;

        function LoadFromCSS(_cssString){
            //Not sure about this
        }

        function GetClass(_Appearance){

        }

        function GetAppearanceList(){

        }

        function ChangeTheme(_newTheme){
            if(_newTheme !== currentTheme){
                currentTheme = _newTheme;
                //Do something to change the classes
            }
        }

        function New(){
            var $Appearance = KUBE.Appearance($ThemeAPI);
            return $Appearance;
        }

        function Fonts(){
            return {
                'AddColor':AddColor,
                'AddSize':AddSize
            };

            function AddColor(_name,_color,_quickSetArray){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    themes[currentTheme].properties.fonts[_name] = {'type':'color','value':_color };
                }
            }

            function AddSize(_name,_pxSize,_quickSetArray){
                if(KUBE.Is(_pxSize) === 'number' && KUBE.Is(_name) === 'string'){
                    themes[currentTheme].properties.fonts[_name] = {'type':'width','value':_pxSize };
                }
            }
        }

        function Background(){
            return {
                'AddColor':AddColor
            };

            function AddColor(_name,_color,_quickSetArray){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    themes[currentTheme].properties.background[_name] = {'type':'color','value':_color };
                }
            }
        }

        function Border(){
            return {
                'AddColor':AddColor,
                'AddWidth':AddWidth
            };

            function AddColor(_name,_color,_quickSetArray){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    themes[currentTheme].properties.border[_name] = {'type':'color','value':_color };
                }
            }

            function AddWidth(_name,_pxSize,_quickSetArray){
                if(KUBE.Is(_pxSize) === 'number' && KUBE.Is(_name) === 'string'){
                    themes[currentTheme].properties.border[_name] = {'type':'width','value':_pxSize };
                }
            }
        }

        function SetPaddingUnitSize(_unitPx){
            if(KUBE.Is(_unitPx) === 'number'){
                themes[currentTheme].paddingUnitSize = _unitPx;
            }
        }

        function SetMarginUnitSize(_unitPx){
            if(KUBE.Is(_unitPx) === 'number'){
                themes[currentTheme].marginUnitSize = _unitPx;
            }
        }

        function SetPositionUnitSize(_unitPx){
            if(KUBE.Is(_unitPx) === 'number'){
                themes[currentTheme].positionUnitSize = _unitPx;
            }
        }

        //Private
        function initTheme(_themeName){
            if(themes[_themeName] === undefined){
                themes[_themeName] = {};
                themes[_themeName].quickSets = {};
                themes[_themeName].paddingUnitSize = 1;
                themes[_themeName].marginUnitSize = 1;
                themes[_themeName].positionUnitSize = 1;
                themes[_themeName].properties = {
                    'border':{},
                    'background':{},
                    'font':{}
                };
            }
        }

        function initQuickSet(_quickSetName){
            if(themes[currentTheme].quickSets[_quickSetName] === undefined){
                themes[currentTheme].quickSets[_quickSetName] = {
                    'background':{},
                    'border':{},
                    'font':{}
                };
            }
        }

        function validateColor(_color){
            var Color = KUBE.Color();
            return Color.IsValidColor(_color);
        }
    }
})(KUBE);