
function introduce_web_version(){
  KEY_WEB_VERSION_INTRODUCED="KEY_WEB_VERSION_INTRODUCED";
  chrome.storage.local.get(KEY_WEB_VERSION_INTRODUCED, function(result){
    if (result[KEY_WEB_VERSION_INTRODUCED] == "INTRODUCED"){   
      //Does nothing      
    }
    else{      
      var web_version_URL = "https://emojikeyboard.org/?utm_source=firefox_ext_first_visit&utm_medium=firefox_ext&utm_campaign=firefox_ext_camp";
      chrome.tabs.create({url:web_version_URL});

      var web_introduced_option = {};
      web_introduced_option[KEY_WEB_VERSION_INTRODUCED]="INTRODUCED";
      chrome.storage.local.set(web_introduced_option, function() {     
      });
    }
  });
}

//Introducing the web version, once in a lifetime only
introduce_web_version();