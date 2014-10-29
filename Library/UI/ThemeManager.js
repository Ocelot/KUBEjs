/**
 * Created by anyuzer on 2014-06-16.
 */

(function(KUBE){
    "use strict";
    KUBE.LoadSingleton('/Library/ThemeManager', ThemeManager,['/Library/Theme','/Library/Appearance','/Library/DomJack','/Library/StyleJack','/Library/Hash','/Library/ExtendObject','/Library/Color']);
    ThemeManager.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function ThemeManager(){
        var $API,themeStore,CurrentTheme,Hash,SJ;
        Hash = KUBE.Hash();
        SJ = KUBE.StyleJack;
        themeStore = {};
        $API = {
            'LoadTheme':LoadTheme,
            'ChangeTheme':ChangeTheme,
            'GetCurrentTheme':GetCurrentTheme,
            'GetClass':GetClass,
            'GetNewAppearance':GetNewAppearance
        }.KUBE().create(ThemeManager.prototype);
        return $API;

        function LoadTheme(_Theme){
            var themeName,$return;
            $return = false;
            if(KUBE.Is(_Theme,true) === 'Theme'){
                themeName = _Theme.GetName();
                if(KUBE.Is(themeName) === 'string'){
                    themeStore[themeName] = _Theme;
                    if(!CurrentTheme){
                        ChangeTheme(themeName);
                    }
                    $return = true;
                }
            }
            return $return;
        }

        function ChangeTheme(_themeName){
            if(KUBE.Is(themeStore[_themeName],true) === 'Theme'){
                //This should create/update the required classes
                CurrentTheme = themeStore[_themeName];
            }
        }

        function GetCurrentTheme(){
            return CurrentTheme;
        }

        function GetClass(_Appearance){
            var using,$return;
            if(KUBE.Is(_Appearance,true) === 'Appearance'){
                using = _Appearance.GetUsing();
                $return = '.s'+Hash.DeepHash(using);
                initializeClass($return,_Appearance);
            }
            return $return;
        }

        function GetNewAppearance(){
            var $Appearance;
            if(KUBE.Is(CurrentTheme,true) === 'Theme'){
                $Appearance = KUBE.Class('/Library/Appearance')(CurrentTheme);
            }
            return $Appearance;
        }

        //Private
        function initializeClass(_className,_Appearance){
            var Visible,Active,Hover,Select,using;
            Visible = SJ(_className);
            //Active = SJ(_className+"::active");
            //Hover = SJ(_className+"::hover");
            //Select = SJ(_className+"::select");
            using = _Appearance.GetUsing();

            setStyle(Visible,using.font.visible,using.border.visible,using.background.visible);
            //setStyle(Active,using.font.active,using.border.active,using.background.active);
            //setStyle(Select,using.font.select,using.border.select,using.background.select);
            //setStyle(Hover,using.font.hover,using.border.hover,using.background.hover);
        }

        function setStyle(_StyleJack,_font,_border,_background){
            if(_font){
                CurrentTheme.Font.SetStyle(_font,_StyleJack);
            }

            if(_border){
                CurrentTheme.Border.SetStyle(_border,_StyleJack);
            }

            if(_background){
                CurrentTheme.Background.SetStyle(_background,_StyleJack);
            }
        }

    }
})(KUBE);