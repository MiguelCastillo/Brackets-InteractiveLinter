define(function(require, exports, module) {



    function groom(message, settings) {
        message.type   = message.level;
        message.reason = message.message;

        if ( message.context ) {
            message.reason += " - " + message.context;
        }

        if ( message.type === "warn" ) {
            message.type += "ing";
        }

        if ( !message.code ) {
            if ( message.type === "error" ) {
                message.code = "E000";
            }
            else {
                message.code = "W000";
            }
        }

        return {
            text: message.message,
            start: {
                line: message.lineNumber - 1,
                ch: 0
            },
            end: {
                line: message.lineNumber - 1,
                ch: 0
            }
        };
    }


    return {
        groom: groom
    };

});

