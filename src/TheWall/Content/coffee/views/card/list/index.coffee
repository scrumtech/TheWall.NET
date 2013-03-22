'use strict'

CardItem = require('../item/index')
template = require('./template.hbs')

#class CardList extends Backbone.View
CardList = Backbone.View.extend
	template: Handlebars.compile(template)

	# get the lastest models
	initialize: ->
		this.listenTo this.collection, 'reset', this.render
		this.listenTo this.collection, 'add', this.render
		this.collection.fetch()

	render: ->
		# sort card items by number
		this.collection.sortBy (model) ->
			model.get('number')

		# render
		html = @template()
		$(this.el).html(html)

		#render the columns
		el = this.$el
		cards = this.collection
		cards.each (card) ->
			view = new CardItem
				model: card
			el.find('.cardlist').append(view.render())

		console.log('test')

module.exports = CardList