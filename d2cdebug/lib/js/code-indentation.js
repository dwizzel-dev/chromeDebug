function indentCode(html) {
  function parse(html, tab = 0) {
      var tab;
      var html = $.parseHTML(html);
      var formatHtml = new String();   

      function setTabs () {
          var tabs = new String();

          for (i=0; i < tab; i++){
            tabs += '  '; // double space car un tab est trop gros
          }
          return tabs;    
      };


      $.each( html, function( i, el ) {
          if (el.nodeName == '#text') {
              if (($(el).text().trim()).length) {
                  formatHtml += setTabs() + $(el).text().trim() + '\n';
              }    
          } else {
              var innerHTML = $(el).html().trim();
              $(el).html(innerHTML.replace('\n', '').replace(/ +(?= )/g, ''));
              

              if ($(el).children().length) {
                  $(el).html('\n' + parse(innerHTML, (tab + 1)) + setTabs());
                  var outerHTML = $(el).prop('outerHTML').trim();
                  formatHtml += setTabs() + outerHTML + '\n'; 

              } else {
                  var outerHTML = $(el).prop('outerHTML').trim();
                  formatHtml += setTabs() + outerHTML + '\n';
              }      
          }
      });

      return formatHtml;
  };   
  
  return parse(html.replace(/(\r\n|\n|\r)/gm," ").replace(/ +(?= )/g,''));
}; 