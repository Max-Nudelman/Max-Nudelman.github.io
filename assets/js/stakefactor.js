/* ============================================================
   Stake Factor — interactive figures. Vanilla JS + SVG.
   ============================================================ */
(function(){
  var el=document.getElementById('sf-data'); if(!el) return;
  var D=JSON.parse(el.textContent);
  var C={acc:'#5EE6A8',warn:'#F5A524',text:'#E8EAED',muted:'#A0A8B4',dim:'#6C7684',line:'#262C35'};
  var NS='http://www.w3.org/2000/svg';
  function s(t,a){var n=document.createElementNS(NS,t);for(var k in a)n.setAttribute(k,a[k]);return n;}
  function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}
  function money(v){var a=Math.abs(v); return (v<0?'-':'+')+'£'+(a>=1000?(a/1000).toFixed(0)+'k':a.toFixed(0));}

  /* --- 1. DETECTION CURVE ---------------------------------------------- */
  (function(){
    var host=document.getElementById('sf-detect'); if(!host) return;
    var d=D.curve, W=880,H=320,ML=58,MR=140,MT=18,MB=46;
    var box=s('svg',{viewBox:'0 0 '+W+' '+H,class:'vnl-svg',role:'img',
      'aria-label':'Separation achieved by closing line value versus realized profit, against number of settled bets'});
    host.querySelector('.vnl-plot').appendChild(box);
    var lx=function(k){return ML+(Math.log(k)-Math.log(5))/(Math.log(100)-Math.log(5))*(W-ML-MR);};
    var y=function(v){return H-MB-(v-.45)/(.56)*(H-MT-MB);};
    [.5,.6,.7,.8,.9,1].forEach(function(v){
      box.appendChild(s('line',{x1:ML,x2:W-MR,y1:y(v),y2:y(v),stroke:v===.5?'#4A5462':C.line,
        'stroke-dasharray':v===.5?'4 4':''}));
      var l=s('text',{x:ML-8,y:y(v)+4,fill:C.dim,'font-size':11,'text-anchor':'end'});
      l.textContent=v.toFixed(1); box.appendChild(l);
    });
    [5,10,20,30,50,100].forEach(function(k){
      var l=s('text',{x:lx(k),y:H-MB+18,fill:C.dim,'font-size':11,'text-anchor':'middle'});
      l.textContent=k; box.appendChild(l);
    });
    var ax=s('text',{x:(ML+W-MR)/2,y:H-10,fill:C.muted,'font-size':12,'text-anchor':'middle'});
    ax.textContent='Settled bets observed'; box.appendChild(ax);
    var cf=s('text',{x:ML+8,y:y(.5)-7,fill:C.dim,'font-size':10.5}); cf.textContent='coin flip'; box.appendChild(cf);
    [['auc_clv',C.acc,'Closing line value'],['auc_roi',C.warn,'Realized profit and loss']].forEach(function(cfg){
      var pts=d.filter(function(r){return r[cfg[0]]!=null && r.k<=100;});
      box.appendChild(s('path',{d:pts.map(function(r,i){return (i?'L':'M')+lx(r.k)+' '+y(r[cfg[0]]);}).join(' '),
        fill:'none',stroke:cfg[1],'stroke-width':2.4}));
      pts.forEach(function(r){
        var c=s('circle',{cx:lx(r.k),cy:y(r[cfg[0]]),r:4,fill:cfg[1]});
        var t=s('title'); t.textContent=r.k+' bets: AUC '+r[cfg[0]].toFixed(3); c.appendChild(t);
        box.appendChild(c);
      });
      var last=pts[pts.length-1];
      var lab=s('text',{x:lx(last.k)+10,y:y(last[cfg[0]])+4,fill:cfg[1],'font-size':11.5});
      lab.textContent=cfg[2]; box.appendChild(lab);
    });
  })();

  /* --- 2. POLICY DIAL --------------------------------------------------- */
  (function(){
    var host=document.getElementById('sf-policy'); if(!host) return;
    // Sorted from the least aggressive policy to the most, so that dragging the
    // slider to the right means restricting MORE people, which is what the label
    // says. Sorting the other way made the control read backwards.
    var pol=D.policy.slice().sort(function(a,b){return b.threshold-a.threshold;});
    var W=880,H=300,ML=70,MR=30,MT=20,MB=48;
    var box=s('svg',{viewBox:'0 0 '+W+' '+H,class:'vnl-svg',role:'img',
      'aria-label':'Change in book profit against share of accounts restricted'});
    host.querySelector('.vnl-plot').appendChild(box);
    var xs=pol.map(function(p){return (1-p.threshold)*100;});
    var lo=Math.min.apply(null,pol.map(function(p){return p.gain;}))*1.12, hi=45000;
    var x=function(v){return ML+v/Math.max.apply(null,xs)*(W-ML-MR);};
    var y=function(v){return H-MB-(v-lo)/(hi-lo)*(H-MT-MB);};

    function draw(sel){
      clear(box);
      [-200000,-150000,-100000,-50000,0].forEach(function(v){
        if(v<lo) return;
        box.appendChild(s('line',{x1:ML,x2:W-MR,y1:y(v),y2:y(v),stroke:v===0?'#4A5462':C.line}));
        var l=s('text',{x:ML-8,y:y(v)+4,fill:C.dim,'font-size':11,'text-anchor':'end'});
        l.textContent=(v/1000)+'k'; box.appendChild(l);
      });
      var path=pol.map(function(p,i){return (i?'L':'M')+x(xs[i])+' '+y(p.gain);}).join(' ');
      box.appendChild(s('path',{d:path+' L'+x(xs[xs.length-1])+' '+y(0)+' L'+x(xs[0])+' '+y(0)+' Z',
        fill:C.warn,opacity:.12}));
      box.appendChild(s('path',{d:path,fill:'none',stroke:C.acc,'stroke-width':2.6}));
      pol.forEach(function(p,i){
        var on = i===sel;
        box.appendChild(s('circle',{cx:x(xs[i]),cy:y(p.gain),r:on?7:4.5,
          fill:p.gain>=0?C.acc:C.warn,stroke:on?C.text:'none','stroke-width':on?2:0,
          style:'cursor:pointer'}));
      });
      var l=s('text',{x:(ML+W-MR)/2,y:H-12,fill:C.muted,'font-size':12,'text-anchor':'middle'});
      l.textContent='Share of accounts restricted'; box.appendChild(l);
      var p=pol[sel];
      host.querySelector('[data-k=cut]').textContent=p.restricted;
      host.querySelector('[data-k=caught]').textContent=p.caught+' of 86';
      host.querySelector('[data-k=wrong]').textContent=p.wrongly_cut;
      host.querySelector('[data-k=gain]').textContent=money(p.gain);
      host.querySelector('[data-k=gain]').style.color = p.gain>=0 ? C.acc : C.warn;
      host.querySelector('[data-k=note]').textContent = p.gain>=0
        ? 'Restricting the top '+((1-p.threshold)*100).toFixed(0)+'% catches '+p.caught+' of the 86 adverse accounts and leaves the book '+money(p.gain)+' better off.'
        : 'Restricting the top '+((1-p.threshold)*100).toFixed(0)+'% catches every adverse account, and still leaves the book '+money(p.gain)+' worse off, because '+p.wrongly_cut+' profitable customers were cut with them.';
    }
    var input=host.querySelector('input[type=range]');
    input.max=pol.length-1; input.value=0;
    input.addEventListener('input',function(){draw(+input.value);});
    draw(0);
  })();
})();
