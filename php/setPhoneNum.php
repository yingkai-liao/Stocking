<?php
  if(!isset($_POST["fbId"]))
	exit();
  
  $path = "../users_phone/".$_POST["fbId"];
  file_put_contents($path,$_POST["phoneNum"]);
?>
