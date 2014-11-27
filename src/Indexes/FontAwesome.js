/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var Index = KUBE.AutoLoad().GetNewIndex();
    Index.SetNamespace('/Library/FontAwesome');
    Index.SetBaseURL(KUBE.Config().autoLoadPath+'Library/FontAwesome');
    Index.SetIndex([
        'FontAwesome'
    ]);

    KUBE.AutoLoad().AddIndex(Index);

}(KUBE));