'use strict'

Column = Backbone.Model.extend
	idAttribute: "_id"
	urlRoot: '/columns'
	
	defaults: ->
		title: 'Column title'

module.exports = Column