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
//var api_url = "http://localhost/API_Hacienda/www/api.php";
var api_url = "https://api-demo.crlibre.org/api.php";
//var api_url = "http://192.168.0.118/API_Hacienda/www/api.php";
var api_front = "index.html";
var api_user = "";
var api_debugMode = true;
var api_title = "CRLibre.org";
var api_title_circule = "CR";
var api_favicon = 'https://crlibre.org/wp-content/uploads/2018/03/cropped-CRLibre-Logo_03-32x32.png';
var api_site_img = 'https://crlibre.org/wp-content/uploads/2018/03/cropped-CRLibre-Logo_15-1.png';

/*******************************/
/*          Loading Settings   */
/*******************************/
function bootSettings() {
//set title of the page
    document.title = api_title;
//set favicon of the site
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = api_favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
    $("#siteTitle").html(api_title);
    $("#siteTitleCircule").html(api_title_circule);
    $("#siteIMG").attr("src", api_site_img);
}



function crLibreApi_registerUser(userData, success, error) {

    var req = {
        w: "users",
        r: "users_register",
        fullName: userData.fullName,
        userName: userData.userName,
        email: userData.userEmail,
        pwd: userData.pwd,
        about: userData.about,
        country: userData.userCountry
    };
    crLibreApi_postRequest(req,
            function (d) {
                crLibreApi_setLocalStorage('userName', d.resp.userName);
                crLibreApi_setLocalStorage('sessionKey', d.resp.sessionKey);
                crLibreApi_setLocalStorage('idMasterUser', d.resp.idUser);
                var user = [];
                user.w = 'facturador';
                user.r = 'copy_master_tables';
                user.iam = localStorage.getItem('userName');
                user.sessionKey = localStorage.getItem('sessionKey');

                crLibreApi_postRequest(user,
                        function (data) {
                            if (typeof data.resp == '1') {

                            } else {
                                console.log("Error copiando tablas maestras");
                            }
                        },
                        function (data) {
                            sweetAlert({title: "Ocurrio un error en la configuracion inicial", type: "error"});
                        });

                success(d);
            }, function (d) {
        error(d);
    });
}

function crLibreApi_companny_registerUser(userData, success, error) {

    var req = {
        w: "facturador",
        r: "companny_users_register",
        fullName: userData.fullName,
        userName: userData.userName,
        email: userData.userEmail,
        pwd: userData.pwd,
        about: userData.about,
        country: userData.userCountry,
        idMasterUser: userData.idMasterUser,
        settings: userData.settings
    };
    crLibreApi_postRequest(req,
            function (d) {
                success(d);
            }, function (d) {
        error(d);
    });
}

/*********************************************/
/* Function to check login users             */
/* Req success, error                        */
/*********************************************/
function crLibreApi_checkLogin(success, error, timeout) {
    var req = {
        w: "facturador",
        r: "companny_users_getMyDetails",
        iam: localStorage.getItem('userName'),
        sessionKey: localStorage.getItem('sessionKey'),
        idMasterUser: localStorage.getItem('idMasterUser')
    }
    ;
    crLibreApi_postRequest(req,
            function (data) {
                if (data.resp != ERROR_USER_WRONG_LOGIN_INFO && data.resp != null && data.resp != ERROR_USER_ACCESS_DENIED && data.resp != ERROR_BAD_REQUEST) {
                    if (success != null) {
                        crLibreApi_debug("It seems we are logged in as " + data.resp.userName);
                        api_user = data.resp.userName;
                        success(data);
                    }
                } else {
                    if (error != null) {
                        error(data);
                    } else {
                        iGoTo("./user_login.html");
                    }
                }
            },
            function () {
                crLibreApi_debug("Exec error func");
                if (error != null) {
                    error();
                }
            },
            function () {
                crLibreApi_debug("Exec callback func");
                if (timeout != null) {
                    timeout();
                }
            });
}

function crLibreApi_checkAdminLogin(success, error, timeout) {
    var req = {
        w: "users",
        r: "users_get_my_details",
        iam: localStorage.getItem('userName'),
        sessionKey: localStorage.getItem('sessionKey')
    }
    ;
    crLibreApi_postRequest(req,
            function (data) {
                if (data.resp != ERROR_USER_WRONG_LOGIN_INFO && data.resp != ERROR_USER_ACCESS_DENIED && data.resp != ERROR_BAD_REQUEST) {
                    if (success != null) {
                        crLibreApi_debug("It seems we are logged in as " + data.resp.userName);
                        api_user = data.resp.userName;
                        success(data);
                    }
                } else {
                    if (error != null) {
                        error(data);
                    }
                }
            },
            function () {
                crLibreApi_debug("Exec error func");
                if (error != null) {
                    error();
                }
            },
            function () {
                crLibreApi_debug("Exec callback func");
                if (timeout != null) {
                    timeout();
                }
            });
}

/*********************************************/
/* Function set local storage                */
/* Req key, value                            */
/*********************************************/
function crLibreApi_setLocalStorage(k, v) {
    crLibreApi_debug("Saving in storage K: " + k + " V: " + v);
    localStorage.setItem(k, v);
}

