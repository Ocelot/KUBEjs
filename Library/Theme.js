/**
 * Created by anyuzer on 2014-06-16.
 */

(function(KUBE){
    "use strict";
    KUBE.LoadFactory('Theme', Theme,['DomJack','StyleJack','Hash','ExtendObject','Color']);
    Theme.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function Theme(_name){
        var $ThemeAPI,theme,quickSets,SJ;
        quickSets = {};
        SJ = KUBE.StyleJack;

        $ThemeAPI = {
            'Font':Font(),
            'Background':Background(),
            'Border':Border(),
            'GetAppearanceList':GetAppearanceList,
            'GetName':GetName,
            'AddQuickSet':AddQuickSet,
            'GetQuickSet':GetQuickSet
        }.KUBE().create(Theme.prototype);
        initTheme();
        return $ThemeAPI;

        function GetName(){
            return _name;
        }

        function GetAppearanceList(){
            return theme.properties;
        }

        function GetQuickSet(_name){
            var $return = {};
            if(KUBE.Is(_name) === 'string' && quickSets[_name]){
                $return = quickSets[_name].GetUsing();
            }
            return $return;
        }

        function Font(){
            return {
                'AddColor':AddColor,
                'AddSize':AddSize,
                'SetStyle':SetStyle
            };

            function AddColor(_name,_color){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    theme.properties.font[_name] = {'type':'color','value':_color };
                }
            }

            function AddSize(_name,_pxSize){
                if(KUBE.Is(_pxSize) === 'number' && KUBE.Is(_name) === 'string'){
                    theme.properties.font[_name] = {'type':'size','value':_pxSize };
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition;
                if(KUBE.Is(_StyleJack,true) === 'StyleJack'){
                    definition = theme.properties.font[_name];
                    if(definition){
                        switch(definition.type){
                            case 'color':
                                _StyleJack.Color(definition.value);
                                break;

                            case 'size':
                                //_StyleJack.Font().Size(definition.color);
                                break;

                            case 'family':
                                break;
                        }
                    }
                }
            }
        }

        function Background(){
            return {
                'AddColor':AddColor,
                'SetStyle':SetStyle
            };

            function AddColor(_name,_color){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    theme.properties.background[_name] = {'type':'color','value':_color };
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition;
                if(KUBE.Is(_StyleJack,true) === 'StyleJack'){
                    definition = theme.properties.background[_name];
                    if(definition){
                        switch(definition.type){
                            case 'color':
                                _StyleJack.Background().Color(definition.value);
                                break;
                        }
                    }
                }
            }
        }

        function Border(){
            return {
                'AddColor':AddColor,
                'AddWidth':AddWidth
            };

            function AddColor(_name,_color){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    theme.properties.border[_name] = {'type':'color','value':_color };
                }
            }

            function AddWidth(_name,_pxSize){
                if(KUBE.Is(_pxSize) === 'number' && KUBE.Is(_name) === 'string'){
                    theme.properties.border[_name] = {'type':'width','value':_pxSize };
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition;
                if(KUBE.Is(_StyleJack,true) === 'StyleJack'){
                    definition = theme.properties.border[_name];
                    if(definition){
                        switch(definition.type){
                            case 'color':
                                //Not sure about this
                                _StyleJack.Border().Width(1);
                                _StyleJack.Border().Style('solid');
                                _StyleJack.Border().Color(definition.value);
                                break;
                        }
                    }
                }
            }
        }

        function AddQuickSet(_name,_Appearance){
            if(KUBE.Is(_Appearance,true) === 'Appearance' && KUBE.Is(_name) === 'string'){
                quickSets[_name] = _Appearance;
            }
        }

        //Private
        function initTheme(){
            theme = {};
            theme.unitSize = 3;
            theme.properties = {
                'border':{},
                'background':{},
                'font':{}
            };
        }

        function validateColor(_color){
            var Color = KUBE.Color();
            return Color.IsValidColor(_color);
        }
    }
})(KUBE);