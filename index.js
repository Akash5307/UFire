//importing sound effects
const backgroundMusic=new Audio("./music/backgroundMusic.mp3");
const introMusic=new Audio("./music/introSo.mp3");
const shootingSound=new Audio("./music/shooting.wav");
const killEnemySound=new Audio("./music/killEnemy.mp3");
const gameOverSound=new Audio("./music/gameOver.wav");
const heavyWeaponSound=new Audio("./music/heavyWeapon.wav");
const hugeWeaponSound=new Audio("./music/hugeWeapon.wav");

//-----------------
const canvas=document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width=innerWidth;
canvas.height=innerHeight;
const context=canvas.getContext("2d");
const lightWeaponDamage=10;
const heavyWeaponDamage=20;
const hugeWeaponDamage=50;
let score=0;


introMusic.play();
let difficulty=2;
const form=document.querySelector("form");
const scoreBoard=document.querySelector(".scoreBoard");

//event listener for difficulty form
document.querySelector("input").addEventListener("click",(e)=>{
    e.preventDefault();//form submit  karne se reload nhi hoga
    introMusic.pause();

    form.style.display="none";
    scoreBoard.style.display="block";
    const userValue=document.getElementById("difficulty").value;
    if(userValue==="easy"){
        setInterval(spawnEnemy,1500);
        return difficulty=3;
    }
    else if(userValue==="medium"){
        setInterval(spawnEnemy,1200);
        return difficulty=5;
    }
    else if(userValue==="hard"){
        setInterval(spawnEnemy,800);
        return difficulty=8;
    }
});
//---------creating EndScreen------------
const gameOver=()=>{
    const gameOverBanner=document.createElement("div");
    const gameOverBtn=document.createElement("button");
    const highScore=document.createElement("div");

    highScore.innerHTML=`Your Score: ${score}`;
    gameOverBtn.innerText="Play Again";

    gameOverBanner.appendChild(highScore);

    gameOverBanner.appendChild(gameOverBtn);

    gameOverBtn.onclick=()=>{
        window.location.reload();
    };

    gameOverBanner.classList.add("gameover");

    document.querySelector("body").appendChild(gameOverBanner);
};



//-------creating Player, Enemy, Weapon classes
// setting player position to Center
playerPosition={
    x:canvas.width/2,
    y:canvas.height/2,
}

class Player{
    constructor(x,y,rad,color){
        this.x=x;
        this.y=y;
        this.rad=rad;
        this.color=color;
    }
    draw(){
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.rad,
            (Math.PI/180)*0,
            (Math.PI/180)*360,
            false
        );
        context.fillStyle=this.color;
        context.fill();
    }
}

//----------
class Weapon{
    constructor(x,y,rad,color,velocity,damage){
        this.x=x;
        this.y=y;
        this.rad=rad;
        this.color=color;
        this.velocity=velocity;
        this.damage=damage;
    }
    draw(){
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.rad,
            (Math.PI/180)*0,
            (Math.PI/180)*360,
            false
        );
        context.fillStyle=this.color;
        context.fill();
    }
    update(){
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
    }
}
//-------special weapon---------
class HugeWeapon{
    constructor(x,y,damage){
        this.x=x;
        this.y=y;
        this.color="red";
        this.damage=damage;
    }
    draw(){
        context.beginPath();
        context.fillStyle=this.color;
        context.fillRect(this.x,this.y,50,canvas.height);
    }
    update(){
        this.draw();
        this.x+=20;
    }
}
//---------------------
class Enemy{
    constructor(x,y,rad,color,velocity){
        this.x=x;
        this.y=y;
        this.rad=rad;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.rad,
            (Math.PI/180)*0,
            (Math.PI/180)*360,
            false
        );
        context.fillStyle=this.color;
        context.fill();
    }
    update(){
        this.draw();
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
    }
}
//------------------
class Particle{
    constructor(x,y,rad,color,velocity){
        this.x=x;
        this.y=y;
        this.rad=rad;
        this.color=color;
        this.velocity=velocity;
        this.alpha=1;
    }
    draw(){
        context.save();
        context.globalAlpha=this.alpha;
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.rad,
            (Math.PI/180)*0,
            (Math.PI/180)*360,
            false
        );
        context.fillStyle=this.color;
        context.fill();
        context.restore();
    }
    update(){
        this.draw();
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
        this.alpha-=0.01;
    }
}
//---------- Main login Starts here --------------
//creating object of Player
const me=new Player(
    playerPosition.x,
    playerPosition.y,
    15,
    "white"
    // `rgb(${Math.random()*250},${Math.random()*250},${Math.random()*250})`
);

