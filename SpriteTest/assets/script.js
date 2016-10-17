//kid friendly game dev ui on top of:
//language on top of:
//game control system on top of:
//canvas

//new magnaGame(canvas)

//rooms

//Audio Model
//audio: src, startTime, duration, volume, play

//Reference:
// 0| int
// + float
// !! boolean
// +'' string

"use strict"

//Drawable interface
class Drawable {
    draw(ctx) {}
}

class simpleText extends Drawable {
    constructor(text='', x=0, y=0, rot=0, font, color) {
        super()
        
        this.text = text+''
        this.x = x|0
        this.y = y|0
        this.rot = +rot
        this.font = font
        this.color = color
    }
    
    draw(ctx) {
        ctx.save()
        
        if (this.font)
            ctx.font = this.font
        if (this.color)
            ctx.fillStyle = this.color
        
        const {width} = ctx.measureText(this.text)
        const centerOffsetWidth = this.x|0
        const centerOffsetHeight = this.y|0
        
        ctx.translate(centerOffsetWidth, centerOffsetHeight)
        ctx.rotate(this.rot)
        ctx.translate(-centerOffsetWidth, -centerOffsetHeight)
        
        ctx.fillText(this.text, this.x, this.y)
        ctx.restore()
    }
} 

class Sprite extends Drawable {
    constructor(image, x=0, y=0, rot=0, width=0, height=0, subimage=0, mirrorX=false, mirrorY=false) {
        super()
        if (image instanceof Image) {
            if (image.naturalHeight == 0)
                throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!")
            this.image = image
            
            this.height = height|0 || this.image.naturalHeight
            this.width = width|0 || this.image.naturalWidth
            
            this.draw = function(ctx) {
                const centerOffsetWidth = this.x+this.width/2|0
                const centerOffsetHeight = this.y+this.height/2|0
                
                ctx.save()
                ctx.translate(centerOffsetWidth, centerOffsetHeight)
                ctx.rotate(this.rot)
                ctx.translate(-centerOffsetWidth, -centerOffsetHeight)
                ctx.drawImage(this.image, this.x|0, this.y|0, this.width|0, this.height|0)
                ctx.restore()
            }
        } else if (image instanceof SpriteSheet) {
            this.spriteSheet = image
            this.subimage = subimage|0
            
            this.height = height|0 || this.spriteSheet.subimageHeight
            this.width = width|0 || this.spriteSheet.subimageWidth
            
            this.draw = function(ctx) { //draw a SpriteSheet
                const centerOffsetWidth = this.x+this.width/2|0
                const centerOffsetHeight = this.y+this.height/2|0
                
                ctx.save()
                
                ctx.translate(centerOffsetWidth, centerOffsetHeight)
                ctx.rotate(this.rot)
                if (this.mirrorX && this.mirrorY) 
                    ctx.scale(-1,-1)
                else if (this.mirrorX)
                    ctx.scale(-1,1)
                else if (this.mirrorY)
                    ctx.scale(1,-1)
                ctx.translate(-centerOffsetWidth, -centerOffsetHeight)

                ctx.drawImage(this.spriteSheet.image, 
                              this.spriteSheet.getFrameX(this.subimage)|0, 
                              this.spriteSheet.getFrameY(this.subimage)|0, 
                              this.spriteSheet.subimageWidth|0,
                              this.spriteSheet.subimageHeight|0,
                              this.x|0, 
                              this.y|0, 
                              this.width|0, 
                              this.height|0
                             )
                ctx.restore()
            }
        } else {
            throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!")
        }
            
        this.x = x|0
        this.y = y|0
        this.rot = +rot
        this.mirrorX = !!mirrorX
        this.mirrorY = !!mirrorY
    }
}

//only supports spritesheets with subimages right next to eachother as of now
class SpriteSheet {
    
