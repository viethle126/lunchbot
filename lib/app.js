const Botkit = require('botkit')
let _bots = {}

const _trackBot = bot => {
  _bots[bot.config.token] = bot
}

module.exports = {
  configure: (port, clientId, clientSecret, config, onInstallation) => {
    let controller = Botkit.slackbot(config).configureSlackApp({
      clientId: clientId,
      clientSecret: clientSecret,
      scopes: ['bot']
    })

    controller.setupWebserver(process.env.PORT, (error, webserver) => {
      controller.createWebhookEndpoints(controller.webserver)
      controller.createOauthEndpoints(controller.webserver, (error, req, res) => {
        if (error) return res.status(500).send('ERROR: ' + error)
        else return res.send('Success!')
      })
    })

    controller.on('create_bot', (bot, config) => {
      if (_bots[bot.config.token]) return
      else bot.startRTM(error => {
        if (!error) return _trackBot(bot)
        if (onInstallation) return onInstallation(bot, config.createdBy)
      })
    })

    controller.storage.teams.all((error, teams) => {
      if (error) throw new Error(error)

      for (var t in teams) {
        if (teams[t].bot) {
          let bot = controller
            .spawn(teams[t])
            .startRTM(error => {
              if (error) return console.log('Error connecting bot to Slack:', error)
              else return _trackBot(bot)
            })
        }
      }
    })

    return controller
  }
}
