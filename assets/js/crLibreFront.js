//Esta variable es para guardar el xmlFirmado y luedo poder descargarlo
var descargaXMLFirmado = "";
var descargaXMLClave = "";

function crLibreFront_boot() {
    crLibreApi_checkLogin(function () {
        crLibreFront_debug("Logueado");
        //Menu principal
        crLibreFront_menuScreen();
    }, function () {
        crLibreFront_debug("No logueado");
        //Ventana de login
        crLibreFront_loginScreen();
    });
}

function crLibreFront_loginScreen() {
//Login screen
    var loginScreen = "html";
    crLibreFront_setContent(loginScreen);
}

function crLibreFront_menuScreen() {
//Login screen
    var loginScreen = "html";
    crLibreFront_setContent(loginScreen);
}


/**********************************/
/*Function to set content         */
/**********************************/
function crLibreFront_setContent(c) {
    $('#crlibre_content').empty();
    $('#crlibre_content').append(c);
}

/**********************************/
/*Check if is LogedIn         */
/**********************************/
function checkUserLogin() {
    crLibreApi_checkLogin(function (data) {
        console.log(data);

    },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                iGoTo("./user_login.html");
            });
}

/**********************************/
/*Check if Admin is LogedIn         */
/**********************************/
function checkAdminLogin() {
    crLibreApi_checkAdminLogin(function (data) {
        console.log(data);
    },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                iGoTo("login.html");
            });
}

function crLibreFront_debug(d) {
    console.log("[crLibreFront] >> " + d);
}

/************************************/
/*Inicio de Funciones del Facturador*/
/************************************/


// I will redirect somewhere
function iGoTo(goTo) {
    $("body").hide();
    window.location.href = goTo;
}

function crLibreApi_logIn_call() {

    var user = [];
    user.userName = $("#username").val();
    user.pwd = $("#password").val();
    crLibreApi_login(user,
            function (data) {
                sweetAlert({title: "Bienvenido!", text: "Bienvenido al sistema\n" + data.userName, type: "success"});
                iGoTo("general.html");
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}

function crLibreApi_companny_logIn_call() {

    var user = [];
    user.userName = $("#username").val();
    user.pwd = $("#password").val();
    user.idMasterUser = $("#idMasterUser").val();

    crLibreApi_companny_login(user,
            function (data) {
                crLibreApi_setLocalStorage('idMasterUser', $("#idMasterUser").val());
                var user = [];
                user.w = 'facturador';
                user.r = 'companny_getMyInfo';
                user.iam = localStorage.getItem('userName');
                user.sessionKey = localStorage.getItem('sessionKey');
                user.idMasterUser = localStorage.getItem('idMasterUser');
                crLibreApi_postRequest(user,
                        function (data) {
                            if (typeof data.resp == 'object') {
                                for (i = 0; i < data.resp.length; i++) {
                                    crLibreApi_setLocalStorage('terminal', data.resp[i].terminal);
                                    crLibreApi_setLocalStorage('nombreSucursal', data.resp[i].nombreTerminal);
                                    crLibreApi_setLocalStorage('sucursal', data.resp[i].sucursal);
                                    crLibreApi_setLocalStorage('nombreTerminal', data.resp[i].nombreTerminal);
                                    iGoTo("mh_comprobantes.html");
                                }
                            } else {
                                console.log("Error recuperando los clientes");
                            }
                        },
                        function (data) {
                            sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
                        });


            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}


//This is just to make a test traying to get a token.
function crLibreApi_test() {
    var clien_id = $("#client_id").val();
    var user = [];
    user.w = 'facturador';
    if (clien_id == 'api-stag') {
        user.r = 'get_stag_credentials';
    } else if (clien_id == 'api-prod') {
        user.r = 'get_prod_credentials';
    }
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    getToken(data.resp[0].value, data.resp[1].value, clien_id);
                } else {
                    console.log("Error recuperando las credenciales");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error recuperando las credenciales", type: "error"});
            });
}

function crLibreApi_consultaClave() {
    var clien_id = $("#client_id").val();
    var user = [];
    user.w = 'facturador';
    if (clien_id == 'api-stag') {
        user.r = 'get_stag_companny_credentials';
    } else if (clien_id == 'api-prod') {
        user.r = 'get_prod_companny_credentials';
    }
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    var user = [];
                    user.username = data.resp[0].value;
                    user.password = data.resp[1].value;
                    user.w = 'token';
                    user.r = 'gettoken';
                    user.grant_type = 'password';
                    user.client_id = $("#client_id").val();
                    crLibreApi_postRequest(user,
                            function (data) {
                                var token = data.resp.access_token;
                                console.log("mhToken: " + token);
                                var user = [];
                                user.w = 'consultar';
                                user.r = 'consultarCom';
                                user.token = token;
                                user.clave = $("#mh_clave").val();
                                user.client_id = $("#client_id").val();
                                crLibreApi_postRequest(user,
                                        function (data) {
                                            if (data.resp === null) {
                                                sweetAlert({title: "Hacienda no respondio la consulta!", text: "No se tiene respuesta al comprobante, es posible que hacienda nunca lo recibiera.", type: "error"});
                                            } else {
                                                if (data.resp['ind-estado'] === "aceptado") {
                                                    console.log("Clave=>" + data.resp.clave);
                                                    console.log("Fecha=>" + data.resp.fecha);
                                                    sweetAlert({title: "Hacienda Exitosa!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp['ind-estado'], type: "success"});
                                                } else if (data.resp['ind-estado'] === "rechazado") {
                                                    sweetAlert({title: "Hacienda Rechazado!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp['ind-estado'], type: "error"});
                                                } else {
                                                    sweetAlert({title: "Hacienda sin respuesta!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp[2], type: "error"});
                                                }
                                            }
                                        },
                                        function (data) {
                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                        });
                            },
                            function (data) {
                                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                            });

                } else {
                    console.log("Error recuperando las credenciales");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error recuperando las credenciales", type: "error"});
            });
}





function crLibreApi_get_is_env_prod() {

    var user = [];
    user.w = 'facturador';
    user.r = 'company_get_env';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    if (data.resp[0].env === "api-stag") {
                        $("input[name='bootstrap-switch']").bootstrapSwitch('state', false);
                    } else if (data.resp[0].env === "api-prod") {
                        $("input[name='bootstrap-switch']").bootstrapSwitch('state', true);
                    }
                } else {
                    console.log("Error cambiando el env");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando el entorno de facturacion", type: "error"});
            });
}


//This is just to change env into api-stag or api-prod
function crLibreApi_change_env(envProduccion) {
    var env;
    var user = [];
    user.w = 'facturador';
    user.r = 'company_change_env';
    user.envProduccion = envProduccion;
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    if (envProduccion) {
        env = "produccion";
    } else {
        env = "pruebas";
    }
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == 'ok') {
                    sweetAlert({title: "Entorno!", text: "El sistema esta en un entordo de " + env, type: "success"});
                } else {
                    console.log("Error cambiando el env");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cambiando el entorno", type: "error"});
            });
}
function crLibreApi_addInventaryProduct() {
    var env;
    var user = [];
    user.w = 'facturador';
    user.r = 'addInventaryProduct';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.nombre = $("#nombre").val();
    user.descripcion = $("#descripcion").val();
    user.unidadMedida = $("#unidadMedida").val();
    user.precioVenta = $("#precioVenta").val();
    user.idImpuesto = $("#idImpuesto").val();
    user.cantidadImpuesto = $("#cantidadImpuesto").val();
    user.codigoBarras = $("#codigoBarras").val();
    user.disponible = $("#disponible").val();
    user.sucursal = localStorage.getItem('sucursal');

    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Registro Exitoso!", text: "Se guardo con exito el producto" + env, type: "success"});
                } else {
                    console.log("Error registrando producto");
                    sweetAlert({title: "Error Registrando Producto", text: "Favor verificar los campos o que el codigo de barras no este registrado", type: "error"});
                }
            },
            function (data) {
                sweetAlert({title: "Error Registrando Producto", type: "error"});
            });
}

//this function get the token in the seet alert
function getToken(userName, pass, client_id, success) {

    var user = [];
    user.w = 'token';
    user.r = 'gettoken';
    user.grant_type = 'password';
    user.username = userName;
    user.password = pass;
    user.client_id = client_id;
    crLibreApi_postRequest(user,
            function (data) {
                success;
                sweetAlert({title: "Conexion a Hacienda Exitosa!", text: "Respuesta\nToken en " + client_id + ":\n" + data.resp.access_token, type: "success"});
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}

/*
 * Get all types of ids
 */
function crLibreApi_getTypeOfId(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'get_type_of_id';
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].codigo + '">' + data.resp[i].descripcion + '</option>');
                    }
                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}


function crLibreApi_getSucursal(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'get_type_of_id';
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].codigo + '">' + data.resp[i].descripcion + '</option>');
                    }
                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}
/*
 * Get all Provinces in Select options
 */
function crLibreApi_getAllProvinces(selectID) {

    var user = [];
    user.w = 'facturador';
    user.r = 'get_all_privinces';
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idProvincia + '">' + data.resp[i].nombreProvincia + '</option>');
                    }
                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}

/*
 *This function get all your receiver by your userName and your sessionkey  
 */
function crLibreApi_getAllReceiver(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'get_active_receiver';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<tr><td>' + data.resp[i].nombreCliente + '</td><td>' + data.resp[i].correoPrincipal + '</td><td>' + data.resp[i].nombreProvincia + '</td><td>' + data.resp[i].telefono + '</td><td>' + data.resp[i].tipoCedula + '</td><td>' + data.resp[i].numeroCedula + '</td><td><button value="' + data.resp[i].idReceptor + '" onclick="addRow($(this).val());"class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idReceptor + '" onclick="crLibreApi_deleteReciver($(this).val());" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                    }
                } else {
                    console.log("Error recuperando los clientes");
                }
                $('#data-table').dataTable();
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });
}


function crLibreApi_AllReceiverCB(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'get_active_receiver';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idReceptor + '">' + data.resp[i].nombreCliente + '</option>');
                    }
                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });
}


function crLibreApi_add_sucursal() {
    var user = [];
    user.w = 'facturador';
    user.r = 'addSucursales';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.numeroSucursal = $("#numeroSucursal").val();
    user.nombreSucursal = $("#nombreSucursal").val();

    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Se creo correctamente la sucursal", type: "success"});
                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error creando la sucursal", type: "error"});
            });
}

function crLibreApi_add_terminal() {
    var user = [];
    user.w = 'facturador';
    user.r = 'add_terminal';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.numeroTerminal = $("#numeroTerminal").val();
    user.nombreTerminal = $("#nombreTerminal").val();
    user.idSucursal = $("#idSucursal").val();

    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Se creo correctamente la terminal", type: "success"});
                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error creando la terminal", type: "error"});
            });
}

/*
 *This function get all your receiver by your userName and your sessionkey  
 */
function crLibreApi_getVouchers(selectID) {
    var client_id;

    var user = [];
    user.w = 'facturador';
    user.r = 'company_get_env';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    client_id = data.resp[0].env;
                    var user = [];
                    user.w = 'facturador';
                    user.r = 'get_vouchers';
                    user.iam = localStorage.getItem('userName');
                    user.sessionKey = localStorage.getItem('sessionKey');
                    user.idMasterUser = localStorage.getItem('idMasterUser');
                    user.env = client_id;
                    $("#" + selectID).empty();
                    crLibreApi_postRequest(user,
                            function (data) {
                                if (typeof data.resp == 'object') {
                                    for (i = 0; i < data.resp.length; i++) {
                                        //  $("#" + selectID).append('<tr><td>' + data.resp[i].consecutivo + '</td><td>' + data.resp[i].clave + '</td><td>' + data.resp[i].tipoDocumento + '</td><td>' + data.resp[i].estado + '</td><td>' + data.resp[i].fechaCreacion + '</td><td><button value="' + data.resp[i].idComprobante + '" onclick="addRow($(this).val());"class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idComprobante + '" onclick="crLibreApi_deleteReciver($(this).val());" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                                        $("#" + selectID).append('<tr><td>' + data.resp[i].consecutivo + '</td><td>' + data.resp[i].clave + '</td><td>' + data.resp[i].tipoDocumento + '</td><td>' + data.resp[i].fechaCreacion + '</td><td><button value="' + data.resp[i].idComprobante + '" onclick="addRow($(this).val());"class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idComprobante + '" onclick="" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                                    }
                                } else {
                                    console.log("Error recuperando los clientes");
                                }
                                $('#data-table').dataTable();
                            },
                            function (data) {
                                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
                            });


                } else {
                    console.log("Error cambiando el env");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando el entorno de facturacion", type: "error"});
            });


}

