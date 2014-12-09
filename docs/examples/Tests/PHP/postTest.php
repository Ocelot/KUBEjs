<?php
/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

include('Response.php');

$Response = new Response();
$Response->SetBody(json_encode([Data::RequestHeaders(),$_POST],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
$Response->SetMimeType('json');
$Response->SetResponseCode(200);
$Response->Output();