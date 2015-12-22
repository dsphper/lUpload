<?php
//HTTP上传文件的开关，默认为ON即是开 
ini_set('file_uploads','ON');
//通过POST、GET以及PUT方式接收数据时间进行限制为90秒 默认值：60 
ini_set('max_input_time','90');
//脚本执行时间就由默认的30秒变为180秒 
ini_set('max_execution_time', '180');
//正在运行的脚本大量使用系统可用内存,上传图片给多点，最好比post_max_size大1.5倍 
ini_set('memory_limit','200M');
if(!is_dir(dirname(__FILE__) . '/upload')) {
	mkdir(dirname(__FILE__) . '/upload');
}
$file_path = dirname(__FILE__) . "/upload/".$_FILES['FileData']['name'];
$returnMsg="{status:true}";
move_uploaded_file( $_FILES["FileData"]["tmp_name"], $file_path);
echo $returnMsg;
