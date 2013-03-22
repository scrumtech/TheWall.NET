'use strict'

Application = require('./views/application/index')
Router = require('./router')

layout = new Application()
router = new Router()

# Start the History state
Backbone.history.start
	pushState: true