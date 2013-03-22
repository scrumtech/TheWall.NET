'use strict'

Column = require('../../models/column/index')

ColumnCollection = Backbone.Collection.extend

	model: Column
	url: '/columns'

module.exports = ColumnCollection