/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


define(function(require, exports, module) {
    'use strict';

    var FileUtils        = brackets.getModule("file/FileUtils"),
        NativeFileSystem = brackets.getModule("file/NativeFileSystem").NativeFileSystem;

    
    function open( file, type, forceCreate ) {
        var deferred = $.Deferred();
        var fileInfo = getFileInfo(file);
        var directoryEntry = new NativeFileSystem.DirectoryEntry(fileInfo.path);

        directoryEntry.getFile(fileInfo.name, {
            create: forceCreate,
            exclusice: true
        }, function( fileEntry ){

            if (type === "write") {
                fileEntry.createWriter(function(fileWriter){
                    deferred.resolve(fileWriter);
                });
            }
            else {
                var fileReader = {
                    readAsText: function() {
                        return FileUtils.readAsText(fileEntry);
                    }
                };

                deferred.resolve(fileReader);
            }

        }, deferred.reject);


        return deferred;
    }
    

    function getFileInfo(file) {
        if ( file[file.lenght - 1] === '/' ) {
            throw "Must provide a file";   
        }

        var offset = file.lastIndexOf("/");

        return {
            path: file.substr(0, offset),
            name: file.substr(offset + 1)
        };
    }


    return {
        open: open,
        fileInfo: getFileInfo
    };

});

