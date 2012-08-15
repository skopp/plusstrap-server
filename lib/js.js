// ========================================================================
// bootstrap-server v1.0.0
// http://twitter.github.com/bootstrap
// ========================================================================
// Copyright 2012 Twitter, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

"use strict"

var uglifyJS = require('uglify-js')
  , path     = require('path')
  , https    = require('https')
  , CACHE    = {}
  , FILES    = [ "bootstrap-transition.js"
               , "bootstrap-modal.js"
               , "bootstrap-affix.js"
               , "bootstrap-dropdown.js"
               , "bootstrap-scrollspy.js"
               , "bootstrap-tab.js"
               , "bootstrap-tooltip.js"
               , "bootstrap-popover.js"
               , "bootstrap-alert.js"
               , "bootstrap-button.js"
               , "bootstrap-collapse.js"
               , "bootstrap-carousel.js"
               , "bootstrap-typeahead.js" ]

function cache() {

  var done   = 0
    , _cache = {}

  FILES.forEach(function (filename) {
    var req
      , content = []
      , options = {
          host: 'raw.github.com'
        , port: 443
        , path: path.join('/xbreaker/plussrap/master/js/', filename)
        , method: 'GET'
        }

    req = https.request(options, function(res) {

      res.setEncoding('utf8')

      res.on('data', function (chunk) {
        content.push(chunk)
      })

      res.on('end', function () {
        _cache[filename] = content.join('')
        if (++done == FILES.length) {
          CACHE = _cache
        }
      })
    })

    req.end()
  })

}

function js(params, callback) {
  var min, content = params.js.map(function (filename) {
    return CACHE[filename]
  }).join('\n')

  try {
    min = uglify(content, params.js)
  } catch (e) {
    min = 'Error minifying source - please open issue on http://github.com/xbreaker/plussrap! thank you :)'
  }

  callback(null, {
    'js/plussrap.js'    : new Buffer(content, 'utf8')
  , 'js/plussrap.min.js': new Buffer(min, 'utf8')
  })
}

function uglify(input, names) {
  var content = input.replace(/[\"\']use strict[\"\']/gi, '')
    , tok = uglifyJS.parser.tokenizer(content)
    , c = tok()
    , result
    , ast

  result = '/**\n'
    + '* Plussrap.js by @xbreaker\n'
    + '* plugins: ' + names.join(', ') + '\n'
    + '* http://www.apache.org/licenses/LICENSE-2.0.txt\n'
    + '*/\n'

  ast = uglifyJS.parser.parse(content)
  ast = uglifyJS.uglify.ast_mangle(ast)
  ast = uglifyJS.uglify.ast_squeeze(ast)

  return result += uglifyJS.uglify.gen_code(ast)
}

module.exports = js
module.exports.cache = cache
module.exports.FILES = FILES
