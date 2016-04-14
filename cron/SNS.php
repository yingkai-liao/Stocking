<?php

require_once 'Services/Twilio.php';

function sendMessage($phoneNum,$text)
{
	// Install the library via PEAR or download the .zip file to your project folder.
	// This line loads the library

	$sid = "AC48db0cfe508f9b7ad34048177648dd29"; // Your Account SID from www.twilio.com/user/account
	$token = "7eccea2180b83a6a55e2523a11e0bb6d"; // Your Auth Token from www.twilio.com/user/account

	$client = new Services_Twilio($sid, $token);
	$message = $client->account->messages->sendMessage(
	  '+17273419429', // From a valid Twilio number
	  $phoneNum, // Text this number
	  $text
	);

	print $message->sid." has send to ".phoneNum;
}

function scanUserStocking()
{
	date_default_timezone_set("Asia/Taipei");
	$checkDay = date("Y-m-d",strtotime("-1 days"));
	echo "checkDay:$checkDay\n";
	
	$files = scandir("../users/");
	foreach($files as $file)
	{
		echo "check user ".$file."\n";
		
		if($file == "." || $file == "..")
			continue;
		if(!file_exists("../users_phone/".$file))
			continue;
		
		echo "checked user phone\n";
		$userPhoneNumber = file_get_contents("../users_phone/".$file);
			
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1/getUserStockItems.php?fbId=$file");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		//curl_setopt($ch, CURLOPT_POST, 1); 
		//curl_setopt($ch, CURLOPT_POSTFIELDS, $PostData);
		$result=curl_exec($ch);
		curl_close($ch);

		$jsonStockItem = json_decode($result);
		foreach($jsonStockItem as $item)
		{
			$title = $item->title;
			$stockId = $item->stockId;
			
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1/getStockData.php?stockId=$stockId");
			curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
			$result = curl_exec($ch);;
			$stockItemResult = json_decode($result);
			curl_close($ch);
			
			$buyList = $stockItemResult->buy;
			$buyCount = count($buyList);
						
			if($buyCount > 2)
			{
				$lastBuy = $buyList[$buyCount-2];
			
				$checkDay = date("Y-m-d",strtotime("-1 days"));
				$lastBuyDate = date($lastBuy[0]);
				if($checkDay == $lastBuyDate)
				{
					$message = $title." 昨日出現買進訊號:"."(".$lastBuy[0].")\n低點 ".$lastBuy[3]."\n收盤 ".$lastBuy[4];
					echo $message."\n";
					sendMessage($userPhoneNumber,$message);
				}
			}
			
			$sellList = $stockItemResult->sell;
			$sellCount = count($sellList);
			if($sellCount > 2)
			{
				$lastSell = $sellList[$sellCount-2];
			
				$checkDay = date("Y-m-d",strtotime("-1 days"));
				$lastSellDate = date($lastSell[0]);
				if($checkDay == $lastSellDate)
				{
					$message = $title." 昨日出現賣出訊號:"."(".$lastSell[0].")\n高點 ".$lastSell[2]."\n收盤 ".$lastSell[4];
					echo $message."\n";
					sendMessage($userPhoneNumber,$message);
				}
			}
		}
		echo "checked user done\n";
	}
}

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
scanUserStocking();
?>
