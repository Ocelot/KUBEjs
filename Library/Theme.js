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
            'SetUnitSize':SetUnitSize,
            'GetUnitSize':GetUnitSize,
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
                'AddFamily':AddFamily,
                'AddStyle':AddStyle,
                'SetStyle':SetStyle
            };

            function AddColor(_name,_color){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.font[_name].color = _color;
                }
            }

            function AddSize(_name,_size){
                if(KUBE.Is(_size) === 'number' && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.font[_name].size = _size;
                }
            }

            function AddFamily(_name,_family){
                if(KUBE.Is(_family) === 'string' && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.font[_name].family = _family;
                }
            }

            function AddStyle(_name,_style){
                if(KUBE.Is(_style) === 'string' && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.font[_name].style = _style;
                }
            }

            function AddWeight(_name,_weight){
                if(KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.font[_name].weight = _weight;
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition = theme.properties.font[_name];

                if(KUBE.Is(_StyleJack,true) === 'StyleJack' && KUBE.Is(definition) === 'object'){
                    definition.KUBE().each(function(_key,_val){
                        applyStyle(_StyleJack,_key,_val);
                    });
                }
            }

            function applyStyle(_SJ,_type,_value){
                switch(_type){
                    case 'color':
                        _SJ.Color(_value);
                        break;

                    case 'size':
                        _SJ.Font().Size(calcSize(_value));
                        break;

                    case 'family':
                        _SJ.Font().Family(_value);
                        break;

                    case 'Weight':
                        _SJ.Font().Weight(_value);
                        break;

                    case 'Style':
                        _SJ.Font().Style(_value);
                        break;
                }
            }

            function initSet(_name){
                if(!theme.properties.font[_name]){
                    theme.properties.font[_name] = {};
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

        function SetUnitSize(_unitSize){
            if(KUBE.Is(_unitSize) === 'number'){
                theme.unitSize = _unitSize;
            }
        }

        function GetUnitSize(){
            return theme.unitSize;
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

        function calcSize(_size,_round){
            _round = (KUBE.Is(_round) === 'boolean' ? _round : true);
            return (_round ? Math.round(_size*theme.unitSize) : _size*theme.unitSize);
        }
    }
})(KUBE);