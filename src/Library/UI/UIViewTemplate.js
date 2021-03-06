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
	KUBE.Uses(['/Library/UI/Loader','/Library/DOM/DomJack','/Library/Extend/Object']).then(function(_Loader){
		_Loader().Load('NewView',NewView);
	});
	
	function NewView(CoreView,id,data,numChildren){
		var DomView = KUBE.Class('/Library/DOM/DomJack');

		//Required additions to every view
		create();

		return CoreView.KUBE().merge({
			'Get':Get,
			'Read':Read,
			'Update':Update,
			'Delete':Delete,
			'Width':Width,
			'Height':Height,
			'Resize':Resize
		});
		
		function Get(){
			return DomView;
		}
		
		function Read(){
			return data;
		}
		
		function Update(_data){
			data = _data;
		}
		
		function Delete(){
			DomView.Delete();
			CoreView.Emit('delete');
		}
		
		function Width(){
			return 0; //Return width
		}
		
		function Height(){
			return 0; //Return height
		}
		
		function Resize(){
			//Called by parent, update width/height if necessary
		}
		
		//Optional
		function Add(){
			//Wants to add a new view
		}

        //Private
        function create(){
            //Gets called at initialization, must emitState DrawFinish on CoreView after it is ready to be injected
            CoreView.EmitState('drawFinish');
        }
	}
	
}(KUBE));