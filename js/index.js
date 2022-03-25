var sw = 20 //方块的宽度
var sh = 20 //方块的高度
var tr = 28 //行数
var td = 28 //列数

var snake = null //蛇的实例
var food = null //食物的实例
var game = null //游戏的实例

// 方块创建
function Square(x, y, classname) {
  //0,0 ->0,0坐标转换
  //20,20->1,0
  this.x = x * sw
  this.y = y * sh
  this.class = classname
  this.viewContent = document.createElement('div') //添加一个方块对应的div
  this.viewContent.className = this.class //给这个div添加一个属性
  this.parent = document.getElementById('snakeWrap') //方块的父级
}

Square.prototype.create = function () {
  //创建方块DOM,并添加导页面
  this.viewContent.style.position = 'absolute'
  this.viewContent.style.width = sw + 'px'
  this.viewContent.style.height = sh + 'px'
  this.viewContent.style.left = this.x + 'px'
  this.viewContent.style.top = this.y + 'px'
  this.parent.appendChild(this.viewContent)
}

Square.prototype.remove = function () {
  this.parent.removeChild(this.viewContent)
}

// 蛇
function Snake() {
  this.head = null //存一下蛇头的信息
  this.tail = null //存一下蛇尾的信息
  this.pos = [] //存蛇身上的每一个方块位置
  this.directionNum = {
    //存储蛇走的方向，用一个对象来表示
    left: {
      x: -1,
      y: 0,
      rotate: 90, //蛇头在不同方向上应该进行旋转
    },
    right: {
      x: 1,
      y: 0,
      rotate: -90,
    },
    up: {
      x: 0,
      y: -1,
      rotate: 180,
    },
    down: {
      x: 0,
      y: 1,
      rotate: 0,
    },
  }
}

//蛇初始化
Snake.prototype.init = function () {
  //创建蛇头
  var snakeHead = new Square(2, 0, 'snakeHead')
  snakeHead.create()
  this.head = snakeHead //存储蛇头信息
  this.pos.push([2, 0]) //把蛇头的位置存起来
  // 创建蛇身体1
  var snakeBody1 = new Square(1, 0, 'snakeBody')
  snakeBody1.create()
  this.pos.push([1, 0]) //把蛇的身体1位置存起来
  // 创建蛇身体2
  var snakeBody2 = new Square(0, 0, 'snakeBody')
  snakeBody2.create()
  this.pos.push([0, 0]) //把蛇的身体1位置存起来
  this.tail = snakeBody2 //把蛇的尾巴信息存起来
  //形成链表关系
  snakeHead.last = null
  snakeHead.next = snakeBody1

  snakeBody1.last = snakeHead
  snakeBody1.next = snakeBody2

  snakeBody2.last = snakeBody1
  snakeBody2.next = null

  //给蛇添加一条属性，用来表示蛇走的方向
  this.direction = this.directionNum.right //默认往右走
}

//这个方法用来获取舌头的下一个位置对应的元素，要根据元素做不同的事情
Snake.prototype.getNextPos = function () {
  var nextPos = [
    this.head.x / sw + this.direction.x,
    this.head.y / sh + this.direction.y,
  ]
  console.log(nextPos)
  // 1.下个点是自己，撞到自己，游戏结束
  var selfCollied = false //是否撞到了自己
  this.pos.forEach(function (value) {
    if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
      //如果数组中的两个数据都相等，说明撞到自己了
      selfCollied = true
    }
  })
  if (selfCollied) {
    console.log('撞到自己')
    this.strategies.die.call(this)
    return
  }
  // 2.下个点是墙，游戏结束
  if (
    nextPos[0] < 0 ||
    nextPos[1] < 0 ||
    nextPos[0] > td - 1 ||
    nextPos[1] > tr - 1
  ) {
    console.log('撞墙上了')
    this.strategies.die.call(this)
    return
  }
  // 3.下个点是蛋，吃
  if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
    //如果这个条件成立代表蛇头要走的下一个点是食物的那个点
    console.log('碰到食物了')
    this.strategies.eat.call(this)
    return
  }

  // 4.下个点什么也不是，继续走
  this.strategies.move.call(this)
}

