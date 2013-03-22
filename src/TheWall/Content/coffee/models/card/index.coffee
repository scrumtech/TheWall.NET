'use strict'

# This class is breaking.
# class Card extends Backbone.Model
# Grunt says:
#	L10:C18] 'Card' is already defined.
#	function Card() {
# 
# as opposed to using Card = Backbone.Model.extend

Card = Backbone.Model.extend
	idAttribute: "_id"
	points: [0,1,3,5]
	categories: [ 'story', 'tech', 'design', 'bug' ]
	urlRoot: '/cards'
	
	defaults: ->
		number: null
		column_id: null
		is_blocked: false

	validate: (attribs)->
		errors = [];
		if attribs.title is undefined then "Remember to set a title"

module.exports = Card