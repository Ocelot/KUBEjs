(function(KUBE) {
    "use strict";
    var uses = {
        "Color": '/Library/Drawing/Color',
        "DJ": '/Library/DOM/DomJack',
        "Convert": '/Library/Tools/Convert',
        "XObject": '/Library/Extend/Object'
    }

    KUBE.LoadFactory('/Library/Drawing/Spinner', Spinner, uses);

    Spinner.prototype.toString = function () {
        return '[object ' + this.constructor.name + ']'
    };
    function Spinner(options) {
        var $K = KUBE.Class(uses);
        var spinJack, rawSpin, rawCtx, playTimer, lastFrameTime, framePos = -1, playState = false;
        var DJ = $K.DJ;
        var options = {
            "radius": 25,
            "height": 25,
            "width": 10,
            "dashes": 10,
            "opacity": 1,
            "padding": 2,
            "rotation": 700,
            "color": "#000"
        };

        var $spinAPI = {
            "Get": Get,
            "Play": Play,
            "Pause": Pause

        }

        return $spinAPI;


        function Get(){
            if(!spinJack){
               initSpinJack();
            }
            return spinJack;
        }

        function Play(){
            if(playState){
                return; //I'm already playing!
            }
            playState = true;
            _nextFrame();
        }

        function Pause(){
            if(!playState){
                return; //I'm already paused;
            }
            lastFrameTime = 0;
            playState = false;
        }

        function initSpinJack(){
            spinJack = DJ('canvas');
            spinJack.SetAttribute('width',workRadius() * 2);
            spinJack.SetAttribute('height',workRadius() * 2);
            rawSpin = spinJack.GetNode();
            rawCtx = rawSpin.getContext('2d');
            rawCtx.translate(workRadius(),workRadius());

            spinJack.On('delete', function(){
                clearTimeout(playTimer);
                spinJack = undefined;
                rawSpin = undefined;
                rawCtx = undefined;
                $spinAPI = {};
            })

        }

        function _nextFrame(time){
            if(playState == true){
                if(time - lastFrameTime < ms()) {
                    requestAnimationFrame(_nextFrame);
                }
                else{
                    nextFrame();
                    lastFrameTime = time;
                    requestAnimationFrame(_nextFrame);
                }
            }
        }

        function nextFrame(){
            if(framePos == dashes() - 1){
                framePos = -1;
            }
            framePos++;
            drawPosition(framePos);
        }


        function drawRoundedRectangle(opt){
            var options = {'top': 0,
                'left': 0,
                'width': 0,
                'height': 0,
                'radius': 0}.KUBE().merge(opt || {}, false);

                var left   = options.left;
                var top    = options.top;
                var width  = options.width;
                var height = options.height;
                var radius = options.radius;

            rawCtx.beginPath();

            rawCtx.moveTo(left + radius, top);
            rawCtx.arc(left + width - radius, top + radius, radius, radian(-90), radian(0), false);
            rawCtx.arc(left + width - radius, top + height - radius, radius, radian(0), radian(90), false);
            rawCtx.arc(left + radius, top + height - radius, radius, radian(90), radian(180), false);
            rawCtx.arc(left + radius, top + radius, radius, radian(-180), radian(-90), false);

            rawCtx.closePath();

            rawCtx.fill();
        }

        function drawPosition(position) {
            var opacities = sc(opacityArr(dashes()), position * -1),
                r    = workRadius(),
                dash    = dashes(),
                rotation  = radian(360 / dash);

            rawCtx.clearRect(r * -1, r * -1, r * 2, r * 2);

            for (var i = 0, len = dash; i < len; i++) {
                drawDash(opacities[i], color());
                rawCtx.rotate(rotation);
            }
        }

        function drawDash(opacity, color) {
            rawCtx.fillStyle = $K.Color().HexToRGB(color,true,+ opacity);

            drawRoundedRectangle({
                top:    dashPosition().top() - workRadius(),
                left:   dashPosition().left() - workRadius(),
                width:  dimensions().width(),
                height: dimensions().height(),
                radius: Math.min(dimensions().height(), dimensions().width()) / 2
            });
        }

        // OPTIONS INTERNAL GETTERS

        function minRadius(){
            return options.radius;
        }

        function width(){
            return options.width;
        }

        function height(){
            return options.height;
        }

        function padding(){
            return options.padding;
        }

        function color(){
            return options.color;
        }

        function dashes(){
            return options.dashes;
        }

        function rotation(){
            return options.rotation;
        }

        function ms(){
            return rotation() / dashes();
        }

        //DIMENSIONS CALC

        function workRadius(){
            var r = Math.ceil(
                Math.max(maxWorkRadius(), pyth(maxRadius(),width()/2))
            );
            return r + parseInt(padding());
        }

        function maxWorkRadius(){
            return Math.max(width(),maxRadius());
        }

        function maxRadius(){
            return minRadius()+height();
        }

        function dashPosition(){
            return {
                'top': function(){
                    return workRadius() - maxRadius()
                },
                'left': function(){
                    return workRadius() - width() / 2
                }
            }
        }

        function dimensions(){
            return {
                'width': function(){
                    return width();
                },
                'height': function(){
                    return maxRadius() - minRadius();
                }
            }
        }

        function opacityArr(){
            var dash = dashes();
            var step  = 1 / dash, array = [];
            for (var i = 0;i<dash;i++)
                array.push((i + 1) * step);
            return array;
        }

        //UTIL
        function pyth(a,b) { return Math.sqrt(a*a + b*b); }
        function degrees(radian) { return (radian*180) / Math.PI; }
        function radian(degrees) { return (degrees*Math.PI) / 180; }

        function sc(arr,dist){
            if(!dist){return arr;}
            var first = arr.slice(0,dist);
            var last = arr.slice(dist,arr.length);
            return last.concat(first);
        }

    }
}(KUBE));
