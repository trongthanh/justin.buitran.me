/**
 * Copyright: 2012 (c) int3ractive.com
 * Author: Thanh Tran - trongthanh@gmail.com
 */

var SimplePreloader = {
  //constructor: T3.Preloader,
  preloadAssets: [
    'img/sky-bg.jpg',
    'img/slide-00/justin-island-01.png',
    'img/slide-00/bg_cloud_331-144.png',
    'img/cloud_1.png',
    'img/slide-00/bg_plane_1272-471.png',
    'img/slide-01/justin-island-02.png',
    'img/slide-01/fg_airplane_1460-438.png',
    'img/slide-02/bg_island2011.png',
    'img/portfolio/portfolio-bg-01.png',
    'img/portfolio/portfolio-bg-02.png',
    'img/portfolio/portfolio-bg-03.png',
    'img/portfolio/portfolio-bg-04.jpg',
    'img/portfolio/portfolio-bg-05.png',
    'img/portfolio/close-btn.png'
  ],
  
  startPreload: function () {
    var assets = this.preloadAssets,
        imageCache = [],     
        len = assets.length,
        loadCount = 0,
        cacheImage,
        that = this;

    var loadHandler = function (e) {
        loadCount ++;
        if(loadCount >= len) {
          that.complete();
        }
      };
    
    for (var i = 0; i < len; i++) {
      cacheImage = document.createElement('img');
      cacheImage.onerror = loadHandler;
      cacheImage.onload = loadHandler;
      cacheImage.src = assets[i];
      imageCache.push(cacheImage);

    }
  },

  complete: function () {
    var preloadCover = document.getElementById('preloader');
    //preloadCover.style.display = 'none';
    //alert('preload completed');
    this._fadeCover(preloadCover, 1);
    
  },

  _fadeCover: function (coverEl, alpha) {
    var that = this;
    if (alpha < 0) {
      coverEl.style.display = 'none';
    } else {
      coverEl.style.opacity = alpha;

      alpha -= 0.05;

      setTimeout(function () {
        that._fadeCover(coverEl, alpha);
      }, 40);
      
    }
    
  }
  
};

SimplePreloader.startPreload();

