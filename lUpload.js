/**
 * Author : dsphper
 * Email : dsphper@gmail.com
 * Version : 0.0.1
 * Licensed under the MIT license:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	Project home:
 * 	https://github.com/dsphper/lUpload
 */
(function($) {
	var opts = {},
	defaultOpts = {
		url : '', // 后台接受地址
		maxfiles : 2, // 最大上传文件数
		maxfilesize : 2, // 最大的文件大小
		run : function(complete, speed) {},
		error : function(error,file,i) { alert(error) }, // 异常信息接收
		multithreading : true, // 是否同时上传
		type : [], // 限制上传的类型
		dragenter : function(e) { return false; },
		dragleave : function(e) { return false; },
		dragover : function(e) { return false; },
		drop : function(e) { return false; },
		dropDefa : function(e) { return false; },
		enterDefa : function(e) { return false; },
		leaveDefa : function(e) { return false; },
		overDefa : function(e) { return false; },
		tpl : function() { return 'false'; },
		setImageTpl : function(file, image, img) {},
		complete : function(file) {},
		Knowntype : {'pdf':'./image/pdf.jpg', 'html':'./image/html.png'},
	},
	errorTexts = ["浏览器不支持", "超过最大文件数", "文件大小超过限制", "不允许的上传格式"],
	errorCode = {200 : 'warning', 201 : 'deadly'}, // warning 普通错误 deadly 致命错误
	uploadImg = [],
	uploadTotal = 0,
	fi = 0,
	thisFile = 0,
	startTime = 0,
	time = [];
	$.fn.dropFile = function(userOpts) {
		$.event.props.push("dataTransfer");
		opts = $.extend( {}, defaultOpts , userOpts);
		this.bind('dragenter', dragenter).bind('dragleave', dragleave).bind('dragover', dragover).bind('drop', drop);
		$(document).bind('drop', dropDefa).bind('dragover', overDefa).bind('dragleave', leaveDefa).bind('dragenter', enterDefa);
	}
	function dragenter(e) {
		e.dataTransfer.dropEffect = "copy";
		e.preventDefault();
		e.stopPropagation();

	}
	function dragleave(e) {
		e.dataTransfer.dropEffect = "copy";
		e.preventDefault();
		e.stopPropagation();

	}
	function dragover(e) {
		e.dataTransfer.dropEffect = "copy";
		e.preventDefault();
		e.stopPropagation();

	}
	function drop(e) {
		handFiles(e.dataTransfer.files);
		e.dataTransfer.dropEffect = "copy";
		e.preventDefault();
		e.stopPropagation();
	}
	function dropDefa(e) {
		opts.dropDefa(e);
		e.dataTransfer.dropEffect = "none";
		e.preventDefault();
		e.stopPropagation();
	}
	function enterDefa(e) {
		opts.enterDefa(e);
		e.dataTransfer.dropEffect = "none";
		e.preventDefault();
		e.stopPropagation();
	}
	function leaveDefa(e) {
		opts.leaveDefa(e);
		e.dataTransfer.dropEffect = "none";
		e.preventDefault();
		e.stopPropagation();
	}
	function overDefa(e) {
		opts.overDefa(e);
		e.dataTransfer.dropEffect = "none";
		e.preventDefault();
		e.stopPropagation();
	}
	function progress(e, file) {
		if(e.lengthComputable) {
			//计算网速
			var nowDate = new Date().getTime();
			var x = (e.loaded) / 1024;
			var y = (nowDate - startTime) / 1000;
			time.push((x / y).toFixed(2));
			if((e.loaded / e.total) * 100 == 100) {
				var avg = 0;
				for (var i = 0; i < time.length; i++) {
					avg += parseInt(time[i]);
				};
				// 求出平均网速
			}
		opts.run($('#uList li').eq(file.index), Math.round((e.loaded / e.total) * 100), (x / y).toFixed(2));
		} else {
			alert('无法获得文件大小')
		}
	}
	function getFileSize(file) {
		var filesize = file.size;
	    if (filesize >= 1073741824) {
	        filesize = Math.round(filesize / 1073741824 * 100) / 100 + ' GB';
	    } else if (filesize >= 1048576) {
	        filesize = Math.round(filesize / 1048576 * 100) / 100 + ' MB';
	    } else if(filesize >= 1024) {
	        filesize = Math.round(filesize / 1024 * 100) / 100 +  ' KB';
	    } else {
	        filesize = filesize + ' Bytes';
	    }
	    return filesize;
	}
	function setImageTpl(file, image, img) {
		var tpl = opts.tpl();
		$('#uList').html($('#uList').html() + tpl);
		var thisLi = $('#uList li').eq(file.index);
		thisLi.find('.borderImg img').attr('src', image.target.result);
		thisLi.find('.fileName').text(file.name);
		thisLi.find('.fileSize').text(img.width + ' X ' + img.height);
		thisLi.find('.size').text(getFileSize(file));
		upload(file);
	}
	function getImageInfo(file, image) {
		var img = new Image();
		img.src = image.target.result;
		img.addEventListener('load', function(e) {
			setImageTpl(file, image, img);
		}, false);
	}
	function readerFile(file) {
		var reader = new FileReader();
		reader.addEventListener('load', function(e) {
			switchHand(file, e);
		}, false);
		reader.readAsDataURL(file);
	}
	function filter(file) {
		var type = !file.type ? 'other' : file.type.split('/')[1];
		if(type) {
			var typeIsOk = false;
			if(opts.type.length > 0) {
				for(o in opts.type) {
					if(type == opts.type[o] ) { typeIsOk = true; break;}
				}
				if(!typeIsOk) {
					opts.error(errorTexts[3]);
					return errorCode['200'];	
				}	
			}
			
		}
		if(uploadTotal > opts.maxfiles) {
			opts.error(errorTexts[1]);
			return errorCode['201'];
		}
		var max_file_size = 1048576 * opts.maxfilesize;
		if(file.size > max_file_size) {
			opts.error(errorTexts[2]);
			return errorCode['200'];
		}

		
	}
	function createXMLHttpRequest() {
		if(window.XMLHttpRequest){ 
			return new XMLHttpRequest(); 
		} else { 
			var names=["msxml","msxml2","msxml3","Microsoft"]; 
			for(var i=0;i<names.length;i++){ 
				try{ 
					var name=names[i]+".XMLHTTP"; 
					return new ActiveXObject(name); 
				}catch(e){ 
				} 
			} 
		} 
		return null; 
	}
	function switchHand(file, e) {
		var type = !file.type ? 'other' : file.type.split('/')[1];
		if(type == 'jpeg' || type == 'png' || type == 'gif' || type == 'bmp' || type == 'x-icon') {
			getImageInfo(file, e);
			return;
		}
		alert('other');
	}
	function upload(file) {
		var xhr = createXMLHttpRequest();
		xhr.open('POST', opts.url, true);
		var upload = xhr.upload;
		if(upload) {
			upload.addEventListener('progress', function(e) {
				progress(e, file);
			}, false);
		}
		xhr.addEventListener('readystatechange', function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				opts.complete(file);
			}
		}, false);
		var formData = new FormData();
		formData.append('FileData', file);
		xhr.send(formData);
		startTime = new Date().getTime();
	}
	function handFiles(files) {
		files = sortFiles(files);
		uploadTotal = files.length;
		for (var i = 0; i < files.length; i++) {
			var code = filter(files[i]);
			if(code == 'deadly') {
				return false;
			} else if(code == 'warning') {
				continue;
			}
			files[i].index = fi++;
			readerFile(files[i]);
			thisFile = files[i];
		};
	}
	function sortFiles(files) {
		var listSize = [];
		for (var i = 0; i < files.length; i++) {
			listSize[i] = files[i];
		};
		for (var i = 0; i < listSize.length; i++) {
			for (var j = i+1; j < listSize.length; j++) {
				if(listSize[j].size < listSize[i].size) {
					var temp = listSize[j];
					listSize[j] = listSize[i];
					listSize[i] = temp;
				}
			};
		};
		
		return listSize;
	}
})(jQuery)