//处理碰撞后要处理的事
Snake.prototype.strategies = {
  move: function (format) {
    //这个参数用于决定要不要删除最后一个方块,传了代表吃
    //创建一个新身体(在旧舌头的位置)
    var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody')
    //  更新链表的关系
    newBody.next = this.head.next
    newBody.next.last = newBody
    newBody.last = null
    this.head.remove() //把旧蛇头删除
    newBody.create()
    //  创建一个新的蛇头(碰撞点)
    var newHead = new Square(
      this.head.x / sw + this.direction.x,
      this.head.y / sh + this.direction.y,
      'snakeHead'
    )

    // 更新链表关系
    newHead.next = newBody
    newHead.last = null
    newBody.last = newHead
    newHead.viewContent.style.transform =
      'rotate(' + this.direction.rotate + 'deg)'
    newHead.create()

    //蛇身上的每一个方块的坐标也要更新
    this.pos.splice(0, 0, [
      this.head.x / sw + this.direction.x,
      this.head.y / sh + this.direction.y,
    ])
    this.head = newHead //还原this.head的信息更新一下

    if (!format) {
      //如果format的值为false，表示需要删除(除了吃之外的操作)
      this.tail.remove()
      this.tail = this.tail.last
      this.pos.pop()
    }
  },
  eat: function () {
    this.strategies.move.call(this, true)
    createFood()
    game.score++
  },
  die: function () {
    console.log('die')
    game.over()
  },
}

snake = new Snake()

//创建食物
function createFood() {
  //食物小方块的坐标
  var x = null
  var y = null

  var include = true //循环跳出的条件，true表示食物的坐标在蛇身上(需要继续循环),false表示食物的坐标不再蛇身上
  while (include) {
    x = Math.round(Math.random() * (td - 1))
    y = Math.round(Math.random() * (tr - 1))
    snake.pos.forEach(function (value) {
      if (x != value[0] && y != value[1]) {
        //这个条件成立说明随机出来的这个坐标，在蛇身上并没有找到
        include = false
      }
    })
  }
  //  生成食物
  food = new Square(x, y, 'food')
  food.pos = [x, y] //存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比
  var foodDom = document.querySelector('.food')
  if (foodDom) {
    foodDom.style.left = x * sw + 'px'
    foodDom.style.top = y * sh + 'px'
  } else {
    food.create()
  }
}

//创建游戏逻辑
function Game() {
  this.timer = null
  this.score = 0
}
Game.prototype.init = function () {
  snake.init()
  // snake.getNextPos()
  createFood()
  document.onkeydown = function (ev) {
    if (ev.which == 37 && snake.direction != snake.directionNum.right) {
      //用户按下左键的时候，这条蛇不能是正往右走
      snake.direction = snake.directionNum.left
    } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
      snake.direction = snake.directionNum.up
    } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
      snake.direction = snake.directionNum.right
    } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
      snake.direction = snake.directionNum.down
    }
  }
  this.start()
}

Game.prototype.start = function () {
  //开始游戏
  this.timer = setInterval(function () {
    snake.getNextPos()
  }, 200)
}
Game.prototype.pause = function () {
  // 暂停游戏
  clearInterval(this.timer)
}

Game.prototype.over = function () {
  //结束游戏
  clearInterval(this.timer)
  alert('你的得分是：' + this.score + '\n' + '分数达到20送额外惊喜一份')
  if (this.score >= 20) {
    var img = document.body
    img.innerText =
      '求你，不要减肥，更不要离开我。你难道不知道吗，我从来都没有嫌你胖，甚至祈求你越胖越好。\n我喜欢你胖胖的样子，不，是爱，发自肺腑的爱。可是，最近你是怎么了呢？你怎么瘦了？钱包，你醒醒啊！'
  } else {
    //游戏回到最初始的状态
    var snakewrap = document.querySelector('#snakeWrap')
    snakewrap.innerHTML = ''
    snake = new Snake()
    game = new Game()
    var startBtnWrap = document.querySelector('.startBtn')
    startBtnWrap.style.display = 'block'
  }
}

//开启游戏
game = new Game()
var startBtn = document.querySelector('.startBtn button')
startBtn.onclick = function () {
  startBtn.parentNode.style.display = 'none'
  game.init()
}

//暂停
var snakeWrap = document.querySelector('#snakeWrap')
var pauseBtn = document.querySelector('.pauseBtn button')
snakeWrap.onclick = function () {
  game.pause()
  pauseBtn.parentNode.style.display = 'block'
}
pauseBtn.onclick = function () {
  game.start()
  pauseBtn.parentNode.style.display = 'none'
}
