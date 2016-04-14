window.fbAsyncInit = function() {
	FB.init({
	  appId      : '581815025308588',
	  cookie     : true,
	  xfbml      : true,
	  version    : 'v2.5'
	});
	CheckLoginState();
};

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "//connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function fbLogin(){
	FB.getLoginStatus(function(r){ //check if user already authorized the app
		 if(r.status === 'connected'){
			CheckLoginState();
		 }else{
			FB.login(function(response) { // opens the login dialog
			CheckLoginState();
			},{scope:''}); //permission required by the app
		}
	});
}

function fbLogout()
{
	FB.logout(function(response) {
		CheckLoginState();
	});
}

function CheckLoginState()
{
	FB.getLoginStatus(function(r){ //check if user already authorized the app
		if(r.status === 'connected'){
			$("#loginBtn").attr("data-toggle","dropdown");
			$("#loginBtn").unbind("click");

			FB.api('/me', function(response) {
			  $("#loginBtn").find("i").text(" " + response.name + " ");
			});
			
			$("#logoutBtn").unbind("click");
			$("#logoutBtn").click(fbLogout);
			FBLogin.Login(r);
		}else{
			
			$("#loginBtn").attr("data-toggle","");
			$("#loginBtn").click(fbLogin);
			$("#loginBtn").find("i").text(" " + Login + " ");
			FBLogin.LoginOut(r);
		}
	});
}
	
var FBLogin = function()
{
	var fbId = "";
	var fbToken = "";
	var login = false;
	var expiresIn;
	var signedRequest = "";
	var loginChecked = false;
	var callbacks = [];
	
	return {
		isLogin : function(){return login;},
		id : function(){return fbId;},
		token : function(){return fbToken;},
		Login : function(r){
			login = true;
			fbToken = r.authResponse.accessToken
			fbId = r.authResponse.userID
			expiresIn = r.authResponse.expiresIn;
			signedRequest = r.authResponse.signedRequest;
			for(var i = 0; i < callbacks.length; i++)
			{
				callbacks[i]();
			}
		},
		Logout : function(){
			fbId = "";
			fbToken = "";
			login = false;
		},
		addOnLogin : function(callback) {
			if (callbacks.indexOf(callback) < 0) {
				callbacks.push(callback);
			}
		},
		removeOnLogin : function removeCallback(callback) {
			var index;
			if ((index = callbacks.indexOf(callback)) >= 0) {
				callbacks.splice(index, 1);
			}
		}
	}
}();