<?php
/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

function Dump($a){
    ob_start();
    (!empty($a) ? print_r($a) : var_dump($a));
    $dump = ob_get_clean();
    echo "<pre>$dump</pre>";
    exit;
}

Dump([$_SERVER,$_POST,$_GET]);