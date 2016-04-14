<?php

$stockId = "2330";
if(isset($_GET["stockId"]))
	$stockId = $_GET["stockId"];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://mis.twse.com.tw/stock/api/getStock.jsp?ch=$stockId.tw");
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
$result=curl_exec($ch);
curl_close($ch);

$jsonStockItem = json_decode($result);
if(count($jsonStockItem->msgArray) == 0)
{
	echo json_encode(array(
		"title" => $stockId ,
		"stockId" => $stockId
	));
}
else 
{
	$name = $jsonStockItem->msgArray[0]->n;
	$ex = $jsonStockItem->msgArray[0]->ex;
	if($ex == "otc")
	{
		echo json_encode(array(
			"title"=>$name."(".$stockId.")",
			"stockId"=>$stockId.".TWO"
		));
	}
	else if($ex == "tse"){
		echo json_encode(array(
			"title"=>$name."(".$stockId.")",
			"stockId"=>$stockId.".TW"
		));
	}
	else 
	{
		echo json_encode(array("title"=>$stockId,"stockId"=>$stockId));
	}
}
?>
