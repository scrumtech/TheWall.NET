Member = require('../../../models/member/index')
MemberCollection = require('../../../collections/member/index')
MemberList = require('../list/index')
template = require('./template.hbs')

MemberForm = Backbone.View.extend
	template: Handlebars.compile(template)
	className: "modal fade hide"
	events:
		'click .submit': 'saveMember'
		'click .close': 'hide'

	initialize: ->
		this.render()

	show: ->
		this.$el.modal()

	hide: (e)->
		this.$el.modal('hide')

	saveMember: (e)->
		e.preventDefault()
		this.populateModel()
		@model.save()
		@collection.add(@model)
		this.hide()

	populateModel: ->
		model = @model;

		this.$el.find('[name]').each ->
			el = $(this)
			model.set el.attr('name'), el.val()

	populateFields: ->
		model = @model

		this.$el.find('[name]').each ->
			el = $(this)
			attr = el.attr('name')
			el.val(model.get(attr))

	getTemplateData: ->
		model = @model
		groups = model.memberGroups.map (group) ->
			name: group
			isSelected: if model.get('memberGroup') is group then 'selected' else ''

		title: @options.title || 'Create New Member'
		model: model
		memberGroups: groups

	render: ->
		html = @template(this.getTemplateData())
		$(this.el).html(html)
		this.populateFields()
		this.show()

module.exports = MemberForm