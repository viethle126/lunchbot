var Botkit = require('botkit');
var _bots = {};

function _trackBot(bot) {
  _bots[bot.config.token] = bot;
}

function destroy(error) {
  console.log(error);
  process.exit(1);
}

module.exports = {
  configure: function(port, clientId, clientSecret, config, onInstallation) {
    var controller = Botkit.slackbot(config).configureSlackApp({
      clientId: clientId,
      clientSecret: clientSecret,
      scopes: ['bot']
    });

    controller.setupWebserver(process.env.PORT, function(error, webserver) {
      controller.createWebhookEndpoints(controller.webserver);
      controller.createOauthEndpoints(controller.webserver, function(error, req, res) {
        if (error) {
          res.status(500).send('ERROR: ' + error);
        } else {
          res.send('Success!');
        }
      })
    })

    controller.on('create_bot', function(bot, config) {
      if (!_bots[bot.config.token]) {
        bot.startRTM(function(error) {
          if (error) {
            destroy(error);
          }

          _trackBot(bot);
          if (onInstallation) {
            onInstallation(bot, config.createdBy);
          }
        })
      }
    })

    controller.storage.teams.all(function(error, teams) {
      if (error) {
        throw new Error(error);
      }

      for (var t in teams) {
        if (teams[t].bot) {
          var bot = controller.spawn(teams[t]).startRTM(function(error) {
            if (error) {
              console.log('Error connecting bot to Slack:', error);
            } else {
              _trackBot(bot);
            }
          });
        }
      }
    })

    return controller;
  }
}
