'use strict'

Card = require('./models/card/index')
CardCollection = require('./collections/card/index')
CardList = require('./views/card/list/index')
CardForm = require('./views/card/form/index')

Member = require('./models/member/index')
MemberCollection = require('./collections/member/index')
MemberList = require('./views/member/list/index')
MemberForm = require('./views/member/form/index')

Column = require('./models/column/index')
ColumnCollection= require('./collections/column/index')
ColumnItem = require('./views/column/item/index')
ColumnCollectionView = require('./views/column/lists/index')

#class Router extends Backbone.Router
Router = Backbone.Router.extend

	# default routes
	routes:
		"": "home"
		"card/new": "cardCreate"
		"card/edit" : "cardUpdate"
		"user/create": "memberCreate"
		"members": "showMembers"
		"*default": "default_route"

	# Home
	home: ->
		$('.nav li.active').removeClass('active')
		$('.home').addClass('active')

		columns = new ColumnCollectionView
			collection: @columnsCollection
			cards: @cards

		$('#app').empty().append(columns.el)

		$.when(@cards.fetch(), @columnsCollection.fetch()).done =>
			columns.render()

	# cardUpdate
	cardUpdate: (id)->
		memberGroup = @members

		model = new Card
			_id:id

		model.fetch().done =>
			update = new CardForm
				model: model
				collection: @cards
				title: 'Update Card'
				members: memberGroup
				columns: @columnsCollection

			update.$el.on 'hide', =>
				this.navigate '/', trigger:true

	# cardCreate
	cardCreate: ->
		$.when(@columnsCollection.fetch(), @members.fetch()).done =>

			createCard = new CardForm
				title: 'Create new card'
				collection: @cards
				model: new Card()
				members: @members
				columns: @columnsCollection

			createCard.$el.on 'hide', =>
				this.navigate '/', trigger:true

	# Create a member
	memberCreate: ->
		createMember = new MemberForm
			model: new Member()
			title: 'Create new member'
			collection: @members

		createMember.$el.on 'hide', =>
			this.navigate '/members', trigger:true

	# Show all members
	showMembers: ->
		this.navigate '/members', trigger:true
		
		memberSection = $('<div class="memberSection" />')
		$('#app').empty().append(memberSection)

		memberlist = new MemberList
		 	collection: @members
		
		memberSection.append(memberlist.el)

		@members.fetch().done =>
			memberlist.render()

	# Default
	default_route: ->
		this.navigate '/', trigger:true

	# initialize
	initialize: ->
		this.cards = new CardCollection()
		this.members = new MemberCollection()
		this.columnsCollection = new ColumnCollection()

module.exports = Router