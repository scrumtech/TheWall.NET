'use strict'

ColumnItem = require('../item/index')
template = require('./template.hbs')

#class CardList extends Backbone.View
Columns = Backbone.View.extend
	template: Handlebars.compile(template)

	# get the lastest models
	initialize: ->
		# this.listenTo this.collection, 'reset', this.render
		# this.listenTo this.collection, 'add', this.render
		# this.listenTo this.options.cards, 'reset', this.render
		# this.listenTo this.options.cards, 'add', this.render
		@collection.fetch()
		@options.cards.fetch()

	render: ->
		# render the template
		html = @template()
		$(this.el).html(html)

		#render the columns
		el = this.$el

		@collection.each (columnModel) =>

			subset = @options.cards.subcollection
				filter: (card) -> card.get('column_id') is columnModel.id

			view = new ColumnItem
				model: columnModel
				collection: subset

			view.render()

			$(this.el).find('.columns').append(view.el)

module.exports = Columns