function crLibreApi_get_inventory(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'get_inventory';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem("idMasterUser");
    user.sucursal = localStorage.getItem("sucursal");
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<tr><td>' + data.resp[i].codigoBarras + '</td><td>' + data.resp[i].nombre + '</td><td>' + data.resp[i].unidadMedida + '</td><td>' + data.resp[i].precioVenta + '</td><td>' + data.resp[i].disponible + '</td><td><button value="' + data.resp[i].idProducto + '" onclick="" class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idReceptor + '" onclick="" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                    }
                } else {
                    console.log("Error recuperando los clientes");
                }
                $('#data-table').dataTable();
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });
}

function crLibreApi_deleteReciver(idReceptor) {
    swal({
        title: "Desea eliminar el cliente?",
        text: "Si elimina el cliente no lo podra recuperar nunca mas!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Si, estoy seguro!',
        cancelButtonText: "No, Cancelar!",
        closeOnConfirm: false,
        closeOnCancel: false
    }, function (isConfirm) {

        if (isConfirm) {
            deleteClient(idReceptor);
        } else {
            swal("Cancelled", "Your imaginary file is safe :)", "error");
        }
    });
}

function compannyUpdateTipoCambio() {
    var user = [];
    user.w = 'facturador';
    user.r = 'compannyUpdateTipoCambio';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.tipoCambio = $("#tipoCambio").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Tipo Cambio actualizado", type: "success"});
                    crLibreApi_getCompannyInformationAdmin();

                } else {
                    console.log("Error actualizando tipo de cambio");
                }

            },
            function (data) {
                sweetAlert({title: "Ocurrio un error actualizando el tipo de cambio", type: "error"});
            });
}
function compannyUpdateLocation() {
    var user = [];
    user.w = 'facturador';
    user.r = 'compannyUpdateLocation';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.idProvincia = $("#provinceSelect").val();
    user.idCanton = $("#cantonSelect").val();
    user.idDistrito = $("#distritoSelect").val();
    user.idBarrio = $("#barrioSelect").val();
    user.sennas = $("#otrasSenas").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Se actualizo la ubicacion", type: "success"});
                    crLibreApi_getCompannyInformationAdmin();

                } else {
                    console.log("Error actualizando ubicacion");
                }

            },
            function (data) {
                sweetAlert({title: "Ocurrio un error actualizando la ubicacion", type: "error"});
            });
}
function compannyUpdateInformation() {
    var user = [];
    user.w = 'facturador';
    user.r = 'compannyUpdateInformation';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.nombre = $("#modalNombre").val();
    user.nombreComercial = $("#modalNombreComercial").val();
    user.email = $("#modalCorreo").val();
    user.codigoPais = $("#modalCodigoPais").val();
    user.telefono = $("#modalTelefono").val();
    user.fax = $("#modalFax").val();

    if ($("#typeIdSelect").val() === 'fisico') {
        user.tipoCedula = '01';
    } else if ($("#typeIdSelect").val() === 'juridico') {
        user.tipoCedula = '02';
    } else if ($("#typeIdSelect").val() === 'dimex') {
        user.tipoCedula = '03';
    } else if ($("#typeIdSelect").val() === 'nite') {
        user.tipoCedula = '04';
    } else if ($("#typeIdSelect").val() === 'extragero') {
        user.tipoCedula = '';
    }

    user.cedula = $("#modalCedula").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Se actualizo la informacion", type: "success"});
                    crLibreApi_getCompannyInformationAdmin();

                } else {
                    console.log("Error actualizando informacion");
                }

            },
            function (data) {
                sweetAlert({title: "Ocurrio un error actualizando la informacion", type: "error"});
            });
}


function deleteClient(idReceptor) {
    var user = [];
    user.w = 'facturador';
    user.r = 'delete_reciver';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idReceptor = idReceptor;
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    sweetAlert({title: "Cliente Eliminado", type: "success"});
                    crLibreApi_getAllReceiver("tableBody");
                } else {
                    console.log("Error eliminando el cliente");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error eliminando el cliente", type: "error"});
            });
}





function crLibreApi_getCanton(idProvince, selectID) {

    var user = [];
    user.w = 'facturador';
    user.r = 'get_cantons';
    user.idProvince = idProvince;
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idCanton + '">' + data.resp[i].nombreCanton + '</option>');
                    }
                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}


function crLibreApi_getSucursal(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getSucursales';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<tr><td>' + data.resp[i].nombreSucursal + '</td><td>' + data.resp[i].sucursal + '</td><td><button value="' + data.resp[i].idSucursal + '" onclick="" class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idSucursal + '" onclick="" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                    }
                } else {
                    console.log("Error recuperando los clientes");
                }
                $('#data-table').dataTable();
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });

}

function crLibreApi_getSucursalCB(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getSucursales';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {

                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idSucursal + '">' + data.resp[i].nombreSucursal + "-" + data.resp[i].sucursal + '</option>');
                    }

                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });

}

function crLibreApi_getTipoImpuestoCB(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'get_tipo_impuesto';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {

                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idImpuesto + '">' + data.resp[i].Descripcion + '</option>');
                    }

                } else {
                    console.log("Error recuperando los tipos impuesto");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los tipos de impuesto", type: "error"});
            });

}
function crLibreApi_getUnidCB(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getUnid';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {

                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].simbolo + '">' + data.resp[i].simbolo + '</option>');
                    }

                } else {
                    console.log("Error recuperando los tipos impuesto");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los tipos de impuesto", type: "error"});
            });

}

function crLibreApi_getTerminalesCB(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getTerminales';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idSucursal = $("#idSucursal").val();
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idTerminal + '">' + data.resp[i].nombreTerminal + "-" + data.resp[i].terminal + '</option>');
                    }
                } else {
                    console.log("Error recuperando las terminales");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las terminales", type: "error"});
            });

}



function crLibreApi_getTerminales(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getTerminales';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<tr><td>' + data.resp[i].nombreTerminal + '</td><td>' + data.resp[i].terminal + '</td><td>' + data.resp[i].nombreSucursal + '</td><td>' + data.resp[i].sucursal + '</td><td><button value="' + data.resp[i].idTerminal + '" onclick="" class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idTerminal + '" onclick="" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                    }
                } else {
                    console.log("Error recuperando los clientes");
                }
                $('#data-table').dataTable();
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });

}



function rowSetValue(row, value) {
    idRow = ($(row).closest('tr')[0].rowIndex);
    $('#tabla tr:eq(' + idRow + ') td :input:enabled:visible:first').val(value);
}


function crLibreApi_getProduct(row) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getProductByCode';
    user.codigo = $("#code" + row).val();
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.sucursal = localStorage.getItem('sucursal');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#unidad" + row).val(data.resp[i].unidadMedida);
                        $("#precio" + row).val(parseInt(data.resp[i].precioVenta));
                        $("#iv" + row).val(data.resp[i].cantidadImpuesto);
                        $("#idIV" + row).val(data.resp[i].codigo);
                        $("#code" + row).val(data.resp[i].descripcion);
                        crLibreApi_formUpdate();

                    }
                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });

}


function crLibreApi_getUsersCompanny(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getUsersCompanny';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<tr><td>' + data.resp[i].fullName + '</td><td>' + data.resp[i].email + '</td><td>' + data.resp[i].country + '</td><td>' + data.resp[i].nombreTerminal + '</td><td>' + data.resp[i].terminal + '</td><td>' + data.resp[i].nombreSucursal + '</td><td>' + data.resp[i].sucursal + '</td><td><button value="' + data.resp[i].idUser + '" onclick="addRow($(this).val());"class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idTerminal + '" onclick="" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                    }
                } else {
                    console.log("Error recuperando los roles");
                }
                $('#data-table').dataTable();
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });

}

function crLibreApi_getUsersRol(selectID) {
    var user = [];
    user.w = 'facturador';
    user.r = 'getUserPermissionById';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<tr><td>' + data.resp[i].FullName + '</td><td>' + data.resp[i].userName + '</td><td>' + data.resp[i].descripcion + '</td><td><button value="' + data.resp[i].idUser + '" onclick="addRow($(this).val());"class="btn btn-warning btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">edit</i></button><button value="' + data.resp[i].idTerminal + '" onclick="crLibreApi_deleteReciver($(this).val());" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Agregar"><i class="material-icons md-12 align-middle">delete</i></button></td></tr>');
                    }
                } else {
                    console.log("Error recuperando los roles");
                }
                $('#data-table').dataTable();
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los roles", type: "error"});
            });

}



function crLibreApi_getDistrict(idProvince, idCanton, selectID) {

    var user = [];
    user.w = 'facturador';
    user.r = 'get_district';
    user.idProvince = idProvince;
    user.idCanton = idCanton;
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idDistrito + '">' + data.resp[i].nombreDistrito + '</option>');
                    }
                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}
function crLibreApi_getCompannyLocationInformation(idProvincia, idCanton, idDistrito, idBarrio) {

    var user = [];
    user.w = 'facturador';
    user.r = 'getCompannyLocationInformation';
    user.idProvincia = idProvincia;
    user.idCanton = idCanton;
    user.idDistrito = idDistrito;
    user.idBarrio = idBarrio;
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#adminProvincia").val(data.resp[0].nombreProvincia);
                    $("#adminCanton").val(data.resp[0].nombreCanton);
                    $("#adminDistrito").val(data.resp[0].nombreDistrito);
                    $("#adminBarrio").val(data.resp[0].nombreBarrio);

                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}


function crLibreApi_getNeighborhood(idProvince, idCanton, idDistrito, selectID) {

    var user = [];
    user.w = 'facturador';
    user.r = 'get_neighborhood';
    user.idProvince = idProvince;
    user.idCanton = idCanton;
    user.idDistrito = idDistrito;
    $("#" + selectID).empty();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    $("#" + selectID).append('<option value="">---</option>');
                    for (i = 0; i < data.resp.length; i++) {
                        $("#" + selectID).append('<option value="' + data.resp[i].idBarrio + '">' + data.resp[i].nombreBarrio + '</option>');
                    }
                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}



