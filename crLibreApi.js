/*******************************/
/*            CONS             */
/*******************************/

// Users
var ERROR_NO_VALID_USER = "-300";
var ERROR_USER_WRONG_LOGIN_INFO = "-301";
var ERROR_USER_NO_VALID_SESSION = "-302"; // Not in use I think
var ERROR_USER_ACCESS_DENIED = "-303";
var ERROR_USER_EXISTS = "-304";

//Database
var ERROR_DB_NO_RESULTS_FOUND = "-200";
var ERROR_BAD_REQUEST = "-1";

var DEFAULT_INIT;
/*******************************/
/*          Settings           */
/*******************************/
var api_url = "https://sapiens.ticoteccr.com/api.php";
var api_front = "index.html";

var api_user = "";
var api_debugMode = true;


function crLibreApi_registerUser(userData, success, error){
    
    var req = {
        w: "users",
        r: "users_register",
        fullName: userData.fullName,
        userName: userData.userName,
        email: userData.userEmail,
        pwd: userData.pwd,
        about: "--",
        country: userData.userCountry
    };
    
    sapiensApi_postRequest(req, 
        function(d){
            sapiensApi_setLocalStorage('userName', d.resp.userName);   
            sapiensApi_setLocalStorage('sessionKey', d.resp.sessionKey); 
            success(d);
        }, function(d){
            error(d);
        });
}

/*********************************************/
/* Function to check login users             */
/* Req success, error                        */
/*********************************************/
function crLibreApi_checkLogin(success, error, timeout){
    var req = {
        w: "users",
        r: "users_get_my_details"
    };
    
    sapiensApi_postRequest(req, 
    function(data){
        if(data.resp != ERROR_USER_WRONG_LOGIN_INFO && data.resp != ERROR_USER_ACCESS_DENIED){
            if(success != null){
                sapiensApi_debug("It seems we are logged in as " + data.resp.userName);
                api_user = data.resp.userName;
                success(data);
            }
        }else{
            if(error != null){
                error(data);
            }
        }
    },
    function(){
        sapiensApi_debug("Exec error func");
        if(error != null){
            error();
        }
    },
    function(){
        sapiensApi_debug("Exec callback func");
        if(timeout != null){
            timeout();
        }
    });
}

/*********************************************/
/* Function set local storage                */
/* Req key, value                            */
/*********************************************/
function crLibreApi_setLocalStorage(k, v){
    crLibreApi_debug("Saving in storage K: " + k + " V: " + v);
    localStorage.setItem(k, v);
}

/*********************************************/
/* Function set local storage                */
/* Req key                                   */
/* Return value                              */
/*********************************************/
function crLibreApi_getLocalStorage(k){
    var v = localStorage.getItem(k);
    crLibreApi_debug("Getting from storage K: " + k + " GOT: " + v);
    return v;
}

/*********************************************/
/* Function to create users                   */
/* Req userData, func success, func error    */
/*********************************************/
function crLibreApi_login(userData, success, error){
 var req = {
            w: "users",
            r: "users_log_me_in",
            userName: userData.userName,
            pwd: userData.pwd
        };
        
 sapiensApi_postRequest(req, 
    function(data){
        if(data.resp != ERROR_USER_WRONG_LOGIN_INFO){
            crLibreApi_setLocalStorage('userName', data.resp.userName);   
            crLibreApi_setLocalStorage('sessionKey', data.resp.sessionKey); 
            if(success != null){
                success(data);
            }
        }else{
            if(error != null){
                error(data);
            }
        }
    },
    function(data){
        if(error != null){
            error(data);
        }
    });
}

/*********************************************/
/* Function to make post reqs                */
/* Req request data, func success, func error*/
/*********************************************/
function crLibreApi_postRequest(req, success, error, timeout = 800, times = 0){
    sapiensApi_debug("Making a post request to " + api_url);
    /*generate the form*/
    var _data = new FormData();
    
    for (var key in req) {
        var value = req[key];
        sapiensApi_debug("Adding " + key + " -> " + value);
        _data.append(key, value);
    }   

    _data.append("iam", sapiensApi_getLocalStorage('userName'));
    _data.append("sessionKey", sapiensApi_getLocalStorage('sessionKey'));

    var oReq = new XMLHttpRequest();
    oReq.open("POST", api_url, true);
    
    oReq.timeout = timeout;
    
    oReq.onload = function(oEvent) {
        if(oReq.status == 200) {
            var r = oReq.responseText;
            console.log(r);
            r = JSON.parse(r);
            success(r);
            sapiensApi_debug("Done!");
        }else{
            var r = oReq.responseText;
            sapiensApi_debug("There was an error");
            error(r);
        }
    };
    
    oReq.ontimeout = function(e){
        times++;
        if(times < 3){
            sapiensApi_postRequest(req, success, error, timeout, (times++));
            sapiensApi_debug("Timeout " + times + ", lets try again");
        }else{
            sapiens_doSomethingAfter(function(){
                sapiensApi_debug("Timeout does not work, retrying in a sec");
                sapiensApi_postRequest(req, success, error, timeout, 0);
                sapiensApi_debug("Function called...");
            }, 3000);
        }
    }
    oReq.send(_data);
}

function crLibreApi_debug(msg){
    if(api_debugMode){
        console.log("[crLibreApi] >> " + msg);
    }
    
}