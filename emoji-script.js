var SKIN_BUTTON_OPTION_CLICKED="";

function search_emojis(){
  $("#search-emojis-results").empty();
  var emoji_keyword=$("#search-emojis-input").val().toLowerCase().trim();  

  //Log the data to JSON console
  //data_emoji=[];

  var num_emojis=0;

  if(emoji_keyword.length>0){
    $("#emojis-content-container .searchable .emoji_span_container").each(function(){
      if(($(this).attr('title')+" "+$(this).data('emoji-keywords')).toLowerCase().indexOf(emoji_keyword)>=0){
        $("#search-emojis-results").append($(this).clone());  
        num_emojis++;      
      }
      else if($(this).attr('data-emoji')==emoji_keyword.trim()){
        $("#search-emojis-results").append($(this).clone());
        var emoji_description_str="<span>&nbsp;&nbsp; - "+$(this).attr('title')+"</span>";
        $("#search-emojis-results").append(emoji_description_str);
        num_emojis++;
        // $(this).mouseover();
      }
    });
  }
  else{
    $("#emojis-content-container .searchable .emoji_span_container").each(function(){
      $("#search-emojis-results").append($(this).clone());
      num_emojis++;
    });      
  }
  var MATCH_STR="MATCH";
  if(num_emojis>=2)
    MATCH_STR="MATCHES";

  var num_emojis_str="<br/><span><em>"+num_emojis+" " + MATCH_STR+"</em></span>";
  $("#search-emojis-results").append(num_emojis_str);
}


function setAutoCopyEmoji(){
  emojiAutoCopy= new Clipboard('.emoji_span_container');
    emojiAutoCopy.on('success', function(event) {
        event.clearSelection();              
        document.getElementById("copy_notification_text").textContent = "  Copied";

        window.setTimeout(function() {
            document.getElementById("copy_notification_text").textContent = "";
        }, 5000);
    });
}

