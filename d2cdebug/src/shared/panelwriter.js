
import Const from '/src/shared/constant.js';
import Consolas from '/src/shared/consolas.js';

const PanelWriter = {
  scripts: [],
  wrtMsg: data => `<span class="msg">${data}</span>`,
  wrtTimers(data){
    let innerContent = `
      <div class="row timer type-6">
      <h2>Timers</h2>
      `;
    //loop dans tout les timers
    for(let o in data){
      //class method peut etre vide des fois
      let fromClass = (data[o].from.class == null || data[o].from.class == '') ? 
          'Global' : data[o].from.class;
      let fromMethod = (data[o].from.method == null || data[o].from.method == '') ? 
          'Global' : data[o].from.method;
      innerContent += `
      <h3>${o}</h3>  
        <div class="cell">
          <div class="line method">
            ${fromClass} :: ${fromMethod}
          </div>  
          <div class="line file">  
            ${data[o].from.file} ${data[o].from.line}
          </div>  
          <div class="line comments">${data[o].comments}</div>
          <div class="line diff">${data[o].diff} seconds</div>
          <div class="line filter">filter: ${data[o].filter}</div>
        </div>
      `;
    }
    innerContent += `</div>`;
    return innerContent;
  },
  wrtAnalyzed(data){
    const output = document.querySelector('.analysed-view');
    if(typeof output !== 'undefined'){
      if(data === Const.CLEAR){
        output.innerHTML = ``;  
      }else{
        output.innerHTML = `<div class="content"><h2>SEO Basics</h2><div class="cell code"></div></div>`;
        //json viewer and style
        $(`.analysed-view .code`).addClass('treeview').jsonView(data);
        //on collapse celui-ci au premier niveau uniquement
        $(`.analysed-view .treeview UL.mainLevel .collapser`).trigger('click');
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
       //on collapse celui-ci au premier niveau uniquement avec un trigger
       $(`#${this.scripts[o].id} .treeview UL.mainLevel .collapser`).trigger('click');
      }
    }
  },
  prettyCode(){
    //indente le code si il y a lieu
    $(`pre`).each(function(index){
      $(this).text(indentCode(($(this).text())));
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
    //comments, groupes stack, et timer stack
    let comments = (typeof data.comments !== 'undefined' && data.comments !== '') ? 
        `<div class="comments">${data.comments}</div>` : '';
    let group = (typeof data.group !== 'undefined' && data.group !== '') ? 
        `<div class="group">Group: ${data.group}</div>` : '';
    let timer = (typeof data.timer !== 'undefined' && data.timer !== '') ? 
        `<div class="timer">Timer: ${data.timer}</div>` : '';
    //class method peut etre vide des fois
    let fromClass = (data.from.class == null || data.from.class == '') ? 
        'Global' : data.from.class;
    let fromMethod = (data.from.method == null || data.from.method == '') ? 
        'Global' : data.from.method;
    //
    return `
      <div class="row type-${data.type}" id="${id}">
        <h2>
          ${timer}
          ${group}
          <div class="infos">
            <span class="classname">${fromClass} :: <span class="methodname">${fromMethod}</span></span>
            <span class="file">${data.from.file} <span class="line">${data.from.line}</span></span>
          </div>  
          ${comments}
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
      let style =  '';
      if(RegExp('^<.*>$','g').test(data)){
        style =  'prettyprint theme-snappy-light';    
      }
      let str = data.replace(/>/g,"&gt;").replace(/</g,"&lt;");
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
          if(k === Const.DATAKEYTIMER){
            content += this.wrtTimers(data[k]);  
          }else{
            content += this.wrtRow(`treeView-${cmpt++}`, data[k]);
          } 
        }
        break;  
    }
    this.wrtOutput(content);
    this.runScripts();
    this.prettyCode();
  },
};

export default PanelWriter;