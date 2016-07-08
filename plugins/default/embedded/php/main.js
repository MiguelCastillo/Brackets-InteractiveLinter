define(function(require) {

	var NodeConnection = brackets.getModule('utils/NodeConnection');
    var node = new NodeConnection();
    var Promise = require("../../../../libs/js/spromise");

    function lint(text, options,meta) {

    	var linterrors = null;
	 if (!node.domains.phplint) {
	        node.connect(true).done(function () {
	            node.loadDomains([meta.path+'/php/phplint.js'], true);
	        });
	    } else {
	    	linterrors = new Promise(function(resolve){
	    		var linterrors_message = {};
		        node.domains.phplint.lintcommand(text).done(function(data,errors){
		        	//Done is good as no parse errors
		        	resolve();
		        }).fail(function(data){
		        	//promise resolves as failed because of parse errors
		        	//PHP Parse error:  syntax error, unexpected end of file in - on line 6
		        	//Parse error: parse error in - on line 57
		        	var detailederrormatch = data.match(/PHP Parse error:  (.+), (.+) in - on line ([0-9]+)/);
		        	var simpleerrormatch = data.match(/Parse error: parse error in - on line ([0-9]+)/);

		        	if(detailederrormatch){

		        		var corrected_line = parseInt(detailederrormatch[3])-1;

			        	linterrors_message = {
			        		'message' : detailederrormatch[0],
							'reason' : detailederrormatch[0],
			        		'type' : detailederrormatch[1],
			        		'character' : 0,
			        		'line': corrected_line,
			        		'pos' :{
			        			'line': corrected_line,
			        			'ch' : 0
			        		},
			        		'token':{
			        			'end':{
				        			'line': corrected_line,
				        			'ch' : 0
			        			},
			        			'start':{
				        			'line': corrected_line,
				        			'ch' : 0
			        			}
			        		}
			        	};
			        } else if(simpleerrormatch) {
			        	var corrected_line = parseInt(simpleerrormatch[1])-1;
			        	linterrors_message = {
			        		'id' : '(error)',
			        		'message' : simpleerrormatch[0],
			        		'reason' : simpleerrormatch[0],
			        		'type' : 'error',
			        		'character' : 0,
			        		'line': corrected_line,
			        		'pos' :{
			        			'line': corrected_line,
			        			'ch' : 0
			        		},
			        		'token':{
			        			'end':{
				        			'line': corrected_line,
				        			'ch' : 0
			        			},
			        			'start':{
				        			'line': corrected_line,
				        			'ch' : 0
			        			}
			        		}
			        	};
			        } else {
			        	resolve();
			        }
		        	resolve([linterrors_message]);
		        });
		    });
		}
		return linterrors;
    }

    return {
        "language": "php",
        "lint": lint
    };
});