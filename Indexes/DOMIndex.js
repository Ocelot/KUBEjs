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
        'Ajax',
        'DomJack',
        'Dragger',
        'FeatureDetect',
        'Scroll',
        'Select',
        'StyleJack',
        'TextKing',
        'Velocity',
        'WinDocJack'
    ]);

    KUBE.AutoLoad().AddIndex(DOMIndex);
}(KUBE));