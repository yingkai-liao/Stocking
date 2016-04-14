<?php

function clearTempFile()
{
	$dirs = glob('../Rtemp/*'); // get all file names
	foreach($dirs as $dir){ // iterate files
	  recursiveDelete($dir);
	}
}

function recursiveDelete($str) {
    if (is_file($str)) {
        unlink($str);
    }
    elseif (is_dir($str)) {
        $scan = glob(rtrim($str,'/').'/*');
        foreach($scan as $index=>$path) {
            recursiveDelete($path);
        }
        rmdir($str);
    }
}

clearTempFile();
?>
