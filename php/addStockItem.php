<?php
  if(!isset($_POST["fbId"]))
	exit();
  
  $stockId = $_POST["stockId"];
  $stockTitle = $_POST["stockTitle"];
  
  $path = "../users/".$_POST["fbId"];

  $data = "";
  if(file_exists($path))
  {
	$data = file_get_contents($path);
  }

  $pattern = $stockTitle."\n".$stockId."\n";
  if(strpos($data,$pattern) !== FALSE)
  {
	exit();
  }

  $data = $data.$stockTitle."\n".$stockId."\n";
  file_put_contents($path,$data);
?>
