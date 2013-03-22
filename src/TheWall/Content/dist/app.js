(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json",".text",".txt",".html",".tmpl",".hbs"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",Function(['require','module','exports','__dirname','__filename','process','global'],"function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = '',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== 'string' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + '/' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === '/';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === '/',\n    trailingSlash = path.slice(-1) === '/';\n\n// Normalize the path\npath = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n  \n  return (isAbsolute ? '/' : '') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === 'string';\n  }).join('/'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || '';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return '.';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || '';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || '';\n};\n\nexports.relative = function(from, to) {\n  from = exports.resolve(from).substr(1);\n  to = exports.resolve(to).substr(1);\n\n  function trim(arr) {\n    var start = 0;\n    for (; start < arr.length; start++) {\n      if (arr[start] !== '') break;\n    }\n\n    var end = arr.length - 1;\n    for (; end >= 0; end--) {\n      if (arr[end] !== '') break;\n    }\n\n    if (start > end) return [];\n    return arr.slice(start, end - start + 1);\n  }\n\n  var fromParts = trim(from.split('/'));\n  var toParts = trim(to.split('/'));\n\n  var length = Math.min(fromParts.length, toParts.length);\n  var samePartsLength = length;\n  for (var i = 0; i < length; i++) {\n    if (fromParts[i] !== toParts[i]) {\n      samePartsLength = i;\n      break;\n    }\n  }\n\n  var outputParts = [];\n  for (var i = samePartsLength; i < fromParts.length; i++) {\n    outputParts.push('..');\n  }\n\n  outputParts = outputParts.concat(toParts.slice(samePartsLength));\n\n  return outputParts.join('/');\n};\n\n//@ sourceURL=path"
));

require.define("__browserify_process",Function(['require','module','exports','__dirname','__filename','process','global'],"var process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var canSetImmediate = typeof window !== 'undefined'\n        && window.setImmediate;\n    var canPost = typeof window !== 'undefined'\n        && window.postMessage && window.addEventListener\n    ;\n\n    if (canSetImmediate) {\n        return function (f) { return window.setImmediate(f) };\n    }\n\n    if (canPost) {\n        var queue = [];\n        window.addEventListener('message', function (ev) {\n            if (ev.source === window && ev.data === 'browserify-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n\n        return function nextTick(fn) {\n            queue.push(fn);\n            window.postMessage('browserify-tick', '*');\n        };\n    }\n\n    return function nextTick(fn) {\n        setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nprocess.binding = function (name) {\n    if (name === 'evals') return (require)('vm')\n    else throw new Error('No such module. (Possibly not yet loaded)')\n};\n\n(function () {\n    var cwd = '/';\n    var path;\n    process.cwd = function () { return cwd };\n    process.chdir = function (dir) {\n        if (!path) path = require('path');\n        cwd = path.resolve(dir, cwd);\n    };\n})();\n\n//@ sourceURL=__browserify_process"
));

