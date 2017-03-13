/**
 * Copyright: 2012 (c) int3ractive.com
 * Author: Thanh Tran - trongthanh@gmail.com
 * Date: 3/4/12
 * Time: 3:36 PM
 * 
 */
/*jshint noarg:true, eqeqeq:true, bitwise:true, undef:true, curly:true, browser:true, maxerr:50, mootools:true*/
/*global T3:true, THREE:true, Class:true, trace:true, FishMesh:true, Boid:true, BirdMesh:true, requestAnimationFrame:true, alert:true*/

var a = {name: 0, name2: "asda"};
 
T3.AnimatedObjects = {
  s1: {
    "s01-airplane": {
      offset: [0, 0.3],
      properties: {
        left: [438, 688],
        top: [527, 457]
      }
    }
  }, //end s1

  s2: {
    "s02-airplane": {
      offset: [0, 0.5],
      properties: {
        left: [1227, 588],
        top: [280, 457]
      }
    }
  },

  s4: {
    "s04-eagle": {
      offset: [0, 0.5],
      properties: {
        left: [1207, 1384],
        top: [980, 800]
      }
    }
  },

  s5: {
    "s05-airplane": {
      offset: [0, 0.5],
      properties: {
        left: [787, 1284],
        top: [491, 500]
      }
    }
  },

  s7: {
    "s07-snowskeater": {
      offset: [0, 1],
      properties: {
        left: [1170, 984],
        top: [100, 200]
      }
    }
  }
};

T3.ObjectAnimator = new Class({
  initialize: function (el, settings) {
    var offset = settings.offset,
        properties = settings.properties;

    //validate
    offset[0] = offset[0] || 0;
    offset[1] = offset[1] || 1;
    
    this.el = el;
    this.offset = offset;
    this.properties = properties;
    this.update(0);

  },
  
  update: function (progress) {
    //progress is from 0 to 1
    trace(2, progress);
    var properties = this.properties,
        from = this.offset[0],
        to = this.offset[1],
        curProgress = (progress - from) / (to - from),
        curValue,
        propFrom,
        propTo,
        styles = {};
    
        
    for (var prop in properties ) {
      propFrom = properties[prop][0];
      propTo = properties[prop][1];
      curValue = (propTo - propFrom) * curProgress + propFrom;
      if (!isNaN(curValue)) {
        styles[prop] = curValue;
      }
    }

    this.el.setStyles(styles);
  },

  toElement: function () {
    return this.el;
  }
});

T3.Slide = new Class({
  initialize: function (index, el) {
    var animators = [],
        aniEl,
        aniSettings = T3.AnimatedObjects['s' + index];

    if (aniSettings) {
      for (var prop in aniSettings) {
        aniEl = el.getElementById(prop);
        if (aniEl) {          
          animators.push(new T3.ObjectAnimator(aniEl, aniSettings[prop]));
        }
      }
    }
    
    this.index = index;
    this.element = el;
    this.bg = el.getElement('.bg-near');
    this.content = el.getElement('.slide-content');
    this.fg = el.getElement('.foreground');
    this.animators = animators;

    this.bg.setPosition({y: -2000 });
    this.fg.setPosition({y: -2000 });
  },
  scroll: function (sTop, vH) {
    var pagePos = this.element.getPosition();
    var pageY = pagePos.y;

    var centerOffset = (T3.SLIDE_HEIGHT - vH) / 2;

    var delta = sTop - pageY;
    var portion = delta / T3.SLIDE_HEIGHT; //from -1 ~ 1

    var bgY = -3000;
    var fgY = -3000;

    if (portion >= -3 && portion <= 3) {
      bgY = /*-centerOffset*/ - portion * T3.BG_NEAR_SPEED;
      fgY = /*-centerOffset*/ - portion * T3.FOREGROUND_SPEED;

      for (var i = 0, il = this.animators.length; i < il; i++) {
        this.animators[i].update(portion);
      }
    }

    this.bg.setPosition({y: bgY });
    this.fg.setPosition({y: fgY });

  }
});

