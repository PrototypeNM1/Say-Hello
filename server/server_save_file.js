/**
 * TODO support other encodings:
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */

if(Meteor.isServer) {
  Meteor.startup(function() {
    Meteor.methods({
      saveFile: function(blob, name, path, encoding, callback) {
        check(blob, String);
        check(name, String);
        check(path, Match.Any);
        check(encoding, String); 
        check(callback, Match.Any);
        var path = cleanPath(path), fs = Npm.require('fs'),
          name = cleanName(name || 'file'), encoding = encoding || 'binary',
          chroot = Meteor.chroot || 'public';
        // Clean up the path. Remove any initial and final '/' -we prefix them-,
        // any sort of attempt to go to the parent directory '..' and any empty directories in
        // between '/////' - which may happen after removing '..'
        path = chroot + (path ? '/' + path + '/' : '/');
        var basePath = process.env.PWD + '/' + path;

        // TODO Add file existance checks, etc...
        fs.writeFile(basePath + name, blob, encoding, function(err) {
          if (err) {
            throw (new Meteor.Error(500, 'Failed to save file.', err));
          } else {
            console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
          }
        }); 

        function cleanPath(str) {
          if (str) {
            return str.replace(/\.\./g,'').replace(/\/+/g,'').
              replace(/^\/+/,'').replace(/\/+$/,'');
          }
        }
        function cleanName(str) {
          return str.replace(/\.\./g,'').replace(/\//g,'');
        }
      }
    });
  });
}