require.define("/router.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Card, CardCollection, CardForm, CardList, Column, ColumnCollection, ColumnCollectionView, ColumnItem, Member, MemberCollection, MemberForm, MemberList, Router;\n\n  Card = require('./models/card/index');\n\n  CardCollection = require('./collections/card/index');\n\n  CardList = require('./views/card/list/index');\n\n  CardForm = require('./views/card/form/index');\n\n  Member = require('./models/member/index');\n\n  MemberCollection = require('./collections/member/index');\n\n  MemberList = require('./views/member/list/index');\n\n  MemberForm = require('./views/member/form/index');\n\n  Column = require('./models/column/index');\n\n  ColumnCollection = require('./collections/column/index');\n\n  ColumnItem = require('./views/column/item/index');\n\n  ColumnCollectionView = require('./views/column/lists/index');\n\n  Router = Backbone.Router.extend({\n    routes: {\n      \"\": \"home\",\n      \"card/new\": \"cardCreate\",\n      \"card/edit\": \"cardUpdate\",\n      \"user/create\": \"memberCreate\",\n      \"members\": \"showMembers\",\n      \"*default\": \"default_route\"\n    },\n    home: function() {\n      var columns,\n        _this = this;\n      $('.nav li.active').removeClass('active');\n      $('.home').addClass('active');\n      columns = new ColumnCollectionView({\n        collection: this.columnsCollection,\n        cards: this.cards\n      });\n      $('#app').empty().append(columns.el);\n      return $.when(this.cards.fetch(), this.columnsCollection.fetch()).done(function() {\n        return columns.render();\n      });\n    },\n    cardUpdate: function(id) {\n      var memberGroup, model,\n        _this = this;\n      memberGroup = this.members;\n      model = new Card({\n        _id: id\n      });\n      return model.fetch().done(function() {\n        var update;\n        update = new CardForm({\n          model: model,\n          collection: _this.cards,\n          title: 'Update Card',\n          members: memberGroup,\n          columns: _this.columnsCollection\n        });\n        return update.$el.on('hide', function() {\n          return _this.navigate('/', {\n            trigger: true\n          });\n        });\n      });\n    },\n    cardCreate: function() {\n      var _this = this;\n      return $.when(this.columnsCollection.fetch(), this.members.fetch()).done(function() {\n        var createCard;\n        createCard = new CardForm({\n          title: 'Create new card',\n          collection: _this.cards,\n          model: new Card(),\n          members: _this.members,\n          columns: _this.columnsCollection\n        });\n        return createCard.$el.on('hide', function() {\n          return _this.navigate('/', {\n            trigger: true\n          });\n        });\n      });\n    },\n    memberCreate: function() {\n      var createMember,\n        _this = this;\n      createMember = new MemberForm({\n        model: new Member(),\n        title: 'Create new member',\n        collection: this.members\n      });\n      return createMember.$el.on('hide', function() {\n        return _this.navigate('/members', {\n          trigger: true\n        });\n      });\n    },\n    showMembers: function() {\n      var memberSection, memberlist,\n        _this = this;\n      this.navigate('/members', {\n        trigger: true\n      });\n      memberSection = $('<div class=\"memberSection\" />');\n      $('#app').empty().append(memberSection);\n      memberlist = new MemberList({\n        collection: this.members\n      });\n      memberSection.append(memberlist.el);\n      return this.members.fetch().done(function() {\n        return memberlist.render();\n      });\n    },\n    default_route: function() {\n      return this.navigate('/', {\n        trigger: true\n      });\n    },\n    initialize: function() {\n      this.cards = new CardCollection();\n      this.members = new MemberCollection();\n      return this.columnsCollection = new ColumnCollection();\n    }\n  });\n\n  module.exports = Router;\n\n}).call(this);\n\n//@ sourceURL=/router.coffee"
));

require.define("/models/card/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Card;\n\n  Card = Backbone.Model.extend({\n    points: [0, 1, 3, 5],\n    categories: ['story', 'tech', 'design', 'bug'],\n    urlRoot: '/TheWall/api/storycards',\n    defaults: function() {\n      return {\n        CardNumber: null,\n        ColumnId: null,\n        IsBlocked: false\n      };\n    },\n    toJSON: function() {\n      return {\n        AcceptanceCriteria: this.get('AcceptanceCriteria'),\n        CardNumber: this.get('CardNumber'),\n        Collaborators: [this.get('Collaborators')],\n        ColumnId: this.get('ColumnId'),\n        IsBlocked: Boolean(this.get('IsBlocked')),\n        Notes: this.get('Notes'),\n        StickyNotes: this.get('StickyNotes'),\n        StoryPoints: this.get('StoryPoints'),\n        Title: this.get('Title'),\n        Type: this.get('Type'),\n        Id: this.get('Id')\n      };\n    }\n  });\n\n  module.exports = Card;\n\n}).call(this);\n\n//@ sourceURL=/models/card/index.coffee"
));

