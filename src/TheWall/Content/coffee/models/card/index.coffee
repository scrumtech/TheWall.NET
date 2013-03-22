'use strict'

# This class is breaking.
# class Card extends Backbone.Model
# Grunt says:
#	L10:C18] 'Card' is already defined.
#	function Card() {
# 
# as opposed to using Card = Backbone.Model.extend

Card = Backbone.Model.extend
	points: [0,1,3,5]
	categories: [ 'story', 'tech', 'design', 'bug' ]
	urlRoot: '/TheWall/api/storycards'
	
	defaults: ->
		number: null
		column_id: null
		is_blocked: false

	toJSON: ->
		AcceptanceCriteria: @get('AcceptanceCriteria')
		CardNumber: @get('CardNumber')
		Collaborators: @get('Collaborators')
		ColumnId: @get('ColumnId')
		IsBlocked: @get('IsBlocked')
		Notes: @get('Notes')
		StickyNotes: @get('StickyNotes')
		StoryPoints: @get('StoryPoints')
		Title: @get('Title')
		Type: @get('Type')
		Id: @get('Id')

	validate: (attribs)->
		errors = [];
		if attribs.title is undefined then "Remember to set a title"

module.exports = Card