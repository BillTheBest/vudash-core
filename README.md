# vudash-core
Vudash open source component

Writen using hapijs, lab, semantic ui, socket.io

# Tests
`npm test`

# Project Status
Status: Rewrote entire original 'vudash' application as a core-component of a bigger project.
Now fully tested, with a handful of example widgets.

# Usage
Install as a global module `npm install -g vudash` and use `vudash create` to create an example dashboard.
Add new widgets under `/widgets` and add them to your dashboard under `/dashboards`.

# Dashboards

A dashboard is a collection of widgets separated into rows and columns.

Dashboards are in JSON format and take the form:
`{
  "name": "my-dashboard",
  "widgets": [
    [
      { "widget": "./widgets/random" },
      { "widget": "./widgets/gauge" },
      { "widget": "./widgets/health" },
      { "widget": "./widgets/time" }
    ],
    [
      { "widget": "./widgets/github" },
      { "widget": "./widgets/pluck", "options": { "path": "rates.GBP", "description": "EUR -> GBP" } },
      { "widget": "./widgets/pluck", "options": { "path": "rates.USD", "description": "EUR -> USD" } }
    ],
    [
      { "widget": "./widgets/dial" }
    ]
  ]
}
`
Where 'widgets' is an array of arrays. The top level array represents rows of widgets on the screen. There is theoretically no min/max width for a widget.

# Widgets

Widgets are configured in the dashboard.json file, in the format:

`{
  "widget": "./widgets/pluck",
  "options": {
    "your" : "config"
  }
}`

# Creating a widget

A widget is a visible indicator of some sort of statistic or other monitor, which emits new data using websockets, and updates its display in the dashboard based on the information given in this data.

A widget is packaged as a node module, but a node module can simply be a folder with a `package.json` file. It can then contain a number of files:

## package.json
`{ "name": "vudash-widget-example", "main": "widget.js" }`
The `main` js file above should reference your main module class, in this example we call it `widget.js`

## widget.js
`'use strict'

const moment = require('moment')

class TimeWidget {

  register (options) {
    return {

      markup: 'markup.html',
      update: 'update.js',
      schedule: 1000,

      job: (emit) => {
        const now = moment()
        emit({time: now.format('HH:mm:ss'), date: now.format('MMMM Do YYYY')})
      }

    }
  }

}

module.exports = TimeWidget
`
The main widget file. The crux of this file is to export a class with a single method, register, which returns a widget configuration, which is:

`
  {
    config: {abc: 'def'} // configuration to pass to the client and server side widget. Available in the client as `$widget.config` and `options` parameter of `register()`
    markup: 'markup.html' // The html for the widget. This is automatically wrapped in a grid cell, so it can be any html you like.
    update: 'update.js' // The method that is triggered when the `job` emits new data. This gets `$widget`, `$id`, and `$data` passed in, as detailed below.
    schedule: 1000 // Put simply, how often the widget sends updates,
    css: 'styles.css' // Or, an array of css filenames. these are rendered to the client.
    clientJs: 'client.js' // or an array of js files. These are rendered to the client.
    job: (emit) => { emit({x: 'y'}) } // The crux of the widget. Does some sort of work or check, and then emits the results.
  }
`

To pass configuration, you can use the `options` parameter of `register()`

## update.js

The client side code to update the widget. It is wrapped in a function which contains
* `$id`: The widget's ID (For avoiding conflicts in the browser - this is in the format widget_<random> where random is some random chars assigned at load time)
* `$widget`: The widget itself, initially contains one property, `config`, which is the config you gave in `widget.js` above. You can use it as a store for anything you like, as it is namespaced to the widget you are working on. i.e. $widget.myValue = 'x'
* `$data`: Whatever you emit from emit() in your job method. Ideally this is a javascript object.

## markup

Just html. Use {{id}} to get the ID of the widget mentioned above. Your html should use things like `<h1 id="{{id}}-some-thing"/>` to avoid conflicts. You can then reference them using `$id+'-some-thing'` when you need to access them from the clientside javascript.

# Working
 - Dashboards
 - Widgets
 - Multi-Tenancy

# Roadmap
 - Documentation
 - A bunch of example widgets
 - Some sort of testing around multi-tenancy
 - A deep consideration of the coupling with semantic-ui
 - Heroku easy deploy