require.define("/collections/card/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Card, CardCollection;\n\n  Card = require('../../models/card/index');\n\n  CardCollection = Backbone.Collection.extend({\n    model: Card,\n    url: '/TheWall/api/storycards',\n    getPoints: function() {\n      var reduce;\n      reduce = function(num, model) {\n        return model.get('points') + num;\n      };\n      return this.reduce(reduce, 0);\n    }\n  });\n\n  module.exports = CardCollection;\n\n}).call(this);\n\n//@ sourceURL=/collections/card/index.coffee"
));

require.define("/views/card/list/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var CardItem, CardList, template;\n\n  CardItem = require('../item/index');\n\n  template = require('./template.hbs');\n\n  CardList = Backbone.View.extend({\n    template: Handlebars.compile(template),\n    initialize: function() {\n      this.listenTo(this.collection, 'reset', this.render);\n      this.listenTo(this.collection, 'add', this.render);\n      return this.collection.fetch();\n    },\n    render: function() {\n      var cards, el, html;\n      this.collection.sortBy(function(model) {\n        return model.get('number');\n      });\n      html = this.template();\n      $(this.el).html(html);\n      el = this.$el;\n      cards = this.collection;\n      cards.each(function(card) {\n        var view;\n        view = new CardItem({\n          model: card\n        });\n        return el.find('.cardlist').append(view.render());\n      });\n      return console.log('test');\n    }\n  });\n\n  module.exports = CardList;\n\n}).call(this);\n\n//@ sourceURL=/views/card/list/index.coffee"
));

require.define("/views/card/item/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var CardItem, Router, template;\n\n  Router = require('../../../router');\n\n  template = require('./template.hbs');\n\n  CardItem = Backbone.View.extend({\n    className: 'card-item',\n    template: Handlebars.compile(template),\n    events: {\n      'click .card': 'edit',\n      'click .remove': 'removeCard'\n    },\n    initialize: function() {\n      return this.listenTo(this.model, 'change', this.render);\n    },\n    render: function() {\n      var html;\n      html = this.template({\n        model: this.model.toJSON()\n      });\n      return $(this.el).html(html);\n    },\n    removeCard: function(e) {\n      var _this = this;\n      e.stopPropagation();\n      return $(this.el).fadeOut('slow', function(e) {\n        return _this.model.destroy();\n      });\n    },\n    edit: function() {\n      return Backbone.history.navigate('/card/' + this.model.id + '/edit', {\n        trigger: true\n      });\n    }\n  });\n\n  module.exports = CardItem;\n\n}).call(this);\n\n//@ sourceURL=/views/card/item/index.coffee"
));

require.define("/views/card/item/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<div data-id=\\\"{{model._id}}\\\" class=\\\"card {{model.type}} {{#if model.is_blocked}}is_blocked{{/if}}\\\">\" +\n\"  <h3>{{model.title}}</h3>\" +\n\"\" +\n\"    <div class=\\\"card-number\\\">Number <span>{{model.CardNumber}}</span></div>\" +\n\"\" +\n\"    {{#if model.StoryPoints}}\" +\n\"    <div class=\\\"card-points\\\">{{model.StoryPoints}}</div>\" +\n\"    {{/if}}\" +\n\"\" +\n\"    {{#if model.Collaborators}}\" +\n\"    <div class=\\\"card-members\\\">Member: <span>{{model.Collaborators}}</span></div>\" +\n\"    {{/if}}\" +\n\"\" +\n\"    {{#if model.Notes}}\" +\n\"    <div class=\\\"card-notes\\\">Note: <span>{{model.Notes}}</span></div>\" +\n\"    {{/if}}\" +\n\"\" +\n\"    <span class=\\\"remove\\\">x</span>\" +\n\"</div>\" ;\n\n//@ sourceURL=/views/card/item/template.hbs"
));

require.define("/views/card/list/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<h1>Card List</h1>\" +\n\"<div class=\\\"cardlist\\\"></div>\" ;\n\n//@ sourceURL=/views/card/list/template.hbs"
));

