import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js';
import { UI } from './UI.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 45;
            this.speed = 0;
            this.maxSpeed = 4; 
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.maxParticles = 50;
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false;
            this.score = 0;
            this.fontColor = 'brown';
            this.gameOver = false;
            this.lives  = 5;
            this.player.currentState = this.player.states[0]
            this.player.currentState.enter();
        }

        update(deltaTime) {
            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
            });
            // handle point messages
            this.floatingMessages.forEach(floatingMessage => {
                floatingMessage.update(deltaTime);
            });
            // handle particles
            this.particles.forEach((particle, idx) => {
                particle.update();
            });
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }
            // handle collision sprites
            this.collisions.forEach((collision, idx) => {
                collision.update(deltaTime);
            });

            this.enemies = this.enemies.filter(e => !e.markedForDeletion);
            this.particles = this.particles.filter(p => !p.markedForDeletion);
            this.collisions = this.collisions.filter(c => !c.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle => {
                particle.draw(context);
            });
            this.collisions.forEach(collision => {
                collision.draw(context);
            });
            this.floatingMessages.forEach(floatingMessage => {
                floatingMessage.draw(context);
            });
            this.UI.draw(context);
        }

        addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
            else if (this.speed > 0) {
                this.enemies.push(new ClimbingEnemy(this));
                this.enemies.push(new FlyingEnemy(this));
            }
        }

    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if (!game.gameOver) requestAnimationFrame(animate);
    }
    animate(0);

    function play() {
        game.speed = 4;
        document.getElementById('instruction').style.zIndex = "-1";
        document.getElementById('btns').style.display = "none";
        game.player.currentState = game.player.states[1];
        game.player.currentState.enter();
    }
    document.getElementById("play-btn").addEventListener("click", play);

    document.getElementById("play-btn-2").addEventListener("click", play);
    
    document.getElementById("help-btn").addEventListener("click", () => {
        document.getElementById('instruction').style.zIndex = "10";
        
    });

})
