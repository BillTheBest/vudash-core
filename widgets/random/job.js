'use strict'

module.exports = {
  script: function (emit) {
    const random = Math.random() * (999 - 100) + 100
    const number = Math.floor(random)
    emit({number})
  },

  schedule: 5000

}
