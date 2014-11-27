/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var UIIndex = KUBE.AutoLoad().GetNewIndex();
    UIIndex.SetNamespace('/Library/UI');
    UIIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/UI');
    UIIndex.SetIndex([
        'Appearance',
        'Theme',
        'ThemeManager',
        'UI',
        'QuickFlow'
    ]);

    KUBE.AutoLoad().AddIndex(UIIndex);

}(KUBE));