/**
 * Copyright: 2012 (c) int3ractive.com
 * Author: Thanh Tran - trongthanh@gmail.com
 * Date: 3/4/12
 * Time: 4:01 PM
 */
T3.ImageContainer = new Class({
  initialize: function (divEl) {
    var el = divEl,
        loadingWheel = divEl.getElement('img');

    el.store('mediator', this);

    this.el = el;
    this.loadingWheel = loadingWheel;
  },
  showImage: function (imageURL) {
    var el = this.el,
        loadingWheel = this.loadingWheel;
  
    var lastImage = el.getElementById('project-image');
    if(lastImage) lastImage.destroy(); 

    //check for image or youtube video
    if (imageURL.contains('youtube.com')) {
      
      // youtube url:
      // http://www.youtube.com/watch?v=8UVNT4wvIGY
      // youtube iframe template
      // <iframe width="560" height="315" src="http://www.youtube.com/embed/A-7XPCNrD5Y" frameborder="0" allowfullscreen></iframe>
      var idIndex = imageURL.lastIndexOf('v=');
      idIndex += 2;

      var videoID = imageURL.substr(idIndex);
      el.grab(new Element('iframe#project-image', {
        width: 550,
        height: 367,
        frameborder: 0,
        allowfullscreen: true,
        src: 'http://www.youtube.com/embed/' + videoID
      }));
      loadingWheel.setStyle('display', 'none');

    } else {
      loadingWheel.setStyle('display', 'block');
      el.grab(new Element('img#project-image', {
        src: imageURL,
        events: {
          load: function () {
            loadingWheel.setStyle('display', 'none');
            this.setStyle('display', 'inline');
            this.fade('in');
          }
        }
      }));
    }
  }
});

//TODO: create parent class to share behaviors among  these buttons
T3.ImageSwitchButton = new Class({
  initialize: function (initObj) {
    //<li><a href="">Vimanit product 2</a></li>
    var el = new Element('li'),
        scope = this;

    var link = new Element('a', {
      href: '#!/' + initObj.photoURL,
      html: initObj.photoNum,
      events: {
        click: this._notifyClicked.bind(scope)
      }
    });

    el.grab(link);

    el.store('mediator', this);

    this.el = el;
    this.photoURL = initObj.photoURL;

  },
  _notifyClicked: function (e) {
    e.preventDefault();
    
    this.setActive(true);
    
  },
  setActive: function (active) {
    
    if (active) {
      var imageContainer = $('image-container').retrieve('mediator'),
          imageButtons = $('image-switcher').getElements('li'),
          imageButton;
        
      for (var i = 0, il = imageButtons.length; i < il; i++) {
        imageButton = imageButtons[i].retrieve('mediator');
        if(imageButton != this) {
          imageButton.setActive(false);
        }
      }
              
      this.el.addClass('active');
      imageContainer.showImage(this.photoURL);
    } else {
      this.el.removeClass('active');
    }
  },
  toElement: function () {
    return this.el;
  }
});

T3.ProjectTitleButton = new Class({
  Implements: [Events],
  initialize: function (initObj) {
    //<li><a href="">Vimanit product 2</a></li>
    var el = new Element('li'),
        scope = this,
        dataEl = initObj.dataEl,
        projectName = dataEl.getElement('h3').get('text'),
        slug = initObj.clientSlug + '/' + projectName.slugify(),
        images = dataEl.getElements('ul.project-images > li'),
        l = images.length,
        i;

    var link = new Element('a', {
      href: '#!/' + slug,
      html: projectName,
      events: {
        click: this._notifyClicked.bind(scope)
      }
    });

    el.grab(link);

    el.store('mediator', this);

    for (i = 0; i < l; i++) {
      images[i] = new T3.ImageSwitchButton({photoNum:i+1, photoURL: images[i].getElement('a').href});
    }

    this.slug = slug;
    this.el = el;
    this.dataEl = dataEl;
    this.images = images;
  },
  _notifyClicked: function (e) {
    //avoid URL rewrite for now
    e.preventDefault();
    
    var projects = $('project-list').getElements('li'),
        projButton;
    for (var i = 0, il = projects.length; i < il; i++) {
      projButton = projects[i].retrieve('mediator');
      if(projButton != this) {
        projButton.setActive(false);
      }
    }
    this.setActive(true);

  },
  setActive: function (active) {
    if (active) {
      var imageList = $('image-switcher'),
          images = this.images;

      this.el.addClass('active');
      
      imageList.empty();
      imageList.adopt(images);
      images[0].setActive(true);

    } else {
      this.el.removeClass('active');
    }
  },
  toElement: function () {
    return this.el;
  }
});

