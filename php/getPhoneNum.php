<?php
  if(!isset($_POST["fbId"]))
	exit();
  
  $path = "../users_phone/".$_POST["fbId"];
	
  $data = "";
  if(file_exists($path))
  {
	$data = file_get_contents($path);
  }
  echo $data;
?>
