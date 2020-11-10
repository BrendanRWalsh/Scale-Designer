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
    offset: {
        x: 0,
        y: 0
    },
    scales: [],
    ghost: {
        draw: true,
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        selections: []
    },
    history: [], //tracker for changes
    x: 0,
    y: 0,
    z: 1.5,
    lastScaleColour: null,
    pointer: {
        x: 0,
        y: 0,
        down: false,
    },
    selection: {
        size: 1,
        colour: 'purple',
        tool: 'brush'
    },
    init: function () {
        //engage main draw port
        app.canvas = document.getElementById('appCanvas')
        app.ctx = app.canvas.getContext('2d');
        ctx = app.ctx
        app.resizeCanvas(app.canvas)
        app.input()
        img = new Image()
        img.src = "./assets/scaleTransp2.png"
    },
    resizeCanvas: function (canv) {
        styles = window.getComputedStyle(canv)
        canv.width = Number(styles.width.substring(0, styles.width.length - 2))
        canv.height = Number(styles.height.substring(0, styles.height.length - 2))
        cPos = app.canvas.getBoundingClientRect()
        app.offset.x = cPos.x
        app.offset.y = cPos.y
    },
    drawScreen: function () {
        ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
        for (i = app.scales.length - 1; i >= 0; i--) {
            if (app.scales[i] != "") {
                for (j = app.scales[i].length - 1; j >= 0; j--) {
                    if (app.scales[i][j] != "") {
                        app.drawScale(j, i, app.scales[i][j])
                    }
                }
            }
        }
    },
    drawScale: function (x, y, scale, alpha) {
        let c = app.coordToMap(x, y)
        ctx.save()
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
        try {
            ctx.fillStyle = scale[1]
        } catch (error) {
            console.log([x, y, scale, alpha])
        }
        ctx.globalAlpha = alpha || 1
        ctx.fill()
        if (scale[2]) {
            ctx.save()
            ctx.globalAlpha = alpha || 0.5
            ctx.fillStyle = "white"
            ctx.fill()
            ctx.restore()
        }
        ctx.restore()
        ctx.save()
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath();
        ctx.arc(c[0], c[1] + (21 * app.z), 15 * app.z, 0, 2 * Math.PI)
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
    toolChange: function (change) {
        switch (change) {
            case "primaryColour":
                app.selection.colour = window.getComputedStyle(document.getElementById('primaryColour')).backgroundColor
                break;
            case "secondaryColour":
                app.selection.colour = window.getComputedStyle(document.getElementById('secondaryColour')).backgroundColor
        }
    },
    input: function () {
        window.addEventListener("keydown", function (e) {
            if (e.key == "ArrowLeft") {
                app.x += 10
            }
            if (e.key == "ArrowRight") {
                app.x -= 10
            }
            if (e.key == "ArrowUp") {
                app.y += 10
            }
            if (e.key == "ArrowDown") {
                app.y -= 10
            }
            app.drawScreen()
        })
        app.canvas.addEventListener("pointerdown", e => {
            app.pointer.down = true
            gridLoc = app.calcGridLoc(e.clientX, e.clientY)
            app.gridClicked(gridLoc[0], gridLoc[1])
        });
        app.canvas.addEventListener("pointerup", e => {
            app.pointer.down = false
        });
        app.canvas.addEventListener("contextmenu", e => {
            e.preventDefault();
        });
        app.canvas.addEventListener("pointermove", e => {
            app.pointer.x = e.clientX - app.offset.x
            app.pointer.y = e.clientY - app.offset.y
            gridLoc = app.calcGridLoc(e.clientX, e.clientY)
            if (app.ghost.lastX != gridLoc[0] || app.ghost.lastY != gridLoc[1]) {
                app.ghost.lastX = app.ghost.x
                app.ghost.lastY = app.ghost.y
                app.ghost.x = gridLoc[0]
                app.ghost.y = gridLoc[1]
                if (app.pointer.down) {
                    app.gridClicked(gridLoc[0], gridLoc[1])
                }
            }
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
    },
    calcGridLoc: function (x, y) {
        x2 = Math.round((x - app.offset.x - app.x) / (60 * app.z))
        y2 = Math.round((y - app.offset.y - app.y - 20) / (35 * app.z))
        return [x2, y2]
    },
    coordToMap: function (x, y) {
        x2 = app.z * x * 60 + app.x
        y2 = app.z * y * 35 + app.y
        if (y % 2 != 0) {
            x2 += 30 * app.z
        }
        return [x2, y2]
    },
    checkMouseOver: function () {

    },
    gridClicked: function (x, y) {
        switch (app.selection.tool) {
            case "brush":
                if (!app.checkScaleExists(x, y)) {
                    app.newScale(x, y, app.selection.size, app.selection.colour)
                } else {
                    app.scales[y][x][1] = app.selection.colour
                    app.drawScreen()
                }
                break;
            case "eraser":
                if (app.scales[y]) {
                    if (app.scales[y][x]) {
                        app.scales[y][x] = []
                        app.drawScreen()
                    }
                }
                break;
            case 'select':
                if (app.scales[y]) {
                    if (app.scales[y][x]) {
                        app.scales[y][x][2] = !app.scales[y][x][2]
                        app.drawScreen()
                    }
                }
                break;
            case 'bucket':
                if (app.ghost.selections.length != 0) {
                    for (i = app.scales.length - 1; i >= 0; i--) {
                        if (app.scales[i] != "") {
                            for (j = app.scales[i].length - 1; j >= 0; j--) {
                                if (app.scales[i][j] != "") {
                                    if (app.scales[i][j][2] == true) {
                                        app.scales[i][j][1] = app.selection.colour
                                    }
                                }
                            }
                        }
                    }
                } else {
                    for (i = app.scales.length - 1; i >= 0; i--) {
                        if (app.scales[i] != "") {
                            for (j = app.scales[i].length - 1; j >= 0; j--) {
                                if (app.scales[i][j] != "") {
                                    app.scales[i][j][1] = app.selection.colour
                                }
                            }
                        }
                    }
                }
                app.drawScreen()

        };
    },
    checkScaleExists(x, y) {
        if (app.scales[y]) {
            if (!app.scales[y][x] || app.scales[y][x] == "") {
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    },
    newScale: function (x, y, size, colour) {
        shift = null
        if (y == -1) {
            shift = app.coordToMap(x, y)
            app.scales.unshift([])
            y = 0
            app.y += shift[1]
        }
        if (x == -1) {
            if (shift != null) {
                shift = app.coordToMap(x, y)
            }
            for (arr of app.scales) {
                arr.unshift([])
            }
            x = 0
            app.x += shift[0]
        }
        if (!app.scales[y]) {
            for (let i = 0; i <= y; i++) {
                if (!app.scales[y]) {
                    app.scales.push([])
                }
            }
        }
        if (!app.scales[y][x]) {
            for (let i = 0; i <= x + 1; i++) {
                if (!app.scales[y][i]) {
                    app.scales[y][i] = []
                }
            }

        }
        app.scales[y][x] = [size, colour, false]
        app.drawScreen()
    }
}

app.init()
// app.scales = [
//     [
//         [1, 'red'],
//         [1, 'orange'],
//         [1, 'yellow'],
//         [1, 'green'],
//         [1, 'blue'],
//         [1, '#FFFFFF']
//     ],
//     [
//         [1, 'purple'],
//         [1, 'purple'],
//         [1, 'purple'],
//         [1, 'purple'],
//         [1, 'purple'],
//         [1, 'purple']
//     ]
// ]
img.onload = function () {
    app.drawScreen()
}