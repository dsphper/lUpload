/**
 * Author : dsphper
 * Email : dsphper@gmail.com
 * Version : 1.0.1
 * Licensed under the MIT license:
 *    http://www.opensource.org/licenses/mit-license.php
 *    Project home:
 *    https://github.com/dsphper/lUpload
 */
!(function ($) {
    var opts = {},
        defaultOpts = {
            url: '', // 后台接受地址
            maxfiles: 2, // 最大上传文件数
            maxfilesize: 2, // 最大的文件大小
            dynamic: function (complete, speed) {
            },
            error: function (error, file, i) {
                alert(error)
            }, // 异常信息接收
            multithreading: true, // 是否同时上传
            type: [], // 限制上传的类型
            dragenter: function (e) {
                return false;
            },
            dragleave: function (e) {
                return false;
            },
            dragover: function (e) {
                return false;
            },
            drop: function (e) {
                return false;
            },
            dropDefa: function (e) {
                return false;
            },
            enterDefa: function (e) {
                return false;
            },
            leaveDefa: function (e) {
                return false;
            },
            overDefa: function (e) {
                return false;
            },
            tpl: function () {
                return 'false';
            },
            setImageTpl: function (file, image, img) {
            },
            setOtherTpl: function (file) {
            },
            complete: function (file) {
            },
            stageChange: function (file) {
            }, // 当开启队列上传时可以知道那个文件正在被上传
            Knowntype: {'pdf': './image/pdf.jpg', 'html': './image/html.png'},
            selectMultiple: true // 允许选择多个文件
        },
        errorTexts = ["浏览器不支持", "超过最大文件数", "文件大小超过限制", "不允许的上传格式"],
        errorCode = {200: 'warning', 201: 'deadly'}, // warning 普通错误 deadly 致命错误
        uploadImg = [],
        uploadTotal = 0, // 本次操作被放入的文件数
        fi = 0, // 记录总共拖入的文件数
        thisFile = 0, // 存放当前文件的资源对象
        startTime = 0, // 当前文件的上传开始时间
        queue = [], // 用于队列上传
        loadOk = 0, // 用于记录当前操作放入的文件被加载成功的数目
        time = []; // 用于计算每个文件上传的平均网速
    // 拖拽上传
    $.fn.dropFile = function (userOpts) {
        $.event.props.push("dataTransfer");
        opts = $.extend({}, defaultOpts, userOpts);
        this.bind('dragenter', dragenter).bind('dragleave', dragleave).bind('dragover', dragover).bind('drop', drop);
        $(document).bind('drop', dropDefa).bind('dragover', overDefa).bind('dragleave', leaveDefa).bind('dragenter', enterDefa);
    }
    // 粘贴上传
    $.fn.pasteFile = function (userOpts) {
        $.event.props.push("clipboardData");
        opts = $.extend({}, defaultOpts, userOpts);
        var _this = this;
        this.bind('mouseover', function () {
            _this.bind('paste', pasteHand);
        });
        this.bind('mouseout', function () {
            _this.unbind('paste', pasteHand);
        });

    }
    // 选择上传
    $.fn.selectFile = function (userOpts) {
        opts = $.extend({}, defaultOpts, userOpts);
        if ($(this).attr('multiple') == undefined && opts.selectMultiple) {
            $(this).attr('multiple', 'multiple');
        }
        $(this).bind('change', function () {
            handFiles(this.files)
        })
    }
    function pasteHand(e) {
        var clipboard = e.clipboardData;
        var temp = [];
        for (var i = 0; i < clipboard.items.length; i++) {
            temp.push(clipboard.items[i].getAsFile());
        }
        ;
        handFiles(temp);
        e.preventDefault();
        e.stopPropagation();

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
        if (e.lengthComputable) {
            //计算网速
            var nowDate = new Date().getTime();
            var x = (e.loaded) / 1024;
            var y = (nowDate - startTime) / 1000;
            time.push((x / y).toFixed(2));
            if ((e.loaded / e.total) * 100 == 100) {
                var avg = 0;
                for (var i = 0; i < time.length; i++) {
                    avg += parseInt(time[i]);
                }
                ;
                // 求出平均网速
            }
            var result = {};
            result.thisDom = $('#uList li').eq(file.index);
            result.progress = Math.round((e.loaded / e.total) * 100);
            result.speed = (x / y).toFixed(2);
            result.loaded = getFileSize({size: e.loaded});
            result.total = getFileSize({size: e.total});
            opts.dynamic(result);
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
        } else if (filesize >= 1024) {
            filesize = Math.round(filesize / 1024 * 100) / 100 + ' KB';
        } else {
            filesize = filesize + ' Bytes';
        }
        return filesize;
    }

    function setImageTpl(file, fileReaderiImage, newImage) {
        var data = {};
        data.file = file;
        data.fileReaderiImage = fileReaderiImage;
        data.newImage = newImage;
        data.fileSize = getFileSize(file);
        data.fileType = getFileType(file);
        opts.setImageTpl(data);
        loadOk++;
        if (loadOk == queue.length && !opts.multithreading) {
            upload(queue[0]);
        }
        if (opts.multithreading) {
            upload(data.file);
        }
    }

    function setOtherTpl(file) {
        var data = {};
        data.file = file;
        data.fileSize = getFileSize(file);
        data.fileType = getFileType(file);
        opts.setOtherTpl(data);

        var type = getFileType(file);
        if (opts.Knowntype[type] != undefined && opts.Knowntype[type] != 'undefined') {
            var thisLi = $('#uList li').eq(data.file.index);

            thisLi.find('.image img').attr('src', opts.Knowntype[type]);

        }
        loadOk++;
        if (loadOk == queue.length && !opts.multithreading) {
            upload(queue[0]);
        }
        if (opts.multithreading) {
            upload(file);
        }
    }

    function getImageInfo(file, image) {
        var img = new Image();
        img.src = image.target.result;
        img.addEventListener('load', function (e) {
            setImageTpl(file, image, img);
        }, false);
    }

    function readerFile(file) {
        var reader = new FileReader();
        reader.addEventListener('load', function (e) {
            switchHand(file, e);
        }, false);
        reader.readAsDataURL(file);
    }

    function filter(file) {
        var type = !file.type ? 'other' : file.type.split('/')[1];
        if (type) {
            var typeIsOk = false;
            if (opts.type.length > 0) {
                for (o in opts.type) {
                    if (type == opts.type[o]) {
                        typeIsOk = true;
                        break;
                    }
                }
                if (!typeIsOk) {
                    opts.error(errorTexts[3], file);
                    return errorCode['200'];
                }
            }

        }
        if (uploadTotal > opts.maxfiles) {
            opts.error(errorTexts[1], file);
            return errorCode['201'];
        }
        var max_file_size = 1048576 * opts.maxfilesize;
        if (file.size > max_file_size) {
            opts.error(errorTexts[2], file);
            return errorCode['200'];
        }


    }

    function createXMLHttpRequest() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            var names = ["msxml", "msxml2", "msxml3", "Microsoft"];
            for (var i = 0; i < names.length; i++) {
                try {
                    var name = names[i] + ".XMLHTTP";
                    return new ActiveXObject(name);
                } catch (e) {
                }
            }
        }
        return null;
    }

    function switchHand(file, e) {
        var type = !file.type ? 'other' : file.type.split('/')[1];
        if (type == 'jpeg' || type == 'png' || type == 'gif' || type == 'bmp' || type == 'x-icon') {
            getImageInfo(file, e);
            return;
        }
        setOtherTpl(file);
        // alert('other');
    }

    function upload(file) {
        file.stage = 'uploadIng';
        opts.stageChange(file);
        var xhr = createXMLHttpRequest();
        xhr.open('POST', opts.url, true);
        var upload = xhr.upload;
        if (upload) {
            upload.addEventListener('progress', function (e) {
                progress(e, file);
            }, false);
        }
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                if (!opts.multithreading) {
                    if (queue.length > 1) {
                        queue.shift();
                        loadOk--;
                        upload_(queue[0]);
                    }
                }
                file.responseText = xhr.responseText;
                opts.complete(file);
            }
        }, false);
        var formData = new FormData();
        formData.append('FileData', file);
        xhr.send(formData);
        startTime = new Date().getTime();
    }

    function upload_(file) {
        upload(file);
    }

    function handFiles(files) {
        files = sortFiles(files);
        uploadTotal = files.length;
        Array.prototype.push.apply(queue, files);
        for (var i = 0; i < files.length; i++) {
            var code = filter(files[i]);
            if (code == 'deadly') {
                return false;
            } else if (code == 'warning') {
                continue;
            }
            if (files[i].name == undefined) {
                files[i].name = 'null'
            }
            files[i].index = fi++;
            files[i].stage = 'Waiting';
            readerFile(files[i]);
            thisFile = files[i];
        }
        ;
    }

    function sortFiles(files) {
        var listSize = [];
        for (var i = 0; i < files.length; i++) {
            listSize[i] = files[i];
        }
        ;
        for (var i = 0; i < listSize.length; i++) {
            for (var j = i + 1; j < listSize.length; j++) {
                if (listSize[j].size < listSize[i].size) {
                    var temp = listSize[j];
                    listSize[j] = listSize[i];
                    listSize[i] = temp;
                }
            }
            ;
        }
        ;

        return listSize;
    }

    function getFileType(file) {
        var type = !file.type ? 'other' : file.type.split('/')[1];
        return type;
    }
})(jQuery)
