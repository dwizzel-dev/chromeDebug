// ce script est caller quand le panel est active

//import Const from './constant';

console.log('[devtool.js] loaded');

const Const = {
  INIT: 0x201,
  INJECT: 0x202,
  CLEAR: 0x203,
  LOADING: 0x204,
  EMPTY: 0x205,
  ONDATA: 0x302,
  ONANALYSED: 0x303,
  TOOLNAME: 'd2cmedia-devtool-inspector',
  CONTENTNAME: 'd2cmedia-devtool-content'
};

const Consolas = {
  log: function(data){
    if(this.options.enabled){
      console.log(data);
    }
  },
  warn: function(data){
    if(this.options.enabled){
      console.warn(data);
    }
  },
  error: function(data){
    if(this.options.enabled){
      console.error(data);
    }
  },
  options: {
      enabled: true,
  },
};

const PanelWriter = {
  scripts: [],
  wrtMsg: data => `<span class="msg">${data}</span>`,
  wrtAnalyzed(data){
    const output = document.querySelector('.analysed-view');
    if(typeof output !== 'undefined'){
      if(data === Const.CLEAR){
        output.innerHTML = ``;  
      }else{
        output.innerHTML = `<div class="content"><h2>SEO Basics</h2><div class="cell code"></div></div>`;
        $(`.analysed-view .code`).jsonView(data);
      }
    }
  },
  appendScript(id, data){
    this.scripts.push({
      id: id,
      data: data,
    });
  },
  resetScripts(){
    this.scripts = [];
  },
  runScripts(){
    if(this.scripts.length > 0){
      for(let o in this.scripts){
       $(`#${this.scripts[o].id} .code`).addClass('treeview').jsonView(this.scripts[o].data);
      }
    }
  },
  prettyCode(){
    //indente le code si il y a lieu
    $(`pre`).each(function(index){
      $(this).text(formatFactory(($(this).text())));
    });
    //prettyfier , mais il va le faire sur les test standard aussi, 
    prettyPrint();
  },
  wrtOutput: data => {
    const output = document.querySelector('.content-view');
    if(typeof output !== 'undefined'){
      output.innerHTML = `<div class="content">${data}</div>`;
    }
  },
  wrtRow(id, data){
    //dont care si h3 dans le h2, jsute pour manipule les css plus facilment par tag
    return `<div class="row type-${data.type}" id="${id}">
      <h2><span class="classname">${data.from.class} :: </span>${data.from.method}
        <div class="file">${data.from.file} <span class="line">${data.from.line}</span></div>
      </h2>  
      <div class="cell code">${this.wrtObj(id, data.obj)}</div>
      <div class="cell filter">Filter: ${data.filter}</div>
      </div>`;
  },
  wrtObj(id, data){
    if(typeof data === 'object' || typeof data === 'array'){
      this.appendScript(id, data);
      return ``;
    }else{
      //il faudrait au moins checker si il y a du html dedans avec des <>
      style =  '';
      if(RegExp('^<.*>$','g').test(data)){
        style =  'prettyprint theme-snappy-light';    
      }
      str = data.replace(/>/g,"&gt;").replace(/</g,"&lt;");
      return `<pre class="${style}">${str}</pre>`;
    }
  },
  wrt(data){
    Consolas.log('[devtool.js] data received');
    Consolas.log(data);
    this.resetScripts();
    let content = '';
    switch(data){
      case Const.CLEAR:
        content = this.wrtMsg('Not a D2CMedia debuggable');
        break; 
      case Const.LOADING:
        content = this.wrtMsg('Loading...');
        break;
      case Const.EMPTY:
        content = this.wrtMsg('Empty Data');
        break;   
      default:
        let cmpt = 0;
        for(let k in data){
          content += this.wrtRow(`treeView-${cmpt++}`, data[k]);
        }
        break;  
    }
    this.wrtOutput(content);
    this.runScripts();
    this.prettyCode();
  },
};

//creer la connection a devtools-background.js
Consolas.log('[devtool.js] connecting to [devtools-background.js]');
var bgPageConnection = chrome.runtime.connect({
  name: 'devtool-d2cmedia'
});

//ecoute pour les message de la devtools-background.js
bgPageConnection.onMessage.addListener(message => {
  Consolas.log('[devtool.js] message from [devtools-background.js]');
  Consolas.log(message);
  //message from the devtools-background.js to inject javascript code to the content
  if(typeof message.name !== 'undefined' && typeof message.command !== 'undefined'){
    if(message.name == Const.TOOLNAME){
      switch(message.command){
        case Const.INJECT:
          Consolas.log('[devtool.js] injecting "backend.js" to inspected content page');
          //injecte le script backend.js dans la content-page (page web que lon inspect) et attend le result
          injectScript(chrome.runtime.getURL('lib/jquery/3.3.1/jquery.min.js'), res => {
            Consolas.log('[devtool.js] injection callback');
          });
          //avec un delai dessus pour que le jquery soit loade avant
          setTimeout(() => {
            injectScript(chrome.runtime.getURL('src/backend.js'), res => {
              Consolas.log('[devtool.js] injection callback');
            });  
          }, 1000);
          break;
        case Const.CLEAR:
          Consolas.log('[devtool.js] clearing panel page content');
          PanelWriter.wrt(Const.CLEAR);
          PanelWriter.wrtAnalyzed(Const.CLEAR);
          break;  
        case Const.LOADING:
          Consolas.log('[devtool.js] clearing panel page content');
          PanelWriter.wrt(Const.LOADING);
          PanelWriter.wrtAnalyzed(Const.CLEAR);
          break;    
        default:
          break;  
      }
    }else if(message.name == Const.CONTENTNAME){
      switch(message.command){
        case Const.ONDATA:
          Consolas.log('[devtool.js] writing to panel');
          if(message.data.length === 0){
            PanelWriter.wrt(Const.EMPTY);
          }else{
            PanelWriter.wrt(message.data);  
          }
          break;
        case Const.ONANALYSED:
          Consolas.log('[devtool.js] analyse to panel');
          if(message.data.length === 0){
            PanelWriter.wrtAnalyzed(Const.CLEAR);
          }else{
            PanelWriter.wrtAnalyzed(message.data);
          }
          break;  
        default:
          break;  
      } 
    }
  }
});

//ecoute les deconnxion de la devtools-background.js
bgPageConnection.onDisconnect.addListener(message => {
  Consolas.log('[devtool.js] disconnection of [devtools-background.js]');
  Consolas.log(message);
});

//envoie un message a la devtools-background.js
Consolas.log('[devtool.js] sending init signal to [devtools-background.js]');
bgPageConnection.postMessage({
  name: Const.TOOLNAME,
  command: Const.INIT,
  tabId: chrome.devtools.inspectedWindow.tabId
});

//pour injection de script
function injectScript(scriptName, cb){
  const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      console.log('[devtool.js] Injecting ${scriptName} script in content page');
      console.log(script);
      document.documentElement.appendChild(script);
      //script.parentNode.removeChild(script);
    })()
    `
  chrome.devtools.inspectedWindow.eval(src, (res, err) => {
    if (err) {
      Consolas.log(err)
    }
    cb(res);
  })
}


function formatFactory(html) {
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