function crLibreApi_getCompannyInformationAdmin() {

    var _data = new FormData();
    var emisor_fax;
    var emisor_tipo_indetif;
    var emisor_barrio;
    var emisor_canton;
    var emisor_distrito;
    var emisor_provincia;
    var emisor_otras_senas;
    var emisor_cod_pais_fax;
    var emisor_cod_pais_tel;
    var emisor_tel;
    var emisor_num_identif;
    var nombre_comercial;
    var emisor_nombre;
    var emisor_email;
    var situacion;
    var tipo_cambio;
    var user = [];
    user.w = 'facturador';
    user.r = 'get_companny_information_admin';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    $("#adminIdMasterUser").val(localStorage.getItem('idMasterUser'));
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        for (var key in data.resp[i]) {
                            var value = data.resp[i].value;
                            crLibreApi_debug("Adding " + data.resp[i].name + " -> " + value);
                            _data.append(data.resp[i].name, value);
                        }
                    }
                    emisor_fax = _data.get('FNUMER');
                    emisor_tipo_indetif = _data.get('TIPOCED');
                    emisor_barrio = _data.get('BARRIO');
                    emisor_canton = _data.get('CANTON');
                    emisor_distrito = _data.get('DISTRITO');
                    emisor_provincia = _data.get('PROVINCIA');
                    emisor_otras_senas = _data.get('SENNAS');
                    emisor_cod_pais_fax = _data.get('FCODPAIS');
                    emisor_cod_pais_tel = _data.get('NCODPAIS');
                    emisor_tel = _data.get('NNUMER');
                    emisor_num_identif = _data.get('CEDULA');
                    nombre_comercial = _data.get('NOMCOMER');
                    emisor_nombre = _data.get('NOMBRE');
                    emisor_email = _data.get('EMAIL');
                    situacion = _data.get('situacion');
                    tipo_cambio = _data.get('TIPOCAMBIO');
                    $("#adminNombre").val(emisor_nombre);
                    $("#adminNombreComercial").val(nombre_comercial);
                    $("#adminCorreo").val(emisor_email);
                    $("#adminCodigo").val(emisor_cod_pais_tel);
                    $("#adminTelefono").val(emisor_tel);
                    $("#adminFax").val(emisor_fax);
                    $("#adminTipoCambio").val(tipo_cambio);
                    $("#adminOtrasSennas").val(emisor_otras_senas);
                    $("#adminCedula").val(emisor_num_identif);
                    crLibreApi_getCompannyLocationInformation(emisor_provincia, emisor_canton, emisor_distrito, emisor_barrio);


                } else {
                    console.log("Error recuperando las provincias");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}


function crLibreApi_add_voucher(clave, consecutivo, estado, xmlEnviadoBase64, tipoDocumento, respuestaMHBase64, idReceptor, env) {

    var user = [];
    user.w = 'facturador';
    user.r = 'companny_add_voucher';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.clave = clave;
    user.consecutivo = consecutivo;
    user.consecutivo = consecutivo;
    user.estado = estado;
    user.xmlEnviadoBase64 = xmlEnviadoBase64;
    user.tipoDocumento = tipoDocumento;
    user.respuestaMHBase64 = respuestaMHBase64;
    user.idReceptor = idReceptor;
    user.env = env;
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == '1') {
                    console.log("Se guardo el voucher");
                } else {
                    console.log("Error guardando voucher");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error guardando el voucher", type: "error"});
            });
}


/*
 * Load XML parse to use in Aceptation MH module
 * 
 */
function crLibreApi_read_xml(event, out) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        var node = document.getElementById(out);
        //node.innerText = text;
        var $xml;
        var xml = text,
                xmlDoc = $.parseXML(xml),
                $xml = $(xmlDoc);
        var Clave = $xml.find("Clave");
        var TotalComprobante = $xml.find("TotalComprobante");
        var FechaEmision = $xml.find("FechaEmision");
        var CodigoMoneda = $xml.find("CodigoMoneda");
        var emisorNombre = $xml.find("Emisor Nombre");
        var emisorNumero = $xml.find("Emisor Numero");
        var tipoCedulaEmisor = $xml.find("Emisor Identificacion Tipo");
        var emisorNombreComercial = $xml.find("Emisor NombreComercial");
        var existeImpuesto = $xml.find("TotalImpuesto");
        var CorreoElectronico = $xml.find("Emisor CorreoElectronico");
        var nombreReceptor = $xml.find("Receptor Nombre");
        var nombreComercialReceptor = $xml.find("Receptor NombreComercial");
        var tipoCedulaReceptor = $xml.find("Receptor Identificacion Tipo");
        var cedulaReceptor = $xml.find("Receptor Identificacion Numero");
        $("#total").val(TotalComprobante.text());
        $("#impuesto").val(existeImpuesto.text());
        $("#clave").val(Clave.text());
        $("#fecha").val(FechaEmision.text());
        $("#moneda").val(CodigoMoneda.text());
        $("#emisorNombre").val(emisorNombre.text());
        $("#emisorNumero").val(emisorNumero.text());
        $("#emisorNombreComercial").val(emisorNombreComercial.text());
        $("#emisorCorreoElectronico").val(CorreoElectronico.text());
        $("#tipoCedulaEmisor").val(tipoCedulaEmisor.text());
        $("#nombreReceptor").val(nombreReceptor.text());
        $("#nombreComercialReceptor").val(nombreComercialReceptor.text());
        $("#tipoCedulaReceptor").val(tipoCedulaReceptor.text());
        $("#cedulaReceptor").val(cedulaReceptor.text());
    };
    reader.readAsText(input.files[0]);
}


/*
 * 
 * 
 */
function makeJsonFE(table) {
    var myTab = document.getElementById(table);
    // LOOP THROUGH EACH ROW OF THE TABLE AFTER HEADER.
    var json = ''; //{"1": {"cantidad":"1","unidadMedida":"Sp","detalle":"Impresora","precioUnitario":"10000","montoTotal":"10000","subtotal":"10000","montoTotalLinea":"10000"}}
    for (i = 1; i < myTab.rows.length - 1; i++) {
        var objCells = myTab.rows.item(i).cells;
        var cantidad = 0;
        var unidadMedida = 0;
        var detalle = 0;
        var precioUnitario = 0;
        var montoTotal = 0;
        var subTotal = 0;
        var montoTotalLinea = 0;
        var cantidadDescuento = 0;
        var cantidadImpuesto = 0;
        var naturalezaDescuento = 0;
        var impuesto = 0;
        var descuento = 0;
        var codigoImpuesto = 0;
        var motoImpuesto = 0;
        var cantidadDescuento;
        cantidadDescuento = parseFloat(objCells.item(4).children[0].value);
        cantidadImpuesto = parseFloat(objCells.item(5).children[0].value);
        codigoImpuesto = (objCells.item(5).children[1].value);
        naturalezaDescuento;
        cantidad = objCells.item(2).children[0].value;
        unidadMedida = objCells.item(1).children[0].value;
        detalle = objCells.item(0).children[0].value;
        precioUnitario = objCells.item(3).children[0].value;
        montoTotal = cantidad * precioUnitario;
        descuento = montoTotal * (cantidadDescuento / 100);
        subTotal = montoTotal - descuento;
        motoImpuesto = subTotal * (cantidadImpuesto / 100);
        montoTotalLinea = subTotal + motoImpuesto;

        if (cantidadDescuento === 0 && cantidadImpuesto === 0) {
            if (json === '') {
                json = '"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '"}';
            } else {
                json = json + ',"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '"}';
                // GET THE CELLS COLLECTION OF THE CURRENT ROW.
            }
        } else if (cantidadDescuento !== 0 && cantidadImpuesto === 0) {
            if (json === '') {
                json = '"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '","montoDescuento":"' + descuento + '","naturalezaDescuento":"NA"}';
            } else {
                json = json + ',"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '","montoDescuento":"' + descuento + '","naturalezaDescuento":"NA"}';
                // GET THE CELLS COLLECTION OF THE CURRENT ROW.
            }
        } else if (cantidadDescuento === 0 && cantidadImpuesto !== 0) {
            if (json === '') {
                json = '"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '","impuesto":{"1": {"codigo":"' + codigoImpuesto + '","tarifa":"' + cantidadImpuesto + '","monto":"' + motoImpuesto + '"}}}';
            } else {
                json = json + ',"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '","impuesto":{"1": {"codigo":"' + codigoImpuesto + '","tarifa":"' + cantidadImpuesto + '","monto":"' + motoImpuesto + '"}}}';
                // GET THE CELLS COLLECTION OF THE CURRENT ROW.
            }
        } else if (cantidadDescuento !== 0 && cantidadImpuesto !== 0) {
            if (json === '') {
                json = '"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '","montoDescuento":"' + descuento + '","naturalezaDescuento":"NA","impuesto":{"1": {"codigo":"' + codigoImpuesto + '","tarifa":"' + cantidadImpuesto + '","monto":"' + motoImpuesto + '"}}}';
            } else {
                json = json + ',"' + i + '": {"cantidad":"' + cantidad + '","unidadMedida":"' + unidadMedida + '","detalle":"' + detalle + '","precioUnitario":"' + precioUnitario + '","montoTotal":"' + montoTotal + '","subtotal":"' + subTotal + '","montoTotalLinea":"' + montoTotalLinea + '","montoDescuento":"' + descuento + '","naturalezaDescuento":"NA","impuesto":{"1": {"codigo":"' + codigoImpuesto + '","tarifa":"' + cantidadImpuesto + '","monto":"' + motoImpuesto + '"}}}';
                // GET THE CELLS COLLECTION OF THE CURRENT ROW.
            }
        }
    }
    json = "{" + json + "}";


    return json;
}



function crLibreApi_recover_pwd() {

    var user = [];
    user.w = 'users';
    user.r = 'users_recover_pwd';
    user.userName = $("#userName").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == 1) {
                    sweetAlert({title: "Se envio un correo electronico con la nueva contraseña", type: "success"});
                    $("#userName").val("");
                } else {
                    sweetAlert({title: "Error!", text: "Error intentando rescuperar contraseña.\n", type: "error"});
                }
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}

function crLibreApi_recover_user_pwd() {

    var user = [];
    user.w = 'facturador';
    user.r = 'companny_users_recover_pwd';
    user.userName = $("#userName").val();
    user.idMasterUser = $("#idMasterUser").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == 1) {
                    sweetAlert({title: "Se envio un correo electronico con la nueva contraseña", type: "success"});
                    $("#userName").val("");
                } else {
                    sweetAlert({title: "Error!", text: "Error intentando rescuperar contraseña.\n", type: "error"});
                }
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}