require.define("/views/card/form/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Card, CardCollection, CardForm, CardList, template;\n\n  Card = require('../../../models/card/index');\n\n  CardCollection = require('../../../collections/card/index');\n\n  CardList = require('../list/index');\n\n  template = require('./template.hbs');\n\n  CardForm = Backbone.View.extend({\n    template: Handlebars.compile(template),\n    className: \"modal fade hide\",\n    events: {\n      'click .submit': 'saveCard',\n      'click .close': 'hide'\n    },\n    initialize: function() {\n      return this.render();\n    },\n    show: function() {\n      return this.$el.modal();\n    },\n    hide: function(e) {\n      return this.$el.modal('hide');\n    },\n    saveCard: function(e) {\n      e.preventDefault();\n      this.populateModel();\n      this.model.save();\n      this.collection.add(this.model);\n      return this.hide();\n    },\n    populateModel: function() {\n      var model;\n      model = this.model;\n      return this.$el.find('[name]').each(function() {\n        var el;\n        el = $(this);\n        return model.set(el.attr('name'), el.val());\n      });\n    },\n    populateFields: function() {\n      var model;\n      model = this.model;\n      return this.$el.find('[name]').each(function() {\n        var attr, el;\n        el = $(this);\n        attr = el.attr('name');\n        return el.val(model.get(attr));\n      });\n    },\n    getTemplateData: function() {\n      var categories, columns, members, model, points;\n      model = this.model;\n      points = this.model.points.map(function(point) {\n        return {\n          name: point,\n          isSelected: model.get('points') === point ? 'selected' : ''\n        };\n      });\n      categories = this.model.categories.map(function(cat) {\n        return {\n          name: cat,\n          isSelected: model.get('type') === cat ? 'selected' : ''\n        };\n      });\n      members = this.options.members.toJSON();\n      columns = this.options.columns.toJSON();\n      return {\n        title: this.options.title || 'Card',\n        model: model,\n        categories: categories,\n        points: points,\n        members: members || 'Bernard',\n        columns: columns\n      };\n    },\n    render: function() {\n      var html;\n      html = this.template(this.getTemplateData());\n      $(this.el).html(html);\n      this.populateFields();\n      return this.show();\n    }\n  });\n\n  module.exports = CardForm;\n\n}).call(this);\n\n//@ sourceURL=/views/card/form/index.coffee"
));