    constructor(image, subimageWidth, subimageHeight, subimageCount) {
    
        if (!(image instanceof Image)) 
            throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!")
        if (!subimageHeight) 
            throw new TypeError("ParameterError: subimageHeight required!")
        if (!subimageWidth) 
            throw new TypeError("ParameterError: subimageWidth required!")
        if (image.naturalHeight == 0)
            throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!")
        
        this.image = image
        this.subimageHeight = subimageHeight|0
        this.subimageWidth = subimageWidth|0
        
        this._imagesPerRow = (image.naturalWidth / subimageWidth|0)
        this._imagesPerColumn = (image.naturalHeight / subimageHeight|0)
        //this.subimageCount = subimageCount|0 || this._imagesPerColumn * this._imagesPerRow
    }
    
    getFrameX(subimage) {
        return ((subimage % this._imagesPerRow) % this._imagesPerRow) * this.subimageWidth
    }
    
    getFrameY(subimage) {
        
        return ((subimage / this._imagesPerRow |0) % this._imagesPerColumn) * this.subimageHeight
    } 
}

//IDEA: use es6 proxies to make a LazyRenderer class (useful for performance on things with a low change rate)
//IDEA: make a ControlledRenderer class that only renders when told to


class RenderLoop {
    
    constructor(canvas) {
        if (!canvas)
            throw new TypeError("Parametererror: canvas required!")
        
        this.canvas = canvas
        if (!this.canvas.getContext)
            throw new TypeError("Context could not be retrieved from canvas!")
        
        this.ctx = this.canvas.getContext('2d')
        
        this.onDrawStart = function() {}
        this.onDrawEnd = function() {}
        
        this._spriteHash = {}
        this._spriteArr = []
        this._running = false
        
        this.start()
    }
    
    start() {
        if (!this._running) {
            this._running = true
            this._loop()
        } else {
            throw new Error("RenderLoop instance was asked to start while running")
        }
    }
    
    stop() {
        if (this._running) {
            this._running = false
        } else {
            throw new Error("RenderLoop instance was asked to stop while stopped")
        }
    }
    
    _loop() {
        this.onDrawStart()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for (let i = 0; i < this._spriteArr.length; i++)
            this._spriteArr[i].draw(this.ctx)

        this.onDrawEnd()
        if (this._running)
            window.requestAnimationFrame(this._loop.bind(this))
    }
    
    addDrawable(name, sprite, depth=0) {
        if (!name)
            throw new TypeError("Parametererror: name required!")
        if (!sprite)
            throw new TypeError("Parametererror: sprite required!")
        if (!(sprite instanceof Drawable))
            throw new TypeError("Parametererror: sprite must be an instance of Sprite!")
        
        this._spriteHash[name] = sprite
        this._spriteHash[name]._rl_depth = depth
        //insert into array at proper position
        this._spliceSprite(sprite)
        
        return this
    }
    
    getDrawable(name) {
        return this._spriteHash[name]
    }
    
    deleteDrawable(name) {
        //remove from array
        this._spriteArr.splice(this._spriteHash[name]._rl_index, 1)
        //remove from hash
        delete this._spriteHash[name]
    }
    
    setDrawableDepth(name, depth=0) {
        //remove from array
        this._spriteArr.splice(this._spriteHash[name]._rl_index, 1)
        this._spriteHash[name]._rl_depth = depth
        //reinsert
        this._spliceSprite(this._spriteHash[name])
    }
    
    getDrawableDepth(name) {
        return this._spriteHash[name]._rl_depth
    }
    
    _spliceSprite(sprite) {
        var low = 0,
            high = this._spriteArr.length

        while (low < high) {
            var mid = (low + high) >>> 1
            if (this._spriteArr[mid]._rl_depth < sprite._rl_depth) low = mid + 1
            else high = mid
        }
        
        sprite._rl_index = low
        this._spriteArr.splice(low, 0, sprite)
        //update index counter of sprites being pushed up by insertion
        for (let i = low+1; i < this._spriteArr.length; i++) {
            this._spriteArr[i]._rl_index++
        }
    }
}

