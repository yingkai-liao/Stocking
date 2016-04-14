function RunSearch()
{
	if($("#search-text").val.length > 0)
	{
		var id = $("#search-text").val();
		$("#search-text").val("");
		
		stockView.clearView();
		var data = {
			stockId : id, 
		};
				
		$.get( "/checkStockTaiwan.php",data)
		.done(function(result) {	
			var resultObj = JSON.parse(result);			
			searchView.restoreView();
			searchView.addView(resultObj.title,resultObj.stockId);	
		})
		.fail(function(error) {
			alert( "error" );
			alert(error);	
		});
	}
}

$("#btn-search").click(function()
{
	RunSearch();
});

$("#search-text").keypress(function(e){
  code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13)
  {
      RunSearch();
  }
});

$("#btn-dashboard").click(function()
{
	searchView.clearView();
	stockView.restoreView();
});

$("#btn-searchRecord").click(function()
{
	stockView.clearView();
	searchView.restoreView();
});

$("#phoneNumBtn").click(function(){
	var data = {
		fbId : FBLogin.id(), 
		fbToken : FBLogin.token(), 
	};
	
	$.post( "/getPhoneNum.php",data)
	.done(function(result) {
		$("#currPhoneNum").text("目前設定:" + result);
	})
	.fail(function(error) {
		alert( "error" );
		alert(error);	
	});	
});

$("#btnSendPhoneNum").click(function(){
	if($("#txtPhoneNum").val().length > 0)
	{
		var data = {
			fbId : FBLogin.id(), 
			fbToken : FBLogin.token(), 
			phoneNum : $("#txtPhoneNum").val(),
		};
		
		$.post( "/setPhoneNum.php",data)
		.done(function(result) {
			alert("已設定新的手機號碼");
		})
		.fail(function(error) {
			alert( "error" );
			alert(error);	
		});	
	}
});


$("#btn-Refresh").click(function(){
	$.ajax( "/forceRefresh.php")
	.done(function(result) {
		location.reload();
	})
	.fail(function(error) {
		alert( "error" );
		alert(error);	
	});
});

if(location.href == "http://65.52.189.186/")
{
	location.href = "http://webstock.eastasia.cloudapp.azure.com/";
}