/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var AjaxIndex = KUBE.AutoLoad().GetNewIndex();
    AjaxIndex.SetNamespace('/Library/Ajax');
    AjaxIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Ajax');
    AjaxIndex.SetIndex([
        'Client',
        'Fetch',
        'Request',
        'Response'
    ]);

    KUBE.AutoLoad().AddIndex(AjaxIndex);
}(KUBE));