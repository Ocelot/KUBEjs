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
            'Padding':Padding(),
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

        //Font
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
                    theme.properties.font[_name].family.push(_family);
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
                switch(_type.toLowerCase()){
                    case 'color':
                        _SJ.Color(_value);
                        break;

                    case 'size':
                        _SJ.Font().Size(calcSize(_value));
                        break;

                    case 'family':
                        _SJ.Font().Family(_value);
                        break;

                    case 'weight':
                        _SJ.Font().Weight(_value);
                        break;

                    case 'style':
                        _SJ.Font().Style(_value);
                        break;
                }
            }

            function initSet(_name){
                if(!theme.properties.font[_name]){
                    theme.properties.font[_name] = {};
                    theme.properties.font[_name].family = [];
                }
            }
        }

        //Background
        function Background(){
            return {
                'AddColor':AddColor,
                'SetStyle':SetStyle
            };

            function AddColor(_name,_color){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.background[_name].color = _color;
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition = theme.properties.background[_name];
                if(KUBE.Is(_StyleJack,true) === 'StyleJack' && KUBE.Is(definition) === 'object'){
                    definition.KUBE().each(function(_key,_val){
                        applyStyle(_StyleJack,_key,_val);
                    });
                }
            }

            function applyStyle(_SJ,_type,_value){
                switch(_type){
                    case 'color':
                        _SJ.Background().Color(_value);
                        break;
                }
            }

            function initSet(_name){
                if(!theme.properties.background[_name]){
                    theme.properties.background[_name] = {};
                }
            }
        }

        //Border
        function Border(){
            //TODO: BorderStyle (Inset/etc)
            return {
                'AddColor':AddColor,
                'AddWidth':AddWidth,
                'AddRadius':AddRadius,
                'SetStyle':SetStyle
            };

            function AddColor(_name,_color){
                if(validateColor(_color) && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.border[_name].color = _color;
                }
            }

            function AddWidth(_name,_pxSize){
                if(KUBE.Is(_pxSize) === 'number' && KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    theme.properties.border[_name].width = _pxSize;
                }
            }

            function AddRadius(_name,_c1,_c2,_c3,_c4){
                if(KUBE.Is(_name) === 'string'){
                    initSet(_name);
                    _c1 = (KUBE.Is(_c1) === 'number' ? _c1 : 0);
                    _c2 = (KUBE.Is(_c2) === 'number' ? _c2 : 0);
                    _c3 = (KUBE.Is(_c3) === 'number' ? _c3 : 0);
                    _c4 = (KUBE.Is(_c4) === 'number' ? _c4 : 0);
                    theme.properties.border[_name].radius = [_c1,_c2,_c3,_c4];
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition = theme.properties.border[_name];
                if(KUBE.Is(_StyleJack,true) === 'StyleJack' && KUBE.Is(definition) === 'object'){
                    definition.KUBE().each(function(_key,_val){
                        applyStyle(_StyleJack,_key,_val);
                    });
                }
            }

            function applyStyle(_SJ,_type,_value){
                //DDNotes -- I dunno about this weird loop to style properties. Seems legit to me but I'm crazy.
                switch(_type){
                    case 'color':
                        ['Top','Bottom','Left','Right'].KUBE().Each(function(v,k){
                            _SJ.Border()[v].Color(_value);
                        });
                        break;
                    case 'width':
                        ['Top','Bottom','Left','Right'].KUBE().Each(function(v,k){
                            _SJ.Border()[v].Width(_value);
                        });
                        break;
                    case 'style':
                        ['Top','Bottom','Left','Right'].KUBE().Each(function(v,k){
                            _SJ.Border()[v].Style(_value);
                        });
                        break;

                }
            }

            function initSet(_name){
                if(!theme.properties.border[_name]){
                    theme.properties.border[_name] = {};
                }
            }
        }

        //Padding
        function Padding(){
            return {
                'AddTop':AddTop,
                'AddRight':AddRight,
                'AddBottom':AddBottom,
                'AddLeft':AddLeft,
                'AddAll':AddAll,
                'SetStyle':SetStyle
            };

            function AddTop(_name,_value){
                if(KUBE.Is(_name) === 'string' && KUBE.Is(_value) === 'number'){
                    initSet(_name);
                    theme.properties.padding[_name].top = calcSize(_value);
                }
            }

            function AddRight(_name,_value){
                if(KUBE.Is(_name) === 'string' && KUBE.Is(_value) === 'number'){
                    initSet(_name);
                    theme.properties.padding[_name].right = calcSize(_value);
                }
            }

            function AddBottom(_name,_value){
                if(KUBE.Is(_name) === 'string' && KUBE.Is(_value) === 'number'){
                    initSet(_name);
                    theme.properties.padding[_name].bottom = calcSize(_value);
                }
            }

            function AddLeft(_name,_value){
                if(KUBE.Is(_name) === 'string' && KUBE.Is(_value) === 'number'){
                    initSet(_name);
                    theme.properties.padding[_name].left = calcSize(_value);
                }
            }

            function AddAll(_name,_value){
                if(KUBE.Is(_name) === 'string' && KUBE.Is(_value) === 'number'){
                    initSet(_name);
                    theme.properties.padding[_name].top = calcSize(_value);
                    theme.properties.padding[_name].right = calcSize(_value);
                    theme.properties.padding[_name].bottom = calcSize(_value);
                    theme.properties.padding[_name].left = calcSize(_value);
                }
            }

            function SetStyle(_name,_StyleJack){
                var definition = theme.properties.padding[_name];
                if(KUBE.Is(_StyleJack,true) === 'StyleJack' && KUBE.Is(definition) === 'object'){
                    _StyleJack.Padding(theme.properties.padding[_name]);
                }
            }

            function initSet(_name){
                if(!theme.properties.padding[_name]){
                    theme.properties.padding[_name] = {'top':0,'right':0,'bottom':0,'left':0};
                }
            }
        }

        function AddQuickSet(_name,_Appearance){
            if(KUBE.Is(_Appearance,true) === 'Appearance' && KUBE.Is(_name) === 'string'){
                quickSets[_name] = _Appearance;
            }
        }

        //Unit size is used to calculate all theme measurements except for border width (because that seems crazy)
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