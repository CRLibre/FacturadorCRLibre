function crLibreFront_boot(){
    crLibreApi_checkLogin(function(){
        crLibreFront_debug("Logueado");
        //Menu principal
        crLibreFront_menuScreen();
        
    }, function(){
        crLibreFront_debug("No logueado");
        //Ventana de login
        crLibreFront_loginScreen();
    });
}

function crLibreFront_loginScreen(){
    //Login screen
    
    var loginScreen = "html";
    
    crLibreFront_setContent(loginScreen);
    
}

function crLibreFront_menuScreen(){
    //Login screen
    
    var loginScreen = "html";
    
    crLibreFront_setContent(loginScreen);
    
}


/**********************************/
/*Function to set content         */
/**********************************/
function crLibreFront_setContent(c){
    $('#crlibre_content').empty();
    $('#crlibre_content').append(c);
}


function crLibreFront_debug(d){
    console.log("[crLibreFront] >> " + d);
    
}