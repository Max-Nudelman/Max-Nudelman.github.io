/* ============================================================
   Hospital prices — interactive figures. Vanilla JS + SVG.
   ============================================================ */
(function () {
  var el = document.getElementById('hosp-data'); if (!el) return;
  var D = JSON.parse(el.textContent);
  var C = { acc:'#5EE6A8', warn:'#F5A524', text:'#E8EAED', muted:'#A0A8B4',
            dim:'#6C7684', line:'#262C35' };
  var NS='http://www.w3.org/2000/svg';
  function s(t,a){var n=document.createElementNS(NS,t);for(var k in a)n.setAttribute(k,a[k]);return n;}
  function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
  function usd(v){ return v>=1000 ? '$'+Math.round(v/1000)+'k' : '$'+Math.round(v); }

  /* --- 1. PROCEDURE EXPLORER ------------------------------------------- */
  (function(){
    var host=document.getElementById('hosp-procedure'); if(!host) return;
    var W=880,H=210,ML=30,MR=30,MT=42,MB=44;
    var box=s('svg',{viewBox:'0 0 '+W+' '+H,class:'vnl-svg',role:'img',
      'aria-label':'Range of billed and paid amounts for the selected procedure'});
    host.querySelector('.vnl-plot').appendChild(box);

    function draw(i){
      clear(box);
      var d=D.drgs[i], max=d.chg[4]*1.05;
      var x=function(v){return ML+v/max*(W-ML-MR);};
      // axis
      var step=Math.pow(10,Math.floor(Math.log10(max)));
      if(max/step>5) step*=2;
      for(var v=0; v<=max; v+=step){
        box.appendChild(s('line',{x1:x(v),x2:x(v),y1:MT-14,y2:H-MB,stroke:C.line}));
        var l=s('text',{x:x(v),y:H-MB+18,fill:C.dim,'font-size':11,'text-anchor':'middle'});
        l.textContent=usd(v); box.appendChild(l);
      }
      [['chg',C.warn,'Billed',MT+10],['pay',C.acc,'Paid',MT+62]].forEach(function(cfg){
        var q=d[cfg[0]], y=cfg[3];
        // p5 to p95 whisker, p25 to p75 box, p50 tick
        box.appendChild(s('line',{x1:x(q[0]),x2:x(q[4]),y1:y,y2:y,stroke:cfg[1],'stroke-width':2,opacity:.45}));
        box.appendChild(s('rect',{x:x(q[1]),y:y-13,width:Math.max(1,x(q[3])-x(q[1])),height:26,rx:4,
          fill:cfg[1],opacity:.30}));
        box.appendChild(s('line',{x1:x(q[2]),x2:x(q[2]),y1:y-15,y2:y+15,stroke:cfg[1],'stroke-width':3}));
        var lab=s('text',{x:ML,y:y-22,fill:cfg[1],'font-size':11.5,'font-weight':'600'});
        lab.textContent=cfg[2]+'  median '+usd(q[2])+'   middle half '+usd(q[1])+' to '+usd(q[3]);
        box.appendChild(lab);
      });
      host.querySelector('[data-k=hosp]').textContent=d.hospitals.toLocaleString();
      host.querySelector('[data-k=spread]').textContent=(d.chg[4]/d.chg[0]).toFixed(1)+'x';
      host.querySelector('[data-k=payspread]').textContent=(d.pay[4]/d.pay[0]).toFixed(1)+'x';
      host.querySelector('[data-k=r]').textContent=d.r.toFixed(2);
    }
    var sel=host.querySelector('select');
    D.drgs.forEach(function(d,i){
      var o=document.createElement('option'); o.value=i;
      // source text is ALL CAPS, so lowercase first and then title-case, or the
      // replace is a no-op and the dropdown shouts at the reader.
      o.textContent=d.drg_desc.toLowerCase()
        .replace(/\b\w/g,function(c){return c.toUpperCase();})
        .replace(/\bMcc\b/g,'MCC').replace(/\bCc\b/g,'CC').replace(/\bMv\b/g,'MV')
        .slice(0,60);
      sel.appendChild(o);
    });
    sel.addEventListener('change',function(){draw(+sel.value);});
    draw(0);
  })();

  /* --- 2. THE DECOMPOSITION, MADE VISIBLE ------------------------------ */
  (function(){
    var host=document.getElementById('hosp-decomp'); if(!host) return;
    var W=880,ML=210,MR=44,MT=16,RH=20;
    var mode='by_hospital';
    var box=s('svg',{viewBox:'0 0 '+W+' '+(MT+28*RH+38),class:'vnl-svg',role:'img',
      'aria-label':'Markup ranges grouped by hospital and by procedure'});
    host.querySelector('.vnl-plot').appendChild(box);
    var H=MT+28*RH+38;
    var x=function(v){return ML+Math.min(v,20)/20*(W-ML-MR);};

    function draw(){
      clear(box);
      var rows=D[mode], colour = mode==='by_hospital' ? C.warn : C.acc;
      [0,5,10,15,20].forEach(function(t){
        box.appendChild(s('line',{x1:x(t),x2:x(t),y1:MT-6,y2:H-30,stroke:C.line}));
        var l=s('text',{x:x(t),y:H-12,fill:C.dim,'font-size':11,'text-anchor':'middle'});
        l.textContent=t+'x'; box.appendChild(l);
      });
      rows.forEach(function(r,i){
        var y=MT+i*RH+10, q=r.q;
        var lab=s('text',{x:ML-10,y:y+4,fill:C.muted,'font-size':10.5,'text-anchor':'end'});
        lab.textContent=r.label; box.appendChild(lab);
        box.appendChild(s('line',{x1:x(q[0]),x2:x(q[4]),y1:y,y2:y,stroke:colour,'stroke-width':1.6,opacity:.4}));
        box.appendChild(s('rect',{x:x(q[1]),y:y-6,width:Math.max(1.5,x(q[3])-x(q[1])),height:12,rx:2.5,
          fill:colour,opacity:.55}));
        box.appendChild(s('circle',{cx:x(q[2]),cy:y,r:3,fill:colour}));
      });
    }
    host.querySelectorAll('button[data-mode]').forEach(function(b){
      b.addEventListener('click',function(){
        mode=b.dataset.mode;
        host.querySelectorAll('button[data-mode]').forEach(function(o){o.classList.toggle('on',o===b);});
        host.querySelector('[data-k=note]').textContent = mode==='by_hospital'
          ? 'Grouped by hospital, each band is narrow and they sit at clearly different heights. A hospital applies roughly one multiplier to everything it does. This is where '+D.stats.r2_hosp+'% of the variation lives.'
          : 'Grouped by procedure, the bands are wide and stacked on top of each other. Knowing which procedure you had barely narrows down the markup at all. This accounts for '+D.stats.r2_drg+'%.';
        draw();
      });
    });
    host.querySelector('[data-k=note]').textContent =
      'Grouped by hospital, each band is narrow and they sit at clearly different heights. A hospital applies roughly one multiplier to everything it does. This is where '+D.stats.r2_hosp+'% of the variation lives.';
    draw();
  })();
})();
