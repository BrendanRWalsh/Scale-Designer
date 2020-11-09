class Scale {
    constructor(x, y, size, colour) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.colour = colour;
    }
    changeColour(colour) {
        this.colour = colour
    }
    changeSize() {}
    delete() {}
}

const app = {
    canvas: {
        base: {
            c: null,
            ctx: null,
        },
        colour: {
            c: null,
            ctx: null
        },
        normal: {
            c: null,
            ctx: null
        }
    },
    scales: [],
    history: [], //tracker for changes
    x: 200,
    y: 200,
    z: 1,
    lastScaleColour: null,
    init: function () {
        //engage main draw port
        app.canvas.base.c = document.getElementById('appCanvas')
        app.canvas.base.ctx = app.canvas.base.c.getContext('2d');
        cb = app.canvas.base
        app.resizeCanvas(cb.c)
        //engage the colour layer (canvas)
        app.canvas.colour.c = document.createElement('canvas')
        app.canvas.colour.ctx = app.canvas.colour.c.getContext('2d')
        cc = app.canvas.colour
        cc.c.width = cb.c.width
        cc.c.height = cb.c.height
        //engage the normal map layer
        app.canvas.normal.c = document.createElement('canvas')
        app.canvas.normal.ctx = app.canvas.normal.c.getContext('2d')
        cn = app.canvas.normal
        cn.c.width = cb.c.width
        cn.c.height = cb.c.height

    },
    resizeCanvas: function (canv) {
        styles = window.getComputedStyle(canv)
        canv.width = Number(styles.width.substring(0, styles.width.length - 2))
        canv.height = Number(styles.height.substring(0, styles.height.length - 2))
    },
    drawScreen: function () {
        //clear all canvi
        cb.ctx.clearRect(0, 0, cb.c.width, cb.c.height);
        // cc.ctx.clearRect(0, 0, cc.c.width, cc.c.height);
        // cn.ctx.clearRect(0, 0, cn.c.width, cn.c.height);
        for (i = app.scales.length - 1; i >= 0; i--) {
            app.drawScale(app.scales[i])
        }
        // cb.ctx.save();
        // cb.ctx.globalCompositeOperation = "source-in"
        // cb.ctx.drawImage(cc.c, 0, 0);
        // cb.ctx.restore();
    },
    coordToMap: function ([x, y]) {
        x2 = app.z * x * 60 + app.x
        y2 = app.z * y * 60 + app.y
        return [x2, y2]
    },
    drawScale: function (scale) {
        let c = app.coordToMap([scale.x, scale.y])
        cb.ctx.beginPath()
        cb.ctx.moveTo(c[0], c[1])
        cb.ctx.bezierCurveTo(
            c[0] - 40,
            c[1] + 30,
            c[0] - 40,
            c[1] + 60,
            c[0],
            c[1] + 100)
        cb.ctx.bezierCurveTo(
            c[0] + 40,  
            c[1] + 60,
            c[0] + 40,
            c[1] + 30,
            c[0],
            c[1])
        cb.ctx.closePath()
        cb.ctx.stroke()
        cb.ctx.fillStyle = scale.colour
        cb.ctx.fill()
        cb.ctx.clearCircle(c[0],c[1],10)
    },
    viewportCalc: function (x, y) {
        x2 = x * (cb.c.width - app.x) / app.z
        y2 = y * (cb.c.height - app.y) / app.z
        return [x2, y2]
    },
    update: function () {},
}
app.init()
for (i = 0; i < 10; i++) {
    x = new Scale(i, 0, 1, 'green')
    app.scales.push(x)
}
for (i = 0; i < 10; i++) {
    x = new Scale(i, 1, 1, 'green')
    app.scales.push(x)
}
app.drawScreen()