// Code goes here

function imprimir() {
    var divToPrint = document.getElementById("divTT");
    newWin = window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();    
}