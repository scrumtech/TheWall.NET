Router = require('../../../router')
template = require('./template.hbs')

#class MemberItem extends Backbone.View
MemberItem = Backbone.View.extend
	className: 'member-item'
	template: Handlebars.compile(template)
	events:
		'click .card': 'edit'
		'click .remove': 'removeMember'

	# define events
	initialize: ->
		this.listenTo(this.model, 'change', this.render)

	# build the card item. This card item is render by the list
	render: ->
		html = @template
			model: this.model.toJSON()
		$(this.el).html(html)

	# Destroy the selected card model
	removeMember: (e) ->
		e.stopPropagation()
		$(this.el).fadeOut 'slow', (e) =>
			this.model.destroy()

	# on click of a selected card, update the URL, which will trigger event in router
	edit: ->
		Backbone.history.navigate '/member/' + this.model.id + '/edit', 
			trigger: true

module.exports = MemberItem;