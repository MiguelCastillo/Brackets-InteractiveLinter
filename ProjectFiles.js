/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    var FileUtils        = brackets.getModule("file/FileUtils"),
        NativeFileSystem = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        ProjectManager   = brackets.getModule("project/ProjectManager");


    var currentProject;


    function ProjectFiles() {
    }


    ProjectFiles.prototype.openFile = function( fileName, type, forceCreate ) {
        var deferred = $.Deferred();

        // Try to load up the linterSettings file, which is per project.
        var directoryPath = FileUtils.canonicalizeFolderPath(currentProject.fullPath) + "/";

        // Get the directory path handler first, and then try to write to the file
        var directoryEntry = new NativeFileSystem.DirectoryEntry(directoryPath);

        directoryEntry.getFile( fileName, {
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
    };


    ProjectFiles.prototype.resolveName = function(fileName) {
        return FileUtils.canonicalizeFolderPath(currentProject.fullPath) + "/" + fileName;
    };


    var _projectFiles = new ProjectFiles();
    $(ProjectManager).on("projectOpen", function(e, project){
        currentProject = project;
        $(_projectFiles).trigger('projectOpen', [project]);
    });


    return _projectFiles;

});