require.define("/views/card/form/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<div class=\\\"modal-header\\\">\" +\n\"  <button class=\\\"close\\\">x</button>\" +\n\"  <h3>{{title}}</h3>\" +\n\"</div>\" +\n\"<div class=\\\"modal-body\\\">\" +\n\"  <form class=\\\"form-horizontal\\\">\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Number</label>\" +\n\"      <input \" +\n\"        class=\\\"card-number\\\" \" +\n\"        name=\\\"Number\\\"\" +\n\"        value=\\\"{{model.CardNumber}}\\\"\" +\n\"        type=\\\"text\\\"></input>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Card Type</label>\" +\n\"      <select \" +\n\"        class=\\\"card-type\\\" \" +\n\"        name=\\\"Type\\\"\" +\n\"      >\" +\n\"        <option value=\\\"\\\">Select</option>\" +\n\"        <option value=\\\"story\\\" {{isSelected}}>Story</option>\" +\n\"        <option value=\\\"tech\\\" {{isSelected}}>Tech</option>\" +\n\"        <option value=\\\"bug\\\" {{isSelected}}>Bug</option>\" +\n\"      </select>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Card Title</label>\" +\n\"      <input \" +\n\"        class=\\\"card-title\\\"\" +\n\"        name=\\\"Title\\\"\" +\n\"        value=\\\"{{model.Title}}\\\"\" +\n\"        type=\\\"text\\\"></input>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Points</label>\" +\n\"        <select \" +\n\"        class=\\\"card-points\\\" \" +\n\"        name=\\\"StoryPoints\\\"\" +\n\"      >\" +\n\"        <option value=\\\"\\\">Select</option>\" +\n\"        <option value=\\\"1\\\" {{isSelected}}>1</option>\" +\n\"        <option value=\\\"3\\\" {{isSelected}}>3</option>\" +\n\"        <option value=\\\"4\\\" {{isSelected}}>5</option>\" +\n\"      </select>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Note</label>\" +\n\"      <textarea \" +\n\"        class=\\\"card-note\\\"\" +\n\"        value=\\\"{{model.Notes}}\\\"\" +\n\"        name=\\\"Notes\\\"></textarea>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Member</label>\" +\n\"      <select \" +\n\"        class=\\\"member\\\" \" +\n\"        name=\\\"Collaborators\\\"\" +\n\"      >\" +\n\"        <option value=\\\"\\\">Select</option>\" +\n\"        <option value=\\\"c.buttery@nib.com.au\\\">Chris</option>\" +\n\"        <option value=\\\"a.short@nib.com.au\\\">Anthony</option>\" +\n\"        <option value=\\\"w.falconer@nib.com.au\\\">Will</option>\" +\n\"        <option value=\\\"w.falconer@nib.com.au\\\">Helle</option>\" +\n\"      </select>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>List</label>\" +\n\"      <select \" +\n\"        class=\\\"column\\\" \" +\n\"        name=\\\"ColumnId\\\"\" +\n\"      >\" +\n\"        <option value=\\\"\\\">Select</option>\" +\n\"        {{#each columns}}\" +\n\"        <option value=\\\"{{Id}}\\\" {{isSelected}}>{{Title}} </option>\" +\n\"        {{/each}}\" +\n\"      </select>\" +\n\"    </div>\" +\n\"    <button class=\\\"submit btn btn-primary\\\">Save Card</button>\" +\n\"  </form>\" +\n\"</div>\" +\n\"<div class=\\\"modal-footer\\\">\" +\n\"  <a href=\\\"#\\\" class=\\\"btn close\\\">Close</a>\" +\n\"</div>\" ;\n\n//@ sourceURL=/views/card/form/template.hbs"
));

require.define("/models/member/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Member;\n\n  Member = Backbone.Model.extend({\n    memberGroups: ['A & D', 'BA', 'UX', 'FE Developer', 'BE Developer'],\n    urlRoot: '/TheWall/api/users',\n    defaults: function() {\n      return {\n        name: null,\n        membergroup: 'none'\n      };\n    },\n    toJSON: function() {\n      return {\n        Name: this.get('Name'),\n        Email: this.get('Email'),\n        Id: this.get('Id')\n      };\n    },\n    setGroup: function(newGroup) {\n      return this.set({\n        membergroup: newGroup\n      });\n    },\n    initialize: function() {\n      return this.on('change:memberGroup', function() {\n        return this.setGroup(this.get('memberGroup'));\n      });\n    }\n  });\n\n  module.exports = Member;\n\n}).call(this);\n\n//@ sourceURL=/models/member/index.coffee"
));

require.define("/collections/member/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Member, MemberCollection;\n\n  Member = require('../../models/member/index');\n\n  MemberCollection = Backbone.Collection.extend({\n    model: Member,\n    url: '/TheWall/api/users',\n    create: function(model) {\n      var member;\n      console.log('created member model');\n      member = new Member(model);\n      return member.save();\n    }\n  });\n\n  module.exports = MemberCollection;\n\n}).call(this);\n\n//@ sourceURL=/collections/member/index.coffee"
));

require.define("/views/member/list/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  var MemberItem, MemberList, template;\n\n  MemberItem = require('../item/index');\n\n  template = require('./template.hbs');\n\n  MemberList = Backbone.View.extend({\n    template: Handlebars.compile(template),\n    initialize: function() {\n      this.listenTo(this.collection, 'reset', this.render);\n      this.listenTo(this.collection, 'add', this.render);\n      return this.collection.fetch();\n    },\n    render: function() {\n      var cards, el, html;\n      this.collection.sortBy(function(model) {\n        return model.get('title');\n      });\n      html = this.template();\n      $(this.el).html(html);\n      el = this.$el;\n      cards = this.collection;\n      return cards.each(function(member) {\n        var view;\n        view = new MemberItem({\n          model: member\n        });\n        return el.find('.memberlist').append(view.render());\n      });\n    }\n  });\n\n  module.exports = MemberList;\n\n}).call(this);\n\n//@ sourceURL=/views/member/list/index.coffee"
));

