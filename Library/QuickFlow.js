(function(KUBE){
	"use strict";
	KUBE.LoadFactory('QuickFlow',QuickFlow,['DomJack','StyleJack','ExtendObject','ExtendArray']);
	
	QuickFlow.prototype.toString = function(){ return '[object '+this.constructor.name+']'; };
	function QuickFlow(viewHeight,itemHeight,ItemMap,mapArray,Target){
		var $API,DJ,SJ,TallBlock,ItemCache,positionCache,totalItems,pauseScroll,currentCount;
		
		DJ = KUBE.DomJack;
		SJ = KUBE.StyleJack;
		
		initQuickFlow();
		$API = {
			'SetHeight':SetHeight,
			'SetMapArray':SetMapArray,
			'Sync':Sync,
			'Reflow':Reflow,
			'Get':Get
		}.KUBE().create(this.prototype);
		return $API;
		
		//Public
		function SetHeight(_viewHeight){
			if(KUBE.Is(_viewHeight) === 'number'){
				pauseScroll = true;
				viewHeight = _viewHeight;
				Target.Style().Height(viewHeight);
				totalItems = Math.ceil(viewHeight/itemHeight)+5;
				storePositions();
				updateItems();
			}
			return $API;
		}
		
		function SetMapArray(_mapArray){
			if(KUBE.Is(_mapArray) === 'array'){
				mapArray = _mapArray;
				Sync();
			}
			return $API;
		}
		
		function Sync(_index){
			var range;
			updateCount();
			if(mapArray[_index]){
				range = getVisibleRange();
				if(_index >= range[0] && _index <= range[1]){
					ItemCache[positionCache[_index].qfIndex].MapData(mapArray[_index]);
				}
			}
			else{
				updateItems();
			}
			return $API;
		}
		
		function Reflow(){
			updateCount();
			updateItems(true);
			return $API;
		}
		
		function Get(){
			return Target;
		}
		
		//Private
		function validateVars(){
			return (KUBE.Is(viewHeight) === 'number' && KUBE.Is(itemHeight) === 'number' && KUBE.Is(ItemMap,true) === 'DomJack' ? true : false);
		}
		
		function initQuickFlow(){
			if(validateVars()){
				mapArray = (KUBE.Is(mapArray) === 'array' ? mapArray : []);
				currentCount = mapArray.length;
				
				//Ensure we have the right type of values in everything
				Target = (KUBE.Is(Target,true) === 'DomJack' ? Target : DJ('div'));
				Target.Style().Overflow('auto');
				
				TallBlock = Target.Append('div').AddClass('.QuickFlowTallBox');
				TallBlock.Style().Width('100%').Position('relative').Height(mapArray.length*itemHeight);	
				
				Target.On('scroll',handleScroll);
				populateStart();
				
				Target.Once('cleanup',cleanup);
			}
			else{
				throw new Error('QuickFlow Error: Failed to validate initial variables');				
			}
		}
		
		function populateStart(){
			ItemCache = [];
			totalItems = Math.ceil(viewHeight/itemHeight)+5;
			storePositions();
			var i,TempItem;
			
			for(i=0;i<totalItems;i++){
				if(KUBE.Is(mapArray[i]) === 'object'){
					TempItem = ItemMap.Copy(true);
					TempItem.Style().Position('absolute').Top(i*itemHeight);
					ItemCache.push(TempItem);
					TempItem.MapData(mapArray[i]);
					TallBlock.Append(TempItem);
				}
			}
		}
		
		function storePositions(){
			positionCache = []; //Scoped reset
			
			var i,posObj,qfIndex;
			
			qfIndex = 0;
			for(i=0;i<mapArray.length;i++){
				posObj = {
					'qfIndex':qfIndex,
					'itemIndex':i,
					'top':i*itemHeight
				};
				positionCache.push(posObj);
				qfIndex = (qfIndex+1 > totalItems-1 ? 0 : qfIndex+1);
			}
		}
		
		function updateCount(){
			var i,TempItem,newItems = 0;
			if(currentCount !== mapArray.length){
				storePositions(); //This could be optimized vs reset
				TallBlock.Style().Height(mapArray.length*itemHeight);	
				if(mapArray.length < totalItems){
					TallBlock.Prune(mapArray.length);
					ItemCache.splice(mapArray.length,ItemCache.length-mapArray.length);
				}

				if(currentCount < totalItems && mapArray.length > currentCount){
					newItems = (mapArray.length > totalItems ? totalItems : mapArray.length)-currentCount;
					for(i=0;i<newItems;i++){
						TempItem = ItemMap.Copy(true);
						TempItem.Style().Position('absolute').Top((currentCount+i)*itemHeight);
						TempItem.MapData(mapArray[currentCount+i]);
						ItemCache.push(TempItem);
						TallBlock.Append(TempItem);
					}
				}
				currentCount = mapArray.length;
			}
		}
		
		function updateItems(_reflow){			
			//Get a slice from our position cache, loop through, update position, as well as mapData
			var ItemRef,
				range = getVisibleRange();

			positionCache.slice(range[0],range[1]).KUBE().each(function(_posObj){
				ItemRef = ItemCache[_posObj.qfIndex];
				if(_reflow || ItemRef.Style().Top() !== _posObj.top){
					ItemRef.Style().Top(_posObj.top);
					ItemRef.MapData(mapArray[_posObj.itemIndex]);
				}
			});
			pauseScroll = false;
		}
		
		function getVisibleRange(){
			var startSlice,endSlice;
			startSlice = (Math.floor(Target.GetNode().scrollTop/itemHeight)-1 >= 0 ? Math.floor(Target.GetNode().scrollTop/itemHeight)-1 : 0);
			endSlice = startSlice+totalItems-1;
			if(!positionCache[endSlice]){
				//This tends to occur on a sync, when the items have changed
				if(positionCache.length < totalItems){
					startSlice = 0;
					endSlice = positionCache.length;
				}
				else{
					endSlice = positionCache.length;
					startSlice = endSlice-totalItems-1;
				}
			}
			return [startSlice,endSlice];
		}
				
		//Event handling
		function handleScroll(){
			if(!pauseScroll){
				updateItems();
			}
		}
		
		function cleanup(){
			/*
			 * Really not sure about cleaning up QuickFlow. What responsibilities does it specifically have?
			 * It has a bunch of DJ references,
			 *	-QuickFlowNode
			 *	-ItemMap
			 *	-TallBlock
			 *	-ItemCache (copies of ItemMap)
			 *	
			 *	Does it have responsibility for detaching references, or deleting some of this stuff if the QFNode gets deleted?
			 */
			console.log('QF cleanup called');
			$API = DJ = SJ = Target = TallBlock = ItemCache = positionCache = totalItems = pauseScroll = undefined;
		}
	
// SEEMS USELESS NOW. DO MORE TESTING.
//		function scrolling(){
//			//Check our position, then give an array of blocks that should be 'on'
//			//Update our Item Positioning, while applying appropriate data...
//			updateItems();
//			fireScroll = false;
//		}		
	}
	
}(KUBE));