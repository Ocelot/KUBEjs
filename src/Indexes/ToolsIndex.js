/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var ToolsIndex = KUBE.AutoLoad().GetNewIndex();
    ToolsIndex.SetNamespace('/Library/Tools');
    ToolsIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Tools');
    ToolsIndex.SetIndex([
        'Convert',
        'ConvertCheck',
        'Handlebars',
        'Hash',
        'Index',
        'KeyVal',
        'Sync',
        'SyncFlow',
        'SyncFlow2'
    ]);

    KUBE.AutoLoad().AddIndex(ToolsIndex);

}(KUBE));