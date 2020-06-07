!function () {

    var callbacks = [],
        isReady = false,
        alreadyListening = false;

    function onLoad() {
        if (!isReady) {
            isReady = true;
            for (var i = 0; i < callbacks.length; i++) callbacks[i].handler.call(window, callbacks[i].args);
            callbacks = []
        }
    }

    window.docReady = function (func, args) {

        if (isReady) {

            setTimeout(function () { 
                func(args); 
            }, 1);

        } else {

            callbacks.push({ handler: func, args: args });

            if ("complete" === document.readyState) {

                setTimeout(onLoad, 1);

            } else {

                if (!alreadyListening) {
                    document.addEventListener("DOMContentLoaded", onLoad, false);
                    alreadyListening = true;
                }    
            }
        }  
    }
}();