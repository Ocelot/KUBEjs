(function(KUBE){
	"use strict";
	KUBE.LoadFactory('Upload',Upload,['Ajax']);
	//Unofficial codename is totally DangerZone, simply so we can have http://www.youtube.com/watch?v=siwpn14IE7E as its theme song.
	Upload.prototype.toString = function(){return '[object ' + 'Upload]';};
	function Upload(_DomJack, _UploadURL){
		var $uploadAPI,Ajax,postName = "files",requestDataStore = {}, allowedExtensions = [];
		if(KUBE.Is(_DomJack,true) !== "DomJack"){
			throw new Error('Upload must be instantiated on a DomJack Element');
		}

		initAjax();
		initDropEvents();
		$uploadAPI = {
			"AddRequestData": AddRequestData,
			"SetPOSTName": SetPOSTName,
            "AddAllowedExtension": AddAllowedExtension
		}.KUBE().create(Upload.prototype);

		return $uploadAPI;

		function AddRequestData(_key,_value){
			if(KUBE.Is(_value) == "string" || KUBE.Is(_value) == "number"){
				requestDataStore[_key] = _value
			}
			else{
				//Maybe handle this later automatically?
				throw new Error('Cannot add non-stringable data to request. (Use _key[_index] or _key[] for HTTP compatible Object')
			}
			return $uploadAPI;
		}

		function SetPOSTName(_name){
			if(KUBE.Is(_name) === "string"){
				postName = _name;
			}
			else{
				throw new Error('POST Name must be a string');
			}
			return $uploadAPI;
		}

        function AddAllowedExtension(_ext){
            switch(KUBE.Is(_ext)){
                case "array":
                    _ext.KUBE().each(function(v,k,a){
                       allowedExtensions.push(String(v).toLowerCase());
                    });
                    break;
                case "string":
                    allowedExtensions.push(String(_ext).toLowerCase());
                    break;
            }
            return $uploadAPI;
        }

		function initAjax(){
			Ajax = KUBE.Ajax(_UploadURL);
            Ajax.Settings().Method('post');
			Ajax.Settings().RequestHandler(_UploadURL);
            Ajax.On('response',handleResponse);
            Ajax.On('error',handleError);
		}

        function handleResponse(data){
            $uploadAPI.Emit('response',data);
        }

        function handleError(data){
            $uploadAPI.Emit('error',data);
        }

		function initDropEvents(){
            //_DomJack.On('dragenter',handleDragEnter);
			_DomJack.On('dragover',handleDragOver);
            _DomJack.On('dragleave',handleDragLeave);
			_DomJack.On('drop',handleDrop);
            _DomJack.On('delete',function(){
                Ajax.Clear();
                Ajax = undefined;
                _DomJack.Clear();
            });
		}

        function handleDragEnter(e){
            //This is only supposed to be used to verify that a drop is valid.
            if(e.dataTransfer.types.indexOf('Files') >= 0){
               return false;
            }
        }


		function handleDragOver(e){
            //This is used to display feedback.  In future for images we can show an image preview (for instance)
            // Or for multiple files, do crazy stuff.  We get freedom, but for now I'm just gonna change the drop effect
            if(e.dataTransfer && e.dataTransfer.types.indexOf('Files') >= 0){
                e.dataTransfer.dropEffect = "copy";
                $uploadAPI.Emit('dragover');
                return false;
            }
            else{
                e.dataTransfer.dropEffect = "none";
            }
		}

        function handleDragLeave(){
            $uploadAPI.Emit('dragleave');
        }

        function areThereAnyValidFiles(files){
            var $return = false;
            for(var i = 0; i < files.length; i++){
                if(isFileAllowed(files[i])){
                    $return = true;
                    break;
                }
            }
            return $return;
        }
        function isFileAllowed(file){
            var $ret = false;
            if(allowedExtensions.indexOf(getFileExtension(String(file.name).toLowerCase())) >= 0){
                $ret = true;
            }
            return $ret; //() ? false : true);
        }

        function getFileExtension(_filename){
            var $return;
            var split = _filename.split('.');
            if(split.length > 1){
                $return = split.pop();
            }
            else{
                $return = ""; //NO EXTENSION GUIS
            }
            return $return;
        }

		function handleDrop(e){  //https://soundcloud.com/bestdropsever
            var formData;
            if(e.dataTransfer.files.length > 0 && areThereAnyValidFiles(e.dataTransfer.files)){
                $uploadAPI.Emit('drop');
				formData = new FormData();
				bindDataToForm(formData);
				bindFilesToForm(e.dataTransfer.files,formData);
				Ajax.Send(formData);
                return false;
			}
		}

		function bindDataToForm(formData){
			if(KUBE.Is(formData,true) === "FormData"){
				requestDataStore.KUBE().each(function(k,v){
					formData.append(k,v);
				});
			}
		}

		function bindFilesToForm(files,formData){
			var outPostName = (files.length > 1) ? postName + "[]" : postName;
			for(var i = 0; i < files.length; i++){
                if(isFileAllowed(files[i])){
                    formData.append(outPostName,files[i]);
                }
			}
		}
	}
}(KUBE));
