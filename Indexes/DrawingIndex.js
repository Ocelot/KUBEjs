/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var DrawingIndex = KUBE.AutoLoad().GetNewIndex();
    DrawingIndex.SetNamespace('/Library/Drawing');
    DrawingIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Drawing');
    DrawingIndex.SetIndex([
        'Arrow',
        'Bezier',
        'Color',
        'ControlPoint',
        'LinearGradient',
        'Spinner'
    ]);

    KUBE.AutoLoad().AddIndex(DrawingIndex);
}(KUBE));