$(document).ready(function(){

  $("#emojis-content-container").on('click','.emoji_span_container',function(){
    // var emoji=$(this).data('emoji');
    // insertAtCaret("emoji-message",emoji);

    var the_emoji=$(this).data('emoji');

    insertAtCaret("emoji-message",the_emoji);

    var class_value=$(this).attr('class');
    var title=$(this).attr('title');
    var emoji_object={"class":class_value,"title":title,"emoji":the_emoji};

    $(this).animate({marginTop: '+=9px'}, 40);
    $(this).animate({marginTop: '-=9px'}, 80);
    
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        //emoji: emoji
        emoji_object: emoji_object
      }, function (response) {
      });
    });

  });

  

  $("#emojis-content-container").on('mouseenter','.emoji_span_container',function(){
    var emoji=$(this).data('emoji');
    var emoji_title=$(this).attr('title');
    $("#current_emoji_title").html('<span class="emoji_big">'+emoji + '</span> '+ emoji_title + "<span id='copy_notification_text'></span>");
    
    $(this).css('border-color','#ff3300');
    $(this).css('margin-top','-9px');
  });

  $("#emojis-content-container").on('mouseleave','.emoji_span_container',function(){
    $("#current_emoji_title").html('<span class="emoji_big">&nbsp;</span>');

    $(this).css('border-color','#000000');
    $(this).css('margin-top','0px');
  });
  

  var search_box=$("#search-emojis-input");
  search_box.on('input propertychange updateInfo',search_emojis);
  search_box.on('paste', function () {
    setTimeout(function () {
      search_emojis();
    }, 10);
  });


  var copyButton= new Clipboard('#copy-btn');
  copyButton.on('success', function(event) {
      event.clearSelection();
      // event.trigger.textContent = 'Copied';
      document.getElementById("copy_text").textContent = "Copied";


      window.setTimeout(function() {
          // event.trigger.textContent = 'Copy';
          document.getElementById("copy_text").textContent = "Copy message";
      }, 3000);
  });
  copyButton.on('error', function(event) { 
      event.trigger.textContent = 'Press "Ctrl + C" to copy';
      window.setTimeout(function() {
          // event.trigger.textContent = 'Copy';
          document.getElementById("copy_text").textContent = "Copy";
      }, 2000);
  });

  //Auxilary useful functions
  function insertAtCaret(areaId, text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var caretPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0, caretPos);
    var back = (txtarea.value).substring(txtarea.selectionEnd, txtarea.value.length);
    txtarea.value = front + text + back;
    caretPos = caretPos + text.length;
    txtarea.selectionStart = caretPos;
    txtarea.selectionEnd = caretPos;
    // txtarea.focus();
    txtarea.scrollTop = scrollPos;
  }
  //For the link to web version
  $("body").on('click','a',function(){
    if($(this).attr('class')=="web_version_link"){
      chrome.tabs.create({url:$(this).attr('href')});
      return false;
    }    
  });
  // For tab event
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    $("#emoji-message-box").show();
    $("#copy-btn-container").show();
    $("#current_emoji_title").show(); 
    $("#web_version_introduction").show();

    var target = $(e.target).attr("href") // activated tab
    if(target=="#search-emojis"){
      //search_emojis();
      $("#search-emojis-input").focus();
      $("#search_area").height($("#smileys_people").height());
      $("#search-emojis-results").height($("#smileys_people").height() - $("#search-emojis-input").outerHeight(true)-20);
    

      // $("#option-emojis").height($("#smileys_people").height());
      $("#emoji-message-box").hide();
      $("#copy-btn-container").hide();
      $("#current_emoji_title").hide();   
      $("#web_version_introduction").hide();
      
    }
    else if(target=="#recent_emojis"){
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          "request": "get_recent_emojis_list"
        }, function (response) {
          if(response){
            var recent_emojis_list=response.recent_emojis_list_response;
            update_recent_emojis_list(recent_emojis_list);
          }
        });
      });
    }
  });


  //If there is recent emojis, go to recent emoji tabs
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      "request": "get_recent_emojis_list"
    }, function (response) {
      if(response)
        var recent_emojis_list=response.recent_emojis_list_response;
      if(!recent_emojis_list || recent_emojis_list.length==0)
        $("#people_ahref").click();
      else{
        update_recent_emojis_list(recent_emojis_list);
      }
    });
  });


  //Set auto copy 
  setAutoCopyEmoji();


  $("#skin_button_option_container").on('click','.skin_button_option',function(){
    if(SKIN_BUTTON_OPTION_CLICKED!=$(this).data("tone")){
      $("#skin_button_option_container .skin_button_option").css('width','22px');
      $(this).css('width','30px');
      show_tones($(this).data("tone"));
      SKIN_BUTTON_OPTION_CLICKED=$(this).data("tone");
    }
    else{
      $("#skin_button_option_container .skin_button_option").css('width','22px');
      show_tones($(this).data("all_tones"));
      SKIN_BUTTON_OPTION_CLICKED="";
    }
  });

});


function show_tones(the_tone){
  $("#skin_tones .emoji_span_container").hide();

  switch (the_tone) {
    case "tone1_white":
      $("#skin_tones .tone1_white").show();
      break;
    case "tone2_lightbrown":   
      $("#skin_tones .tone2_lightbrown").show();   
      break;
    case "tone3_olive":      
      $("#skin_tones .tone3_olive").show();
      break;
    case "tone4_deeper_brown":    
      $("#skin_tones .tone4_deeper_brown").show();  
      break;
    case "tone5_black":  
      $("#skin_tones .tone5_black").show();    
      break;
    default:
      $("#skin_tones .emoji_span_container").show();
      break;
  }
}

function update_recent_emojis_list(recent_emojis_list){
  var recent_emojis_html="";

  var arrayLength = recent_emojis_list.length;
  for (var i = 0; i < arrayLength; i++) {
    var current_emoji=recent_emojis_list[i];
    recent_emojis_html=recent_emojis_html+'<span class="'+current_emoji["class"]+
        ' recent_emoji"     data-emoji="'+current_emoji["emoji"]+
        '"     title="'+current_emoji["title"]+
        '" data-clipboard-text="'+current_emoji["emoji"]+'"></span>';
  }

  $("#recent_emojis").html(recent_emojis_html);
}