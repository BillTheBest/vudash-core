'use strict'

const Widget = require(fromSrc('modules/widget'))

describe('modules.widget', () => {
  it('Barf on unknown widget', (done) => {
    const badModuleName = resource('widgets/unknown')
    function fn () {
      return new Widget(badModuleName)
    }
    expect(fn).to.throw(Error, /Cannot find module /)
    done()
  })

  it('Gains a dynamic id', (done) => {
    const module = resource('widgets/example')
    expect(new Widget(module).id).to.exist()
    done()
  })

  it('Reads widget descriptor properties', (done) => {
    const widget = new Widget(resource('widgets/example'))
    const job = widget.getJob()
    expect(job).to.deep.include({
      schedule: 1000
    })
    expect(job.script).to.be.a.function()
    expect(widget.getClientsideJs()).to.include("function() { console.log('hello'); }")
    expect(widget.getCss()).to.equal('body { color: #fff; }')
    done()
  })

  it('Parses markup', (done) => {
    const widget = new Widget(resource('widgets/example'))
    expect(widget.getMarkup()).to.equal(`<h1 id="${widget.id}">Hello</h1>`)
    done()
  })

  it('Widget with missing properties', (done) => {
    const widget = new Widget(resource('widgets/missing'))
    expect(widget.getMarkup()).to.equal('')
    expect(widget.getCss()).to.equal('')
    expect(widget.getClientsideJs()).to.equal('')
    done()
  })

  it('Widget with invalid properties', (done) => {
    const module = resource('widgets/broken')
    expect(() => { return new Widget(module) }).to.throw(Error, `Could not load widget component from ${module}/markup.html`)
    done()
  })

  it('Converts widget to render model', (done) => {
    const widget = new Widget(resource('widgets/example'))
    const renderModel = widget.toRenderModel()
    expect(renderModel).to.deep.include({
      css: widget.getCss(),
      markup: widget.getMarkup()
    })
    expect(renderModel.js).to.include(widget.getClientsideJs())
    done()
  })

  it('Binds events on the client side', (done) => {
    const widget = new Widget(resource('widgets/example'))
    let bound = `
    socket.on('${widget.id}:update', widget_${widget.id}.handleEvent.bind(widget_${widget.id}))
    `.trim()
    expect(widget.toRenderModel().js).to.include(bound)
    done()
  })

  it('Event is not bound if there is no update code', (done) => {
    const widget = new Widget(resource('widgets/neutral'))
    expect(widget.toRenderModel().js).to.equal('')
    done()
  })

  it('Attaches update function to event', (done) => {
    const widget = new Widget(resource('widgets/example'))
    let update = `
      update: ${widget.update}
    `.trim()
    expect(widget.toRenderModel().js).to.include(update)
    done()
  })

  it('Loads jobs', (done) => {
    const widget = new Widget(resource('widgets/example'))
    const job = widget.getJob()
    expect(job.schedule).to.equal(1000)
    done()
  })

  it('Overrides config for jobs', (done) => {
    const overrides = {
      foo: 'baz',
      working: true
    }
    const widget = new Widget(resource('widgets/configurable'), overrides)
    const rawConfig = widget.getJob().script()
    expect(rawConfig).to.deep.equal(overrides)
    done()
  })

  it('Does not override all config for jobs', (done) => {
    const overrides = {
      working: true
    }
    const widget = new Widget(resource('widgets/configurable'), overrides)
    const rawConfig = widget.getJob().script()
    expect(rawConfig).to.deep.equal({
      foo: 'bar',
      working: true
    })
    done()
  })
})
