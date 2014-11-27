/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    "use strict";

    /* Load functions */
    var ExtendAPI;
    KUBE.SetAsLoaded('/Library/Extend/Math');
    if(KUBE.Extend){
        ExtendAPI = KUBE.Extend();
        ExtendAPI.Load('Math','scaleAspectRatio',ScaleAspectRatio);
        KUBE.EmitState('/Library/Extend/Math');
        KUBE.console.log('/Library/Extend/Math Loaded');
    }

    /* Declare functions */

    //Pretty sure there's a better way to do this but I'm an idiot
    function ScaleAspectRatio(_currentWidth,_currentHeight,_targetWidth,_targetHeight,_minimum){
        var $return,cW,cH,alg,factor;
        _minimum = _minimum || false;

        $return = {
            'width':0,
            'height':0
        }
        cW = _currentWidth/_targetWidth;
        cH = _currentHeight/_targetHeight;
        alg = (cW > cH ? 0 : 1);

        //Reverse the alg if minimum has been set
        if(_minimum){
            alg = (alg ? 0 : 1);
        }

        if(alg){
            factor = _targetWidth/_currentWidth;
            $return.width = _targetWidth;
            $return.height = this.round(_currentHeight*factor);
        }
        else {
            factor = _targetHeight/_currentHeight;
            $return.height = _targetHeight;
            $return.width = this.round(_currentWidth*factor);
        }
        return $return;
    }

}(KUBE));