function crLibreApi_add_companny_reciver() {

    var user = [];
    user.w = 'facturador';
    user.r = 'add_companny_reciver';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.nombreCliente = $("#nombreCliente").val();
    user.numeroCedula = $("#numeroCedula").val();
    user.tipoCedula = $("#typeIdSelect").val();
    user.telefono = $("#telefono").val();
    user.idProvincia = $("#provinceSelect").val();
    user.idCanton = $("#cantonSelect").val();
    user.idDistrito = $("#distritoSelect").val();
    user.idBarrio = $("#barrioSelect").val();
    user.otrasSenas = $("#otrasSenas").val();
    user.nombreComercial = $("#nombreComercial").val();
    user.correoPrincipal = $("#correoPrincipal").val();
    user.copiasCorreo = $("#copiasCorreo").val();
    user.numeroFax = $("#numeroFax").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp == 1) {
                    sweetAlert({title: "Se creo correctamente el cliente\n" + $("#nombreCliente").val(), type: "success"});
                    $("#userName").val("");
                } else {
                    sweetAlert({title: "Error!", text: "Error intentando crear clienteu.\n", type: "error"});
                }
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function crLibreApi_mensaje_comprobacion() {
    var clave = $("#clave").val();
    var fecha = $("#mrDate").val();
    var emi_tipoIdentificacion = $("#tipoCedulaEmisor").val();
    var emi_numeroIdentificacion = $("#emisorNumero").val();
    var recp_tipoIdentificacion = $("#tipoCedulaReceptor").val();
    var recp_numeroIdentificacion = $("#cedulaReceptor").val();
    var terminal = localStorage.getItem('terminal');
    var sucursal = localStorage.getItem('sucursal');
    var tipoDocumento = $("#mensaje").val();
    var consecutivo = $("#feConsecutivo").val();
    consecutivo = padDigits(consecutivo, 10);
    var numero_consecutivo_receptor = sucursal + terminal + tipoDocumento + consecutivo;

    var mensaje;
    var XML;
    var env;
    var token;
    var user;
    var pass;
    var downloadCode;
    var pinP12;
    var tipoDoc;

    if ($("#mensaje").val() == '05') {
        tipoDoc = "CCE";
        mensaje = '1';
    } else if ($("#mensaje").val() == '06') {
        tipoDoc = "CPCE";
        mensaje = '2';
    } else if ($("#mensaje").val() == '07') {
        tipoDoc = "RCE";
        mensaje = '3';
    }

    var user = [];
    user.w = 'genXML';
    user.r = 'gen_xml_mr';
    user.clave = clave;
    user.numero_cedula_emisor = emi_numeroIdentificacion;
    if ($("#impuesto").val() == "") {
    } else {
        user.monto_total_impuesto = $("#impuesto").val();
    }
    user.fecha_emision_doc = fecha;
    user.mensaje = mensaje;
    user.detalle_mensaje = $("#detalle").val();
    user.total_factura = $("#total").val();
    user.numero_cedula_receptor = recp_numeroIdentificacion;
    user.numero_consecutivo_receptor = numero_consecutivo_receptor;
    user.emi_tipoIdentificacion = emi_tipoIdentificacion;
    user.recp_tipoIdentificacion = recp_tipoIdentificacion;
    user.emi_numeroIdentificacion = $("#emisorNumero").val();
    user.recp_numeroIdentificacion = $("#cedulaReceptor").val();


    crLibreApi_postRequest(user,
            function (data) {
                if (data.resp.xml != "") {
                    XML = data.resp.xml;
                    var user = [];
                    user.w = 'facturador';
                    user.r = 'company_get_env';
                    user.iam = localStorage.getItem('userName');
                    user.sessionKey = localStorage.getItem('sessionKey');
                    user.idMasterUser = localStorage.getItem('idMasterUser');
                    crLibreApi_postRequest(user,
                            function (data) {
                                if (typeof data.resp == 'object') {
                                    env = data.resp[0].env;
                                    var client_id = env;
                                    var user = [];
                                    user.w = 'facturador';
                                    if (client_id == 'api-stag') {
                                        user.r = 'get_stag_companny_credentials';
                                    } else if (client_id == 'api-prod') {
                                        user.r = 'get_prod_companny_credentials';
                                    }
                                    user.iam = localStorage.getItem('userName');
                                    user.sessionKey = localStorage.getItem('sessionKey');
                                    user.idMasterUser = localStorage.getItem('idMasterUser');
                                    crLibreApi_postRequest(user,
                                            function (data) {
                                                if (typeof data.resp == 'object') {
                                                    user = data.resp[0].value;
                                                    pass = data.resp[1].value;
                                                    downloadCode = data.resp[2].value;
                                                    pinP12 = data.resp[3].value;
                                                    var user = [];
                                                    user.w = 'token';
                                                    user.r = 'gettoken';
                                                    user.grant_type = 'password';
                                                    user.username = data.resp[0].value;
                                                    user.password = pass;
                                                    user.client_id = env;
                                                    crLibreApi_postRequest(user,
                                                            function (data) {
                                                                token = data.resp.access_token;
                                                                var user = [];
                                                                user.w = 'signXML';
                                                                user.r = 'signFE';
                                                                user.p12Url = downloadCode;
                                                                user.pinP12 = pinP12;
                                                                user.inXml = XML;
                                                                user.tipodoc = tipoDoc;
                                                                crLibreApi_postRequest(user,
                                                                        function (data) {
                                                                            if (data.resp.xmlFirmado != "") {
                                                                                XML = data.resp.xmlFirmado;
                                                                                var user = [];
                                                                                user.w = 'send';
                                                                                user.r = 'sendMensaje';
                                                                                user.token = token;
                                                                                user.clave = clave;
                                                                                user.fecha = fecha;
                                                                                user.emi_tipoIdentificacion = emi_tipoIdentificacion;
                                                                                user.emi_numeroIdentificacion = emi_numeroIdentificacion;
                                                                                user.recp_tipoIdentificacion = recp_tipoIdentificacion;
                                                                                user.recp_numeroIdentificacion = recp_numeroIdentificacion;
                                                                                user.client_id = env;
                                                                                user.comprobanteXml = XML;
                                                                                user.consecutivoReceptor = numero_consecutivo_receptor;
                                                                                crLibreApi_postRequest(user,
                                                                                        function (data) {
                                                                                            if (data.resp.xmlFirmado != "") {
                                                                                                sweetAlert({title: "Envio Exitoso!", text: "Respuesta\nStatus:\n" + data.resp.Status + "\n", type: "success"});
                                                                                                var user = [];
                                                                                                user.w = 'facturador';
                                                                                                user.r = 'companny_updateConsecutive';
                                                                                                user.idMasterUser = localStorage.getItem('idMasterUser');
                                                                                                user.env = client_id;
                                                                                                user.tipoDocumento = tipoDoc;
                                                                                                crLibreApi_postRequest(user,
                                                                                                        function (data) {
                                                                                                            if (typeof data.resp == '1') {
                                                                                                                console.log("Consecutivo aumentado");
                                                                                                            } else {
                                                                                                                console.log("Error recuperando las provincias");
                                                                                                            }
                                                                                                        },
                                                                                                        function (data) {
                                                                                                            sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
                                                                                                        });
                                                                                            } else {
                                                                                                sweetAlert({title: "Error Firmando", text: "No se pudo obtener el xml firmado", type: "error"});
                                                                                            }

                                                                                        },
                                                                                        function (data) {
                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                        });
                                                                            } else {
                                                                                sweetAlert({title: "Error Firmando", text: "No se pudo obtener el xml firmado", type: "error"});
                                                                            }

                                                                        },
                                                                        function (data) {
                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                        });

                                                            },
                                                            function (data) {
                                                                sweetAlert({title: "Error!", text: "Error intentando obtener token.\n", type: "error"});
                                                            });
                                                } else {
                                                    console.log("Error recuperando las credenciales");
                                                }
                                            },
                                            function (data) {
                                                sweetAlert({title: "Ocurrio un error recuperando las credenciales", type: "error"});
                                            });
                                } else {
                                    console.log("Error obteniendo el env");
                                }
                            },
                            function (data) {
                                sweetAlert({title: "Ocurrio un error obteniendo el env", type: "error"});
                            });
                } else {
                    sweetAlert({title: "Error!", text: "Error intentando rescuperar contraseña.\n", type: "error"});
                }
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}


//Esta funcion crea el XMl, lo firma pide token y lo envia a hacienda

function crLibreApi_FE() {

    var token;
    var usuario;
    var pass;
    var client_id;
    var p12Code;
    var pin;
    var tipoDocumento = 'FE';
    var codigoPais;
    var situacion;
    var codigoSeguridad = Math.floor(Math.pow(10, 8 - 1) + Math.random() * (Math.pow(10, 8) - Math.pow(10, 8 - 1) - 1));
    var consecutivoXML;
    var clave;
    var consecutivo = $("#feConsecutivo").val();
    var codigoPais;
    var situacion;
    var emisor_tipo_indetif;
    var emisor_num_identif;
    var nombre_comercial;
    var emisor_provincia;
    var emisor_canton;
    var emisor_distrito;
    var emisor_barrio;
    var emisor_otras_senas;
    var emisor_cod_pais_tel;
    var emisor_tel;
    var emisor_cod_pais_fax;
    var emisor_fax;
    var emisor_email;
    var emisor_nombre;
    var receptor_tipo_identif;
    var receptor_num_identif;
    var receptor_nombre;
    var receptor_provincia;
    var receptor_canton;
    var receptor_distrito;
    var receptor_barrio;
    var receptor_cod_pais_tel;
    var receptor_tel;
    var receptor_cod_pais_fax;
    var receptor_fax;
    var tipo_cambio;
    var receptor_email;
    var condicion_venta = $("#condicionVenta").val();
    var plazo_credito = $("#plazoCreditoInput").val();
    var medio_pago = $("#medioPago").val();
    var cod_moneda = $("#tipoMoneda").val();
    var condicion_venta = $("#condicionVenta").val();
    var plazo_credito = $("#plazoCreditoInput").val();
    var medio_pago = $("#medioPago").val();
    var cod_moneda = $("#tipoMoneda").val();
    var total_serv_gravados = $("#TotalServGravados").val();
    var total_serv_exentos = $("#TotalServExentos").val();
    var total_merc_gravada = $("#TotalMercanciasGravadas").val();
    var total_merc_exenta = $("#TotalMercanciasExentas").val();
    var total_gravados = $("#TotalGravado").val();
    var total_exentos = $("#TotalExento").val();
    var total_ventas = $("#totalVenta").val();
    var total_descuentos = $("#descuenteTotal").val();
    var total_ventas_neta = $("#ventaNeta").val();
    var total_impuestos = $("#impuestoTotal").val();
    var total_comprobante = $("#total").val();
    var _data = new FormData();
    //var consecutivo = $("#feConsecutivo").val();
    var fecha_emision = $("#feDate").val();

    var user = [];
    user.w = 'facturador';
    user.r = 'get_receiver_by_id';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    user.idReceptor = $("#idReceptor").val();
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    receptor_tipo_identif = data.resp[0].tipoCedula;
                    switch (data.resp[0].tipoCedula) {
                        case "fisico":
                            receptor_tipo_identif = '01';
                            break;
                        case "juridico":
                            receptor_tipo_identif = '02';
                            break;
                        case "dimex":
                            receptor_tipo_identif = '03';
                            break;
                        case "nite":
                            receptor_tipo_identif = '04';
                            break;
                            defaul:
                                    receptor_tipo_identif = '';
                            break;
                    }
                    receptor_num_identif = data.resp[0].numeroCedula;
                    receptor_nombre = data.resp[0].nombreCliente;
                    receptor_provincia = data.resp[0].idProvincia;
                    receptor_canton = data.resp[0].idCanton;
                    receptor_distrito = data.resp[0].idDistrito;
                    receptor_barrio = data.resp[0].idBarrio;
                    receptor_otras_senas = data.resp[0].otrasSenas;
                    receptor_cod_pais_tel = data.resp[0].codigoPais;
                    receptor_tel = data.resp[0].telefono;
                    receptor_cod_pais_fax = data.resp[0].codigoPais;
                    receptor_fax = data.resp[0].numeroFax;
                    receptor_email = data.resp[0].correoPrincipal;


                    var user = [];
                    user.w = 'facturador';
                    user.r = 'get_companny_information';
                    user.iam = localStorage.getItem('userName');
                    user.sessionKey = localStorage.getItem('sessionKey');
                    user.idMasterUser = localStorage.getItem('idMasterUser');
                    crLibreApi_postRequest(user,
                            function (data) {
                                if (typeof data.resp == 'object') {

                                    for (i = 0; i < data.resp.length; i++) {
                                        for (var key in data.resp[i]) {
                                            var value = data.resp[i].value;
                                            crLibreApi_debug("Adding " + data.resp[i].name + " -> " + value);
                                            _data.append(data.resp[i].name, value);
                                        }
                                    }
                                    emisor_fax = _data.get('FNUMER');
                                    emisor_tipo_indetif = _data.get('TIPOCED');
                                    emisor_barrio = _data.get('BARRIO');
                                    emisor_canton = _data.get('CANTON');
                                    emisor_distrito = _data.get('DISTRITO');
                                    emisor_provincia = _data.get('PROVINCIA');
                                    emisor_otras_senas = _data.get('SENNAS');
                                    emisor_cod_pais_fax = _data.get('FCODPAIS');
                                    emisor_cod_pais_tel = _data.get('NCODPAIS');
                                    emisor_tel = _data.get('NNUMER');
                                    emisor_num_identif = _data.get('CEDULA');
                                    nombre_comercial = _data.get('NOMCOMER');
                                    emisor_nombre = _data.get('NOMBRE');
                                    emisor_email = _data.get('EMAIL');
                                    situacion = _data.get('situacion');
                                    tipo_cambio = _data.get('TIPOCAMBIO');
                                    var user = [];
                                    user.w = 'clave';
                                    user.r = 'clave';
                                    user.tipoDocumento = tipoDocumento;
                                    user.tipoCedula = emisor_tipo_indetif;
                                    user.cedula = emisor_num_identif;
                                    user.codigoPais = emisor_cod_pais_tel;
                                    user.consecutivo = consecutivo;
                                    user.situacion = situacion;
                                    user.codigoSeguridad = codigoSeguridad;
                                    user.iam = localStorage.getItem('userName');
                                    user.sessionKey = localStorage.getItem('sessionKey');
                                    crLibreApi_postRequest(user,
                                            function (data) {
                                                clave = data.resp.clave;
                                                consecutivoXML = data.resp.consecutivo;
                                                var user = [];
                                                user.w = 'facturador';
                                                user.r = 'company_get_env';
                                                user.iam = localStorage.getItem('userName');
                                                user.sessionKey = localStorage.getItem('sessionKey');
                                                user.idMasterUser = localStorage.getItem('idMasterUser');
                                                crLibreApi_postRequest(user,
                                                        function (data) {
                                                            if (typeof data.resp == 'object') {

                                                                if (data.resp[0].env === "api-stag") {
                                                                    client_id = "api-stag";
                                                                } else if (data.resp[0].env === "api-prod") {
                                                                    client_id = "api-prod";
                                                                }
                                                                var user = [];
                                                                user.w = 'facturador';
                                                                if (client_id == 'api-stag') {
                                                                    user.r = 'get_stag_companny_credentials';
                                                                } else if (client_id == 'api-prod') {
                                                                    user.r = 'get_prod_companny_credentials';
                                                                }
                                                                user.iam = localStorage.getItem('userName');
                                                                user.sessionKey = localStorage.getItem('sessionKey');
                                                                user.idMasterUser = localStorage.getItem('idMasterUser');
                                                                crLibreApi_postRequest(user,
                                                                        function (data) {
                                                                            if (typeof data.resp == 'object') {
                                                                                usuario = data.resp[0].value;
                                                                                pass = data.resp[1].value;
                                                                                p12Code = data.resp[2].value;
                                                                                pin = data.resp[3].value;
                                                                                var user = [];
                                                                                user.w = 'token';
                                                                                user.r = 'gettoken';
                                                                                user.grant_type = 'password';
                                                                                if (usuario == '' || pass == '' || client_id == '') {
                                                                                    sweetAlert({title: "Error!", text: "Todos los campos son requeridos deben contener datos.\n", type: "error"});
                                                                                } else {
                                                                                    user.username = usuario;
                                                                                    user.password = pass;
                                                                                    user.client_id = client_id;
                                                                                    crLibreApi_postRequest(user,
                                                                                            function (data) {
                                                                                                token = data.resp.access_token;
                                                                                                console.log("mhToken: " + token);
                                                                                                var user = [];
                                                                                                user.w = 'genXML';
                                                                                                user.r = 'gen_xml_fe';
                                                                                                user.clave = clave;
                                                                                                user.consecutivo = consecutivoXML;
                                                                                                user.fecha_emision = fecha_emision;
                                                                                                user.emisor_nombre = emisor_nombre;
                                                                                                user.emisor_tipo_indetif = emisor_tipo_indetif;
                                                                                                user.emisor_num_identif = emisor_num_identif;
                                                                                                user.nombre_comercial = nombre_comercial;
                                                                                                user.emisor_provincia = emisor_provincia;
                                                                                                user.emisor_canton = emisor_canton;
                                                                                                user.emisor_distrito = emisor_distrito;
                                                                                                user.emisor_barrio = emisor_barrio;
                                                                                                user.emisor_otras_senas = emisor_otras_senas;
                                                                                                user.emisor_cod_pais_tel = emisor_cod_pais_tel;
                                                                                                user.emisor_tel = emisor_tel;
                                                                                                user.emisor_cod_pais_fax = emisor_cod_pais_fax;
                                                                                                user.emisor_fax = emisor_fax;
                                                                                                user.emisor_email = emisor_email;
                                                                                                user.receptor_nombre = receptor_nombre;
                                                                                                user.receptor_tipo_identif = receptor_tipo_identif;
                                                                                                user.receptor_num_identif = receptor_num_identif;
                                                                                                user.receptor_provincia = receptor_provincia;
                                                                                                user.receptor_canton = receptor_canton;
                                                                                                user.receptor_distrito = receptor_distrito;
                                                                                                user.receptor_barrio = receptor_barrio;
                                                                                                user.receptor_otras_senas = receptor_otras_senas;
                                                                                                user.receptor_cod_pais_tel = receptor_cod_pais_tel;
                                                                                                user.receptor_tel = receptor_tel;
                                                                                                user.receptor_cod_pais_fax = '';
                                                                                                user.receptor_fax = receptor_fax;
                                                                                                user.receptor_email = receptor_email;
                                                                                                user.condicion_venta = condicion_venta;
                                                                                                user.plazo_credito = plazo_credito;
                                                                                                user.medio_pago = medio_pago;
                                                                                                user.cod_moneda = cod_moneda;
                                                                                                user.tipo_cambio = tipo_cambio;
                                                                                                user.total_serv_gravados = total_serv_gravados;
                                                                                                user.total_serv_exentos = total_serv_exentos;
                                                                                                user.total_merc_gravada = total_merc_gravada;
                                                                                                user.total_merc_exenta = total_merc_exenta;
                                                                                                user.total_gravados = total_gravados;
                                                                                                user.total_exentos = total_exentos;
                                                                                                user.total_ventas = total_ventas;
                                                                                                user.total_descuentos = total_descuentos;
                                                                                                user.total_ventas_neta = total_ventas_neta;
                                                                                                user.total_impuestos = total_impuestos;
                                                                                                user.total_comprobante = total_comprobante;
                                                                                                user.otros = $("#note").val();
                                                                                                user.otrosType = 'OtroTexto';
                                                                                                user.detalles = makeJsonFE('FETable');
                                                                                                crLibreApi_postRequest(user,
                                                                                                        function (data) {
                                                                                                            if (data.resp[0] != "") {
                                                                                                                var xml = data.resp.xml;
                                                                                                                var user = [];
                                                                                                                user.w = 'signXML';
                                                                                                                user.r = 'signFE';
                                                                                                                user.p12Url = p12Code;
                                                                                                                user.pinP12 = pin;
                                                                                                                user.inXml = xml;
                                                                                                                user.tipodoc = tipoDocumento;
                                                                                                                crLibreApi_postRequest(user,
                                                                                                                        function (data) {
                                                                                                                            if (data.resp.xmlFirmado != "") {
                                                                                                                                var xmlFirmado = data.resp.xmlFirmado;
                                                                                                                                console.log
                                                                                                                                var user = [];
                                                                                                                                user.w = 'send';
                                                                                                                                user.r = 'json';
                                                                                                                                user.token = token;
                                                                                                                                user.clave = clave;
                                                                                                                                user.fecha = fecha_emision;
                                                                                                                                user.emi_tipoIdentificacion = emisor_tipo_indetif;
                                                                                                                                user.emi_numeroIdentificacion = emisor_num_identif;
                                                                                                                                user.recp_tipoIdentificacion = receptor_tipo_identif;
                                                                                                                                user.recp_numeroIdentificacion = receptor_num_identif;
                                                                                                                                user.client_id = client_id;
                                                                                                                                user.callbackUrl = encodeURI('https://api-demo.crlibre.org/api.php?w=callback&r=callback');
                                                                                                                                user.comprobanteXml = xmlFirmado;
                                                                                                                                crLibreApi_postRequest(user,
                                                                                                                                        function (data) {

                                                                                                                                            if (data.resp.xmlFirmado != "") {
                                                                                                                                                if (data.resp.Status == "202") {
                                                                                                                                                    $("#myBtn").show();
                                                                                                                                                    descargaXMLFirmado = xmlFirmado;
                                                                                                                                                    descargaXMLClave = clave;
                                                                                                                                                    sweetAlert({title: "Envio Exitoso!", text: "Se envio correctamente el comprobante", type: "success"});
                                                                                                                                                    var user = [];
                                                                                                                                                    user.w = 'facturador';
                                                                                                                                                    user.r = 'companny_updateConsecutive';
                                                                                                                                                    user.idMasterUser = localStorage.getItem('idMasterUser');
                                                                                                                                                    user.env = client_id;
                                                                                                                                                    user.tipoDocumento = tipoDocumento;
                                                                                                                                                    crLibreApi_postRequest(user,
                                                                                                                                                            function (data) {
                                                                                                                                                                if (data.resp == '1') {
                                                                                                                                                                    crLibreApi_add_voucher(clave, consecutivoXML, "enviado", xmlFirmado, "FE", "NULL", " NULL", client_id);
                                                                                                                                                                    console.log("Consecutivo aumentado");
                                                                                                                                                                } else {
                                                                                                                                                                    console.log("Error recuperando las provincias");
                                                                                                                                                                }
                                                                                                                                                            },
                                                                                                                                                            function (data) {
                                                                                                                                                                sweetAlert({title: "Ocurrio aumentando consecutivo", type: "error"});
                                                                                                                                                            });
                                                                                                                                                }
                                                                                                                                            } else {
                                                                                                                                                sweetAlert({title: "Hacienda sin respuesta!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp[2], type: "error"});
                                                                                                                                            }

                                                                                                                                        },
                                                                                                                                        function (data) {
                                                                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                                                                        });
                                                                                                                            } else {
                                                                                                                                sweetAlert({title: "Hacienda sin respuesta!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp[2], type: "error"});
                                                                                                                            }

                                                                                                                        },
                                                                                                                        function (data) {
                                                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                                                        });
                                                                                                            } else {
                                                                                                                sweetAlert({title: "Error en envio!", text: "Respuesta\nStatus:\n" + data.resp.Status + "\n", type: "error"});
                                                                                                            }

                                                                                                        },
                                                                                                        function (data) {
                                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                                        });
                                                                                            },
                                                                                            function (data) {
                                                                                                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                            });
                                                                                }

                                                                            } else {
                                                                                console.log("Error recuperando las credenciales");
                                                                            }
                                                                        },
                                                                        function (data) {
                                                                            sweetAlert({title: "Ocurrio un error recuperando las credenciales", type: "error"});
                                                                        });
                                                            } else {
                                                                console.log("Error cambiando el env");
                                                            }
                                                        },
                                                        function (data) {
                                                            sweetAlert({title: "Ocurrio un error cargando el entorno de facturacion", type: "error"});
                                                        });
                                            },
                                            function (data) {
                                                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
                                            });
                                } else {
                                    console.log("Error recuperando los clientes");
                                }
                            },
                            function (data) {
                                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
                            });
                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });
}

//Esta funcion crea el XMl, lo firma pide token y lo envia a hacienda

function crLibreApi_TE() {
    var token;
    var usuario;
    var pass;
    var client_id;
    var p12Code;
    var pin;
    var tipoDocumento = 'TE';
    var codigoPais;
    var situacion;
    var codigoSeguridad = Math.floor(Math.pow(10, 8 - 1) + Math.random() * (Math.pow(10, 8) - Math.pow(10, 8 - 1) - 1));
    var consecutivoXML;
    var clave;
    var consecutivo = $("#feConsecutivo").val();
    var codigoPais;
    var situacion;
    var emisor_tipo_indetif;
    var emisor_num_identif;
    var nombre_comercial;
    var emisor_provincia;
    var emisor_canton;
    var emisor_distrito;
    var emisor_barrio;
    var emisor_otras_senas;
    var emisor_cod_pais_tel;
    var emisor_tel;
    var emisor_cod_pais_fax;
    var emisor_fax;
    var emisor_email;
    var emisor_nombre;
    var condicion_venta = $("#condicionVenta").val();
    var plazo_credito = $("#plazoCreditoInput").val();
    var medio_pago = $("#medioPago").val();
    var cod_moneda = $("#tipoMoneda").val();
    var total_serv_gravados = $("#TotalServGravados").val();
    var total_serv_exentos = $("#TotalServExentos").val();
    var total_merc_gravada = $("#TotalMercanciasGravadas").val();
    var total_merc_exenta = $("#TotalMercanciasExentas").val();
    var total_gravados = $("#TotalGravado").val();
    var total_exentos = $("#TotalExento").val();
    var total_ventas = $("#totalVenta").val();
    var total_descuentos = $("#descuenteTotal").val();
    var total_ventas_neta = $("#ventaNeta").val();
    var total_impuestos = $("#impuestoTotal").val();
    var total_comprobante = $("#total").val();



    var _data = new FormData();
    //var consecutivo = $("#feConsecutivo").val();

    var fecha_emision = $("#feDate").val();
    var user = [];
    user.w = 'facturador';
    user.r = 'get_companny_information';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    for (i = 0; i < data.resp.length; i++) {
                        for (var key in data.resp[i]) {
                            var value = data.resp[i].value;
                            crLibreApi_debug("Adding " + data.resp[i].name + " -> " + value);
                            _data.append(data.resp[i].name, value);
                        }
                    }

                    emisor_fax = _data.get('FNUMER');
                    emisor_tipo_indetif = _data.get('TIPOCED');
                    emisor_barrio = _data.get('BARRIO');
                    emisor_canton = _data.get('CANTON');
                    emisor_distrito = _data.get('DISTRITO');
                    emisor_provincia = _data.get('PROVINCIA');
                    emisor_otras_senas = _data.get('SENNAS');
                    emisor_cod_pais_fax = _data.get('FCODPAIS');
                    emisor_cod_pais_tel = _data.get('NCODPAIS');
                    emisor_tel = _data.get('NNUMER');
                    emisor_num_identif = _data.get('CEDULA');
                    nombre_comercial = _data.get('NOMCOMER');
                    emisor_nombre = _data.get('NOMBRE');
                    emisor_email = _data.get('EMAIL');
                    situacion = _data.get('situacion');
                    var user = [];
                    user.w = 'clave';
                    user.r = 'clave';
                    user.tipoDocumento = tipoDocumento;
                    user.tipoCedula = emisor_tipo_indetif;
                    user.cedula = emisor_num_identif;
                    user.codigoPais = emisor_cod_pais_tel;
                    user.consecutivo = consecutivo;
                    user.situacion = situacion;
                    user.codigoSeguridad = codigoSeguridad;
                    user.iam = localStorage.getItem('userName');
                    user.sessionKey = localStorage.getItem('sessionKey');
                    crLibreApi_postRequest(user,
                            function (data) {
                                clave = data.resp.clave;
                                consecutivoXML = data.resp.consecutivo;
                                var user = [];
                                user.w = 'facturador';
                                user.r = 'company_get_env';
                                user.iam = localStorage.getItem('userName');
                                user.sessionKey = localStorage.getItem('sessionKey');
                                user.idMasterUser = localStorage.getItem('idMasterUser');
                                crLibreApi_postRequest(user,
                                        function (data) {
                                            if (typeof data.resp == 'object') {

                                                if (data.resp[0].env === "api-stag") {
                                                    client_id = "api-stag";
                                                } else if (data.resp[0].env === "api-prod") {
                                                    client_id = "api-prod";
                                                }
                                                var user = [];
                                                user.w = 'facturador';
                                                if (client_id == 'api-stag') {
                                                    user.r = 'get_stag_companny_credentials';
                                                } else if (client_id == 'api-prod') {
                                                    user.r = 'get_prod_companny_credentials';
                                                }
                                                user.iam = localStorage.getItem('userName');
                                                user.sessionKey = localStorage.getItem('sessionKey');
                                                user.idMasterUser = localStorage.getItem('idMasterUser');
                                                crLibreApi_postRequest(user,
                                                        function (data) {
                                                            if (typeof data.resp == 'object') {
                                                                usuario = data.resp[0].value;
                                                                pass = data.resp[1].value;
                                                                p12Code = data.resp[2].value;
                                                                pin = data.resp[3].value;
                                                                var user = [];
                                                                user.w = 'token';
                                                                user.r = 'gettoken';
                                                                user.grant_type = 'password';
                                                                if (usuario == '' || pass == '' || client_id == '') {
                                                                    sweetAlert({title: "Error!", text: "Todos los campos son requeridos deben contener datos.\n", type: "error"});
                                                                } else {
                                                                    user.username = usuario;
                                                                    user.password = pass;
                                                                    user.client_id = client_id;
                                                                    crLibreApi_postRequest(user,
                                                                            function (data) {
                                                                                token = data.resp.access_token;
                                                                                console.log("mhToken: " + token);
                                                                                var user = [];
                                                                                user.w = 'genXML';
                                                                                user.r = 'gen_xml_te';
                                                                                user.clave = clave;
                                                                                user.consecutivo = consecutivoXML;
                                                                                user.fecha_emision = fecha_emision;
                                                                                user.emisor_nombre = emisor_nombre;
                                                                                user.emisor_tipo_indetif = emisor_tipo_indetif;
                                                                                user.emisor_num_identif = emisor_num_identif;
                                                                                user.nombre_comercial = nombre_comercial;
                                                                                user.emisor_provincia = emisor_provincia;
                                                                                user.emisor_canton = emisor_canton;
                                                                                user.emisor_distrito = emisor_distrito;
                                                                                user.emisor_barrio = emisor_barrio;
                                                                                user.emisor_otras_senas = emisor_otras_senas;
                                                                                user.emisor_cod_pais_tel = emisor_cod_pais_tel;
                                                                                user.emisor_tel = emisor_tel;
                                                                                user.emisor_cod_pais_fax = emisor_cod_pais_fax;
                                                                                user.emisor_fax = emisor_fax;
                                                                                user.emisor_email = emisor_email;
                                                                                user.condicion_venta = condicion_venta;
                                                                                user.plazo_credito = plazo_credito;
                                                                                user.medio_pago = medio_pago;
                                                                                user.cod_moneda = cod_moneda;
                                                                                user.tipo_cambio = '564.48';
                                                                                user.total_serv_gravados = total_serv_gravados;
                                                                                user.total_serv_exentos = total_serv_exentos;
                                                                                user.total_merc_gravada = total_merc_gravada;
                                                                                user.total_merc_exenta = total_merc_exenta;
                                                                                user.total_gravados = total_gravados;
                                                                                user.total_exentos = total_exentos;
                                                                                user.total_ventas = total_ventas;
                                                                                user.total_descuentos = total_descuentos;
                                                                                user.total_ventas_neta = total_ventas_neta;
                                                                                user.total_impuestos = total_impuestos;
                                                                                user.total_comprobante = total_comprobante;
                                                                                user.otros = $("#note").val();
                                                                                user.otrosType = 'OtroTexto';
                                                                                user.detalles = makeJsonFE('FETable');
                                                                                crLibreApi_postRequest(user,
                                                                                        function (data) {
                                                                                            if (data.resp[0] != "") {
                                                                                                var xml = data.resp.xml;
                                                                                                var user = [];
                                                                                                user.w = 'signXML';
                                                                                                user.r = 'signFE';
                                                                                                user.p12Url = p12Code;
                                                                                                user.pinP12 = pin;
                                                                                                user.inXml = xml;
                                                                                                user.tipodoc = 'TE';
                                                                                                crLibreApi_postRequest(user,
                                                                                                        function (data) {
                                                                                                            if (data.resp.xmlFirmado != "") {
                                                                                                                var xmlFirmado = data.resp.xmlFirmado;
                                                                                                                console.log
                                                                                                                var user = [];
                                                                                                                user.w = 'send';
                                                                                                                user.r = 'sendTE';
                                                                                                                user.token = token;
                                                                                                                user.clave = clave;
                                                                                                                user.fecha = fecha_emision;
                                                                                                                user.emi_tipoIdentificacion = emisor_tipo_indetif;
                                                                                                                user.emi_numeroIdentificacion = emisor_num_identif;
                                                                                                                user.client_id = client_id;
                                                                                                                user.callbackUrl = encodeURI('https://api-demo.crlibre.org/api.php?w=callback&r=callback');
                                                                                                                user.comprobanteXml = xmlFirmado;
                                                                                                                crLibreApi_postRequest(user,
                                                                                                                        function (data) {
                                                                                                                            if (data.resp.xmlFirmado != "") {
                                                                                                                                if (data.resp.Status == "202") {
                                                                                                                                    crLibreApi_get_te_lines('tabla', 'linesTE', clave, consecutivoXML, nombre_comercial, fecha_emision, emisor_num_identif, emisor_tel);
                                                                                                                                    $("#myBtn").show();
                                                                                                                                    sweetAlert({title: "Envio Exitoso!", text: "Se envio correctamente el comprobante", type: "success"});
                                                                                                                                    var user = [];
                                                                                                                                    user.w = 'facturador';
                                                                                                                                    user.r = 'companny_updateConsecutive';
                                                                                                                                    user.idMasterUser = localStorage.getItem('idMasterUser');
                                                                                                                                    user.env = client_id;
                                                                                                                                    user.tipoDocumento = tipoDocumento;
                                                                                                                                    crLibreApi_postRequest(user,
                                                                                                                                            function (data) {
                                                                                                                                                if (data.resp == '1') {
                                                                                                                                                    console.log("Consecutivo aumentado");
                                                                                                                                                    crLibreApi_add_voucher(clave, consecutivoXML, "enviado", xmlFirmado, "TE", "NULL", " NULL", client_id);

                                                                                                                                                } else {
                                                                                                                                                    console.log("Error recuperando las provincias");
                                                                                                                                                }
                                                                                                                                            },
                                                                                                                                            function (data) {
                                                                                                                                                sweetAlert({title: "Ocurrio aumentando consecutivo", type: "error"});
                                                                                                                                            });
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                sweetAlert({title: "Hacienda sin respuesta!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp[2], type: "error"});
                                                                                                                            }

                                                                                                                        },
                                                                                                                        function (data) {
                                                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                                                        });
                                                                                                            } else {
                                                                                                                sweetAlert({title: "Hacienda sin respuesta!", text: "Respuesta\nClave:\n" + data.resp.clave + "\nFecha:\n" + data.resp.fecha + "\nEstado:\n" + data.resp[2], type: "error"});
                                                                                                            }

                                                                                                        },
                                                                                                        function (data) {
                                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                                        });
                                                                                            } else {
                                                                                                sweetAlert({title: "Error en envio!", text: "Respuesta\nStatus:\n" + data.resp.Status + "\n", type: "error"});
                                                                                            }

                                                                                        },
                                                                                        function (data) {
                                                                                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                                        });
                                                                            },
                                                                            function (data) {
                                                                                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                                                                            });
                                                                }

                                                            } else {
                                                                console.log("Error recuperando las credenciales");
                                                            }
                                                        },
                                                        function (data) {
                                                            sweetAlert({title: "Ocurrio un error recuperando las credenciales", type: "error"});
                                                        });
                                            } else {
                                                console.log("Error cambiando el env");
                                            }
                                        },
                                        function (data) {
                                            sweetAlert({title: "Ocurrio un error cargando el entorno de facturacion", type: "error"});
                                        });
                            },
                            function (data) {
                                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
                            });
                } else {
                    console.log("Error recuperando los clientes");
                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando los clientes", type: "error"});
            });
}

function crLibreApi_registro_call() {

    var userData = [];
    userData.fullName = $("#name").val() + " " + $("#lastName").val();
    userData.userName = $("#userName").val();
    userData.userEmail = $("#email").val();
    userData.about = $("#companyName").val();
    userData.pwd = $("#password").val();
    userData.userCountry = $("#country").val();
    crLibreApi_registerUser(userData,
            function (data) {
                sweetAlert({title: "Bienvenido!", text: "Bienvenido al sistema\n" + userData.userName, type: "success"});
                iGoTo("general.html");
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}

function crLibreApi_companny_registro_call() {

    var userData = [];
    userData.fullName = $("#name").val() + " " + $("#lastName").val();
    userData.userName = $("#userName").val();
    userData.userEmail = $("#email").val();
    userData.about = "";
    userData.pwd = $("#password").val();
    userData.userCountry = $("#country").val();
    userData.idMasterUser = localStorage.getItem('idMasterUser');
    userData.settings = $("#idTerminal").val();
    crLibreApi_companny_registerUser(userData,
            function (data) {
                var userData = [];
                var user = [];
                user.w = 'facturador';
                user.r = 'companny_add_master_Consecutive';
                user.iam = localStorage.getItem('userName');
                user.sessionKey = localStorage.getItem('sessionKey');
                user.idMasterUser = localStorage.getItem('idMasterUser');
                user.idUser = data.resp.idUser;
                crLibreApi_postRequest(user,
                        function (data) {
                            if (data.resp == '14') {
                                sweetAlert({title: "Reistro exitoso!", text: "Registro exitoso", type: "success"});
                            } else {
                                console.log("Error registrando consecutivos del usuario");
                            }
                        },
                        function (data) {
                            sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
                        });
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}


function crLibreApi_certiUp_call() {
    var formData = new FormData();
    formData.append('w', 'fileUploader');
    formData.append('r', 'subir_certif');
    formData.append('iam', localStorage.getItem('userName'));
    formData.append('sessionKey', localStorage.getItem('sessionKey'));
    formData.append('fileToUpload', $('#fileToUpload')[0].files[0]);
    crLibreApi_postRequestFormData(formData,
            function (data) {
                if (data.resp !== 'null') {
                    var user = [];
                    user.w = 'facturador';
                    var client_id = $("#client_id").val();
                    if (client_id == 'api-stag') {
                        user.r = 'company_stag_users';
                    } else if (client_id === 'api-prod') {
                        user.r = 'company_prod_users';
                    }
                    console.log(data.resp);
                    var fileCode = data.resp.downloadCode;
                    user.downloadCode = fileCode;
                    user.userName = $("#userName").val();
                    user.password = $("#password").val();
                    user.pinCerti = $("#pinCerti").val();
                    user.iam = localStorage.getItem('userName');
                    user.sessionKey = localStorage.getItem('sessionKey');
                    crLibreApi_postRequest(user,
                            function (data) {
                                if (data.resp == "ok") {
                                    sweetAlert({title: "Registro de credenciales exitoso!", text: "Se guardo con exito los credenciales\n", type: "success"});
                                } else {
                                    sweetAlert({title: "Error al guardar!", text: "Se presento un error al guardar\nPor favor refrescar la paguina y intentar de nuevo", type: "error"});
                                }
                            },
                            function (data) {
                                sweetAlert({title: "Error!", text: "Error intentando registrar.\n", type: "error"});
                            });
                } else {
                    sweetAlert({title: "Error al guardar!", text: "Se presento un error al guardar el certificado", type: "error"});
                }
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando guardar certificados.\n", type: "error"});
            });

}

//Esta funcion resive 3 parametros
//table=tabla de donde vamos a contar
//columna=columnas a sumar
//id=id de html que vamos a remplazar
function crLibreApi_sumar_call(table, columna, id) {
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    var total = 0;
    columna = parseInt(columna);
    for (r = 0; r < cantidadLineas; r++) {
        total = parseInt(total) + parseInt(data[r][columna]);
    }
    document.getElementById(id).value = total;
}






//Esta funcion resive 3 parametros
//table=tabla de donde vamos a contar
//columna=columnas a sumar
//id=id de html que vamos a remplazar
function crLibreApi_CalculaSubTotal(table, columna, id) {
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    var subTotal = 0;
    var totalDescuento = 0;
    var totalImpuesto = 0;
    columna = parseInt(columna);
    for (r = 0; r < cantidadLineas; r++) {
        var precioTotal = (data[r][2] * parseInt(data[r][3])); // cantidad * unidad
        var descuento = precioTotal * (parseInt(data[r][4]) / 100);
        totalDescuento = totalDescuento + descuento;
        var IV = precioTotal * parseInt(data[r][5]) / 100;
        totalImpuesto = totalImpuesto + IV;
        var subTotal = precioTotal - descuento + IV;
    }
    document.getElementById(id).value = subTotal;
}

//Esta funcion resive 3 parametros
//table=tabla de donde vamos a contar
//columna=columnas a sumar
//id=id de html que vamos a remplazar
function crLibreApi_total_descuento(table, columna, id) {
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    var subTotal = 0;
    var totalDescuento = 0;
    columna = parseInt(columna);
    for (r = 0; r < cantidadLineas; r++) {
        var precioTotal = (data[r][2] * parseInt(data[r][3])); // cantidad * unidad
        var descuento = precioTotal * (parseInt(data[r][4]) / 100);
        totalDescuento = totalDescuento + descuento;
    }
    document.getElementById(id).value = totalDescuento;
}

function crLibreApi_total_impuesto(table, columna, id) {
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    var subTotal = 0;
    var totalDescuento = 0;
    var totalImpuesto = 0;
    columna = parseInt(columna);
    for (r = 0; r < cantidadLineas; r++) {
        var precioTotal = (data[r][2] * parseFloat(data[r][3])); // cantidad * unidad
        var descuento = precioTotal * (parseFloat(data[r][4]) / 100);
        totalDescuento = totalDescuento + descuento;
        subTotal = precioTotal - descuento;
        var IV = subTotal * parseInt(data[r][5]) / 100;
        totalImpuesto = totalImpuesto + IV;

    }
    document.getElementById(id).value = totalImpuesto;
}

function crLibreApi_get_te_lines(table, appendTable, clave, consecutivo, nombreComercial, fecha, cedula, telefono) {

    $("#teNombreComercial").append(nombreComercial);
    $("#teFecha").append(fecha);
    $("#teClave").append("Clave: " + clave);
    $("#teConsucutivo").append("Consecutivo: " + consecutivo);
    $("#teCedula").append("Cedula: " + cedula);
    $("#teTel").append("TEL: " + telefono);
    $("#" + appendTable).empty();
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;

    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;

        }
    }
    for (r = 0; r < cantidadLineas; r++) {
        $("#" + appendTable).append('<tr><td class="cantidad">' + data[r][2] + '</td><td  class="producto">' + data[r][0] + '</td><td class="precio">' + data[r][3] + '</td></tr>');
    }



    $("#" + appendTable).append('<tr><td><br></td><td><br></td><td><br></td></tr><tr>');
    $("#" + appendTable).append('<tr><td>Total Venta:<br></td><td>' + $("#totalVenta").val() + '</td><td>' + $("#tipoMoneda").val() + '</td></tr>');
    $("#" + appendTable).append('<tr><td>Descuento Total:<br></td><td>' + $("#descuenteTotal").val() + '</td><td>' + $("#tipoMoneda").val() + '</td></tr>');
    $("#" + appendTable).append('<tr><td>Total Venta Neta:<br></td><td>' + $("#ventaNeta").val() + '</td><td>' + $("#tipoMoneda").val() + '</td></tr>');
    $("#" + appendTable).append('<tr><td>Impuesto Total:<br></td><td>' + $("#impuestoTotal").val() + '</td><td>' + $("#tipoMoneda").val() + '</td></tr>');
    $("#" + appendTable).append('<tr><td>Total:<br></td><td>' + $("#total").val() + '</td><td>' + $("#tipoMoneda").val() + '</td></tr>');

}


//Esta funcion resive 3 parametros
//table=tabla de donde vamos a contar
//columna=columnas a sumar
//id=id de html que vamos a remplazar
function crLibreApi_CalculaTotalGravadoExcento(table) {
    var totalMercansiaGravada = 0;
    var totalMercansiaExcento = 0;
    var totalServicioGravado = 0;
    var totalServioExcenta = 0;
    var totalGravado = 0;
    var totalExcento = 0;
    var totalVenta = 0;
    var subTotal = 0;
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    for (r = 0; r < cantidadLineas; r++) {
        var precioTotal = (data[r][2] * parseInt(data[r][3])); // cantidad * unidad
        if (data[r][1] === 'Sp' && data[r][5] === '0') {
            totalServioExcenta = totalServioExcenta + (data[r][2] * parseFloat(data[r][3])); // cantidad * unidad
            console.log("totalServicioExcento " + data[r][1] + " " + data[r][5] + " :" + totalServioExcenta);
        } else if (data[r][1] === 'Sp' && data[r][5] !== '0') {
            totalServicioGravado = totalServicioGravado + (precioTotal + (precioTotal * parseInt(data[r][5]) / 100)); // cantidad * unidad
            console.log("totalServicioGravado" + data[r][1] + " " + data[r][5] + " :" + totalServicioGravado);
        } else if (data[r][1] !== 'Sp' && data[r][5] === '0') {
            console.log("totalMercanciaExcento " + data[r][1] + " " + data[r][5] + " :" + totalMercansiaExcento);
            totalMercansiaExcento = totalMercansiaExcento + (data[r][2] * parseFloat(data[r][3])); // cantidad * unidad
        } else if (data[r][1] !== 'Sp' && data[r][5] !== '0') {
            console.log("totalMercanciaGravada " + data[r][1] + " " + data[r][5] + " :" + totalMercansiaGravada);
            totalMercansiaGravada = totalMercansiaGravada + (precioTotal + (precioTotal * parseInt(data[r][5]) / 100)); // cantidad * unidad
        }
    }
    totalGravado = totalServicioGravado + totalMercansiaGravada;
    totalExcento = totalServioExcenta + totalMercansiaExcento;
    totalVenta = totalGravado + totalExcento;

    $("#TotalServGravados").val(totalServicioGravado);
    $("#TotalServExentos").val(totalServioExcenta);
    // $("#impuestoTotal").val(totalGravado);
    $("#TotalMercanciasGravadas").val(totalMercansiaGravada);
    $("#TotalMercanciasExentas").val(totalMercansiaExcento);
    $("#TotalGravado").val(totalGravado);
    $("#TotalExento").val(totalExcento);
    $("#TotalServGravados").val(totalServicioGravado);
    $("#totalVenta").val(totalVenta);
}


//Esta funcion resive 3 parametros
//table=tabla de donde vamos a contar
//columna=columnas a sumar
//id=id de html que vamos a remplazar
function crLibreApi_CalculaTotal(table, columna, id) {
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    var subTotal = 0;
    columna = parseInt(columna);
    for (r = 0; r < cantidadLineas; r++) {
        var precioTotal = (data[r][2] * parseInt(data[r][3])); // cantidad * unidad
        var descuento = precioTotal * (parseInt(data[r][4]) / 100);
        var IV = precioTotal * parseInt(data[r][5]) / 100;
        var subTotal = precioTotal - descuento + IV;
    }
    document.getElementById(id).value = subTotal;
}


function crLibreApi_CalculaLineas(table) {
    var cantidadLineas = document.getElementById(table).getElementsByTagName("tr").length;
    var cantidadColumnas = document.getElementById(table).rows[0].getElementsByTagName("td").length - 1;
    var data = [];
    for (i = 0; i < cantidadLineas; i++) {
        data[i] = [];
        for (j = 0; j < cantidadColumnas; j++) {
            data[i][j] = document.getElementById(table).rows[i].cells[j].getElementsByTagName('input')[0].value;
        }
    }
    var subTotal = 0;
    var precioTotal = 0;
    for (r = 0; r < cantidadLineas; r++) {
        precioTotal = (data[r][2] * parseInt(data[r][3])); // cantidad * unidad
        var descuento = precioTotal * (parseInt(data[r][4]) / 100);
        var IV = precioTotal * parseInt(data[r][5]) / 100;
        var subTotal = precioTotal - descuento + IV;
        document.getElementById(table).rows[r].cells[6].getElementsByTagName('input')[0].value = precioTotal;
        document.getElementById(table).rows[r].cells[7].getElementsByTagName('input')[0].value = subTotal;
    }

}

function crLibreApi_formUpdate() {
    crLibreApi_sumar_call('tabla', 2, 'cantidad');

    crLibreApi_total_descuento('tabla', 4, 'descuenteTotal');
    crLibreApi_total_impuesto('tabla', 5, 'impuestoTotal');
    crLibreApi_CalculaLineas('tabla');
    crLibreApi_CalculaTotalGravadoExcento('tabla');
    $("#ventaNeta").val($("#totalVenta").val() - $("#descuenteTotal").val());
    $("#total").val(parseFloat($("#ventaNeta").val()) + parseFloat($("#impuestoTotal").val()));
}


function addmenu() {
    $("#default-drawer").append('' +
            '            <div class="mdk-drawer__content">' +
            '                    <div class="mdk-drawer__inner" data-simplebar="" data-simplebar-force-enabled="true">' +
            '                        <nav class="drawer  drawer--dark">' +
            '                            <div class="drawer-spacer">' +
            '                                <div class="media align-items-center">' +
            '                                    <a href="./index.html" class="drawer-brand-circle mr-2" id="siteTitleCircule">CR</a>' +
            '                                    <div class="media-body">' +
            '                                        <a href="./index.html" class="h5 m-0 text-link" id="siteTitle"></a>' +
            '                                    </div>' +
            '                                </div>' +
            '                            </div>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Dashboards' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="dasboardMenu" data-children=".drawer-submenu">' +
            '                                <li class="drawer-menu-item active ">' +
            '                                    <a href="./index.html">' +
            '                                        <i class="material-icons">poll</i>' +
            '                                        <span class="drawer-menu-text"> Inicio</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                            </ul>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Administracion' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="mainMenu" data-children=".drawer-submenu">' +
            '                                <li class="drawer-menu-item drawer-submenu">' +
            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#uiComponentsMenu" aria-controls="uiComponentsMenu" aria-expanded="false" class="collapsed">' +
            '                                        <i class="material-icons">library_books</i>' +
            '                                        <span class="drawer-menu-text">Comprobantes</span>' +
            '                                    </a>' +
            '                                    <ul class="collapse " id="uiComponentsMenu">' +
            '                                        <li class="drawer-menu-item "><a href="./factura.html">Factura</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./tiquete.html">Tiquete Electronico</a></li>' +
//            '                                        <li class="drawer-menu-item "><a href="./ui-colors.html">Nota de Credito</a></li>' +
//            '                                        <li class="drawer-menu-item "><a href="./ui-grid.html">Nota de Debito</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./mh_mr.html">Mensaje Aceptacion</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./mh_comprobantes.html">Todos mis comprobantes</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./mh_consulta.html">Revisar Manual</a></li>' +
            '                                    </ul>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item drawer-submenu">' +
            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#formsMenu" aria-controls="formsMenu" aria-expanded="false" class="collapsed">' +
            '                                        <i class="material-icons">assignment_ind</i>' +
            '                                        <span class="drawer-menu-text"> Clientes</span>' +
            '                                    </a>' +
            '                                    <ul class="collapse " id="formsMenu">' +
            '                                        <li class="drawer-menu-item "><a href="./mh_clientes.html">Ver clientes</a></li>' +
            '                                    </ul>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item drawer-submenu">' +
            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#formsCompany" aria-controls="formsCompany" aria-expanded="false" class="collapsed">' +
            '                                        <i class="material-icons">work</i>' +
            '                                        <span class="drawer-menu-text">Compañia</span>' +
            '                                    </a>' +
            '                                    <ul class="collapse " id="formsCompany">' +
            '                                        <li class="drawer-menu-item "><a href="./mh_inventario.html">Inventario</a></li>' +
            '                                    </ul>' +
            '                                </li>' +
            '                            </ul>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Paginas' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="mainMenu" data-children=".drawer-submenu">' +
//            '                                <li class="drawer-menu-item">' +
//            '                                    <a href="./account.html">' +
//            '                                        <i class="material-icons">edit</i>' +
//            '                                        <span class="drawer-menu-text">Editar cuenta</span>' +
//            '                                    </a>' +
//            '                                </li>' +
            '                            </ul>' +
            '                        </nav>' +
            '                    </div>' +
            '                </div>');
}

function addAdminMenu() {
    $("#default-drawer").append('' +
            '            <div class="mdk-drawer__content">' +
            '                    <div class="mdk-drawer__inner" data-simplebar="" data-simplebar-force-enabled="true">' +
            '                        <nav class="drawer  drawer--dark">' +
            '                            <div class="drawer-spacer">' +
            '                                <div class="media align-items-center">' +
            '                                    <a href="./index.html" class="drawer-brand-circle mr-2" id="siteTitleCircule"></a>' +
            '                                    <div class="media-body">' +
            '                                        <a href="./index.html" class="h5 m-0 text-link" id="siteTitle"></a>' +
            '                                    </div>' +
            '                                </div>' +
            '                            </div>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Dashboards' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="dasboardMenu" data-children=".drawer-submenu">' +
            '                                <li class="drawer-menu-item active ">' +
            '                                    <a href="./index.html">' +
            '                                        <i class="material-icons">poll</i>' +
            '                                        <span class="drawer-menu-text"> Inicio</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                            </ul>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Administracion' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="mainMenu" data-children=".drawer-submenu">' +
//            '                                <li class="drawer-menu-item drawer-submenu">' +
//            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#formsCompany" aria-controls="formsCompany" aria-expanded="false" class="collapsed">' +
//            '                                        <i class="material-icons">work</i>' +
//            '                                        <span class="drawer-menu-text">Compañia</span>' +
//            '                                    </a>' +
//            '                                    <ul class="collapse " id="formsCompany">' +
//            '                                        <li class="drawer-menu-item "><a href="./mh_inventario.html">Inventario</a></li>' +
//            '                                    </ul>' +
//            '                                </li>' +
            '                                <li class="drawer-menu-item drawer-submenu">' +
            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#formsConfig" aria-controls="formsConfig" aria-expanded="false" class="collapsed">' +
            '                                        <i class="material-icons">settings</i>' +
            '                                        <span class="drawer-menu-text"> Configuracion</span>' +
            '                                    </a>' +
            '                                    <ul class="collapse " id="formsConfig">' +
            '                                        <li class="drawer-menu-item "><a href="./general.html">General</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./certi_up.html">Config. MH CR</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./mh_test.html">Test de Conexion</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./mh_usuarios.html">Usuarios</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./mh_sucursales.html">Sucursales</a></li>                                    ' +
            '                                        <li class="drawer-menu-item "><a href="./mh_terminales.html">Terminales</a></li>                                    ' +
            '                                    </ul>' +
            '                                </li>' +
            '                            </ul>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Paginas' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="mainMenu" data-children=".drawer-submenu">' +
//            '                                <li class="drawer-menu-item">' +
//            '                                    <a href="./account.html">' +
//            '                                        <i class="material-icons">edit</i>' +
//            '                                        <span class="drawer-menu-text">Editar cuenta</span>' +
//            '                                    </a>' +
//            '                                </li>' +
            '                            </ul>' +
            '                        </nav>' +
            '                    </div>' +
            '                </div>');
    bootSettings();
}

function addRow(inIdRow) {
    var idRow = inIdRow;
    if (!idRow) {
        idRow = 0;
    }
    $("#tabla").append('<tr id="' + idRow + '">' +
            '          <td class="align-middle" onfocusout="crLibreApi_formUpdate()">' +
            '              <input id="code' + idRow + '" autofocus onkeypress="feTableEnter(this);" onchange="crLibreApi_formUpdate();" type="text" class="form-control" placeholder="Camara">' +
            '          </td>' +
            '          <td class="align-middle"><input id="unidad' + idRow + '" onfocusout="crLibreApi_formUpdate()" onchange="crLibreApi_formUpdate();" type="text" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input value="1" id"cantidad' + idRow + '" onfocusout="crLibreApi_formUpdate()" value="0" onchange="crLibreApi_formUpdate();" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input id="precio' + idRow + '" onfocusout="crLibreApi_formUpdate()" onchange="crLibreApi_formUpdate();" type="text" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input id"descuento' + idRow + '" onfocusout="crLibreApi_formUpdate()" value="0" onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input readonly value="0" id="iv' + idRow + '" onfocusout="crLibreApi_formUpdate()" onchange="crLibreApi_formUpdate();" type="text" class="form-control"  placeholder=""><input hiden value="0" id="idIV' + idRow + '" type="hidden" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input id"subtotal' + idRow + '" onfocusout="crLibreApi_formUpdate()" value="0" readonly onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input id"total' + idRow + '" onfocusout="crLibreApi_formUpdate()" value="0" readonly onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle text-right">' +
            '              <button onfocusout="crLibreApi_formUpdate()" onclick="$(this).parent().parent().remove();crLibreApi_formUpdate();" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Delete">' +
            '                  <i class="material-icons md-14 align-middle">delete</i>' +
            '              </button>' +
            '          </td>' +
            '      </tr>');
}


function feTableEnter(id) {

    if (event.keyCode === 13) {
        idRow = ($(id).closest('tr')[0].rowIndex);
        crLibreApi_getProduct(idRow - 1);
        idRow = ($(id).closest('tr')[0].rowIndex);
        addRow(idRow);
        console.log("Row index is: " + idRow);
        $('#tabla tr:eq(' + idRow + ') td :input:enabled:visible:first').focus();
    } else if (event.keyCode === 9) {
        idRow = ($(id).closest('tr')[0].rowIndex);
        crLibreApi_getProduct(idRow - 1);
        console.log("Row index is: " + idRow);
    }
}

function createAndOpenFile(xmlFirmadoBase64) {
    var xml= atob(xmlFirmadoBase64);    
    download(descargaXMLClave+".xml",xml);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function crLibreApi_companny_consecutive_by_terminal(tipoComprobante) {

    var user = [];
    user.w = 'facturador';
    user.r = 'company_get_env';
    user.iam = localStorage.getItem('userName');
    user.sessionKey = localStorage.getItem('sessionKey');
    user.idMasterUser = localStorage.getItem('idMasterUser');
    crLibreApi_postRequest(user,
            function (data) {
                if (typeof data.resp == 'object') {
                    var user = [];
                    user.w = 'facturador';
                    user.r = 'companny_getMyConsecutive';
                    user.iam = localStorage.getItem('userName');
                    user.sessionKey = localStorage.getItem('sessionKey');
                    user.idMasterUser = localStorage.getItem('idMasterUser');
                    user.tipoComprobante = tipoComprobante;
                    user.env = data.resp[0].env;
                    crLibreApi_postRequest(user,
                            function (data) {
                                var consecutivo = data.resp[0].consecutivo;
                                var siguienteConsecutivo = parseInt(consecutivo) + 1;
                                $("#feConsecutivo").val(siguienteConsecutivo);
                            },
                            function (data) {
                                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
                            });

                }
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });


}

function crLibreApi_make_clave(tipoDocumento, tipoCedula, cedula, codigoPais, consecutivo, situacion, codigoSeguridad) {

    var user = [];
    user.w = 'clave';
    user.r = 'clave';
    user.tipoDocumento = tipoDocumento;
    user.tipoCedula = tipoCedula;
    user.cedula = cedula;
    user.codigoPais = codigoPais;
    user.consecutivo = consecutivo;
    user.situacion = situacion;
    user.codigoSeguridad = codigoSeguridad;
    crLibreApi_postRequest(user,
            function (data) {
                var resp = [];
                resp.clave = data.resp[0].clave;
                resp.consecutivo = data.resp[0].consecutivo;
                return resp;
            },
            function (data) {
                sweetAlert({title: "Ocurrio un error cargando las provincias", type: "error"});
            });
}






