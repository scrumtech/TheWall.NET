MemberItem = require('../item/index')
template = require('./template.hbs')

#class MemberList extends Backbone.View
MemberList = Backbone.View.extend
	template: Handlebars.compile(template)

	# get the lastest models
	initialize: ->
		this.listenTo(this.collection, 'reset', this.render)
		this.listenTo(this.collection, 'add', this.render)
		this.collection.fetch()

	render: ->
		# sort card items by number
		this.collection.sortBy (model) ->
			model.get('title')

		# render
		html = @template()
		$(this.el).html(html)

		el = this.$el
		cards = this.collection
		cards.each (member) ->
			view = new MemberItem
				model: member
			el.find('.memberlist').append(view.render())

module.exports = MemberList