class ImageLoadPool {
    
    constructor() {
        
        this._total = 0
        this._progress = 0

        this._images = []
        
        this.onProgress = function(){}
        this.onComplete = function(){}
    }
    
    addImage(src) {
        this._total++
        const temp = new Image()
        this._images.push({img: temp, src: src})
        
        temp.onload = (function() {
            this._progress++
            if (this._progress == this._total)
                this.onComplete()
            else
                this.onProgress()
        }).bind(this)
        
        temp.onerror = function() {
            throw new Error("Error loading image: " + src)
        }
        
        return temp
    }
    
    start() {
        this._images.forEach(e=>{
            e.img.src = e.src
        })
    }
}

class Input {
    constructor(el=document) {
        if (!((el instanceof HTMLElement) || (el instanceof HTMLDocument)))
            throw new TypeError("ParameterError: el must be a valid HTML element!")
        
        //allow this element to be focused
        if (el.tabIndex==-1)
            el.tabIndex = 1
        //input state
        this.keysDown = {}
        this.buttonsDown = {}
        this.mousePos = { x: 0, y:0 }
        
        //callback registry
        this._mouseEvents = {
            down: [],
            up: [],
            move: []
        };
        
        this._keyEvents = {
            down: [],
            up: []
        }
        //IDEAs:
        //gamepad
        //touch vs mouse (perhaps gestures too)
        
        //disable the context menu
        el.oncontextmenu=e=>e.preventDefault()
        //add callbacks
        el.onmousedown=e=>{
            e.preventDefault()
            e.target.focus()
            this.buttonsDown[e.button] = true
            this._mouseEvents.down.forEach(o=>{
                if (o.button!=undefined) {
                    if (o.button==e.button) 
                        o.func(e.button)   
                }
                else
                    o.func(e.button)
            })
        }
        el.onmouseup=e=>{
            e.preventDefault()
            e.target.focus()
            this.buttonsDown[e.button] = false
            this._mouseEvents.up.forEach(o=>{
                if (o.button!=undefined) {
                    if (o.button==e.button) 
                        o.func(e.button)   
                }
                else
                    o.func(e.button)
            })
        }
        el.onmousemove=e=>{
            this._mouseEvents.move.forEach(o=>o.func())
            const {left, top} = canvas.getBoundingClientRect()
            this.mousePos.x = e.clientX - left
            this.mousePos.y = e.clientY - top
        }
        
        el.onkeydown=e=>{
            if (!this.keysDown[e.key.toLowerCase()]) {
                e.preventDefault()
                this.keysDown[e.key.toLowerCase()] = true
                this._keyEvents.down.forEach(o=>{
                    if (o.key) {
                        if (o.key==e.key.toLowerCase()) 
                            o.func(e.key)   
                    }
                    else
                        o.func(e.key)
                })
            }
        }
        el.onkeyup=e=>{
            e.preventDefault()
            this.keysDown[e.key.toLowerCase()] = false
            this._keyEvents.up.forEach(o=>{
                if (o.key) {
                    if (o.key==e.key.toLowerCase()) 
                        o.func(e.key)   
                }
                else
                    o.func(e.key)
            })
        }
    }
    
    onMouse(eventName, func, button) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._mouseEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)

        this._mouseEvents[eventName].push({func, button})
    }
    
    onKey(eventName, func, key) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._keyEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        
        this._keyEvents[eventName].push({func, key: (key)?key.toLowerCase():undefined})
    }
    
    checkKey(key) {
        return (this.keysDown[key.toLowerCase()])?true:false
    }
    
    checkButton(button) {
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)
        
        return (this.buttonsDown[button])?true:false
    }
    
    _stringToMouseCode(str) {
        switch (str.toLowerCase()) {
            case 'left': return 0
            case 'middle': return 1
            case 'right': return 2
        }
    }
}

