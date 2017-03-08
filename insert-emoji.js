var MAX_RECENT_EMOJIS_QUATITY=60;
var KEY_RECENT_EMOJIS_LIST="KEY_RECENT_EMOJIS_LIST_V3";
recent_emojis_list=[];

chrome.storage.local.get(KEY_RECENT_EMOJIS_LIST, function(result){
  recent_emojis_list=result[KEY_RECENT_EMOJIS_LIST];
});

function add_emoji_to_recent_list(emoji_object){
  if(!recent_emojis_list)
    recent_emojis_list=[];
  var arrayLength = recent_emojis_list.length;
  for (var i = 0; i < arrayLength; i++) {
    if(emoji_object["emoji"]==recent_emojis_list[i]["emoji"]){
      recent_emojis_list.splice(i,1);
      break;
    }
  }

  while(recent_emojis_list.length>=MAX_RECENT_EMOJIS_QUATITY){
    recent_emojis_list.pop();
  }
  recent_emojis_list.unshift(emoji_object);
  // Array.prototype.unshift.call(recent_emojis_list, emoji_object);

  var recent_emoji_list_dict={};
  recent_emoji_list_dict[KEY_RECENT_EMOJIS_LIST]=recent_emojis_list;

  // Cookies.set('recent_emojis_list', recent_emojis_list, { expires: 10 });
  chrome.storage.local.set(recent_emoji_list_dict, function() {
  });
}



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log("from the extension: "+ request.emoji);
    if(request.request=="get_recent_emojis_list"){
        sendResponse({"recent_emojis_list_response": recent_emojis_list});
        return true;
    }
    else{

      // var emoji = request.emoji;
      // insertEmoji(emoji);

      add_emoji_to_recent_list(request.emoji_object);

      var emoji = request.emoji_object.emoji;

      var inputElem=document.activeElement;
      var scrollPos = inputElem.scrollTop;
      var caretPos = 0;
      var oldText="";
      

      if (inputElem.tagName.toLowerCase() === 'input' || inputElem.tagName.toLowerCase() === 'textarea') {
        oldText = inputElem.value;
        caretPos = inputElem.selectionStart;
        var front = (inputElem.value).substring(0, caretPos);
        var back = (inputElem.value).substring(inputElem.selectionEnd, inputElem.value.length);
      } else {
        oldText = inputElem.innerText;
      }    

      if (inputElem.tagName.toLowerCase() === 'input' || inputElem.tagName.toLowerCase() === 'textarea') {
        inputElem.value = front + emoji + back;
        caretPos = caretPos + emoji.length;
        inputElem.selectionStart = caretPos;
        inputElem.selectionEnd = caretPos;
        // inputElem.focus();
        inputElem.scrollTop = scrollPos;

      } else {
        if (inputElem.getAttribute('contenteditable') === 'true') {
          // console.log('This element is contenteditable');
          
          var isExecCommand = false;
          try{
            if(document.execCommand("insertText", false, emoji)){
              isExecCommand = true;
            }
          }
          catch(err) {
            isExecCommand = false;
          }

          if(isExecCommand){
            // console.log('isExecCommand works');
          }
          else{
            //console.log('isExecCommand does not work');

            //Do this to get the element focused
            var oldText=$(inputElem).text();            
            $(inputElem).text(oldText+'');

            setTimeout(function(){
              if(document.execCommand("insertText", false, emoji)){
                isExecCommand = true;
                //console.log('isExecCommand now works');
              }
              if(!isExecCommand)
                $(inputElem).text($(inputElem).text() + emoji);

            },200);
            
          }
        }
      }


    }
  }
);