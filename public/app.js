$.cookie.json = true;

function getState() {
  var state = $.cookie('state');

  return {
    language: $('.language').val(),
    code: $('.code').val(),
    solution: $('.solution').val(),
    started: (state && state.started ? state.started : Date.now()),
  }
}

function saveState() {
  $.cookie('state', getState(), { path: '/' });
}

function getExpiredTime() {
  var state = getState();
  var now = Date.now();
  var diff = (now - state.started) / 1000;
  var minutes = Math.floor(diff / 60);
  var seconds = Math.floor(diff - minutes * 60);

  return 'Time taken: ' + ("00" + minutes).slice(-2) + ':' + ("00" + seconds).slice(-2);
}

function submitSolution() {
  var state = getState();
  var result = '';

  $.ajax({
    url: '/execute',
    method: 'POST',
    data: state,
    success: function(data) {
      $('.actual table').remove();

      if (data.result_table) {
        $('.actual .panel-body').hide();
        $('.actual').append(data.result_table);
        $('.actual .panel-table').show();
      }
      else {
        $('.actual .panel-body').text(data.result ? data.result : 'No output');
        $('.actual .panel-body').show();
      }

      if (data.error) {
        $('.test-status .msg').text(data.error);
        $('.test-status').attr('class', 'test-status test-status-error');
      }
      else if (!data.pass) {
        $('.test-status .msg').text('Output does not match the expected value.');
        $('.test-status').attr('class', 'test-status test-status-error');
      }
      else {
        $('.test-status .msg').text('Correct! ' + getExpiredTime());
        $('.test-status').attr('class', 'test-status test-status-success');
      }

      $('.solution').focus();
    }
  });
}

$(document).ready(function() {
  $('.anchor').on('click', function() {
    window.location = $(this).data('href');
  });

  $('.solution').focus();

  $('.solution').keydown(function(e) {
    if (e.keyCode == 13 && e.shiftKey) {
      submitSolution();
      e.preventDefault();
    }
  });

  $('.solution').keyup(function(e) {
    saveState();
  });

  $(document).keydown(function(e) {
    if (!(String.fromCharCode(e.which).toLowerCase() == 's' && e.ctrlKey) && !(e.which == 19)) return true;
    submitSolution();
    e.preventDefault();
  });

  $('.btn-test-check').on('click', submitSolution);

  $('.btn-solve').on('click', function(e) {
    var state = getState();

    $.get('/solve/' + state.language + '/' + state.code, function(data) {
      $('.solution').val(data);
      $('.solution').trigger('autosize.resize');
      submitSolution();
    });

    e.preventDefault();
  });

  var state = $.cookie('state');

  if (state) {
    if (state.language == $('.language').val() && state.code == $('.code').val()) {
      $('.solution').val(state.solution);
    }
    else {
      $.removeCookie('state', {path: '/'});
    }
  }

  saveState();

  $('.solution').autosize({append: ""});

});

$(document).delegate('textarea', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});