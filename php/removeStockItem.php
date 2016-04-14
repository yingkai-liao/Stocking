<?php
  if(!isset($_POST["fbId"]))
	exit();
	
  $stockId = $_POST["stockId"];
  $stockTitle = $_POST["stockTitle"];
  
  $path = "../users/".$_POST["fbId"];
	
  $data = "";
  if(file_exists($path))
  {
	$result = array();
	$data = file_get_contents($path);
	
	$pattern = $stockTitle."\n".$stockId."\n";
	$data = str_replace($pattern,"",$data);
	file_put_contents($path,$data);	
  }
?>
