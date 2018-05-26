function crLibreFront_boot(){
    crLibreApi_checkLogin(function(){
        crLibreFront_debug("Logueado");
        //Menu principal
        
    }, function(){
        crLibreFront_debug("No logueado");
        //Ventana de login
    });
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