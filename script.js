var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};

// Nav gets a frosted background after scrolling
var nav=$("#nav");
addEventListener("scroll",function(){nav.classList.toggle("s",scrollY>20)},{passive:true});

// Fade-in on scroll
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.25});
$$(".rv").forEach(function(el){io.observe(el)});

// Feature list: the item in the middle of the screen lights up
var fo=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle("on",e.isIntersecting)})},{rootMargin:"-38% 0px -38% 0px"});
$$(".f").forEach(function(el){fo.observe(el)});

// Hero shield follows the mouse slightly
var art=$("#art");
if(art&&!matchMedia("(prefers-reduced-motion: reduce)").matches)
  addEventListener("pointermove",function(e){art.style.translate=(e.clientX/innerWidth-.5)*-14+"px "+(e.clientY/innerHeight-.5)*-14+"px"});

$("#y").textContent=new Date().getFullYear();
