var stockSingals = function()
{
	return{
		Update:function(viewList)
		{
			$("#stockSingals").empty();
			
			var sellCompareIndexs = [];
			var buyCompareIndexs = [];
			for(i = 0;i < viewList.length; i++){
				sellCompareIndexs.push(viewList[i]["sell"].length - 2);
				buyCompareIndexs.push(viewList[i]["buy"].length - 2);
			};
			
			var showCount = 30;
			for(i = 0; i < showCount; i++){
				var list = [];
				for(j = 0;j < viewList.length; j++){
					var sellIndex = sellCompareIndexs[j];
					if(sellIndex > 1)
						list.push([viewList[j]["sell"][sellIndex][0],j,"sell"]);
					var buyIndex = buyCompareIndexs[j];
					if(buyIndex > 1)	
						list.push([viewList[j]["buy"][buyIndex][0],j,"buy"]);
				}		
				if(list.length == 0)
					break;
					
				list.sort(function(a, b) {
					return a[0].localeCompare(b[0]);
				});
				
				var nearest = list[list.length - 1]; //nearest:["2015-12-06",2,"buy"]	
				var index = nearest[1];
				var stockViewItem = viewList[index];
				if(nearest[2] == "sell"){
					var row = stockViewItem["sell"][sellCompareIndexs[index]];
					sellCompareIndexs[index]--;
					
					var text = "(" +  row[0] + ")" + stockViewItem["title"] + "(收盤:" + row[4] + ")";
					var newSingal = $("<a/>").attr("class","list-group-item list-group-item-success").text(text);
					$("#stockSingals").append(newSingal);		
				}
				else{
					var row = stockViewItem["buy"][buyCompareIndexs[index]];
					buyCompareIndexs[index]--;
					
					var text = "(" + row[0] + ")" + stockViewItem["title"] + "(收盤:" + row[4] + ")";
					var newSingal = $("<a/>").attr("class","list-group-item list-group-item-danger").text(text);
					$("#stockSingals").append(newSingal);		
				}
			}

		}
	};
}();

