'use strict'

Member = Backbone.Model.extend
	memberGroups: ['A & D', 'BA', 'UX', 'FE Developer', 'BE Developer']
	urlRoot: '/TheWall/api/users'

	defaults: ->
		name: null
		membergroup: 'none'

	toJSON: ->
		Name: @get('Name')
		Email: @get('Email')
		Id: @get('Id')

	setGroup: (newGroup) ->
		this.set
			membergroup: newGroup

	# if the member group changes, add the new group
	initialize: ->
		this.on 'change:memberGroup', ->
			this.setGroup(this.get('memberGroup'))

module.exports = Member