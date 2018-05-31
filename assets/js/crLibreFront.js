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
                iGoTo("index.html");
            },
            function (data) {
                sweetAlert({title: "Error!", text: "Error intentando ingresar.\n", type: "error"});
            });
}


function crLibreApi_registro_call() {

    var userData = [];
    userData.fullName = $("#name").val() + " " + $("#lastName").val();
    userData.userName = $("#userName").val();
    userData.userEmail = $("#email").val();
    userData.pwd = $("#password").val();
    userData.userCountry = $("#country").val();

    crLibreApi_registerUser(userData,
            function (data) {
                sweetAlert({title: "Bienvenido!", text: "Bienvenido al sistema\n" + userData.userName, type: "success"});
                iGoTo("index.html");
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
    $.ajax({
        url: api_url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            sweetAlert({title: "Exito!", text: "El archivo se subio con exito", type: "success"});
        }

    });
}
;

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
        document.getElementById(table).rows[r].cells[6].getElementsByTagName('input')[0].value=precioTotal;
        document.getElementById(table).rows[r].cells[7].getElementsByTagName('input')[0].value=subTotal;
    }
    
}

function crLibreApi_formUpdate() {
    crLibreApi_sumar_call('tabla', 2, 'cantidad');
    crLibreApi_sumar_call('tabla', 4, 'descuenteTotal');
    crLibreApi_sumar_call('tabla', 5, 'impuestoTotal');
    crLibreApi_sumar_call('tabla', 6, 'subTotal');
    crLibreApi_sumar_call('tabla', 7, 'total');
    crLibreApi_CalculaLineas('tabla');
}


function addmenu() {
    $("#default-drawer").append('' +
            '            <div class="mdk-drawer__content">' +
            '                    <div class="mdk-drawer__inner" data-simplebar="" data-simplebar-force-enabled="true">' +
            '                        <nav class="drawer  drawer--dark">' +
            '                            <div class="drawer-spacer">' +
            '                                <div class="media align-items-center">' +
            '                                    <a href="./index.html" class="drawer-brand-circle mr-2">CR</a>' +
            '                                    <div class="media-body">' +
            '                                        <a href="./index.html" class="h5 m-0 text-link">Facturador - CRLibre</a>' +
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
            '                                <li class="drawer-menu-item  ">' +
            '                                    <a href="./certi_up.html">' +
            '                                        <i class="material-icons">tab</i>' +
            '                                        <span class="drawer-menu-text"> Subir Certificado</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item drawer-submenu">' +
            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#uiComponentsMenu" aria-controls="uiComponentsMenu" aria-expanded="false" class="collapsed">' +
            '                                        <i class="material-icons">library_books</i>' +
            '                                        <span class="drawer-menu-text">Comprobantes</span>' +
            '                                    </a>' +
            '                                    <ul class="collapse " id="uiComponentsMenu">' +
            '                                        <li class="drawer-menu-item "><a href="./factura.html">Factura</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./ui-colors.html">Nota de Credito</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./ui-grid.html">Nota de Debito</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./ui-icons.html">Mensaje Aceptacion</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./ui-typography.html">Todos mis comprobantes</a></li>' +
            '                                    </ul>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item drawer-submenu">' +
            '                                    <a data-toggle="collapse" data-parent="#mainMenu" href="#" data-target="#formsMenu" aria-controls="formsMenu" aria-expanded="false" class="collapsed">' +
            '                                        <i class="material-icons">text_format</i>' +
            '                                        <span class="drawer-menu-text"> Clientes</span>' +
            '                                    </a>' +
            '                                    <ul class="collapse " id="formsMenu">' +
            '                                        <li class="drawer-menu-item "><a href="./form-controls.html">Ver clientes</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./checkboxes-radios.html">Agregar Cliente</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./switches-toggles.html">Eliminar Cliente</a></li>' +
            '                                        <li class="drawer-menu-item "><a href="./form-layout.html">Editar Cliente</a></li>                                    ' +
            '                                    </ul>' +
            '                                </li>' +
            '                            </ul>' +
            '                            <!-- HEADING -->' +
            '                            <div class="py-2 drawer-heading">' +
            '                                Paguinas' +
            '                            </div>' +
            '                            <!-- MENU -->' +
            '                            <ul class="drawer-menu" id="mainMenu" data-children=".drawer-submenu">' +
            '                                <li class="drawer-menu-item">' +
            '                                    <a href="./account.html">' +
            '                                        <i class="material-icons">edit</i>' +
            '                                        <span class="drawer-menu-text">Edit Account</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item">' +
            '                                    <a href="./login.html">' +
            '                                        <i class="material-icons">lock</i>' +
            '                                        <span class="drawer-menu-text">Login</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item">' +
            '                                    <a href="./signup.html">' +
            '                                        <i class="material-icons">account_circle</i>' +
            '                                        <span class="drawer-menu-text">Sign Up</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                                <li class="drawer-menu-item">' +
            '                                    <a href="./forgot-password.html">' +
            '                                        <i class="material-icons">help</i>' +
            '                                        <span class="drawer-menu-text">Forgot Password</span>' +
            '                                    </a>' +
            '                                </li>' +
            '                            </ul>' +
            '                        </nav>' +
            '                    </div>' +
            '                </div>');
}

function addRow() {
    $("#tabla").append('<tr >' +
            '          <td class="align-middle" onfocusout="crLibreApi_formUpdate()">' +
            '              <input  onchange="crLibreApi_formUpdate();" type="text" class="form-control" placeholder="Camara">' +
            '          </td>' +
            '          <td class="align-middle"><input  onfocusout="crLibreApi_formUpdate()" onchange="crLibreApi_formUpdate();" type="text" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input  onfocusout="crLibreApi_formUpdate()" value="0" onchange="crLibreApi_formUpdate();" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input onfocusout="crLibreApi_formUpdate()"  value="0" onchange="crLibreApi_formUpdate();" type="number" class="form-control" placeholder=""></td>' +
            '          <td class="align-middle"><input onfocusout="crLibreApi_formUpdate()" value="0" onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input onfocusout="crLibreApi_formUpdate()"  value="0" onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input onfocusout="crLibreApi_formUpdate()" value="0" readonly onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle"><input onfocusout="crLibreApi_formUpdate()" value="0" readonly onchange="crLibreApi_formUpdate()" type="number" class="form-control"  placeholder=""></td>' +
            '          <td class="align-middle text-right">' +
            '              <button onfocusout="crLibreApi_formUpdate()" onclick="$(this).parent().parent().remove();crLibreApi_formUpdate();" class="btn btn-danger btn-sm " data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Delete">' +
            '                  <i class="material-icons md-14 align-middle">delete</i>' +
            '              </button>' +
            '          </td>' +
            '      </tr>');
}