T3.BackgroundFar = new Class({
  initialize: function (el) {
    this.element = el;
    this.skyLayer = el.getElement('#sky-layer');
    this.oSkyH = this.skyLayer.getSize().y;
    this.seaLayer = el.getElement('#sea-layer');
    this.seaLayer.setPosition({y: T3.BG_FAR_SPEED * T3.SKY_SEA_BOUNDARY});

    //TODO: crop the mountain to avoid appearing under the sea
    this.moutainbg = $('mountain-bg');

  },
  scroll: function (sTop, vH) {
    var sBottom = sTop + vH;

    var bgY = -sTop * T3.BG_FAR_SPEED;

    this.element.setPosition({y: bgY});

    //calculate height of sky bg from sky & sea boundary

    var boundaryToScrollTop = T3.SKY_SEA_BOUNDARY - sTop;

    if (boundaryToScrollTop < vH) {
      //border on screen
      var skybgHeight = boundaryToScrollTop - bgY;
      this.skyLayer.setStyle('height', skybgHeight + 'px');
    } else {
      this.skyLayer.setStyle('height', this.oSkyH + 'px');
    }


  }
});

T3.BoidScene = new Class({
  /*initialize: function() {

   },*/

  init: function (boidContainer, numBirds, isFish) {
    var viewWidth = boidContainer.getSize().x,
      viewHeight = boidContainer.getSize().y,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(75, viewWidth / viewHeight, 1, 10000),
      renderer = new THREE.CanvasRenderer(),
      birds = [],
      boids = [],
      boid, bird,
      scope = this;

    if (isFish === undefined) {isFish = false; }
    numBirds = numBirds || 50;

    camera.position.z = 450;

    for (var i = 0; i < numBirds; i ++) {
      if (isFish) {
        //reduce maxspeed & steer force
        boid = boids[ i ] = new Boid(2, 0.02);
        //the actual 3D object
        bird = birds[ i ] = new FishMesh();
      } else {
        boid = boids[ i ] = new Boid(4, 0.1);
        bird = birds[ i ] = new BirdMesh();
      }
      
      boid.position.x = Math.random() * 500 - 250;
      boid.position.y = Math.random() * 500 - 250;
      boid.position.z = Math.random() * 500 - 250;
      boid.velocity.x = Math.random() * 2 - 1;
      boid.velocity.y = Math.random() * 2 - 1;
      boid.velocity.z = Math.random() * 2 - 1;
      boid.setAvoidWalls( true );
      boid.setWorldSize( 500, 500, 400 );

      bird.position = boids[ i ].position;
      bird.doubleSided = true;

      scene.add( bird );
    }

    // renderer.autoClear = false;
    //TODO: check for resize
    renderer.setSize( viewWidth, viewHeight );

    document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );

    /* debug
     var materials = [];
     for ( var j = 0; j < 6; j ++ ) {
     materials.push( new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) );
     }

     this.cube = new THREE.Mesh( new THREE.CubeGeometry( 10, 10, 10, 1, 1, 1, materials ), new THREE.MeshFaceMaterial() );
     this.cube.overdraw = true;
     this.scene.add( this.cube ); */


    /*stats = new Stats();
     stats.domElement.style.position = 'absolute';
     stats.domElement.style.left = '0px';
     stats.domElement.style.top = '0px';

     document.getElementById( 'container' ).appendChild(stats.domElement);*/

    //add scene to DOM
    boidContainer.grab(renderer.domElement);

    var lastCheck = new Date().getTime(),
        now, longEnough;

    this.animate = function () {
      
      requestAnimationFrame( scope.animate );
      now = new Date().getTime();
      
      longEnough = (now - lastCheck) > 50; //50ms ~= 20fps
      
      if (scope._visible && longEnough) { scope.render(); }
      //stats.update();

    };

    //members:
    this.container = boidContainer;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.halfViewWidth = viewWidth / 2;
    this.halfViewHeight = viewHeight / 2;
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.offset = {x:0, y:0};
    this.birds = birds;
    this.boids = boids;
    this._visible = false;// whether the scene in in view and should be rendered

  },

  toElement: function (){
    return this.container;
  },

  onDocumentMouseMove: function ( e ) {
    var boid,
        offset = this.offset,
        boids = this.boids,
        vector = new THREE.Vector3( e.clientX - offset.x - this.halfViewWidth, - e.clientY - offset.y + this.halfViewHeight, 0 );
    //TODO: 0.59 is a projection scaling number that is deduced from trial & errors, will find the correct formular to convert projection later
    vector.multiplyScalar(0.59);

    //trace(3, 'offset: ' + offset.x + 'x' + offset.y + ' - vector: ' + vector.x + 'x' + vector.y);

    for ( var i = 0, il = boids.length; i < il; i++ ) {
      boid = boids[ i ];
      vector.z = boid.position.z;
      boid.repulse( vector );
    }

  },

  scroll: function(main) {
    var scrollTop = main.$scrollBody.getScroll().y,
        scrollBottom = scrollTop + main.winSize.y,
        offset = this.container.getPosition(),
        frameTop = offset.y;
    //calculate inView
    this._visible = (frameTop < scrollBottom && frameTop > scrollTop - this.viewHeight);
    
    offset.y = scrollTop - offset.y;
    
    this.offset = offset;
  },

  render: function() {
    var boid, bird;

    for ( var i = 0, il = this.birds.length; i < il; i++ ) {
      boid = this.boids[ i ];
      boid.run( this.boids );
      bird = this.birds[ i ];
      bird.updateCourse(boid);

    }
    //slow netbook 
    this.renderer.render( this.scene, this.camera );
  }
});

