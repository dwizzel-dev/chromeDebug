

const Const = {
  
  //devtools
  INIT: 0x201,
  INJECT: 0x202,
  CLEAR: 0x203,
  LOADING: 0x204,
  EMPTY: 0x205,
  
  //backend command
  LOAD: 0x301,
  ANALYSED: 0x302,
  EXTERNDATA: 0x303,

  //hooks emiter
  ONDATA: 0x401,
  ONANALYSED: 0x402,
  ONEXTERNDATA: 0x403,

  //specific key name or text
  DATAKEYTIMER: 'timer',
    
  //devtool name for post message filtering
  TOOLNAME: 'd2cmedia-devtool-inspector',
  CONTENTNAME: 'd2cmedia-devtool-content'
  
};


export default Const;