var stockViewCounter = 0;
function StockViewPanel()
{
	var parent = $("#stockView-parent");
	var templete = $("#stockView-templete");
	var onAddCallback = null;
	var viewList = [];
	
	
	function addStockView_(title,stockId,strategy)
	{
		//add stock item
		var newStockItem = {};
		newStockItem["id"] = "stockView_" + stockViewCounter;
		newStockItem["title"] = title;
		newStockItem["stockId"] = stockId;
		
		//counter 
		stockViewCounter++;
		//add view
		var newView = templete.clone();	
		newView.attr("id",newStockItem["id"]);		
		newView.show();
		
		newView.find("#stockTitle").text(" " + title + "(Loading..)");
		newView.find("#stockExtra").hide();
		newView.find("#stockClose").hide();
		parent.prepend(newView);
		
		$.ajax( "/getStockData.php?stockId=" + stockId )
		.done(function(result) {
			var resultObj = JSON.parse(result);
			newStockItem["buy"] = resultObj.buy;
			newStockItem["sell"] = resultObj.sell;
			newStockItem["last"] = resultObj.last;
			newStockItem["png"] = resultObj.png;
			if(newStockItem["png"] == "")
			{
				parent.remove(newView);
				alert("無此代號")
				return;
			}
			UpdateView(newView,newStockItem);
			viewList.push(newStockItem);
			stockSingals.Update(viewList);
		})
		.fail(function(error) {
			alert( "error" );
			alert(error);	
			parent.remove(newView);
		});
	}
	
	function UpdateView(newView,newStockItem)
	{
		newView.attr("id",newStockItem["id"]);
	
		var stockImg = newView.find("#stockImg");
		stockImg.attr("src","data:image/png;base64," + newStockItem["png"]);
		stockImg.click(function(){
			$("#picModalImg").attr("src",stockImg.attr("src"));
		});
		
		var openCol = 1;
		var closeCol = 4;
		var last_is_up = newStockItem["last"].length > 3 ? (newStockItem["last"][2][closeCol] > newStockItem["last"][1][closeCol]) : (newStockItem["last"][1][closeCol] > newStockItem["last"][1][openCol]);
		var last_is_down = newStockItem["last"].length > 3 ? (newStockItem["last"][2][closeCol] < newStockItem["last"][1][closeCol]) : (newStockItem["last"][1][closeCol] < newStockItem["last"][1][openCol]);
		//title
		var titleView = newView.find("#stockTitle");
		titleView.text(" " + newStockItem["title"]);
		//last day
		var lastDay = newView.find("#lastday");
		var lastbuy = newView.find("#lastbuy");
		var lastsell = newView.find("#lastsell");
		
		newView.find("#lasttitle").text("最新: 	" + newStockItem["last"][2][0]);
		lastDay.text("收盤:" + newStockItem["last"][2][closeCol] + " 最高:" + newStockItem["last"][2][2] + " 最低:" + newStockItem["last"][2][3]);
		if(last_is_up)
		{
		  titleView.attr("class","glyphicon glyphicon-triangle-top list-group-item-danger");
		  lastDay.attr("class","glyphicon glyphicon-triangle-top  list-group-item list-group-item-danger");
		}
		else if(last_is_down)
		{
		  titleView.attr("class","glyphicon glyphicon-triangle-bottom list-group-item-success");
		  lastDay.attr("class"," glyphicon glyphicon-triangle-bottom  list-group-item list-group-item-success");
		}
		
		if(newStockItem["buy"].length > 2)
		{
			var buyRow = newStockItem["buy"][newStockItem["buy"].length - 2];
			newView.find("#buytitle").text("最近買入訊號: " + buyRow[0]);
			lastbuy.text("收盤:" + buyRow[closeCol] + " 最高:" + buyRow[2] + " 最低:" + buyRow[3]);
		}
		
		if(newStockItem["sell"].length > 2)
		{
			var sellRow = newStockItem["sell"][newStockItem["sell"].length - 2];
			newView.find("#selltitle").text("最近賣出訊號: " + sellRow[0]);
			lastsell.text("收盤:" + sellRow[closeCol] + " 最高:" + sellRow[2] + " 最低:" + sellRow[3]);
		}
		
		if(onAddCallback != null)
		{
			onAddCallback(newView,newStockItem);
		}
	}
	
	function removeStockItem_(stockItem){
		var index = viewList.indexOf(stockItem);
		if(index >= 0)
		{
			viewList.splice(index,1);
			restoreView_();
		}
	}
	
	function restoreView_()
	{
		parent.empty();
		for(var i = 0; i <　viewList.length; i++)
		{
			var newView = templete.clone();	
			newView.show();
			parent.prepend(newView);
			UpdateView(newView,viewList[i]);
		}
		stockSingals.Update(viewList);
	}
	
	
	return{
		addStockItem:function(stockItem){
			viewList.push(stockItem);
		},
		removeStockItem:function(stockItem){
			removeStockItem_(stockItem);
		},
		clearStockItem:function(){
			viewList = [];
		},
		
		addView:function(title,stockId,strategy)
		{
			addStockView_(title,stockId,strategy);
		},
		clearView:function()
		{
			parent.empty();
		},
		restoreView:function()
		{
			restoreView_();
		},
		setOnAllCallback:function(cb)
		{
			onAddCallback = cb;
		},
		
		contains: function(item)
		{
			for(var i = 0;i < viewList.length; i++)
			{
				if(viewList[i]["title"] == item["title"] && viewList[i]["stockId"] == item["stockId"])
					return true;
			}
			return false;
		}
	};
};

$("#stockView-templete").hide().removeClass("hidden");

stockView = new StockViewPanel();
stockView.setOnAllCallback(function(newView,newStockItem){
	newView.find("#stockExtra").hide();
	newView.find("#stockClose").show();
	newView.find("#stockClose").click(function(){
		if(confirm("將 " + newStockItem["title"] + " 移出看版，確定嗎?"))
		{
			stockView.removeStockItem(newStockItem);
			if(FBLogin.isLogin())
			{
				var data = {
					fbId : FBLogin.id(), 
					fbToken : FBLogin.token(), 
					stockTitle : newStockItem["title"],
					stockId : newStockItem["stockId"]
				};
				
				$.post( "/removeStockItem.php",data)
				.done(function(result) {
					//alert(result);
				})
				.fail(function(error) {
					alert( "error" );
					alert(error);	
				});
			}
		}
	});
});


searchView = new StockViewPanel();
searchView.setOnAllCallback(function(newView,newStockItem){
	newView.find("#stockClose").show();
	newView.find("#stockExtra").show();	
	if(!stockView.contains(newStockItem))
	{
		newView.find("#stockExtra").click(function(){
			stockView.addStockItem(newStockItem);
			if(FBLogin.isLogin())
			{
				var data = {
					fbId : FBLogin.id(), 
					fbToken : FBLogin.token(), 
					stockTitle : newStockItem["title"],
					stockId : newStockItem["stockId"]
				};
				
				$.post( "/addStockItem.php",data)
				.done(function(result) {
					alert("已加入看版");
				})
				.fail(function(error) {
					alert( "error" );
					alert(error);	
				});
			}
		});
	}else 
	{
		newView.find("#stockExtra").text("已經存在看版");	
	}	
	newView.find("#stockClose").click(function(){
		searchView.removeStockItem(newStockItem);
	});
});