const weapons=[];
const enemies=[];
const particles=[];
const hugeWeapons=[];
//---------Function to spawn enemy at random location-----------
const spawnEnemy=()=>{
    const enemySize=Math.random()*(40-5)+5;
    const enemyColor=`hsl(${Math.floor(Math.random()*360)},100%,50%)`;
    let random;
    //random is enemy spawn position

    //making enemy spawn location random but outside of screen
    if(Math.random()<0.5){
        //making x to very left or very right of screen and setting y to anywhere vertically
        random={
            x:Math.random()<0.5?canvas.width+enemySize:0-enemySize,
            y:Math.random()*canvas.height,
        };
    }else{
        //making y to very up or very down of screen and setting x to anywhere horizontally
        random={
        x:Math.random()*canvas.width,
        y:Math.random()<0.5?canvas.height+enemySize:0-enemySize,
        };
    }
    //angle bw center and enemy position
    const alpha=Math.atan2(canvas.height/2-random.y,canvas.width/2-random.x);
    const velocity={
        x:Math.cos(alpha)*difficulty,
        y:Math.sin(alpha)*difficulty,
    }

    enemies.push(new Enemy(random.x,random.y,enemySize,enemyColor,velocity));
}
//--------creating animation Function----------
let animationId;
function animation(){
    //recursion
    animationId=requestAnimationFrame(animation);
    //clearing canvas on each frame
    context.fillStyle="rgba(49,49,49,0.25)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    me.draw();

    //generating particles
    particles.forEach((particle,index)=>{
        if(particle.alpha<=0){
            particles.splice(index,1);
        }else{
            particle.update();
        }
    });

    //generating hugeWeapon
    hugeWeapons.forEach((hugeWeapon,index)=>{
        if(hugeWeapon.x>canvas.width){
            hugeWeapons.splice(index,1);
        }else{
            hugeWeapon.update();
        }
    });


    //generating bullets
    weapons.forEach((weapon,index)=>{
        weapon.draw();
        weapon.update();
        if(weapon.x+weapon.rad<1 || 
            weapon.y+weapon.rad<1 ||
            weapon.x-weapon.rad>canvas.width||
            weapon.y-weapon.rad>canvas.height
            ){
            weapons.splice(index,1);
        }
    });
    //generating enemies
    enemies.forEach((enemy,enemyIndex)=>{
        enemy.update();
        const distBetweenPlayerAndEnemy= Math.hypot(
            me.x-enemy.x,
            me.y-enemy.y
        );
        if(distBetweenPlayerAndEnemy-me.rad-enemy.rad<1){
            cancelAnimationFrame(animationId );
            gameOverSound.play();
            hugeWeaponSound.pause();
            shootingSound.pause();
            heavyWeaponSound.pause();
            killEnemySound.pause();
            return gameOver();
        }

        hugeWeapons.forEach((hugeWeapon,index)=>{
            const distBetweenHugeWeaponAndEnemy=hugeWeapon.x-enemy.x;
            console.log(distBetweenHugeWeaponAndEnemy);
            if(distBetweenHugeWeaponAndEnemy<=50 && 
                distBetweenHugeWeaponAndEnemy>=-50
                ){
                    score+=10;
                    setTimeout(()=>{
                        enemies.splice(enemyIndex,1);
                        heavyWeaponSound.play();
                    },0);
            }
        });

        weapons.forEach((weapon,weaponIndex)=>{
            const distBetweenWeaponAndEnemy= Math.hypot(
                weapon.x-enemy.x,
                weapon.y-enemy.y
            );
            if(distBetweenWeaponAndEnemy-weapon.rad-enemy.rad<1){
                // console.log("Finish"); 

                if(enemy.rad>weapon.damage+5){
                    enemy.rad=enemy.rad-weapon.damage;
                    setTimeout(()=>{
                        weapons.splice(weaponIndex,1);
                    },0);
                }else {
                    for(let i=0;i<enemy.rad*3;i++){
                        particles.push(new Particle(weapon.x,weapon.y,Math.random()*2,enemy.color,{
                            x:(Math.random()-0.5)*Math.random()*7,
                            y:(Math.random()-0.5)*Math.random()*7,
                        })
                        );
                    }
                    score+=10;
                    //rendering player score
                    scoreBoard.innerHTML=`Score: ${score}`;
                    // console.log(score);
                    setTimeout(()=>{
                        enemies.splice(enemyIndex,1);
                        killEnemySound.play();
                        weapons.splice(weaponIndex,1);
                    },0);
                }
            }
        });
    });
}
//-----------end of Animation Function------------
//------Adding event Listeners--------
//event listener for light weapon
canvas.addEventListener("click",(e)=>{
    const alpha=Math.atan2(e.clientY-canvas.height/2,e.clientX-canvas.width/2);
    // console.log(alpha);
    shootingSound.playbackRate=10;
    shootingSound.play();
    const velocity={
        x:Math.cos(alpha)*6,
        y:Math.sin(alpha)*6,
    }
    weapons.push(new Weapon(canvas.width/2,canvas.height/2,6,"white",velocity,lightWeaponDamage));
});
//for heavy weapon on right click
canvas.addEventListener("contextmenu",(e)=>{
    e.preventDefault();
    if(score<2)return;
    heavyWeaponSound.playbackRate=5;
    heavyWeaponSound.play();

    score-=2;
    scoreBoard.innerHTML=`Score: ${score}`;
    const alpha=Math.atan2(e.clientY-canvas.height/2,e.clientX-canvas.width/2);
    console.log(alpha);
    const velocity={
        x:Math.cos(alpha)*4,
        y:Math.sin(alpha)*4,
    }
    weapons.push(new Weapon(canvas.width/2,canvas.height/2,20,"cyan",velocity,heavyWeaponDamage));
});

addEventListener("keypress",(e)=>{
    if(e.key===" "){
        if(score<20)return;
        hugeWeaponSound.play();
        score-=20;
        scoreBoard.innerHTML=`Score: ${score}`;
        hugeWeapons.push(
            new HugeWeapon(
                0,
                0,
                hugeWeaponDamage));
    }
});

addEventListener("resize",()=>{
    window.location.reload();
})
backgroundMusic.volume = 0.3;
document.addEventListener("click", () => {
    backgroundMusic.play().catch((error) => {
        console.error("Background music playback failed:", error);
    });
});

animation();