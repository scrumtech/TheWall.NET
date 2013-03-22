'use strict'

Router = require('../../../router')
template = require('./template.hbs')

#class CardItem extends Backbone.View
CardItem = Backbone.View.extend
	className: 'card-item'
	template: Handlebars.compile(template)
	events:
		'click .card': 'edit'
		'click .remove': 'removeCard'

	# define events
	initialize: ->
		this.listenTo(this.model, 'change', this.render)

	# build the card item. This card item is render by the list
	render: ->
		html = @template
			model: this.model.toJSON()
		$(this.el).html(html)

	# Destroy the selected card model
	removeCard: (e) ->
		e.stopPropagation()
		$(this.el).fadeOut 'slow', (e) =>
			this.model.destroy()

	# on click of a selected card, update the URL, which will trigger event in router
	edit: ->
		Backbone.history.navigate '/card/' + this.model.id + '/edit', 
			trigger: true

module.exports = CardItem;