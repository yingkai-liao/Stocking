<?php

  if(!isset($_GET["fbId"]))
	exit();

  $path = "../users/".$_GET["fbId"];

  if(!file_exists($path))
  {
	echo json_encode();
  }
  else 
  {
	$result = array();
	$data = file_get_contents($path);
	$lines = explode("\n",$data);
	$count = count($lines) - 2;
	for($i=0; $i<$count;$i+=2)
	{
		$item = array(
			"title" => $lines[$i],
			"stockId" => $lines[$i+1]
		);
		array_push($result,$item);
	}
	echo json_encode($result);
  }
?>
