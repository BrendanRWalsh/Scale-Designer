const app = {
    canvas: null,
    ctx: null,
    scales: {
        history: [],
        hStep: 0,
        temp: [],
        main: []
    },
    ghost: {
        draw: true,
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        selections: []
    },
    history: [], //tracker for changes
    vp: {
        x: 0,
        y: 0,
        z: 1.5,
        offset: {
            x: 0,
            y: 0
        },
    },
    input: {
        pointer: {
            x: 0,
            y: 0,
            down: false,
        },
        keys: []
    },
    selection: {
        size: 1,
        colour: 'purple',
        tool: 'brush',
        mode: 'select'
    },
    settings: {
        maxHistory: 10,
        theme: 'dark'
    },
    f: {
        init: function () {
            //engage canvas
            app.canvas = document.getElementById('appCanvas')
            app.ctx = app.canvas.getContext('2d');
            ctx = app.ctx
            //set to default
            app.f.resizeCanvas(app.canvas)
            //engage inputs
            app.f.input()
            //add resize listener
            window.onresize = function () {
                app.f.resizeCanvas(app.canvas)
            }
            //load scale image into memory
            img = new Image()
            img.src = "./assets/scaleTransp2.png"
        },
        resizeCanvas: function (canv) {
            styles = window.getComputedStyle(canv)
            canv.width = Number(styles.width.substring(0, styles.width.length - 2))
            canv.height = Number(styles.height.substring(0, styles.height.length - 2))
            cPos = app.canvas.getBoundingClientRect()
            app.vp.offset.x = cPos.x
            app.vp.offset.y = cPos.y
            app.f.drawScreen()
        },
        drawScreen: function () {
            ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
            for (i = app.scales.main.length - 1; i >= 0; i--) {
                if (app.scales.main[i] != "") {
                    for (j = app.scales.main[i].length - 1; j >= 0; j--) {
                        if (app.scales.main[i][j] != "") {
                            app.f.drawScale(j, i, app.scales.main[i][j])
                        }
                    }
                }
            }
        },
        addToHistory() {
            if (app.scales.hStep > 0) {
                app.scales.history.splice(0 - app.scales.hStep, app.scales.hStep)
                app.scales.hStep = 0
            }
            app.scales.history.push(app.scales.temp)
            app.scales.main = app.scales.temp
            app.scales.temp = []
            if (app.scales.history.length > app.settings.maxHistory) {
                app.scales.history.shift()
            }
        },
        undo: function () {
            app.scales.main = app.scales.history[scales.history.length - 1]
        },
        redo: function () {},
        drawScale: function (x, y, scale, alpha) {
            let c = app.f.coordToMap(x, y)
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(c[0], c[1])
            ctx.bezierCurveTo(
                c[0] - 40 * app.vp.z,
                c[1] + 15 * app.vp.z,
                c[0] - 40 * app.vp.z,
                c[1] + 75 * app.vp.z,
                c[0],
                c[1] + 100 * app.vp.z)
            ctx.bezierCurveTo(
                c[0] + 40 * app.vp.z,
                c[1] + 75 * app.vp.z,
                c[0] + 40 * app.vp.z,
                c[1] + 15 * app.vp.z,
                c[0],
                c[1])
            ctx.closePath()
            ctx.fillStyle = scale[1]
            ctx.globalAlpha = alpha || 1
            ctx.fill()
            if (scale[2]) {
                ctx.globalAlpha = alpha || 0.5
                ctx.strokeStyle = "cyan"
                ctx.stroke()
                ctx.restore()
            }
            ctx.restore()
            ctx.save()
            ctx.globalCompositeOperation = "destination-out"
            ctx.beginPath();
            ctx.arc(c[0], c[1] + (21 * app.vp.z), 14 * app.vp.z, 0, 2 * Math.PI)
            ctx.fill()
            ctx.globalCompositeOperation = "source-atop"
            ctx.globalAlpha = 0.4;

            ctx.drawImage(
                img,
                c[0] - 31 * app.vp.z,
                c[1],
                61 * app.vp.z,
                100 * app.vp.z)
            ctx.restore()


        },
        viewportCalc: function (x, y) {
            x2 = x * (app.canvas.width - app.vp.x) / app.vp.z
            y2 = y * (app.canvas.height - app.vp.y) / app.vp.z
            return [x2, y2]
        },
        toolChange: function (change) {
            switch (change) {
                case "primaryColour":
                    app.selection.colour = window.getComputedStyle(document.getElementById('primaryColour')).backgroundColor
                    break;
                case "secondaryColour":
                    app.selection.colour = window.getComputedStyle(document.getElementById('secondaryColour')).backgroundColor
                    break;
            }
        },
        input: function () {
            window.addEventListener("keydown", function (e) {
                app.input.keys[e.key] = true
                app.f.checkKeys()
                app.f.drawScreen()
            })
            window.addEventListener("keyup", function (e) {
                app.input.keys[e.key] = false
            })
            app.canvas.addEventListener("pointerdown", e => {
                app.input.pointer.down = true
                gridLoc = app.f.calcGridLoc(e.clientX, e.clientY)
                app.f.gridClicked(gridLoc[0], gridLoc[1])
            });
            app.canvas.addEventListener("pointerup", e => {
                app.input.pointer.down = false
                app.selection.selectMode = null
            });
            app.canvas.addEventListener("contextmenu", e => {
                e.preventDefault();
            });
            app.canvas.addEventListener("pointermove", e => {
                app.input.pointer.x = e.clientX - app.vp.offset.x
                app.input.pointer.y = e.clientY - app.vp.offset.y
                gridLoc = app.f.calcGridLoc(e.clientX, e.clientY)
                if (app.ghost.lastX != gridLoc[0] || app.ghost.lastY != gridLoc[1]) {
                    app.ghost.lastX = app.ghost.x
                    app.ghost.lastY = app.ghost.y
                    app.ghost.x = gridLoc[0]
                    app.ghost.y = gridLoc[1]
                    if (app.input.pointer.down) {
                        app.f.gridClicked(gridLoc[0], gridLoc[1])
                    }
                }
            });
            window.addEventListener("wheel", e => {
                if (e.deltaY < 0) {
                    app.vp.z += 0.1
                    app.vp.x -= (app.input.pointer.x)
                };
                if (e.deltaY > 0) {
                    app.vp.z -= 0.1
                };
                app.f.drawScreen()
            });
        },
        calcGridLoc: function (x, y) {
            x2 = Math.round((x - app.vp.offset.x - app.vp.x) / (60 * app.vp.z))
            y2 = Math.round((y - app.vp.offset.y - app.vp.y - 20) / (35 * app.vp.z))
            return [x2, y2]
        },
        coordToMap: function (x, y) {
            x2 = app.vp.z * x * 60 + app.vp.x
            y2 = app.vp.z * y * 35 + app.vp.y
            if (y % 2 != 0) {
                x2 += 30 * app.vp.z
            }
            return [x2, y2]
        },
        checkMouseOver: function () {

        },
        checkKeys: function () {
            if (app.input.keys["ArrowLeft"]) {
                app.vp.x += 10
            }
            if (app.input.keys["ArrowRight"]) {
                app.vp.x -= 10
            }
            if (app.input.keys["ArrowUp"]) {
                app.vp.y += 10
            }
            if (app.input.keys["ArrowDown"]) {
                app.vp.y -= 10
            }
        },
        gridClicked: function (x, y) {
            switch (app.selection.tool) {
                case "brush":
                    if (!app.f.checkScaleExists(x, y)) {
                        app.f.newScale(x, y, app.selection.size, app.selection.colour)
                    } else {
                        app.scales.main[y][x][1] = app.selection.colour
                        app.f.drawScreen()
                    }
                    break;
                case "eraser":
                    if (app.scales.main[y]) {
                        if (app.scales.main[y][x]) {
                            app.scales.main[y][x] = []
                            app.f.drawScreen()
                        }
                    }
                    break;
                case 'select':
                    //scale exists at pointer?
                    if (app.scales.main[y]) {
                        if (app.scales.main[y][x] && app.scales.main[y][x] != '') {
                            //select mode chosen?
                            if (app.selection.selectMode == null) {
                                if (app.scales.main[y][x][2] == false) {
                                    app.selection.selectMode = "select"
                                } else {
                                    app.selection.selectMode = "deselect"
                                }
                            }
                            if (app.selection.selectMode == "select") {
                                app.scales.main[y][x][2] = true
                            } else {
                                app.scales.main[y][x][2] = false
                            }
                            // console.log(app.selection.selectMode)
                            app.f.drawScreen()
                        }
                    }
                    break;
                case 'marquee':

                    break;

                case 'bucket':
                    if (app.ghost.selections.length != 0) {
                        for (i = app.scales.main.length - 1; i >= 0; i--) {
                            if (app.scales.main[i] != "") {
                                for (j = app.scales.main[i].length - 1; j >= 0; j--) {
                                    if (app.scales.main[i][j] != "") {
                                        if (app.scales.main[i][j][2] == true) {
                                            app.scales.main[i][j][1] = app.selection.colour
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        for (i = app.scales.main.length - 1; i >= 0; i--) {
                            if (app.scales.main[i] != "") {
                                for (j = app.scales.main[i].length - 1; j >= 0; j--) {
                                    if (app.scales.main[i][j] != "") {
                                        app.scales.main[i][j][1] = app.selection.colour
                                    }
                                }
                            }
                        }
                    }
                    break;
            };
            app.f.drawScreen()
        },
        checkScaleExists(x, y) {
            if (app.scales.main[y]) {
                if (!app.scales.main[y][x] || app.scales.main[y][x] == "") {
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
                shift = app.f.coordToMap(x, y)
                app.scales.main.unshift([])
                y = 0
                app.vp.y += shift[1]
            }
            if (x == -1) {
                if (shift != null) {
                    shift = app.f.coordToMap(x, y)
                }
                for (arr of app.scales.main) {
                    arr.unshift([])
                }
                x = 0
                app.vp.x += shift[0]
            }
            if (!app.scales.main[y]) {
                for (let i = 0; i <= y; i++) {
                    if (!app.scales.main[y]) {
                        app.scales.main.push([])
                    }
                }
            }
            if (!app.scales.main[y][x]) {
                for (let i = 0; i <= x + 1; i++) {
                    if (!app.scales.main[y][i]) {
                        app.scales.main[y][i] = []
                    }
                }

            }
            app.scales.main[y][x] = [size, colour, false]
            app.f.drawScreen()
        },
        contiguous: function (x, y, z) {
            function check(x, y, z) {
                if (s[y] && s[y] != "") {
                    if (s[y][x] && s[y][x] != "") {
                        if (z) {
                            if (s[y][x][1] == z) {
                                a.push([y, x])
                            } else {
                                b.push([y, x])
                            }
                        } else {
                            a.push([y, x])
                        }
                    } else {
                        b.push([y, x])
                    }
                } else {
                    b.push([y, null])
                }
            }
            let a = [] //contigious
            let b = [] //ignore
            const n = [
                [-2, 0],
                [-1, 0],
                [-1, 1],
                [0, -1],
                [0, 1],
                [1, 0],
                [1, 1],
                [2, 0]
            ] //neighbours to check
            let s = app.scales.main //scale shortcut
            let end = false
            for (i of n) {
                check(x + i[0], x + i[1])
            }

            return t
        }

    },

}

app.f.init()
img.onload = function () {
    app.f.drawScreen()
}
nyph = {
    p: "#4e43bb",
    w: "#f9f8f3",
    r: "#d3443e"
}