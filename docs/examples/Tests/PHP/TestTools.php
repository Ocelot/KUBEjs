<?php
/**
 * Created by PhpStorm.
 * User: anyuzer
 * Date: 14-12-08
 * Time: 4:59 PM
 */

class TestTools{
    private $headerCache = [];

//    public function __construct(){
//        $this->readHeaders();
//    }



    private function readHeaders(){
        if(!$this->headerCache){
            foreach($_SERVER as $key => $val){
                if(substr($key, 0, 5) == "HTTP_"){
                    $h = str_replace('_', '', substr($key, 5));
                    $h = str_replace(' ', '-', strtolower($key));
                    unset($_SERVER[$key]);
                    $this->headerCache[$h] = $val;
                }
            }
        }
    }
}

class Output extends Base{
    private $File = null;
    private $headers = array();

    //Pulling these from FileOutput (OLD) for now
    protected $disposition = null;
    protected $fileSize = null;
    protected $responseStatus = null;
    protected $cacheExpiry = null;
    protected $lastModified = null;
    protected $customHeaders = array();
    protected $autoCacheHandling = false;
    protected $deleteOnOutput = false;

    public function __construct(File $File){
        //Output requires a File, otherwise errorz
        $this->File = $File;
    }

    public function GetFile(){
        return $this->File;
    }


    /**
     * @description
     * @param 'inline' string $disposition
     * @return type $this
     */

    public function SetDisposition($disposition='inline'){
        $this->disposition = $disposition;
        return $this;
    }

    /**
     * @description
     * @param type $responseCode*
     * @return FileOutput $this
     */

    public function SetResponseCode($responseCode){
        $responseCodes = KUBE::HTTPResponseCodes();
        $this->responseStatus = ($responseCodes[$responseCode] ? $responseCodes[$responseCode] : null);
        return $this;
    }

    /**
     * @description Setter for cache expiry time
     * @param type $seconds
     */

    public function SetCacheExpiry($seconds){
        $this->cacheExpiry = $seconds;
    }

    /**
     * @description
     * @param string $headerString
     */

    public function AddCustomHeader($headerString){
        if(!$this->customHeaders[$headerString]){
            $this->customHeaders[$headerString] = $headerString;
        }
    }


    /**
     * @description Useful for storing a timestamp for last modification
     * @param string $timestamp
     */

    public function SetLastModified($timestamp){
        $this->lastModified = $timestamp;
    }

    public function SetDeleteOnOutput($bool=false){
        $this->deleteOnOutput = ($bool ? true : false);
    }

    /**
     * @description
     * @param true bool $exitOnFinish
     * @param false bool $removeFileAfterOutput
     *
     */

    //TODO: evaluate security concerns around code files. I think with new Adapter system, we've technically eliminated this threat which would allow us to read out PHP files stored in Assets/Storage. Currently reading PHP is still disabled though
    public function ToBuffer(KUBE $KUBEKey){
        ob_start();
        if($this->File->GetLiteralExtension() != 'php'){
            if($this->autoCacheHandling && $this->File->GetPath()){
                $cacheDate = strtotime($this->headers['http_if_modified_since']);
                $modifiedDate = $this->File->GetModifiedTime();
                if($modifiedDate <= $cacheDate){
                    $this->SetResponseCode(304);
                    $skipOutputToMemory = true;
                }
            }
            $this->outputHeaders();
        }
        else{
            //Failz
        }

        //If it's cached, we don't output to memory, we just respond with 304 and the appropriate headers
        if(!$skipOutputToMemory){
            $this->outputToMemory($KUBEKey);
        }

        ob_end_flush();
    }

    private function outputHeaders(){
        if($this->responseStatus){
            header($this->responseStatus);
        }

        if($this->File->GetMimeType()){
            header("Content-Type: ".$this->File->GetMimeType()."; charset=UTF-8");
        }

        if($this->disposition){
            header("Content-Disposition: $this->disposition; filename=\"".$this->File->GetName()."\";");
            if($this->disposition == 'attachment' && $this->File->GetFileSize()){
                header("Content-Length: ".$this->File->GetFileSize());
            }
        }

        if(isset($this->cacheExpiry)){
            $time = time();
            $expiry = date("D, d M Y H:i:s T", $time+$this->cacheExpiry);
            if($this->File->GetModifiedTime()){
                $lm = date("D, d M Y H:i:s T", $this->File->GetModifiedTime());
                header("Last-Modified: $lm");
            }
            header("Expires: $expiry");
            header("Cache-Control: max-age=$this->cacheExpiry, must-revalidate");
            header('Pragma: public');
        }
        else{
            header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
            header('Pragma: no-cache');
        }

        if(isset($this->customHeaders) && is_array($this->customHeaders)){
            foreach($this->customHeaders as $header){
                header($header);
            }
        }
    }

    /**
     * @description
     * @param false bool $removeFileAfterOutput
     */

    private function outputToMemory(KUBE $KUBEKey){
        switch($this->File->GetMimeType()){
            default:
                $this->File->Output($KUBEKey);
                break;
        }

        if($this->deleteOnOutput){
            $this->File->Delete();
        }
    }

    public static function Quick(){

    }

}
