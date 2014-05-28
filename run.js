phantom.onError = function(msg, trace) {
  console.error(msg);
  phantom.exit(1);
};

phantom.injectJs(require('system').args[1]);