T3.Navigation = new Class({
  initialize: function (navEl) {
    var el = navEl,
        anchors = navEl.getElements('a'),
        that = this;
    
    anchors.each(function (el) {
      var targetHash = el.href.getURLHash(),
          targetEl = $(targetHash),
          targetPos = targetEl.getPosition();
      targetPos.y -= 100; //minus 100px to allow some margin
      
      el.store('targetHash', targetHash);
      el.store('targetEl', targetEl);
      el.store('targetPos', targetPos);

      el.addEvent('click', function (e) {
        e.preventDefault();
        that.scrollTo(el);
      });
      
    });

    this.el = el;
    this.anchors = anchors;
    
  },
  getAnchorEl: function (hash) {
    var anchors = this.anchors,
        anchor;
    for (var i = 0, il = anchors.length; i < il; i++) {
      anchor = anchors[i];
      if (anchor.retrieve('targetHash') === hash) {
        return anchor;
      }
    }
    return null;
  },
  scrollTo: function (anchorEl) {
    var targetHash = anchorEl.retrieve('targetHash'),
        targetPos = anchorEl.retrieve('targetPos');
    T3.mainApp.bodyScrollFx.start(targetPos.x, targetPos.y);
  },
  checkScrollPosition: function (scrollTop) {
    var anchors = this.anchors,
        anchor,
        targetPos,
        targetHash = '';

    for (var i = 0, il = anchors.length; i < il; i++) {
      anchor = anchors[i];
      targetPos = anchor.retrieve('targetPos');
      if (scrollTop >= targetPos.y) {
        targetHash = anchor.retrieve('targetHash');
      }
    }

    if(!T3.mainApp.autoScroll) {
      //FIXME: still so many issues, will activate later
      //window.location.hash = '!/' + (targetHash? targetHash : 'home');
    }
  },
  checkLandingURL: function () {
    var url,
        initAnchor;
        //check for initial hash and go to that navigation point
    url = window.location.hash;
    initAnchor = this.getAnchorEl(url.getURLHash());
    if(initAnchor) {
      this.scrollTo(initAnchor);
    } else {
      T3.mainApp.bodyScrollFx.toTop();
    }
  }
});

/**
 * Main Class
 **/
