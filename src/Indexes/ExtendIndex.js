/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var ExtendIndex = KUBE.AutoLoad().GetNewIndex();
    ExtendIndex.SetNamespace('/Library/Extend');
    ExtendIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Extend');
    ExtendIndex.SetIndex([
        'Array',
        'Date',
        'Function',
        'Math',
        'Number',
        'Object',
        'RegExp',
        'String'
    ]);

    KUBE.AutoLoad().AddIndex(ExtendIndex);

}(KUBE));