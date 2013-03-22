'use strict'

Column = Backbone.Model.extend
	urlRoot: '/TheWall/api/columns'
	
	defaults: ->
		title: 'Column title'

	toJSON: ->
		Title: @get('Title')
		Order: @get('Order')
		Id: @get('Id')


module.exports = Column