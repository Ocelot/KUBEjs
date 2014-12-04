/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

//Let's load our ExampleIndex (we will do this inline here for the example, but the full ExampleIndex is in ../js/ExampleIndex.js)
(function(KUBE){
    "use strict";
    //First we'll get a new Index Object from the KUBE AutoLoader
    var ExampleIndex = KUBE.AutoLoad().GetNewIndex();

    //Then we'll set the namespace
    ExampleIndex.SetNamespace('/KUBEjs/Examples');

    //Our baseURL tells which directory to load files from (KUBE.Config().autoLoadPath will point to the KUBEjs/src)
    ExampleIndex.SetBaseURL(KUBE.Config().autoLoadPath+'/../../docs/examples/js');

    //And then we set which classes our available in our Index (it will expect file names to match class names
    ExampleIndex.SetIndex([
        'Logger'
    ]);

    //Now we add our Index object back to the KUBE AutoLoader
    KUBE.AutoLoad().AddIndex(ExampleIndex);
}(KUBE));