// スクロールしたらページ上部にメニューを表示
$(function () {
    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $('#menu').addClass('fixed');
      } else {
        $('#menu').removeClass('fixed');
      }
    });
});

// ページ上部に移動するボタン
jQuery(function() {
    var pagetop = $('#page_top');   
    pagetop.hide();
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {  //100pxスクロールしたら表示
            pagetop.fadeIn();
        } else {
            pagetop.fadeOut();
        }
    });
    pagetop.click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 500); //0.5秒かけてトップへ移動
        return false;
    });
});

