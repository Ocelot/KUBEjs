/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
    var TestIndex = KUBE.AutoLoad().GetNewIndex();
    TestIndex.SetNamespace('/Library/Test');
    TestIndex.SetBaseURL(KUBE.Config().autoLoadPath+'Library/Test');
    TestIndex.SetIndex([
        'Test',
        'Test2'
    ]);

    KUBE.AutoLoad().AddIndex(TestIndex);

}(KUBE));