require.define("/views/member/item/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  var MemberItem, Router, template;\n\n  Router = require('../../../router');\n\n  template = require('./template.hbs');\n\n  MemberItem = Backbone.View.extend({\n    className: 'member-item',\n    template: Handlebars.compile(template),\n    events: {\n      'click .card': 'edit',\n      'click .remove': 'removeMember'\n    },\n    initialize: function() {\n      return this.listenTo(this.model, 'change', this.render);\n    },\n    render: function() {\n      var html;\n      html = this.template({\n        model: this.model.toJSON()\n      });\n      return $(this.el).html(html);\n    },\n    removeMember: function(e) {\n      var _this = this;\n      e.stopPropagation();\n      return $(this.el).fadeOut('slow', function(e) {\n        return _this.model.destroy();\n      });\n    },\n    edit: function() {\n      return Backbone.history.navigate('/member/' + this.model.id + '/edit', {\n        trigger: true\n      });\n    }\n  });\n\n  module.exports = MemberItem;\n\n}).call(this);\n\n//@ sourceURL=/views/member/item/index.coffee"
));

require.define("/views/member/item/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<div data-id=\\\"{{model._id}}\\\" class=\\\"member\\\">\" +\n\"\t<h3>{{model.name}}</h3>\" +\n\"\t<p>{{model.membergroup}}</p>\" +\n\"\t<span class=\\\"remove\\\">x</span>\" +\n\"</div>\" ;\n\n//@ sourceURL=/views/member/item/template.hbs"
));

require.define("/views/member/list/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<div class=\\\"memberlist\\\"></div>\" ;\n\n//@ sourceURL=/views/member/list/template.hbs"
));

require.define("/views/member/form/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  var Member, MemberCollection, MemberForm, MemberList, template;\n\n  Member = require('../../../models/member/index');\n\n  MemberCollection = require('../../../collections/member/index');\n\n  MemberList = require('../list/index');\n\n  template = require('./template.hbs');\n\n  MemberForm = Backbone.View.extend({\n    template: Handlebars.compile(template),\n    className: \"modal fade hide\",\n    events: {\n      'click .submit': 'saveMember',\n      'click .close': 'hide'\n    },\n    initialize: function() {\n      return this.render();\n    },\n    show: function() {\n      return this.$el.modal();\n    },\n    hide: function(e) {\n      return this.$el.modal('hide');\n    },\n    saveMember: function(e) {\n      e.preventDefault();\n      this.populateModel();\n      this.model.save();\n      this.collection.add(this.model);\n      return this.hide();\n    },\n    populateModel: function() {\n      var model;\n      model = this.model;\n      return this.$el.find('[name]').each(function() {\n        var el;\n        el = $(this);\n        return model.set(el.attr('name'), el.val());\n      });\n    },\n    populateFields: function() {\n      var model;\n      model = this.model;\n      return this.$el.find('[name]').each(function() {\n        var attr, el;\n        el = $(this);\n        attr = el.attr('name');\n        return el.val(model.get(attr));\n      });\n    },\n    getTemplateData: function() {\n      var groups, model;\n      model = this.model;\n      groups = model.memberGroups.map(function(group) {\n        return {\n          name: group,\n          isSelected: model.get('memberGroup') === group ? 'selected' : ''\n        };\n      });\n      return {\n        title: this.options.title || 'Create New Member',\n        model: model,\n        memberGroups: groups\n      };\n    },\n    render: function() {\n      var html;\n      html = this.template(this.getTemplateData());\n      $(this.el).html(html);\n      this.populateFields();\n      return this.show();\n    }\n  });\n\n  module.exports = MemberForm;\n\n}).call(this);\n\n//@ sourceURL=/views/member/form/index.coffee"
));

