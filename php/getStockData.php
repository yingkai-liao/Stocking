<?php


  $stockId = "2330.TW";
  if(isset($_GET["stockId"]))
    $stockId = $_GET["stockId"];

  $user = "user";
  $today = date("Ymd"); 
  
  $path = "/home/webStock/Rtemp/";
  $dirName = $path."$user"."_$today"."_$stockId";
  if(!file_exists($dirName))
  {
    $cmd = "Rscript /home/webStock/R/singals.R $stockId $dirName";
    exec($cmd);
  }

  //get buy data
  $csvStr = file_get_contents($dirName."/buy.csv");
  $buyData = array_map("str_getcsv", explode("\n", $csvStr));
  //get sell data
  $csvStr = file_get_contents($dirName."/sell.csv");
  $sellData = array_map("str_getcsv", explode("\n", $csvStr));
  //get last data
  $csvStr = file_get_contents($dirName."/last.csv");
  $lastData = array_map("str_getcsv", explode("\n", $csvStr));
  //get png
  $png = file_get_contents($dirName."/output.png");
  //output
  $output = array();
  $output["buy"] = $buyData;
  $output["sell"] = $sellData;
  $output["last"] = $lastData;
  $output["png"] = base64_encode($png);
  
//  exec("rm -rf $dirName/");
  echo json_encode($output);
  
?>
