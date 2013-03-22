'use strict'

#class Application extends Backbone.View
Application = Backbone.View.extend
	el: $('body')
	events:
		'click .brand': 'home'
		'click .cardCreate': 'cardCreate'
		'click .memberCreate': 'memberCreate'
		'click .showMembers': 'showMembers'

	# On click of the logo/home, navigate home
	home: (e) ->
		e.preventDefault()
		Backbone.history.navigate '/', trigger:true

	# On click of the 'card create' link, navigate to 'card/new' which will trigger an event in the router
	cardCreate: (e) ->
		e.preventDefault()
		Backbone.history.navigate 'card/new', trigger:true

	memberCreate: (e) ->
		e.preventDefault()
		Backbone.history.navigate 'member/new', trigger:true

	showMembers: (e) ->
		e.preventDefault()
		Backbone.history.navigate 'members', trigger: true

module.exports = Application