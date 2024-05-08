
//postavljanje kaboom kanvasa
kaboom({
	global: true,
	fullscreen: true,
	scale: 2,
	debug: true,
	clearColor: [0, 5, 10,1],
})
// promenljive i konstante
	const MOVE_SPEED=120
	const JUMP_FORCE=460
	let CURRENT_JUMP_FORCE=JUMP_FORCE
	const BIG_JUMP_FORCE=550
	let isJumping=true
	const FALL_DEATH=400
	const ENEMY_SPEED=30
	let CURRENT_SPEED = ENEMY_SPEED
	let canDestroy=false
	const BULLET_SPEED=150
	let BULLET_NUMBER=0

//ucitavanje slicica
loadSprite('ground', "slike/ground.png")
loadSprite('coin', "slike/coin.png")
loadSprite('questionBox', "slike/questionBox")
loadSprite('emptyBox', "slike/emptyBox")
loadSprite('pipeTop', "slike/pipeTop")
loadSprite('pipeBottom', "slike/pipeBottom")
loadSprite('enemy', "slike/enemy")
loadSprite('bigMushy', "slike/bigMushy")
loadSprite('sMario', "slike/sMario.png")
loadSprite('wMario', "slike/wMario.png")
loadSprite('castle', "slike/castle.png")
loadSprite('brick', "slike/brick.png")
loadSprite('flower', "slike/flower.png")
loadSprite('cloud', "slike/cloud.png")


