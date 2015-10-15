/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var DOMIndex = KUBE.AutoLoad().GetNewIndex();
    DOMIndex.SetNamespace('/Library/DOM');
    DOMIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/DOM');
    DOMIndex.SetIndex([
        'DomJack',
        'FeatureDetect',
        'Scroll',
        'Select',
        'StyleJack',
        'TextKing',
        'Velocity',
        'WinDocJack',
        'WebSocket'
    ]);

    KUBE.AutoLoad().AddIndex(DOMIndex);

    var DraggerIndex = KUBE.AutoLoad().GetNewIndex();
    DraggerIndex.SetNamespace('/Library/DOM/Dragger');
    DraggerIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/DOM/Dragger');
    DraggerIndex.SetIndex([
        'Dragger',
        'DraggerTarget',
        'DraggerHandle'
    ]);

    KUBE.AutoLoad().AddIndex(DraggerIndex);

}(KUBE));