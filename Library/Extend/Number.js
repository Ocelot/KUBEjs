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
	KUBE.SetAsLoaded('/Library/Extend/Number');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('number','debug',Debugger);

		KUBE.EmitState('/Library/Extend/Number');
		KUBE.console.log('/Library/Extend/Number Loaded');
	}
	
	/* Declare functions */
	function Debugger(){
		debugger;
		return this;
	}


}(KUBE));