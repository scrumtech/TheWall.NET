'use strict'

Member = require('../../models/member/index')

#class MemberCollection extends Backbone.Collection
MemberCollection = Backbone.Collection.extend

	model: Member
	url: '/TheWall/api/users'

	# save a member model
	create: (model) ->
		console.log 'created member model'
		member = new Member(model)
		return member.save()

module.exports = MemberCollection