'use strict'

Member = Backbone.Model.extend
	idAttribute: "_id"
	memberGroups: ['A & D', 'BA', 'UX', 'FE Developer', 'BE Developer']
	urlRoot: '/members'

	url: ->
		if this.get('_id')
			return '/member/' + this.get('_id')
		else
			return '/member'

	defaults: ->
		name: null
		membergroup: 'none'

	setGroup: (newGroup) ->
		this.set
			membergroup: newGroup

	# if the member group changes, add the new group
	initialize: ->
		this.on 'change:memberGroup', ->
			this.setGroup(this.get('memberGroup'))

module.exports = Member