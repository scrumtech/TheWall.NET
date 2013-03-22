'use strict'

Card = require('../../../models/card/index')
CardCollection = require('../../../collections/card/index')
CardList = require('../list/index')
template = require('./template.hbs')

#class CardForm extends Backbone.View
CardForm = Backbone.View.extend
	template: Handlebars.compile(template)
	className: "modal fade hide"
	events:
		'click .submit': 'saveCard'
		'click .close': 'hide'

	# call render immediately
	initialize: ->
		this.render()

	# show the modal
	show: ->
		this.$el.modal()

	# hide the modal
	hide: (e)->
		this.$el.modal('hide')

	# on click of .submit, extract the data from the form and populate & save the model
	#Add the model to the collection and call the hide method to hide the modal
	saveCard: (e)->
		e.preventDefault()
		this.populateModel()
		this.model.save()
		this.collection.add(this.model)
		this.hide()

	# Called when creating a card
	# Extract the data from an element into the matching key/value store of the model
	populateModel: ->
		model = this.model

		this.$el.find('[name]').each ->
			el = $(this)
			model.set el.attr('name'), el.val()

	# Called when editing a card
	# Extract the data from the model into the matching input with the same attr name
	populateFields: ->
		model = this.model

		this.$el.find('[name]').each ->
			el = $(this)
			attr = el.attr('name')
			el.val(model.get(attr))

	# Get the model data
	# Create an array of 'points' and 'categories' extracted from the model
	# Get the memberCollection that was passed through via this.options.members, convert to JSON and send it to the template
	# return title which is available through options, and the model, categories and points
	getTemplateData: ->
		model = this.model
		points = this.model.points.map (point) ->
			name: point
			isSelected: if model.get('points') is point then 'selected' else ''
		categories = this.model.categories.map (cat) ->
			name: cat
			isSelected: if model.get('type') is cat then 'selected' else ''

		members = this.options.members.toJSON()
		columns = this.options.columns.toJSON()

		title: this.options.title || 'Card'
		model: model
		categories: categories
		points: points
		members: members or 'Bernard'
		columns: columns

	# Stuff #cardForm with our form markup, appending modal classes from 'className'.
	# Call getTemplateData() and extract data from the model.
	# Call populateFields() and get the data from any input with a name attr
	# Call the show method to display the modal
	render: ->
		html = @template(this.getTemplateData())

		$(this.el).html(html)
		this.populateFields()
		this.show()

module.exports = CardForm