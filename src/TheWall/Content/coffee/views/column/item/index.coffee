'use strict'
CardItem = require('../../card/item/index')
template = require('./template.hbs')

#class CardList extends Backbone.View
ColumnView = Backbone.View.extend
	className: 'column'
	template: Handlebars.compile(template)

	# define events
	initialize: ->
		this.listenTo(this.model, 'change', this.render)

	# build the card item. This card item is render by the list
	render: ->
		html = @template
			model: this.model.toJSON()
			points: this.collection.getPoints()
		$(this.el).html(html)

		@renderCards()

	renderCards: ->
		@collection.each (card) =>
			view = new CardItem
				model: card
			view.render()
			@$el.append(view.el)

module.exports = ColumnView