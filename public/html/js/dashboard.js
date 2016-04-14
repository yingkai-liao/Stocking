

function onFbLogin()
{
	$.ajax( "/getUserStockItems.php?fbId=" + FBLogin.id() + "&fbToken=" + FBLogin.token())
	.done(function(result) {
		stockView.clearStockItem();
		stockView.clearView();
		var resultObj = JSON.parse(result);
		for(var i = 0;i < resultObj.length;i++)
		{
			var title = resultObj[i].title;
			var stockId = resultObj[i].stockId;
			stockView.addView(title,stockId);
		};
	})
	.fail(function(error) {
		alert( "error" );
		alert(error);	
	});
}

stockView.clearView();
if(FBLogin.isLogin())
{
	onFbLogin();
}
else 
{
	FBLogin.addOnLogin(onFbLogin)
	stockView.addView("台積電(2330)","2330.TW");
}

