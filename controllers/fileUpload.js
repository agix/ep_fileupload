/**
 * Copyright 2009, 2011 RedHog, Egil Möller <egil.moller@piratpartiet.se>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var eejs = require("ep_etherpad-lite/node/eejs");

var hashFile = function (file, hash, digest, cb) {
  if (digest === undefined) digest = 'hex';
  if (hash === undefined) hash = 'md5';
 
  var state = crypto.createHash(hash);

  var stream = fs.createReadStream(file, {});
  stream.on("data", function(data){
    state.update(data);
  });
  stream.on("error", function(err){
    cb(err, null);
  });
  stream.on("close", function(){
    cb(null, state.digest(digest));
  });
}

exports.onRequest = function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.normalize(path.join(__dirname, "..", "upload"));
  form.parse(req, function(err, fields, files) {
    if (err) throw err;

    var tmp = files.uploadfile.path;
    var extension = files.uploadfile.name.split('.').pop();

    hashFile(tmp, undefined, undefined, function (err, hash) {
      var name = hash + "." + extension;
      var perm = path.normalize(path.join(__dirname, "..", "upload", name));
      fs.rename(tmp, perm, function(err) {
        fs.unlink(tmp, function() {
          if (err) throw err;
            var regex = /^(https?:\/\/[^\/]+)\//;
            var urlBase = 'http://' + req.headers.host;
            var matches = regex.exec(req.headers['referer']);
            if(typeof req.headers['referer'] != "undefined" && typeof matches[1] != "undefined"){
              urlBase = matches[1];
            }
            res.send(eejs.require("ep_fileupload/templates/fileUploaded.ejs", {upload: urlBase + "/up/" + name}, module));
        });
      });
    });
  });
}
