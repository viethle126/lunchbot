# @lunchbot: search for restaurants on Slack

**Features** - updated 5/1/16
* User can search for restaurants
  * @lunchbot search :pizza: near Irvine, CA
  * _standard search:_ @lunchbot search tacos near Irvine, CA _**-all**_
* User can set a default location
  * @lunchbot set location Tustin, CA
  * _then:_ @lunchbot search sushi
* User can request reviews for a restaurant
  * @lunchbot reviews for Taco Shop
* User can request the menu for a restaurant
  * @lunchbot menu for Curry House
* User can request the number and address for a restaurant
  * @lunchbot info Hondaya

**Notes:**

1. @lunchbot only returns restaurants with an Eat24 portal by default. To perform a standard search including restaurants without an Eat24 portal, append _**-all**_ to the end of your search.
2. @lunchbot must be addressed in public channels before issuing commands.
  * General: @lunchbot search Thai near Los Angeles, CA
  * Direct message: search Thai near Los Angeles, CA

![lunchbot-search-blur](https://cloud.githubusercontent.com/assets/16697731/14793292/3bede79c-0ad3-11e6-9e88-4eb2b3fdf11e.jpg)
