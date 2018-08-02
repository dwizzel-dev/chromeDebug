

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


export default Consolas;
