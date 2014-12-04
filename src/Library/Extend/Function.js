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
	KUBE.SetAsLoaded('/Library/Extend/Function');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();

        //This works, but we didn't have any immediate use for it

		KUBE.EmitState('/Library/Extend/Function');
		KUBE.console.log('/Library/Extend/Function Loaded');
	}
	
	/* Declare functions */
}(KUBE));