require.define("/views/member/form/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<div class=\\\"modal-header\\\">\" +\n\"  <button class=\\\"close\\\">x</button>\" +\n\"  <h3>{{title}}</h3>\" +\n\"</div>\" +\n\"<div class=\\\"modal-body\\\">\" +\n\"  <form class=\\\"form-horizontal\\\">\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Name</label>\" +\n\"      <input \" +\n\"        class=\\\"member-name\\\" \" +\n\"        name=\\\"name\\\"\" +\n\"        value=\\\"{{model.name}}\\\"\" +\n\"        type=\\\"text\\\"></input>\" +\n\"    </div>\" +\n\"    <div class=\\\"control-group\\\">\" +\n\"      <label>Member Group</label>\" +\n\"      <select \" +\n\"        class=\\\"member-group\\\" \" +\n\"        name=\\\"membergroup\\\"\" +\n\"      >\" +\n\"        <option value=\\\"\\\">Select</option>\" +\n\"        {{#each memberGroups}}\" +\n\"        <option value=\\\"{{name}}\\\" {{isSelected}}> {{name}} </option>\" +\n\"        {{/each}}\" +\n\"      </select>\" +\n\"    </div>\" +\n\"    <button class=\\\"submit btn btn-primary\\\">Save Member</button>\" +\n\"  </form>\" +\n\"</div>\" +\n\"<div class=\\\"modal-footer\\\">\" +\n\"  <a href=\\\"#\\\" class=\\\"btn close\\\">Close</a>\" +\n\"</div>\" ;\n\n//@ sourceURL=/views/member/form/template.hbs"
));

require.define("/models/column/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Column;\n\n  Column = Backbone.Model.extend({\n    urlRoot: '/TheWall/api/columns',\n    defaults: function() {\n      return {\n        title: 'Column title'\n      };\n    },\n    toJSON: function() {\n      return {\n        Title: this.get('Title'),\n        Order: this.get('Order'),\n        Id: this.get('Id')\n      };\n    }\n  });\n\n  module.exports = Column;\n\n}).call(this);\n\n//@ sourceURL=/models/column/index.coffee"
));

require.define("/collections/column/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Column, ColumnCollection;\n\n  Column = require('../../models/column/index');\n\n  ColumnCollection = Backbone.Collection.extend({\n    model: Column,\n    url: '/TheWall/api/columns'\n  });\n\n  module.exports = ColumnCollection;\n\n}).call(this);\n\n//@ sourceURL=/collections/column/index.coffee"
));

require.define("/views/column/item/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var CardItem, ColumnView, template;\n\n  CardItem = require('../../card/item/index');\n\n  template = require('./template.hbs');\n\n  ColumnView = Backbone.View.extend({\n    className: 'column',\n    template: Handlebars.compile(template),\n    initialize: function() {\n      return this.listenTo(this.model, 'change', this.render);\n    },\n    render: function() {\n      var html;\n      html = this.template({\n        model: this.model.toJSON(),\n        points: this.collection.getPoints()\n      });\n      $(this.el).html(html);\n      return this.renderCards();\n    },\n    renderCards: function() {\n      var _this = this;\n      return this.collection.each(function(card) {\n        var view;\n        view = new CardItem({\n          model: card\n        });\n        view.render();\n        return _this.$el.append(view.el);\n      });\n    }\n  });\n\n  module.exports = ColumnView;\n\n}).call(this);\n\n//@ sourceURL=/views/column/item/index.coffee"
));

require.define("/views/column/item/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<h1 class=\\\"column__title\\\">{{model.Title}} <span>{{points}}</span></h1>\" +\n\"<div class=\\\"column__index\\\"></div>\" ;\n\n//@ sourceURL=/views/column/item/template.hbs"
));

