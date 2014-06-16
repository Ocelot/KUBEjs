/**
 * Created by anyuzer on 2014-06-16.
 */

(function(KUBE){
    KUBE.LoadSingletonFactory('Theme', Theme,['DomJack','StyleJack','Hash','ObjectKUBE']);
    Theme.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function Theme(){
        var $ThemeAPI;

        $ThemeAPI = {
            'LoadFromCSS':LoadFromCSS,
            'GetClass':GetClass,
            'New':New,
            'Fonts':Fonts(),
            'Background':Background(),
            'Border':Border()
        }.KUBE().create(Theme.prototype);

        return $ThemeAPI;

        function LoadFromCSS(_cssString){
            //Not sure about this
        }

        function GetClass(_Appearance){

        }

        function New(){
            var $Appearance = Appearance($ThemeAPI);
            return $Appearance;
        }

        function Fonts(){
            return {
                'AddColor':AddColor
            };

            function AddColor(_name,_ColorObj,_quickSetArray){}
        }

        function Background(){
            return {
                'AddColor':AddColor
            };

            function AddColor(_name,_ColorObj,_quickSetArray){}
        }

        function Border(){
            return {
                'AddColor':AddColor
            };

            function AddColor(_name,_ColorObj,_quickSetArray){}
        }
    }

    Appearance.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Appearance(_Theme){
        var $AppearanceAPI;
        $AppearanceAPI = {
            'QuickSet':QuickSet,
            'Font':Font(),
            'Background':Background(),
            'Border':Border()
        }.KUBE().create(Appearance.prototype);
        validateInit();
        return $AppearanceAPI;

        //Public API
        function QuickSet(_name){

        }

        function Font(){
            return {
                'Use':Use
            };
            function Use(_name,_state){

            }
        }

        function Background(){
            return {
                'Use':Use
            };
            function Use(_name,_state){

            }
        }

        function Border(){
            return {
                'Use':Use
            };
            function Use(_name,_state){

            }
        }

        //Private
        function validateInit(){
            if(KUBE.Is(_Theme,true) !== 'Theme'){
                console.log(_Theme);
                throw new Error('Invalid initialization variable passed to Appearance. Must be a Theme object');
            }
        }
    }

})(KUBE);