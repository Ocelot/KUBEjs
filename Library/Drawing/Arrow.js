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
    KUBE.LoadFactory('/Library/Drawing/Arrow', Arrow,['/Library/DOM/DomJack','/Library/DOM/StyleJack','/Library/Extend/Object','/Library/Extend/Array']);
    Arrow.prototype.toString = function(){ return '[object '+this.constructor.name+']' };

    function Arrow(_width,_height){
        var $API,Container,arrows,cWidth,cHeight,DomJack;
        DomJack = KUBE.Class('/Library/DOM/DomJack');
        arrows = [];
        cWidth = (KUBE.Is(_width) === 'number' ? _width : 0);
        cHeight = (KUBE.Is(_height) === 'number' ? _height : 0);
        Container = DomJack('div');
        Container.Style().Width(cWidth).Height(cHeight).Position('relative').Box().Sizing('border-box');

        $API = {
            'Add':Add,
            'SetContainerDimensions':SetContainerDimensions,
            'GetContainer':GetContainer,
            'Clear':Clear
        }.KUBE().create(Arrow.prototype);
        return $API;

        //API Methods
        function Add(_startSide,_startPosition,_endSide,_endPosition){
            var rawApi,NewArrow,startXY,endXY,cp1,cp2;
            NewArrow = Container.Append('canvas');
            NewArrow.Style().Width(cWidth).Height(cHeight).Position('absolute').Top(0).Left(0).Box().Sizing('border-box');
            NewArrow.SetAttribute({'width':cWidth*2,'height':cHeight*2});


            //debugger;
            //NewArrow.Width(cWidth).Height(cHeight);

            arrows.push(NewArrow);

            startXY = calcXY(_startSide,_startPosition);
            endXY = calcXY(_endSide,_endPosition);
            cp1 = calcCP1(startXY,endXY);
            cp2 = calcCP2(startXY,endXY);
            rawApi = NewArrow.GetNode().getContext("2d");
            rawApi.beginPath();
            rawApi.moveTo(startXY[0],startXY[1]);
            //rawApi.lineTo(endXY[0],endXY[1]);
            rawApi.bezierCurveTo(cp1[0],cp1[1],cp2[0],cp2[1],endXY[0],endXY[1]);
            rawApi.lineWidth = 2;
            rawApi.stroke();
        }

        function SetContainerDimensions(_width,_height){

        }

        function GetContainer(){
            return Container;
        }

        function Clear(){
            arrows.KUBE().each(function(_Arrow){
                _Arrow.Delete();
            });
            arrows = [];
        }

        //Private
        function calcXY(_side,_position){
            var x,y;
            switch(_side){
                case 'top':
                    x = _position*2;
                    y = 0;
                    break;

                case 'left':
                    x = 0;
                    y = _position*2;
                    break;

                case 'bottom':
                    x = _position*2;
                    y = cHeight*2;
                    break;

                case 'right':
                    x = cWidth*2;
                    y = _position*2;
                    break;

                default:
                    x = 0;
                    y = 0;
                    break;
            }
            return [x,y];
        }

        function calcCP1(_startXY,_endXY){
            var x, y,xDistance,yDistance;
            xDistance = _endXY[0]-_startXY[0];
            yDistance = _endXY[1]-_startXY[1];

            x = (_startXY[0]+((xDistance/4)*3));
            y = (_startXY[1]+((yDistance/4)));
            return [x,y];
        }

        function calcCP2(_startXY,_endXY){
            var x, y,xDistance,yDistance;
            xDistance = _endXY[0]-_startXY[0];
            yDistance = _endXY[1]-_startXY[1];

            x = (_startXY[0]+((xDistance/4)));
            y = (_startXY[1]+((yDistance/4)*3));
            return [x,y];
        }


    }
})(KUBE);