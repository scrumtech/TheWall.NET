'use strict'

Column = require('../../models/column/index')

ColumnCollection = Backbone.Collection.extend

	model: Column
	url: '/TheWall/api/columns'

module.exports = ColumnCollection