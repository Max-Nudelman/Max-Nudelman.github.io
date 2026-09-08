/* ============================================================
   Home advantage — interactive figures
   Vanilla JS + SVG. Data embedded in the page.
   ============================================================ */
(function () {
  var el = document.getElementById('ha-data');
  if (!el) return;
  var D = JSON.parse(el.textContent);
  var C = { accent:'#5EE6A8', warn:'#F5A524', blue:'#7FB2F0', text:'#E8EAED',
            muted:'#A0A8B4', dim:'#6C7684', line:'#262C35' };
  var NS = 'http://www.w3.org/2000/svg';
  function s(t,a){var n=document.createElementNS(NS,t);for(var k in a)n.setAttribute(k,a[k]);return n;}
  function clear(n){while(n.firstChild)n.removeChild(n.firstChild);}

  /* --- 1. TIMELINE with an era brush ------------------------------------ */
  (function () {
    var host = document.getElementById('ha-timeline'); if (!host) return;
    var d = D.monthly, W=880,H=300,ML=52,MR=18,MT=18,MB=42;
    var box = s('svg',{viewBox:'0 0 '+W+' '+H,class:'vnl-svg',role:'img',
      'aria-label':'Home win rate by month across eleven European divisions'});
    host.querySelector('.vnl-plot').appendChild(box);
    var t0=new Date(d[0].mth+'-01').getTime(), t1=new Date(d[d.length-1].mth+'-01').getTime();
    var x=function(m){return ML+(new Date(m+'-01').getTime()-t0)/(t1-t0)*(W-ML-MR);};
    var y=function(v){return H-MB-(v-0.30)/(0.30)*(H-MT-MB);};
    var EMPTY0='2020-03', EMPTY1='2021-06';

    function draw(show){
      clear(box);
      if(show.empty){
        box.appendChild(s('rect',{x:x(EMPTY0),y:MT,width:x(EMPTY1)-x(EMPTY0),height:H-MB-MT,
          fill:C.warn,opacity:.10}));
        var lb=s('text',{x:(x(EMPTY0)+x(EMPTY1))/2,y:MT+16,fill:C.warn,'font-size':11,'text-anchor':'middle'});
        lb.textContent='empty stadiums'; box.appendChild(lb);
      }
      [0.35,0.40,0.45,0.50,0.55].forEach(function(v){
        box.appendChild(s('line',{x1:ML,x2:W-MR,y1:y(v),y2:y(v),stroke:C.line}));
        var l=s('text',{x:ML-8,y:y(v)+4,fill:C.dim,'font-size':11,'text-anchor':'end'});
        l.textContent=Math.round(v*100)+'%'; box.appendChild(l);
      });
      if(show.baseline){
        box.appendChild(s('line',{x1:ML,x2:W-MR,y1:y(0.461),y2:y(0.461),stroke:C.dim,'stroke-dasharray':'5 5'}));
        var b=s('text',{x:ML+6,y:y(0.461)-7,fill:C.dim,'font-size':11});
        b.textContent='pre-COVID average, 46.1%'; box.appendChild(b);
      }
      ['2017','2019','2021','2023','2025'].forEach(function(yr){
        var l=s('text',{x:x(yr+'-01'),y:H-MB+18,fill:C.dim,'font-size':11,'text-anchor':'middle'});
        l.textContent=yr; box.appendChild(l);
      });
      var path=d.map(function(p,i){return (i?'L':'M')+x(p.mth)+' '+y(p.hw);}).join(' ');
      box.appendChild(s('path',{d:path,fill:'none',stroke:'#39414C','stroke-width':1.2}));
      d.forEach(function(p){
        var inEmpty = p.mth>=EMPTY0 && p.mth<=EMPTY1;
        var c=s('circle',{cx:x(p.mth),cy:y(p.hw),r:3.2,
          fill: inEmpty&&show.empty ? C.warn : C.accent, opacity:.85});
        var t=s('title'); t.textContent=p.mth+' · '+(p.hw*100).toFixed(1)+'% of '+p.n+' matches';
        c.appendChild(t); box.appendChild(c);
      });
    }
    var st={empty:true,baseline:true};
    host.querySelectorAll('input[type=checkbox]').forEach(function(cb){
      cb.addEventListener('change',function(){st[cb.dataset.k]=cb.checked;draw(st);});
    });
    draw(st);
  })();

  /* --- 2. MECHANISM by country ------------------------------------------ */
  (function () {
    var host = document.getElementById('ha-mechanism'); if (!host) return;
    var W=880,ML=170,MR=90,MT=26,RH=38;
    var order=['Foul calls','Cards','Corners','Shots','Shots on target'];
    var box=s('svg',{viewBox:'0 0 '+W+' '+(MT+order.length*RH+34),class:'vnl-svg',role:'img',
      'aria-label':'Share of the home edge lost on each channel'});
    host.querySelector('.vnl-plot').appendChild(box);
    var H=MT+order.length*RH+34;
    var x=function(v){return ML+v/2.0*(W-ML-MR);};
    var country='All';

    function rows(){
      // "All" uses the match-weighted pooled figures computed in R, not an
      // average of country averages, so the page matches the analysis exactly.
      if(country==='All') return D.pooled;
      return D.edges.filter(function(e){return e.country===country;});
    }
    function draw(){
      clear(box);
      var rs=rows();
      [0,0.5,1,1.5].forEach(function(t){
        box.appendChild(s('line',{x1:x(t),x2:x(t),y1:MT-10,y2:H-30,
          stroke:t===1?C.dim:C.line,'stroke-dasharray':t===1?'5 5':''}));
        var l=s('text',{x:x(t),y:H-12,fill:C.dim,'font-size':11,'text-anchor':'middle'});
        l.textContent=Math.round(t*100)+'%'; box.appendChild(l);
      });
      var gone=s('text',{x:x(1)+6,y:MT-14,fill:C.dim,'font-size':10.5});
      gone.textContent='edge completely gone'; box.appendChild(gone);
      // say plainly whether this division follows the overall pattern
      var note=host.querySelector('[data-k=note]');
      if(note){
        if(country==='All'){
          note.textContent='Pooled across all 31,356 matches. Referee channels in amber lost far more of the home edge than performance channels in green.';
        } else {
          var c=(D.consistency||[]).filter(function(r){return r.country===country;})[0];
          note.textContent = c && c.ref_dominant
            ? country+' follows the overall pattern: the card edge fell by more than the shots edge.'
            : country+' is the exception. Here the performance channels lost more than the referee channels, which is the reverse of the other ten divisions.';
        }
      }
      order.forEach(function(ch,i){
        var r=rs.filter(function(e){return e.channel===ch;})[0]; if(!r) return;
        var y=MT+i*RH+10, isRef=/Foul|Cards/.test(ch);
        var lab=s('text',{x:ML-12,y:y+5,fill:C.muted,'font-size':12,'text-anchor':'end'});
        lab.textContent=ch; box.appendChild(lab);
        var w=Math.max(0,Math.min(2,r.lost));
        var bar=s('rect',{x:ML,y:y-9,width:x(w)-ML,height:19,rx:3,
          fill:isRef?C.warn:C.accent,opacity:.9});
        bar.style.transition='width .4s cubic-bezier(.4,0,.2,1)';
        box.appendChild(bar);
        var v=s('text',{x:x(w)+8,y:y+5,fill:C.text,'font-size':11.5});
        v.textContent=Math.round(r.lost*100)+'%'; box.appendChild(v);
      });
    }
    var sel=host.querySelector('select');
    ['All'].concat(D.by_country.map(function(c){return c.country;})
      .filter(function(v,i,a){return a.indexOf(v)===i;}).sort())
      .forEach(function(c){
        var o=document.createElement('option'); o.value=c;
        o.textContent=c==='All'?'All 11 divisions':c; sel.appendChild(o);
      });
    sel.addEventListener('change',function(){country=sel.value;draw();});
    draw();
  })();
})();
