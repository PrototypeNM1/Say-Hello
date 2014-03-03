/*
Copyright (c) 2012 Ramesh Nair (hiddentao.com)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/


(function() {
  var Cloneable, DefaultQueryBuilderOptions, Delete, Expression, Insert, JoinWhereOrderLimit, QueryBuilder, Select, Update, WhereOrderLimit, _export, _extend,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _extend = function() {
    var dst, k, sources, src, v, _i, _len;
    dst = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (sources) {
      for (_i = 0, _len = sources.length; _i < _len; _i++) {
        src = sources[_i];
        if (src) {
          for (k in src) {
            if (!__hasProp.call(src, k)) continue;
            v = src[k];
            dst[k] = v;
          }
        }
      }
    }
    return dst;
  };

  Cloneable = (function() {

    function Cloneable() {}

    Cloneable.prototype.clone = function() {
      var newInstance;
      newInstance = new this.constructor;
      return _extend(newInstance, JSON.parse(JSON.stringify(this)));
    };

    return Cloneable;

  })();

  Expression = (function() {
    var _toString;

    Expression.prototype.tree = null;

    Expression.prototype.current = null;

    function Expression() {
      this.toString = __bind(this.toString, this);

      this.or = __bind(this.or, this);

      this.and = __bind(this.and, this);

      this.end = __bind(this.end, this);

      this.or_begin = __bind(this.or_begin, this);

      this.and_begin = __bind(this.and_begin, this);

      var _this = this;
      this.tree = {
        parent: null,
        nodes: []
      };
      this.current = this.tree;
      this._begin = function(op) {
        var new_tree;
        new_tree = {
          type: op,
          parent: _this.current,
          nodes: []
        };
        _this.current.nodes.push(new_tree);
        _this.current = _this.current.nodes[_this.current.nodes.length - 1];
        return _this;
      };
    }

    Expression.prototype.and_begin = function() {
      return this._begin('AND');
    };

    Expression.prototype.or_begin = function() {
      return this._begin('OR');
    };

    Expression.prototype.end = function() {
      if (!this.current.parent) {
        throw new Error("begin() needs to be called");
      }
      this.current = this.current.parent;
      return this;
    };

    Expression.prototype.and = function(expr) {
      if (!expr || "string" !== typeof expr) {
        throw new Error("expr must be a string");
      }
      this.current.nodes.push({
        type: 'AND',
        expr: expr
      });
      return this;
    };

    Expression.prototype.or = function(expr) {
      if (!expr || "string" !== typeof expr) {
        throw new Error("expr must be a string");
      }
      this.current.nodes.push({
        type: 'OR',
        expr: expr
      });
      return this;
    };

    Expression.prototype.toString = function() {
      if (null !== this.current.parent) {
        throw new Error("end() needs to be called");
      }
      return _toString(this.tree);
    };

    _toString = function(node) {
      var child, nodeStr, str, _i, _len, _ref;
      str = "";
      _ref = node.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child.expr != null) {
          nodeStr = child.expr;
        } else {
          nodeStr = _toString(child);
          if ("" !== nodeStr) {
            nodeStr = "(" + nodeStr + ")";
          }
        }
        if ("" !== nodeStr) {
          if ("" !== str) {
            str += " " + child.type + " ";
          }
          str += nodeStr;
        }
      }
      return str;
    };

    return Expression;

  })();

  DefaultQueryBuilderOptions = {
    autoQuoteTableNames: false,
    autoQuoteFieldNames: false,
    nameQuoteCharacter: '`',
    usingValuePlaceholders: false
  };

  QueryBuilder = (function(_super) {

    __extends(QueryBuilder, _super);

    function QueryBuilder(options) {
      this.options = _extend({}, DefaultQueryBuilderOptions, options);
    }

    QueryBuilder.prototype._getObjectClassName = function(obj) {
      var arr;
      if (obj && obj.constructor && obj.constructor.toString) {
        arr = obj.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length === 2) {
          return arr[1];
        }
      }
      return void 0;
    };

    QueryBuilder.prototype._sanitizeCondition = function(condition) {
      var c, t;
      t = typeof condition;
      c = this._getObjectClassName(condition);
      if ('Expression' !== c && "string" !== t) {
        throw new Error("condition must be a string or Expression instance");
      }
      if ('Expression' === t || 'Expression' === c) {
        condition = condition.toString();
      }
      return condition;
    };

    QueryBuilder.prototype._sanitizeName = function(value, type) {
      if ("string" !== typeof value) {
        throw new Error("" + type + " must be a string");
      }
      return value;
    };

    QueryBuilder.prototype._sanitizeField = function(item) {
      var sanitized;
      sanitized = this._sanitizeName(item, "field name");
      if (this.options.autoQuoteFieldNames) {
        return "" + this.options.nameQuoteCharacter + sanitized + this.options.nameQuoteCharacter;
      } else {
        return sanitized;
      }
    };

    QueryBuilder.prototype._sanitizeTable = function(item) {
      var sanitized;
      sanitized = this._sanitizeName(item, "table name");
      if (this.options.autoQuoteTableNames) {
        return "" + this.options.nameQuoteCharacter + sanitized + this.options.nameQuoteCharacter;
      } else {
        return sanitized;
      }
    };

    QueryBuilder.prototype._sanitizeAlias = function(item) {
      return this._sanitizeName(item, "alias");
    };

    QueryBuilder.prototype._sanitizeLimitOffset = function(value) {
      value = parseInt(value);
      if (0 > value || isNaN(value)) {
        throw new Error("limit/offset must be >=0");
      }
      return value;
    };

    QueryBuilder.prototype._sanitizeValue = function(item) {
      var t;
      t = typeof item;
      if (null !== item && "string" !== t && "number" !== t && "boolean" !== t) {
        throw new Error("field value must be a string, number, boolean or null");
      }
      return item;
    };

    QueryBuilder.prototype._formatValue = function(value) {
      if (null === value) {
        value = "NULL";
      } else if ("boolean" === typeof value) {
        value = value ? "TRUE" : "FALSE";
      } else if ("number" !== typeof value) {
        if (false === this.options.usingValuePlaceholders) {
          value = "'" + value + "'";
        }
      }
      return value;
    };

    return QueryBuilder;

  })(Cloneable);

  WhereOrderLimit = (function(_super) {

    __extends(WhereOrderLimit, _super);

    function WhereOrderLimit(options) {
      this._limitString = __bind(this._limitString, this);

      this._orderString = __bind(this._orderString, this);

      this._whereString = __bind(this._whereString, this);

      this.limit = __bind(this.limit, this);

      this.order = __bind(this.order, this);

      this.where = __bind(this.where, this);
      WhereOrderLimit.__super__.constructor.call(this, options);
      this.wheres = [];
      this.orders = [];
      this.limits = null;
    }

    WhereOrderLimit.prototype.where = function(condition) {
      condition = this._sanitizeCondition(condition);
      if ("" !== condition) {
        this.wheres.push(condition);
      }
      return this;
    };

    WhereOrderLimit.prototype.order = function(field, asc) {
      if (asc == null) {
        asc = true;
      }
      field = this._sanitizeField(field);
      this.orders.push({
        field: field,
        dir: asc ? "ASC" : "DESC"
      });
      return this;
    };

    WhereOrderLimit.prototype.limit = function(max) {
      max = this._sanitizeLimitOffset(max);
      this.limits = max;
      return this;
    };

    WhereOrderLimit.prototype._whereString = function() {
      if (0 < this.wheres.length) {
        return " WHERE (" + this.wheres.join(") AND (") + ")";
      } else {
        return "";
      }
    };

    WhereOrderLimit.prototype._orderString = function() {
      var o, orders, _i, _len, _ref;
      if (0 < this.orders.length) {
        orders = "";
        _ref = this.orders;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          if ("" !== orders) {
            orders += ", ";
          }
          orders += "" + o.field + " " + o.dir;
        }
        return " ORDER BY " + orders;
      } else {
        return "";
      }
    };

    WhereOrderLimit.prototype._limitString = function() {
      if (this.limits) {
        return " LIMIT " + this.limits;
      } else {
        return "";
      }
    };

    return WhereOrderLimit;

  })(QueryBuilder);

  JoinWhereOrderLimit = (function(_super) {

    __extends(JoinWhereOrderLimit, _super);

    function JoinWhereOrderLimit(options) {
      this._joinString = __bind(this._joinString, this);

      this.outer_join = __bind(this.outer_join, this);

      this.right_join = __bind(this.right_join, this);

      this.left_join = __bind(this.left_join, this);

      this.join = __bind(this.join, this);
      JoinWhereOrderLimit.__super__.constructor.call(this, options);
      this.joins = [];
    }

    JoinWhereOrderLimit.prototype.join = function(table, alias, condition, type) {
      if (type == null) {
        type = 'INNER';
      }
      table = this._sanitizeTable(table);
      if (alias) {
        alias = this._sanitizeAlias(alias);
      }
      if (condition) {
        condition = this._sanitizeCondition(condition);
      }
      this.joins.push({
        type: type,
        table: table,
        alias: alias,
        condition: condition
      });
      return this;
    };

    JoinWhereOrderLimit.prototype.left_join = function(table, alias, condition) {
      if (alias == null) {
        alias = null;
      }
      if (condition == null) {
        condition = null;
      }
      return this.join(table, alias, condition, 'LEFT');
    };

    JoinWhereOrderLimit.prototype.right_join = function(table, alias, condition) {
      if (alias == null) {
        alias = null;
      }
      if (condition == null) {
        condition = null;
      }
      return this.join(table, alias, condition, 'RIGHT');
    };

    JoinWhereOrderLimit.prototype.outer_join = function(table, alias, condition) {
      if (alias == null) {
        alias = null;
      }
      if (condition == null) {
        condition = null;
      }
      return this.join(table, alias, condition, 'OUTER');
    };

    JoinWhereOrderLimit.prototype._joinString = function() {
      var j, joins, _i, _len, _ref;
      joins = "";
      _ref = this.joins || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        j = _ref[_i];
        joins += " " + j.type + " JOIN " + j.table;
        if (j.alias) {
          joins += " `" + j.alias + "`";
        }
        if (j.condition) {
          joins += " ON (" + j.condition + ")";
        }
      }
      return joins;
    };

    return JoinWhereOrderLimit;

  })(WhereOrderLimit);

  Select = (function(_super) {

    __extends(Select, _super);

    function Select(options) {
      this.toString = __bind(this.toString, this);

      this.offset = __bind(this.offset, this);

      this.group = __bind(this.group, this);

      this.field = __bind(this.field, this);

      this.from = __bind(this.from, this);

      this.distinct = __bind(this.distinct, this);
      Select.__super__.constructor.call(this, options);
      this.froms = [];
      this.fields = [];
      this.groups = [];
      this.offsets = null;
      this.useDistinct = false;
    }

    Select.prototype.distinct = function() {
      this.useDistinct = true;
      return this;
    };

    Select.prototype.from = function(table, alias) {
      if (alias == null) {
        alias = null;
      }
      table = this._sanitizeTable(table);
      if (alias) {
        alias = this._sanitizeAlias(alias);
      }
      this.froms.push({
        name: table,
        alias: alias
      });
      return this;
    };

    Select.prototype.field = function(field, alias) {
      if (alias == null) {
        alias = null;
      }
      field = this._sanitizeField(field);
      if (alias) {
        alias = this._sanitizeAlias(alias);
      }
      this.fields.push({
        name: field,
        alias: alias
      });
      return this;
    };

    Select.prototype.group = function(field) {
      field = this._sanitizeField(field);
      this.groups.push(field);
      return this;
    };

    Select.prototype.offset = function(start) {
      start = this._sanitizeLimitOffset(start);
      this.offsets = start;
      return this;
    };

    Select.prototype.toString = function() {
      var f, field, fields, groups, ret, table, tables, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      if (0 >= this.froms.length) {
        throw new Error("from() needs to be called");
      }
      ret = "SELECT ";
      if (this.useDistinct) {
        ret += "DISTINCT ";
      }
      fields = "";
      _ref = this.fields;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        if ("" !== fields) {
          fields += ", ";
        }
        fields += field.name;
        if (field.alias) {
          fields += " AS \"" + field.alias + "\"";
        }
      }
      ret += "" === fields ? "*" : fields;
      tables = "";
      _ref1 = this.froms;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        table = _ref1[_j];
        if ("" !== tables) {
          tables += ", ";
        }
        tables += table.name;
        if (table.alias) {
          tables += " `" + table.alias + "`";
        }
      }
      ret += " FROM " + tables;
      ret += this._joinString();
      ret += this._whereString();
      if (0 < this.groups.length) {
        groups = "";
        _ref2 = this.groups;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          f = _ref2[_k];
          if ("" !== groups) {
            groups += ", ";
          }
          groups += f;
        }
        ret += " GROUP BY " + groups;
      }
      ret += this._orderString();
      ret += this._limitString();
      if (this.offsets) {
        ret += " OFFSET " + this.offsets;
      }
      return ret;
    };

    return Select;

  })(JoinWhereOrderLimit);

  Update = (function(_super) {

    __extends(Update, _super);

    function Update(options) {
      this.toString = __bind(this.toString, this);

      this.set = __bind(this.set, this);

      this.table = __bind(this.table, this);
      Update.__super__.constructor.call(this, options);
      this.tables = [];
      this.fields = {};
    }

    Update.prototype.table = function(table, alias) {
      if (alias == null) {
        alias = null;
      }
      table = this._sanitizeTable(table);
      if (alias) {
        alias = this._sanitizeAlias(alias);
      }
      this.tables.push({
        name: table,
        alias: alias
      });
      return this;
    };

    Update.prototype.set = function(field, value) {
      field = this._sanitizeField(field);
      value = this._sanitizeValue(value);
      this.fields[field] = value;
      return this;
    };

    Update.prototype.toString = function() {
      var field, fieldNames, fields, ret, table, tables, _i, _j, _len, _len1, _ref;
      if (0 >= this.tables.length) {
        throw new Error("table() needs to be called");
      }
      fieldNames = (function() {
        var _ref, _results;
        _ref = this.fields;
        _results = [];
        for (field in _ref) {
          if (!__hasProp.call(_ref, field)) continue;
          _results.push(field);
        }
        return _results;
      }).call(this);
      if (0 >= fieldNames.length) {
        throw new Error("set() needs to be called");
      }
      ret = "UPDATE ";
      tables = "";
      _ref = this.tables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        table = _ref[_i];
        if ("" !== tables) {
          tables += ", ";
        }
        tables += table.name;
        if (table.alias) {
          tables += " AS `" + table.alias + "`";
        }
      }
      ret += tables;
      fields = "";
      for (_j = 0, _len1 = fieldNames.length; _j < _len1; _j++) {
        field = fieldNames[_j];
        if ("" !== fields) {
          fields += ", ";
        }
        fields += "" + field + " = " + (this._formatValue(this.fields[field]));
      }
      ret += " SET " + fields;
      ret += this._whereString();
      ret += this._orderString();
      ret += this._limitString();
      return ret;
    };

    return Update;

  })(WhereOrderLimit);

  Delete = (function(_super) {

    __extends(Delete, _super);

    function Delete() {
      this.toString = __bind(this.toString, this);

      this.from = __bind(this.from, this);
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.prototype.table = null;

    Delete.prototype.from = function(table, alias) {
      table = this._sanitizeTable(table);
      if (alias) {
        alias = this._sanitizeAlias(alias);
      }
      this.table = {
        name: table,
        alias: alias
      };
      return this;
    };

    Delete.prototype.toString = function() {
      var ret;
      if (!this.table) {
        throw new Error("from() needs to be called");
      }
      ret = "DELETE FROM " + this.table.name;
      if (this.table.alias) {
        ret += " `" + this.table.alias + "`";
      }
      ret += this._joinString();
      ret += this._whereString();
      ret += this._orderString();
      ret += this._limitString();
      return ret;
    };

    return Delete;

  })(JoinWhereOrderLimit);

  Insert = (function(_super) {

    __extends(Insert, _super);

    function Insert(options) {
      this.toString = __bind(this.toString, this);

      this.set = __bind(this.set, this);

      this.into = __bind(this.into, this);
      Insert.__super__.constructor.call(this, options);
      this.table = null;
      this.fields = {};
    }

    Insert.prototype.into = function(table) {
      table = this._sanitizeTable(table);
      this.table = table;
      return this;
    };

    Insert.prototype.set = function(field, value) {
      field = this._sanitizeField(field);
      value = this._sanitizeValue(value);
      this.fields[field] = value;
      return this;
    };

    Insert.prototype.toString = function() {
      var field, fieldNames, fields, name, values, _i, _len;
      if (!this.table) {
        throw new Error("into() needs to be called");
      }
      fieldNames = (function() {
        var _ref, _results;
        _ref = this.fields;
        _results = [];
        for (name in _ref) {
          if (!__hasProp.call(_ref, name)) continue;
          _results.push(name);
        }
        return _results;
      }).call(this);
      if (0 >= fieldNames.length) {
        throw new Error("set() needs to be called");
      }
      fields = "";
      values = "";
      for (_i = 0, _len = fieldNames.length; _i < _len; _i++) {
        field = fieldNames[_i];
        if ("" !== fields) {
          fields += ", ";
        }
        fields += field;
        if ("" !== values) {
          values += ", ";
        }
        values += this._formatValue(this.fields[field]);
      }
      return "INSERT INTO " + this.table + " (" + fields + ") VALUES (" + values + ")";
    };

    return Insert;

  })(QueryBuilder);

  _export = {
    expr: function() {
      return new Expression;
    },
    select: function(options) {
      return new Select(options);
    },
    update: function(options) {
      return new Update(options);
    },
    insert: function(options) {
      return new Insert(options);
    },
    "delete": function(options) {
      return new Delete(options);
    },
    remove: function(options) {
      return new Delete(options);
    },
    DefaultQueryBuilderOptions: DefaultQueryBuilderOptions,
    Cloneable: Cloneable,
    Expression: Expression,
    QueryBuilder: QueryBuilder,
    WhereOrderLimit: WhereOrderLimit,
    JoinWhereOrderLimit: JoinWhereOrderLimit,
    Select: Select,
    Update: Update,
    Insert: Insert,
    Delete: Delete
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = _export;
  }

  if (typeof window !== "undefined" && window !== null) {
    window.squel = _export;
  }

	squel = _export;

}).call(this);
