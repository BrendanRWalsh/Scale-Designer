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
    canvas: null,
    ctx: null,
    offset : {
        x : 0,
        y : 0
    },
    scales: [],
    history: [], //tracker for changes
    x: 100,
    y: 0,
    z: 1.5,
    lastScaleColour: null,
    pointer: {
        x: 0,
        y: 0,
        down: false,
    },
    init: function () {
        //engage main draw port
        app.canvas = document.getElementById('appCanvas')
        app.ctx = app.canvas.getContext('2d');
        ctx = app.ctx
        app.resizeCanvas(app.canvas)
        cPos = app.canavs.getBoundingClientRect()
        app.offset.x = cPos.x
        app.offset.y = cPos.y
        app.input()
    },
    resizeCanvas: function (canv) {
        styles = window.getComputedStyle(canv)
        canv.width = Number(styles.width.substring(0, styles.width.length - 2))
        canv.height = Number(styles.height.substring(0, styles.height.length - 2))
    },
    drawScreen: function () {
        ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
        for (i = app.scales.length - 1; i >= 0; i--) {
            app.drawScale(app.scales[i])
        }
    },
    coordToMap: function ([x, y]) {
        x2 = app.z * x * 60 + app.x
        y2 = app.z * y * 35 + app.y
        if (y % 2 != 0) {
            x2 += 30 * app.z
        }
        return [x2, y2]
    },
    drawScale: function (scale) {
        let c = app.coordToMap([scale.x, scale.y])
        ctx.beginPath()
        ctx.moveTo(c[0], c[1])
        ctx.bezierCurveTo(
            c[0] - 40 * app.z,
            c[1] + 15 * app.z,
            c[0] - 40 * app.z,
            c[1] + 75 * app.z,
            c[0],
            c[1] + 100 * app.z)
        ctx.bezierCurveTo(
            c[0] + 40 * app.z,
            c[1] + 75 * app.z,
            c[0] + 40 * app.z,
            c[1] + 15 * app.z,
            c[0],
            c[1])
        ctx.closePath()
        ctx.fillStyle = scale.colour
        ctx.fill()
        ctx.save()
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath();
        ctx.arc(c[0], c[1] + 21 * app.z, 15 * app.z, 0, 2 * Math.PI)
        ctx.fill()
        ctx.globalCompositeOperation = "source-atop"
        ctx.globalAlpha = 0.4;

        ctx.drawImage(
            img,
            c[0] - 31 * app.z,
            c[1],
            61 * app.z,
            100 * app.z)
        ctx.restore()
    },
    viewportCalc: function (x, y) {
        x2 = x * (app.canvas.width - app.x) / app.z
        y2 = y * (app.canvas.height - app.y) / app.z
        return [x2, y2]
    },
    input: function () {
        window.addEventListener("keydown", function (e) {
            if (e.key == "ArrowLeft") {
                app.x -= 10
            }
            if (e.key == "ArrowRight") {
                app.x += 10
            }
            if (e.key == "ArrowUp") {
                app.y -= 10
            }
            if (e.key == "ArrowDown") {
                app.y += 10
            }
            app.drawScreen()
        })
        app.canvas.addEventListener("pointerdown", e => {
            app.pointer.down = true
        });
        app.canvas.addEventListener("pointerdown", e => {
            app.pointer.down = false
        });
        app.canvas.addEventListener("contextmenu", e => {
            e.preventDefault();
        });
        app.canvas.addEventListener("pointermove", e => {
            app.pointer.x = e.clientX
            app.pointer.y = e.clientY
            ctx.clearRect(0,0,50,50)
            ctx.fillText(app.pointer.x,10,10)
            ctx.fillText(app.pointer.y,10,20)
        });
        window.addEventListener("wheel", e => {
            if (e.deltaY < 0) {
                app.z += 0.1
            };
            if (e.deltaY > 0) {
                app.z -= 0.1
            };
            app.drawScreen()
        });
    }
}
img = new Image()
img.src = "./assets/scaleTransp2.png"
app.init()
for (i = 0; i < 10; i++) {
    x = new Scale(i, 0, 1, 'green')
    app.scales.push(x)
}
for (i = 0; i < 10; i++) {
    x = new Scale(i, 1, 1, 'green')
    app.scales.push(x)
}
img.onload = function () {
    app.drawScreen()
}