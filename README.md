##插件介绍
插件基于jQuery开发，可支持：
>1.粘贴上传  
2.拖拽上传  
3.选择上传  
4.实时上传速度  
5.实时进度信息  
7.可自定义不同文件类型上传缩略图  
8.同步上传(队列阻塞模式, 文件会一个接一个的上传.)  
9.异步上传
浏览器支持情况：  
![github logo](http://dsphper.github.io/assets/image/jianrong.gif)  

###DEMO
项目主页：http://dsphper.github.io/  
演示Demo：http://1.luploaddemo.sinaapp.com/  
###Document
####使用本插件您完全不需要有太多的JS相关知识，只需按照文档简单的书写相关调用函数即可，  
##拖拽上传
```javascript  
// 添加拖拽上传事件
$('#event').dropFile(opts);
```  
##选择上传
```javascript  
// 添加选择上传事件
$('#event #selectFile').selectFile(opts);
```  
##粘贴上传
```javascript  
// 添加粘贴上传事件	
$('#event').pasteFile(opts);
```  
##同时使用多个上传事件
```javascript
// 添加拖拽上传事件
$('#event').dropFile(opts);
// 添加选择上传事件
$('#event #selectFile').selectFile(opts);
// 添加粘贴上传事件	
$('#event').pasteFile(opts);

```

##HTML代码
```html
请引入jQuery与本插件
这是上传详情展示的地方，ID默认使用`uList`如果想要更改请修改源代码。
<ul id="uList">
<!--这里是你在js中配置的模板最终被插入到的地方-->
</ul>
```

##插件使用实例：  

```javascript
// 说明 $('#drop').dropFile为拖拽上传 $('#drop').pasteFile为粘贴上传 $('#drop').selectFile 为选择上传
// 拖拽上传
var opts = {
url : '/lUpload/Demo/upload.php',
maxfiles: 111 , // 单次上传的数量
maxfilesize : 11,  // 单个文件允许的大小 (M)
multithreading : true, // true为同时上传false为队列上传
type : [], // 限制上传的类型
Knowntype : {'pdf':'./image/pdf.jpg', 'html':'./assets/image/html.png'}, // 根据不同上传类型设置缩略图
tpl : function(type) { // 自定义模板
	var imageTpl = '<li>\
		<div class="image">\
			<img src="./assets/image/aa.jpg" alt="">\
		</div>\
		<div class="uploadInfo">\
			<span class="fileName">文件名称: <text> default </text></span>\
			<span class="imageSize">图片尺寸: <text> default </text></span>\
			<span class="fileSize">文件大小: <text> default </text></span>\
			<span class="speed">上传速度: <text> default </text></span>\
			<span class="loaded">上传详情: <text> default </text></span>\
			<span class="stage">\
				上传状态: <text>等待上传</text>\
			</span>\
			<div class="progress" style="display:none">\
				<div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;" id="progress">\
				    60%\
				  </div>\
			</div>\
		</div>\
	</li>';
	var otherTpl = '<li>\
		<div class="image">\
			<img src="./assets/image/aa.jpg" alt="">\
		</div>\
		<div class="uploadInfo">\
			<span class="fileName">文件名称: <text> default </text></span>\
			<span class="fileSize">文件大小: <text> default </text></span>\
			<span class="speed">上传速度: <text> default </text></span>\
			<span class="loaded">上传详情: <text> default </text></span>\
			<span class="stage">\
				上传状态: <text>等待上传</text>\
			</span>\
			<div class="progress" style="display:none">\
				<div class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;" id="progress">\
				    60%\
				  </div>\
			</div>\
		</div>\
	</li>';
	// 为不同的上传类型定义不同的模板 ClassName 必须注意填写正确
	if(type == 'image') {
		return imageTpl;
	} else if(type == 'other') {
		return otherTpl;
	}
},
// result 结构 {thisDom: 当前被上传的节点, progress: 进度, speed: "网速", loaded: "已上传的大小 992 KB"}
dynamic : function(result) { // 返回网速及上传百分比
	result.thisDom.find('#progress').css('width', result.progress + '%').html(result.progress + '%');
	result.thisDom.find('.speed').text("网速：" + result.speed + " K\/S");
	result.thisDom.find('.loaded text').text(result.loaded + ' / ' + result.total);
},
complete : function(file) { // 上传完成后调用的
	var uList = $('#uList li').eq(file.index);
	uList.find('.stage text').html('上传完成！');
	// 使用 file.index 查看第几个文件上传完毕
},
stageChange : function(file) {
	var uList = $('#uList li').eq(file.index);
	uList.find('.progress').show();
	uList.find('.stage text').html('正在被上传');
} // 当开启队列上传时可以知道那个文件正在被上传
};
$(function() {
	$('#event').dropFile(opts);	
	$('#event #selectFile').selectFile(opts);	
	$('#event').pasteFile(opts);	
})
```


###版权
######MIT
