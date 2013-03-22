'use strict'

Card = require('../../models/card/index')

#class CardCollection extends Backbone.Collection
CardCollection = Backbone.Collection.extend

	model: Card
	url: '/TheWall/api/storycards'

	getPoints: ->
		reduce = (num, model)-> model.get('points') + num
		this.reduce reduce, 0

module.exports = CardCollection