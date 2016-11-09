function change_screen_barcode(){
	
	cordova.plugins.barcodeScanner.scan(
      function (result) {
          alerta("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
      }, 
      function (error) {
          alerta("Scanning failed: " + error);
      },
      {
          "formats" : "CODE_39", // default: all but PDF_417 and RSS_EXPANDED
      }
   );

}