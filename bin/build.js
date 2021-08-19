const crawler = require('crawler-request');
 
crawler("https://www.gsi.go.jp/KOKUJYOHO/CENTER/kendata/zenken.pdf").then(function(response){
    // handle response
    console.log(response.text);
});