//kreiranje glavne scene u kojoj su nivoi
//dizajniranje nivoa
scene("game", ({level,score})=>{
//slojevi u sceni pozadina, objekti koji uticu na igru i broj poena
	layers(['bg','obj','ui'],'obj')
	
	const maps=[
	[
    "=                                                                                                ",
    "=                                                                                                ",
    "=                                                                                                ",
    "=                      ???                                                                       ",
    "=                                                                                                ",
    "=                                                                                                ",
    "=                                                                                                ",
    "=      -?-b-                                                                                     ",
    "=                                                    ?        ?                                  ",
    "=                                                                                                ",
    "=                                      _                 ?                             H         ",
    "=                                 _    |                                                         ",
    "=                           _     |    |                      _                                  ",
    "=       E                   |     |    |         E   E        |                                  ",
    "=================     ====================================   ==========   =======================",
  ],
	[
    "                                                                                             ",
    "                                                                                             ",
    "                                                                                             ",
    "                                       ?                                                     ",
    "                                                                                             ",
    "                                   -?-                                                       ",
    "                                                                                             ",
    "      -?-f-                  -?-                                                             ",
    "                                                                                             ",
    "                                                                                             ",
    "                                                                                  H          ",
    "                                                                                             ",
    "       _                                            _                                        ",
    "       |                    E       E               |        E    E                          ",
    "================     =====================================================   ================",
  ]
	]
	
	const levelCfg={
		width: 16,
		height: 16,
		'=': [sprite('ground'), solid()],
		'c': [sprite('coin'), 'coin'],
		'?': [sprite('questionBox'), solid(), 'questionBox','coin-surprise'],
		'b': [sprite('questionBox'), solid(), 'questionBox','mushroom-surprise'],
		'f': [sprite('questionBox'), solid(), 'questionBox','flower-surprise'],
		'!': [sprite('emptyBox'), solid()],
		'|': [sprite('pipeBottom'), solid(),'pb'],
		'_': [sprite('pipeTop'), solid()],
		'E': [sprite('enemy'),solid(), 'dangerous'],
		'M': [sprite('bigMushy'), 'mushroom', body()],
		'N': [sprite('flower'), 'flower', body()],
		'H': [sprite('castle'),'castle'],
		'-': [sprite('brick'), solid(),'brick'],
		
	}
	
	const gameLevel=addLevel(maps[level], levelCfg)

// broj poena
	const scoreLabel=add([
		text(score),
		pos(30,6),
		layer('ui'),
		{
			value: score,
		}
	])
//trenutni nivo
	add([text('level '+parseInt(level+1)),pos(50,6)])

//nesto u pozadinskom sloju reda radi
	add([
		sprite("cloud"),
		pos(200, 50),
		layer("bg")
	]);
	
// funkcija za povecavanje glavnog lika kada pojede pecurku	
	function big(){
		let timer=0
		let isBig=false
		return{
			update(){
				if(isBig){
					CURRENT_JUMP_FORCE=BIG_JUMP_FORCE
					timer-=dt()
					if(timer<=0){
						this.smallify()
					}
				}
			},
			isBig(){
				return isBig
			},
			smallify(){
				this.scale=vec2(1)
				CURRENT_JUMP_FORCE=JUMP_FORCE
				timer=0
				isBig=false
			},
			biggify(time){
				this.scale=vec2(1.7)
				timer=time
				isBig=true
			}
		}
	}
	
//dodavanje glavnog lika
	const player= add([
		sprite('sMario'),
		solid(),
		pos(30,50),
		body(),
		big(),
		origin('bot')
	])
	
//udarci glavom u kutije
	player.on("headbump", (obj)=>{
		if(obj.is("questionBox")){
			if(obj.is('coin-surprise')){
				let coin=gameLevel.spawn('c',obj.gridPos.sub(0,1))
				destroy(obj)
				gameLevel.spawn('!',obj.gridPos.sub(0,0))
				wait(0.5,()=>{destroy(coin)})
				scoreLabel.value++
				scoreLabel.text = scoreLabel.value
			}
			if(obj.is('mushroom-surprise')){
				gameLevel.spawn('M',obj.gridPos.sub(0,1))
				destroy(obj)
				gameLevel.spawn('!',obj.gridPos.sub(0,0))
			}
			if(obj.is('flower-surprise')){
				gameLevel.spawn('N',obj.gridPos.sub(0,1))
				destroy(obj)
				gameLevel.spawn('!',obj.gridPos.sub(0,0))
			}
		}
	})

//kretanje pecurke
	action('mushroom', (m)=>{
		m.move(20,0)
	})

//prilazak pecurki
	player.collides('mushroom', (m) => {
		destroy(m)
		player.biggify(6)
	})
		
//prilazak cvetu
	player.collides('flower', (f) => {
		destroy(f)
		BULLET_NUMBER=2
		player.changeSprite('wMario')
	})

//prilazak zamku	
	player.collides('castle', ()=>{
		keyPress('down', ()=>{
			if(level+1>=maps.length){
				go('lose',{score: scoreLabel.value})
			}
			else{
				go('game',{
					level:(level+1),
					score:scoreLabel.value			
				})
			}
		})
	})

//kretanje neprijatelja	
	action('dangerous', (d)=>{
		d.move(CURRENT_SPEED,0)
	})
		
	loop(3, () => {
		CURRENT_SPEED=-CURRENT_SPEED
	})
	
//prilazak neprijatelju	
	player.collides('dangerous', (d)=>{
		if(isJumping){
			destroy(d)
			scoreLabel.value++
			scoreLabel.text = scoreLabel.value
		}
		else{
			go('lose',{score: scoreLabel.value})
		}
	})
	
//dodavanje metka	
	function spawnBullet(p) {
		add([
			rect(6,3), 
			pos(p), 
			origin('center'), 
			color(0.9, 0.4, 0.2),
			'bullet'
		])
	}
	
//ispaljivanje metka	
	keyPress('c', () => {
		if(BULLET_NUMBER>0){
			spawnBullet(player.pos.add(15, -10))
			BULLET_NUMBER--
		}
		if(BULLET_NUMBER==0){
			player.changeSprite('sMario')
		}
	})
	
	action('bullet', (b) => {
		b.move(BULLET_SPEED, 0)
		wait(2,()=>{destroy(b)})
	})

//dodir metka i neprijatelja	
	collides('bullet', 'dangerous', (b,e) => {
		destroy(b)
		destroy(e)
		scoreLabel.value++
		scoreLabel.text = scoreLabel.value
	})

//pozicioniranje kamere
	player.action(()=>{
		camPos(player.pos.x,height()/2)
		if(player.pos.y>=FALL_DEATH){
			go('lose',{score: scoreLabel.value})
		}
	})
//kontrole za kretanje glavnog lika
	keyDown('left', ()=>{
		player.move(-MOVE_SPEED, 0)
	})
	keyDown('right', ()=>{
		player.move(MOVE_SPEED, 0)
	})
	
	player.action(() => {
		if(player.grounded()) {
			isJumping = false
		}
	})
	keyPress('space',()=>{
		if(player.grounded()){
			isJumping=true
			player.jump(CURRENT_JUMP_FORCE)
		}
	})

})

//scena za pocetak igre
scene("start", () => {

  add([
    text("Pritisni enter za pocetak igre", 22 ),
    pos(width()/2, height()/ 2),
    origin("center"),
    color(255, 255, 255),
	
  ])
	
	keyRelease("enter", () => {
    go("game", { level: 0, score: 0})
  })
  
})

//scena za kraj igre
	scene('lose', ({ score }) => {
		add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
		
		keyRelease("enter", () => {
			go("start")
		})
	})
	

start("start")