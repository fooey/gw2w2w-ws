fs = require('fs')
vm = require('vm')
jsdom = require('jsdom')

class SVG
    constructor: () ->
        filename = require.resolve("../externals/raphael")
        code = fs.readFileSync(filename)
        @_script = vm.createScript(code, filename)

    _raphael: (win, doc, nav) ->
        ctx =
            module:     {}
            window:     win
            document:   doc
            navigator:  nav
            console:    console
            setTimeout: process.nextTick
        @_script.runInNewContext(ctx)
        ctx.module.exports

    generate: (width, height, callback) ->
        win = jsdom.createWindow(jsdom.dom)
        doc = win.document = jsdom.jsdom("<html><body></body></html>")
        nav = win.navigator
        doc.implementation.addFeature "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"
        Raphael = @_raphael(win, doc, nav)
        paper = new Raphael(0, 0, width or 42, height or 42)
        callback? paper
        doc.body.firstChild?.outerHTML or ""

module.exports = new SVG()
module.exports.SVG = SVG
