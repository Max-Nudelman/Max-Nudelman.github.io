/* ============================================================
   Carbon accounting — interactive figures
   Vanilla JS + SVG. Data embedded in the page.
   ============================================================ */
(function () {
  var el = document.getElementById('carbon-data'); if (!el) return;
  var D = JSON.parse(el.textContent);
  var C = { acc:'#5EE6A8', warn:'#F5A524', text:'#E8EAED', muted:'#A0A8B4',
            dim:'#6C7684', line:'#262C35' };
  var NS='http://www.w3.org/2000/svg';
  function s(t,a){var n=document.createElementNS(NS,t);for(var k in a)n.setAttribute(k,a[k]);return n;}
  function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
  var byIso={}; D.series.forEach(function(x){byIso[x.iso]=x;});
  var meta={};  D.summary.forEach(function(x){meta[x.iso]=x;});

  /* --- 1. COUNTRY EXPLORER --------------------------------------------- */
  (function(){
    var host=document.getElementById('carbon-country'); if(!host) return;
    var W=880,H=330,ML=62,MR=118,MT=20,MB=42;
    var box=s('svg',{viewBox:'0 0 '+W+' '+H,class:'vnl-svg',role:'img',
      'aria-label':'Territorial and consumption emissions over time for the selected country'});
    host.querySelector('.vnl-plot').appendChild(box);

    function draw(iso){
      clear(box);
      var d=byIso[iso], m=meta[iso];
      var n=d.t.length, yrs=d.t.map(function(_,i){return d.y0+i;});
      var max=Math.max.apply(null,d.t.concat(d.c))*1.12;
      var x=function(i){return ML+i/(n-1)*(W-ML-MR);};
      var y=function(v){return H-MB-v/max*(H-MT-MB);};
      // gridlines
      var step=Math.pow(10,Math.floor(Math.log10(max)))*(max/Math.pow(10,Math.floor(Math.log10(max)))>5?2:1);
      for(var v=0; v<=max; v+=step/2){
        box.appendChild(s('line',{x1:ML,x2:W-MR,y1:y(v),y2:y(v),stroke:C.line}));
        var l=s('text',{x:ML-8,y:y(v)+4,fill:C.dim,'font-size':11,'text-anchor':'end'});
        l.textContent=Math.round(v).toLocaleString(); box.appendChild(l);
      }
      [0,Math.floor((n-1)/2),n-1].forEach(function(i){
        var l=s('text',{x:x(i),y:H-MB+18,fill:C.dim,'font-size':11,'text-anchor':'middle'});
        l.textContent=yrs[i]; box.appendChild(l);
      });
      // the gap between the two lines is the story, so fill it
      var area=d.t.map(function(v,i){return (i?'L':'M')+x(i)+' '+y(v);}).join(' ')+
        ' '+d.c.slice().reverse().map(function(v,i){return 'L'+x(n-1-i)+' '+y(v);}).join(' ')+' Z';
      box.appendChild(s('path',{d:area,fill:C.warn,opacity:.12}));
      [['t',C.acc,'Territorial'],['c',C.warn,'Consumption']].forEach(function(cfg){
        var arr=d[cfg[0]];
        box.appendChild(s('path',{d:arr.map(function(v,i){return (i?'L':'M')+x(i)+' '+y(v);}).join(' '),
          fill:'none',stroke:cfg[1],'stroke-width':2.2}));
        var lab=s('text',{x:x(n-1)+10,y:y(arr[n-1])+4,fill:cfg[1],'font-size':12});
        lab.textContent=cfg[2]; box.appendChild(lab);
      });
      // readout
      var pct=function(v){return (v>=0?'+':'')+Math.round(v*100)+'%';};
      host.querySelector('[data-k=terr]').textContent=pct(m.pct_t);
      host.querySelector('[data-k=cons]').textContent=pct(m.pct_c);
      host.querySelector('[data-k=gapmt]').textContent=Math.round(Math.abs(m.unmatched_mt)).toLocaleString()+' Mt';
      var note=host.querySelector('[data-k=note]');
      if(!m.cut){
        note.textContent=m.country+' did not cut its territorial emissions over this period, so there is no reported reduction to test.';
      } else if(m.pct_c > 0){
        note.textContent=m.country+' reports cutting emissions '+pct(m.pct_t)+', but the emissions caused by what it consumes ROSE '+pct(m.pct_c)+'.';
      } else if(m.pct_c > m.pct_t){
        note.textContent=m.country+' reports '+pct(m.pct_t)+'. Measured by what its consumption causes, the fall is '+pct(m.pct_c)+'. The difference is '+Math.round(Math.abs(m.unmatched_mt)).toLocaleString()+' Mt that moved rather than went away.';
      } else {
        note.textContent=m.country+' is one of the few where the consumption measure fell by MORE than the reported cut. Its reduction understates the progress rather than overstating it.';
      }
    }
    var sel=host.querySelector('select');
    D.summary.slice().sort(function(a,b){return a.country<b.country?-1:1;}).forEach(function(m){
      var o=document.createElement('option'); o.value=m.iso; o.textContent=m.country; sel.appendChild(o);
    });
    sel.value='GBR'; sel.addEventListener('change',function(){draw(sel.value);});
    draw('GBR');
  })();

  /* --- 2. THE WORLD TOTAL ---------------------------------------------- */
  (function(){
    var host=document.getElementById('carbon-world'); if(!host) return;
    var W=880,H=280,ML=64,MR=110,MT=18,MB=40, d=D.world;
    var box=s('svg',{viewBox:'0 0 '+W+' '+H,class:'vnl-svg',role:'img',
      'aria-label':'Global territorial and consumption emissions, which track each other almost exactly'});
    host.querySelector('.vnl-plot').appendChild(box);
    var max=Math.max.apply(null,d.map(function(r){return Math.max(r.t,r.c);}))*1.1;
    var x=function(i){return ML+i/(d.length-1)*(W-ML-MR);};
    var y=function(v){return H-MB-v/max*(H-MT-MB);};
    [0,10000,20000,30000].forEach(function(v){
      box.appendChild(s('line',{x1:ML,x2:W-MR,y1:y(v),y2:y(v),stroke:C.line}));
      var l=s('text',{x:ML-8,y:y(v)+4,fill:C.dim,'font-size':11,'text-anchor':'end'});
      l.textContent=v.toLocaleString(); box.appendChild(l);
    });
    [0,Math.floor(d.length/2),d.length-1].forEach(function(i){
      var l=s('text',{x:x(i),y:H-MB+18,fill:C.dim,'font-size':11,'text-anchor':'middle'});
      l.textContent=d[i].year; box.appendChild(l);
    });
    [['t',C.acc,'Territorial',0],['c',C.warn,'Consumption',16]].forEach(function(cfg){
      box.appendChild(s('path',{d:d.map(function(r,i){return (i?'L':'M')+x(i)+' '+y(r[cfg[0]]);}).join(' '),
        fill:'none',stroke:cfg[1],'stroke-width':cfg[0]==='t'?3:1.6,
        'stroke-dasharray':cfg[0]==='c'?'4 4':''}));
      var lab=s('text',{x:x(d.length-1)+10,y:y(d[d.length-1][cfg[0]])+4+cfg[3],fill:cfg[1],'font-size':12});
      lab.textContent=cfg[2]; box.appendChild(lab);
    });
    var last=d[d.length-1];
    host.querySelector('[data-k=diff]').textContent=
      ((last.c-last.t)/last.t*100).toFixed(2)+'%';
  })();
})();