T3.ClientTitleButton = new Class({
  Implements: [Events],
  initialize: function (initObj) {
    var scope = this,
        clientName = initObj.clientHeading.get('text'),
        dataWidth = Number.from(initObj.clientHeading.get('data-width')),
        slug = clientName.slugify();
    var el = new Element('li');

    var link = new Element('a', {
      href: '#!/' + slug,
      html: clientName,
      events: {
        click: this._notifyClicked.bind(scope)
      }
    });

    el.grab(link);

    this.el = el;
    this.size = {x:dataWidth, y:0}; //
    this.pageIdx = NaN; //decide the list group of the item (later)
    this.idx = initObj.index; //index in the whole list
    this.slug = slug;
    this.projectButtons = []; //
  },
  _notifyClicked: function (e) {
    //avoid URL rewrite for now
    e.preventDefault();

    e.clientId = this.slug;
    this.fireEvent('click', e)
  },
  setActive: function (active) {
    if (active) {
      this.el.addClass('active');
    } else {
      this.el.removeClass('active');
    }
  },
  updateSize: function () {
    //update this component size after render
    var size = this.el.getSize();
    //compare with data-width attribute
    var dataWidth = this.size.x;
    if (dataWidth && dataWidth > size.x) {
      size.x = dataWidth;
    }

    this.size = size;
    //log(this.slug + " width: " + this.size.x);
  },
  setPosition: function (obj) {
    this.el.setPosition(obj);
  },
  toElement: function () {
    return this.el;
  }
});

T3.ClientSliderPage = new Class({
  initialize: function () {
    //create new list group
    var el = new Element('ul.client-list');
    //initial position
    el.setStyle('left', '85px' );

    this.el = el;
    this._fadeOutTween = new Fx.Morph(el, {
      duration: 500,
      onComplete: this._fadeOutComplete.bind(this)
    });
    this._fadeInTween = new Fx.Morph(el, {
      duration: 500
    });
    //this.pageIdx = 0;
  },
  add: function (liEl) {
    this.el.grab(liEl);
  },
  hide: function () {
    this.el.setStyles({display: 'none', opacity: 0});
  },
  fadeIn: function (fromRight) {
    var el = this.el;

    if(fromRight) {
      el.setStyles({ display: 'block', left: '120px'});
      this._fadeInTween.start({ opacity: 1, left: 85});
    } else {
      el.setStyles({ display: 'block', left: '50px'});
      this._fadeInTween.start({ opacity: 1, left: 85});
    }
  },
  fadeOut: function (toRight) {
    if(toRight) {
      this._fadeOutTween.start({ opacity: 0, left: 120 });
    } else {
      this._fadeOutTween.start({ opacity: 0, left: 50});
    }
  },
  _fadeOutComplete: function () {
    this.el.setStyle('display', 'none');
  },
  toElement: function () {
    return this.el;
  }

});

