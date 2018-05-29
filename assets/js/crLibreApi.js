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
var api_url = "https://api-demo.crlibre.org/api.php";
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
    
    crLibreApi_postRequest(req, 
        function(d){
            crLibreApi_setLocalStorage('userName', d.resp.userName);   
            crLibreApi_setLocalStorage('sessionKey', d.resp.sessionKey); 
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
    
    crLibreApi_postRequest(req, 
    function(data){
        if(data.resp != ERROR_USER_WRONG_LOGIN_INFO && data.resp != ERROR_USER_ACCESS_DENIED){
            if(success != null){
                crLibreApi_debug("It seems we are logged in as " + data.resp.userName);
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
        crLibreApi_debug("Exec error func");
        if(error != null){
            error();
        }
    },
    function(){
        crLibreApi_debug("Exec callback func");
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
    var v = window.localStorage.getItem(k);
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
        
 crLibreApi_postRequest(req, 
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
    crLibreApi_debug("Making a post request to " + api_url);
    /*generate the form*/
    var _data = new FormData();
    
    for (var key in req) {
        var value = req[key];
        crLibreApi_debug("Adding " + key + " -> " + value);
        _data.append(key, value);
    }   

    _data.append("iam", crLibreApi_getLocalStorage('userName'));
    _data.append("sessionKey", crLibreApi_getLocalStorage('sessionKey'));

    var oReq = new XMLHttpRequest();
    oReq.open("POST", api_url, true);
    
    oReq.timeout = timeout;
    
    oReq.onload = function(oEvent) {
        if(oReq.status == 200) {
            var r = oReq.responseText;
            console.log(r);
            r = JSON.parse(r);
            success(r);
            crLibreApi_debug("Done!");
        }else{
            var r = oReq.responseText;
            crLibreApi_debug("There was an error");
            error(r);
        }
    };
    
    oReq.ontimeout = function(e){
        times++;
        if(times < 3){
            crLibreApi_postRequest(req, success, error, timeout, (times++));
            crLibreApi_debug("Timeout " + times + ", lets try again");
        }else{
            sapiens_doSomethingAfter(function(){
                crLibreApi_debug("Timeout does not work, retrying in a sec");
                crLibreApi_postRequest(req, success, error, timeout, 0);
                crLibreApi_debug("Function called...");
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

/**************************************************/
/*Función para enviar a hacienda                  */
/**************************************************/
function crLibreApi_send(data, success, error){
    
    var req = {
        w: "send",
        r: "sendMensaje",
        token: data.token,
        clave: data.clave,
        fecha: data.fecha,
        emi_tipoIdentificacion: data.tipoIdentifEmisor,
        emi_numeroIdentificacion: data.numIdentifEmisor,
        recp_tipoIdentificacion: data.tipoIdentifRec,
        recp_numeroIdentificacion: data.numIdentifRec,
        consecutivoReceptor: data.consecutivo,
        comprobanteXml: data.XML
    };
    crLibreApi_postRequest(req, success, error);
}

/**************************************************/
/*Función para firmar XML                         */
/**************************************************/
function crLibreApi_signXML(data, success, error){
    var req = {
        w: "signXML",
        r: "signFE",
        p12Url: data.p12Url,
        inXml: data.inXml,
        tipodoc: data.tipodoc
    };
    crLibreApi_postRequest(req, success, error);
}

/**************************************************/
/*Función para enviar a Haciena Solamente TE      */
/**************************************************/
function crLibreApi_sendTE(data, success, error){
    var req = {
        w: "send",
        r: "send",
        token: data.token,
        clave: data.clave,
        fecha: data.fecha,
        emi_tipoIdentificacion: data.emi_tipoIdentificacion,
        emi_numeroIdentificacion: data.emi_numeroIdentificacion,
        comprobanteXml: data.comprobanteXml
    };
    crLibreApi_postRequest(req, success, error);
}

/**************************************************/
/*Función para enviar a Haciena FA, NC, ND        */
/**************************************************/
function crLibreApi_send(data, success, error){
   var req = {
        w: "send",
        r: "json",
        token: data.token,
        clave: data.clave,
        fecha: data.fecha,
        emi_tipoIdentificacion: data.emi_tipoIdentificacion,
        emi_numeroIdentificacion: data.emi_numeroIdentificacion,
        recp_tipoIdentificacion: data.recp_tipoIdentificacion,
        recp_numeroIdentificacion: data.recp_numeroIdentificacion,
        comprobanteXml: data.comprobanteXml
    };
    crLibreApi_postRequest(req, success, error);
}

/**************************************************/
/*Función para consultar comprobantes             */
/**************************************************/
function crLibreApi_consultar(data, success, error){
    var req = {
        w: "consultar",
        r: "consultarCom",
        clave: data.clave,
        token: data.token
    };
    crLibreApi_postRequest(req, success, error);
    
}