require.define("/views/column/lists/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var ColumnItem, Columns, template;\n\n  ColumnItem = require('../item/index');\n\n  template = require('./template.hbs');\n\n  Columns = Backbone.View.extend({\n    template: Handlebars.compile(template),\n    initialize: function() {\n      this.collection.fetch();\n      return this.options.cards.fetch();\n    },\n    render: function() {\n      var el, html,\n        _this = this;\n      html = this.template();\n      $(this.el).html(html);\n      el = this.$el;\n      return this.collection.each(function(columnModel) {\n        var subset, view;\n        subset = _this.options.cards.subcollection({\n          filter: function(card) {\n            return card.get('column_id') === columnModel.id;\n          }\n        });\n        view = new ColumnItem({\n          model: columnModel,\n          collection: subset\n        });\n        view.render();\n        return $(_this.el).find('.columns').append(view.el);\n      });\n    }\n  });\n\n  module.exports = Columns;\n\n}).call(this);\n\n//@ sourceURL=/views/column/lists/index.coffee"
));

require.define("/views/column/lists/template.hbs",Function(['require','module','exports','__dirname','__filename','process','global'],"module.exports = \"<h1></h1>\" +\n\"<div class=\\\"columns\\\"></div>\" ;\n\n//@ sourceURL=/views/column/lists/template.hbs"
));

require.define("/main.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Application, Router, layout, router;\n\n  Application = require('./views/application/index');\n\n  Router = require('./router');\n\n  layout = new Application();\n\n  router = new Router();\n\n  Backbone.history.start({\n    pushState: true\n  });\n\n}).call(this);\n\n//@ sourceURL=/main.coffee"
));

require.define("/views/application/index.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var Application;\n\n  Application = Backbone.View.extend({\n    el: $('body'),\n    events: {\n      'click .brand': 'home',\n      'click .cardCreate': 'cardCreate',\n      'click .memberCreate': 'memberCreate',\n      'click .showMembers': 'showMembers'\n    },\n    home: function(e) {\n      e.preventDefault();\n      return Backbone.history.navigate('/', {\n        trigger: true\n      });\n    },\n    cardCreate: function(e) {\n      e.preventDefault();\n      return Backbone.history.navigate('card/new', {\n        trigger: true\n      });\n    },\n    memberCreate: function(e) {\n      e.preventDefault();\n      return Backbone.history.navigate('member/new', {\n        trigger: true\n      });\n    },\n    showMembers: function(e) {\n      e.preventDefault();\n      return Backbone.history.navigate('members', {\n        trigger: true\n      });\n    }\n  });\n\n  module.exports = Application;\n\n}).call(this);\n\n//@ sourceURL=/views/application/index.coffee"
));

require.define("/entry.coffee",Function(['require','module','exports','__dirname','__filename','process','global'],"(function() {\n  'use strict';\n\n  var appView, cardCollection, cardFormView, cardItemView, cardListView, cardModel, columnCollection, columnItemView, columnListView, columnModel, main, memberCollection, memberFormView, memberItemView, memberListView, memberModel, router;\n\n  router = require('./router');\n\n  main = require('./main');\n\n  cardModel = require('./models/card/index');\n\n  memberModel = require('./models/member/index');\n\n  columnModel = require('./models/column/index');\n\n  cardCollection = require('./collections/card/index');\n\n  memberCollection = require('./collections/member/index');\n\n  columnCollection = require('./collections/column/index');\n\n  appView = require('./views/application/index');\n\n  cardFormView = require('./views/card/form/index');\n\n  cardItemView = require('./views/card/item/index');\n\n  cardListView = require('./views/card/list/index');\n\n  memberItemView = require('./views/member/item/index');\n\n  memberListView = require('./views/member/list/index');\n\n  memberFormView = require('./views/member/form/index');\n\n  columnItemView = require('./views/column/item/index');\n\n  columnListView = require('./views/column/lists/index');\n\n}).call(this);\n\n//@ sourceURL=/entry.coffee"
));
require("/entry.coffee");
})();
