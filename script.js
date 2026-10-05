var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};

// Nav gets a frosted background after scrolling
var nav=$("#nav");
addEventListener("scroll",function(){nav.classList.toggle("s",scrollY>20)},{passive:true});

// Fade-in on scroll
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.25});
$$(".rv").forEach(function(el){io.observe(el)});

// Twinkling stars: each one reappears in a new random spot around the shield
var box=$("#stars");
if(box){
  var star='<svg viewBox="0 0 24 24"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6Z"/></svg>';
  var place=function(el){
    var ang=Math.random()*Math.PI*2,r=30+Math.random()*24;
    el.style.left=(50+r*Math.cos(ang))+"%";el.style.top=(50+r*Math.sin(ang))+"%";
  };
  for(var i=0;i<6;i++){
    var s=document.createElement("span"),z=16+Math.random()*14;
    s.className="st";s.innerHTML=star;
    s.style.width=s.style.height=z+"px";s.style.marginLeft=s.style.marginTop=-z/2+"px";
    s.style.animationDuration=(3+Math.random()*2.5)+"s";
    s.style.animationDelay=(1.5+Math.random()*4)+"s";
    s.addEventListener("animationiteration",function(e){place(e.currentTarget)});
    place(s);box.appendChild(s);
  }
}

// Hero shield follows the mouse slightly
var art=$("#art");
if(art&&!matchMedia("(prefers-reduced-motion: reduce)").matches)
  addEventListener("pointermove",function(e){art.style.translate=(e.clientX/innerWidth-.5)*-14+"px "+(e.clientY/innerHeight-.5)*-14+"px"});

$("#y").textContent=new Date().getFullYear();
