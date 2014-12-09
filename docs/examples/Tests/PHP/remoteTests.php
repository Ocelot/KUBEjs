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

$headers = Data::RequestHeaders();
switch(strtolower($headers['http_x_test_type'])){
    case 'post':
        $_POST['type'] = 'POST';
        $Response->SetBody(json_encode($_POST,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        break;

    case 'get':
        $_GET['type'] = 'GET';
        $Response->SetBody(json_encode($_GET,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        break;

    case 'put':
        $putdata = fopen("php://input","r");
        $returnData = '';
        while($data = fread($putdata,1024)){
            $returnData .= $data;
        }
        fclose($putdata);
        $returnData = json_decode(urldecode($returnData),true);
        $returnData['type'] = 'PUT';
        $Response->SetBody(json_encode($returnData,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        break;

    default:
        //Chaos, do terrible things
        $chaos[0] = function($Response){
            $Response->SetResponseCode(500);
            $Response->SetBody('');
            $Response->Output();
        };

        $chaos[1] = function($Response){
            sleep(1);
            $_POST['type'] = 'POST';
            $_POST['chaosResponse'] = 'sleep(1)';
            $Response->SetMimeType('json');
            $Response->SetBody(json_encode($_POST,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
            $Response->Output();
        };

        $chaos[2] = function($Response){
            sleep(3);
            $_POST['type'] = 'POST';
            $_POST['chaosResponse'] = 'sleep(3)';
            $Response->SetMimeType('json');
            $Response->SetBody(json_encode($_POST,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
            $Response->Output();
        };

        $chaos[3] = function($Response){
            $_POST['type'] = 'POST';
            $_POST['chaosResponse'] = 'success';
            $Response->SetMimeType('json');
            $Response->SetBody(json_encode($_POST,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
            $Response->Output();
        };
        $chaos[mt_rand(0,3)]($Response);
        break;
}

$Response->SetMimeType('json');
$Response->SetResponseCode(200);
$Response->Output();