T3.ClientSlider = new Class({
  initialize: function (el) {
    var clientArr = [], //array of client li
        groupArr = [], //array of groups of li
        sectList = $$('section.client'),
        listContainer = new Element('div#client-list-container.client-list-container'),
        sliderInnerWidth = 850, //FIXME: hardcode
        tempList = new Element('ul.client-list'),
        sect, liEl, group, space,
        i, il, j, jl, 
        sumW = 0, 
        xPos = 0,
        scope = this;
    
    var leftButton = new Element('a.arrow-left-btn', {
      //'<a class="arrow-left-btn"><-</a>' 
      href: '#',
      html: '<-',
      events: {
        click: function (e) {
          e.preventDefault();
          scope.setPageIndex(scope.getPageIndex() - 1);
        }
      }
    });
    
    var rightButton = new Element('a.arrow-right-btn', {
      //'<a class="arrow-right-btn">-></a>' 
      href: '#',
      html: '->',
      events: {
        click: function (e) {
          e.preventDefault();
          scope.setPageIndex(scope.getPageIndex() + 1);
        }
      }
    });
    
    el.adopt(leftButton,
             listContainer,
             rightButton);

    il = sectList.length;
    for (i = 0; i < il; i ++) {
      sect = sectList[i];
      liEl = new T3.ClientTitleButton({index: i, clientHeading: sect.getElement('h2')});
      liEl.addEvent('click', this._buttonClickHandler.bind(scope));
      tempList.grab(liEl);
      clientArr.push(liEl);
    }
    
    //this step is only to let the title render, get its size and decide its page
    listContainer.grab(tempList);

    for (i = 0; i < il; i ++) {
      liEl = clientArr[i];
      liEl.updateSize();
      sumW += liEl.size.x;
      if (i === 0 || sumW > sliderInnerWidth) {
        sumW = liEl.size.x;
        group = [];
        groupArr.push(group);
      }
      group.push(liEl);
      group.sumW = sumW;
    }
    tempList.empty(); //remove children first if don't want them to be destroyed (all event handlers removed) as well
    tempList.destroy();
    
    //split title to groups that fit within slider
    il = groupArr.length;
    for (i = 0; i < il; i ++) {
      group = groupArr[i];
      jl = group.length;
      //create new list group
      tempList = new T3.ClientSliderPage();

      //reuse the array to contain ul element
      groupArr[i] = tempList;

      //hide other group
      if(i > 0) {
        tempList.hide();
      }
      
      space = (sliderInnerWidth - group.sumW) / (group.length + 1);
      xPos = space;
      for (j = 0; j < jl; j++) {
        liEl = group[j];
        liEl.pageIdx = i;
        tempList.add(liEl);
        liEl.setPosition({x: xPos});
        xPos += liEl.size.x + space;
      }
      
      listContainer.grab(tempList);
    }

    //assign class members:
    this.el = el;
    this.leftButton = leftButton;
    this.rightButton = rightButton;
    this.clientArr = clientArr;
    this.pageArr = groupArr;
    this.numPages = groupArr.length;
    this._curPageIndex = 0;
    this.setPageIndex(0); //update slider buttons
  },
  _buttonClickHandler: function (e) {
    this.selectClient(e.clientId);
  },
  selectClient: function (id) {
    var i,
        clientArr = this.clientArr,
        l = clientArr.length,
        liEl,
        projLi,
        projectList = $('project-list'),
        selIdx,
        pageIdx;

    for (i = 0; i < l; i++) {
      liEl = clientArr[i];
      if(liEl.slug === id) {
        liEl.setActive(true);
        selIdx = i;
        pageIdx = liEl.pageIdx;
      } else {
        liEl.setActive(false);
      }
    };

    //get project list:
    var projects =  $$('section.client')[selIdx].getElements('ol.projects > li');
    l = projects.length;
    projectList.empty();
    
    for (i = 0; i < l; i++) {
      projLi = projects[i];
      liEl = new T3.ProjectTitleButton({
        clientSlug: clientArr[selIdx].slug,
        dataEl: projLi
      });
      projectList.grab(liEl);

    };

    //active first item
    projectList.getElement('li').retrieve('mediator').setActive(true);
    //move to the page containing this client
    this.setPageIndex(pageIdx);
  },
  getPageIndex: function () {
    return this._curPageIndex;
  },
  setPageIndex: function (pageIndex) {
    var curPageIndex = this._curPageIndex,
        pageArr = this.pageArr,
        numPages = this.numPages,
        leftButton = this.leftButton,
        rightButton = this.rightButton;

    rightButton.setStyle('display', 'block');
    leftButton.setStyle('display', 'block');

    if(pageIndex >= numPages - 1) {
      pageIndex = numPages - 1;
      rightButton.setStyle('display', 'none');
    } else if (pageIndex <= 0) {
      pageIndex = 0;
      leftButton.setStyle('display', 'none');
    }
    
    if(pageIndex > curPageIndex) {
      //to next page on the right
      pageArr[curPageIndex].fadeOut(false);
      pageArr[pageIndex].fadeIn(true);
    } else if (pageIndex < curPageIndex) {
      //to last page on the left
      pageArr[curPageIndex].fadeOut(true);
      pageArr[pageIndex].fadeIn(false);
    }
    //else, same page, no update
    
    this._curPageIndex = pageIndex;
  },
  toElement: function() {
    return this.el;
  }

});

T3.PortfolioPage = new Class({
  initialize: function (el) {
    var closeButton = el.getElementById('port-close-btn'),
        imageContainer = new T3.ImageContainer(el.getElementById('image-container')),
        slider = new T3.ClientSlider(el.getElementById('client-slider')),
        scope = this;
        
    el.set('morph', {duration: 'long'});
    closeButton.addEvent('click', function (e) {
      e.preventDefault();
      scope.hide();
    });
    
    this.el = el;
    this.imageContainer = imageContainer;
    this.slider = slider;
    this.winSize = {x: 1900, y: 1200}; //will be updated by main
    this.active = false;
  },
  selectClient: function (id) {
    this.slider.selectClient(id);
  },
  updateWinSize: function (newSize) {
    this.winSize = newSize;
    if(this.active) {
      this.el.tween('left', this._getCenterX() );
    }
  },
  show: function (id) {
    this.selectClient(id);
    
    this.el.morph({left: [-1900, this._getCenterX() ], opacity: 1});
    this.active = true;
  },
  hide: function () {
    this.el.morph({left: 1900, opacity: 0});
    this.active = false;
  },
  _getCenterX: function () {
    return (this.winSize.x - 1900) / 2;
  }
  
});