/*********************************************/
/* Function set local storage                */
/* Req key                                   */
/* Return value                              */
/*********************************************/
function crLibreApi_getLocalStorage(k) {
    var v = window.localStorage.getItem(k);
    crLibreApi_debug("Getting from storage K: " + k + " GOT: " + v);
    return v;
}

/*********************************************/
/* Function to create users                   */
/* Req userData, func success, func error    */
/*********************************************/
function crLibreApi_login(userData, success, error) {
    var req = {
        w: "users",
        r: "users_log_me_in",
        userName: userData.userName,
        pwd: userData.pwd
    };
    crLibreApi_postRequest(req,
            function (data) {
                if (data.resp != ERROR_USER_WRONG_LOGIN_INFO) {
                    crLibreApi_setLocalStorage('idMasterUser', data.resp.idUser);
                    crLibreApi_setLocalStorage('userName', data.resp.userName);
                    crLibreApi_setLocalStorage('sessionKey', data.resp.sessionKey);

                    if (success != null) {
                        success(data);
                    }
                } else {
                    if (error != null) {
                        error(data);
                    }
                }
            },
            function (data) {
                if (error != null) {
                    error(data);
                }
            });
}

function crLibreApi_companny_login(userData, success, error) {
    var req = {
        w: "facturador",
        r: "companny_users_logMeIn",
        userName: userData.userName,
        pwd: userData.pwd,
        idMasterUser: userData.idMasterUser
    };
    crLibreApi_postRequest(req,
            function (data) {
                if (data.resp != ERROR_USER_WRONG_LOGIN_INFO) {
                    crLibreApi_setLocalStorage('userName', data.resp.userName);
                    crLibreApi_setLocalStorage('sessionKey', data.resp.sessionKey);

                    if (success != null) {
                        success(data);
                    }
                } else {
                    if (error != null) {
                        error(data);
                    }
                }
            },
            function (data) {
                if (error != null) {
                    error(data);
                }
            });
}

/*********************************************/
/* Function to make post reqs                */
/* Req request data, func success, func error*/
/*********************************************/
function crLibreApi_postRequest(req, success, error, timeout = 8000, times = 0) {
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
    oReq.onload = function (oEvent) {
        if (oReq.status == 200) {
            var r = oReq.responseText;
            console.log(r);
            r = JSON.parse(r);
            success(r);
            crLibreApi_debug("Done!");
        } else {
            var r = oReq.responseText;
            crLibreApi_debug("There was an error");
            error(r);
        }
    };
    oReq.ontimeout = function (e) {
        times = times + 1;
        if (times < 3) {
            crLibreApi_postRequest(req, success, error, timeout, times);
            crLibreApi_debug("Timeout " + times + ", lets try again");
        } else {
            crLibreApi_doSomethingAfter(function () {
                crLibreApi_debug("Timeout does not work, retrying in a sec");
                crLibreApi_postRequest(req, success, error, timeout, 0);
                crLibreApi_debug("Function called...");
            }, 3000);
        }
    }
    oReq.send(_data);
}


/*********************************************/
/* Function to make post reqs                */
/* Req request data, func success, func error*/
/*********************************************/
function crLibreApi_postRequestFormData(req, success, error, timeout = 8000, times = 0) {
    crLibreApi_debug("Making a post request to " + api_url);
    /*generate the form*/
    var _data = new FormData();
    _data = req;
    _data.append("iam", crLibreApi_getLocalStorage('userName'));
    _data.append("sessionKey", crLibreApi_getLocalStorage('sessionKey'));
    var oReq = new XMLHttpRequest();
    oReq.open("POST", api_url, true);
    oReq.timeout = timeout;
    oReq.onload = function (oEvent) {
        if (oReq.status == 200) {
            var r = oReq.responseText;
            console.log(r);
            r = JSON.parse(r);
            success(r);
            crLibreApi_debug("Done!");
        } else {
            var r = oReq.responseText;
            crLibreApi_debug("There was an error");
            error(r);
        }
    };
    oReq.ontimeout = function (e) {
        times = times + 1;
        if (times < 3) {
            crLibreApi_postRequest(req, success, error, timeout, times);
            crLibreApi_debug("Timeout " + times + ", lets try again");
        } else {
            crLibreApi_doSomethingAfter(function () {
                crLibreApi_debug("Timeout does not work, retrying in a sec");
                crLibreApi_postRequest(req, success, error, timeout, 0);
                crLibreApi_debug("Function called...");
            }, 3000);
        }
    }
    oReq.send(_data);
}


function crLibreApi_debug(msg) {
    if (api_debugMode) {
        console.log("[crLibreApi] >> " + msg);
    }

}

/**************************************************/
/*Función para enviar a hacienda                  */
/**************************************************/
function crLibreApi_send(data, success, error) {

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
function crLibreApi_signXML(data, success, error) {
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
function crLibreApi_sendTE(data, success, error) {
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
function crLibreApi_send(data, success, error) {
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
function crLibreApi_consultar(data, success, error) {
    var req = {
        w: "consultar",
        r: "consultarCom",
        clave: data.clave,
        token: data.token
    };
    crLibreApi_postRequest(req, success, error);
}