T3.Main = new Class({
  initialize: function (win) {
    if (T3.mainApp) {
      alert('T3.Main singleton exception');
    } else {
      T3.mainApp = this;
    }
    var doc = win.document,
        slideElArr = doc.getElements('.slide'),
        slidesLen = slideElArr.length,
        slides = [],
        that = this;

    for(var i = 0; i < slidesLen; ++ i) {
      slides.push(new T3.Slide(i, slideElArr[i]));
    }
    
    var navigation = new T3.Navigation(doc.id('main-nav'));

    var boidScene1 = new T3.BoidScene();
    boidScene1.init($('bird-frame-1'), 20, false);
    boidScene1.animate();

    var boidScene2 = new T3.BoidScene();
    boidScene2.init($('bird-frame-2'), 10, false);
    boidScene2.animate();

    var boidScene3 = new T3.BoidScene();
    boidScene3.init($('fish-frame'), 15, true);
    boidScene3.animate();

    win.addEvent('scroll', this.scrollHandler.bind(this));
    win.addEvent('resize', this.resizeHandler.bind(this));
    win.addEvent('mousewheel', this.mouseWheelHandler.bind(this));
    win.onhashchange = function () {
      //handle it
    };
    
    trace(1, 'app started');

    var portfolioPage = new T3.PortfolioPage($('portfolio'));
    //capture check out clicks
    var checkoutLinks = $$('.check-btn, .other-client-link');
    checkoutLinks.forEach(function (thisObj) {
      thisObj.addEvent('click', function (e) {
        e.preventDefault();
        var clientId = /#(.*?)$/.exec(thisObj.href)[1]; //pick the client-id on 
        portfolioPage.show(clientId);
      });
    });

    //members
    this.win = win;
    this.doc = doc;
    this.nav = navigation;
    this.portfolioPage = portfolioPage;
    this.autoScroll = false;
    //$.scrollBody = ($.browser.mozilla || $.browser.msie || $.browser.opera) ? $('html') : $('body');
    this.$scrollBody = doc.getElement('body');
    this.bodyScrollFx = new Fx.Scroll(this.$scrollBody, {
      onStart: function () {
        that.autoScroll = true;
      },
      onComplete: function () {
        that.autoScroll = false;
      }
      
    });
    this.slides = slides;
    this.slidesLen = slidesLen;

    this.bgfar = new T3.BackgroundFar(this.doc.id('bg-far'));
    this.boidScene1 = boidScene1;
    this.boidScene2 = boidScene2;
    this.boidScene3 = boidScene3;

    //do first layour update
    this.nav.checkLandingURL();
    this.resizeHandler();
  },
  mouseWheelHandler: function (e) {
    trace(1, 'mouse wheel detected');
    if(this.portfolioPage.active && e) {
      e.preventDefault();
    }
  },
  scrollHandler: function(e) {
    var scrollTop = this.$scrollBody.getScroll().y,
        winSize = this.winSize,
        viewableFrom = Math.floor(scrollTop / T3.SLIDE_HEIGHT);
    //var scrollBottom = scrollTop + winSize.y;
    //var viewableTo = Math.floor(scrollBottom / T3.SLIDE_HEIGHT);
    
    //trace(2, 'scroll top: ' + scrollTop + ' - in slide:' + viewableFrom);

    this.bgfar.scroll(scrollTop, winSize.y);

    for(var i = 0; i < this.slidesLen; ++ i) {
      this.slides[i].scroll(scrollTop, winSize.y);
    }

    //scroll the boid scene
    this.boidScene1.scroll(this);
    this.boidScene2.scroll(this);
    this.boidScene3.scroll(this);

    this.nav.checkScrollPosition(scrollTop);
    //trace(3, 'boidscene 2 visible: ' + this.boidScene2._visible);
  },
  resizeHandler: function () {
    var winSize = this.win.getSize();
    this.winSize = winSize;
    this.scrollHandler();
    this.portfolioPage.updateWinSize(winSize);
    
    //alert('resize: ' + this.winSize.x + 'x' + this.winSize.y);
  }
});

//this is where it all begin:
window.addEvent('domready', function() {
  //main application singleton
  window.mainApp = new T3.Main(window);
});

