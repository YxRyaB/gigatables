/**
 * Created by Arthur Kushman
 */
(function ($) {
  if (!String.prototype.trim) { // IE < 9 etc
    String.prototype.trim = function () {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  }
  $.fn.GigaTable = function (options) {
    var PERIOD_SEARCH = 200, // optimal period to search (onkeyup) for user experiance
            TIMEOUT_SEARCH = 300,
            SORT_ASC = 'asc',
            SORT_DESC = 'desc',
            POSITION_TOP = 'top',
            POSITION_BOTTOM = 'bottom',
            UNDEFINED = 'undefined',
            FUNCTION = 'function',
            // opts
            SELECTED = 'selected',
            CHECKED = 'checked';

    var CNTRL_KEY = 17,
            SHIFT_KEY = 16,
            ENTER_KEY = 13;

    var that = this,
            json = null,
            struct = {},
            language = [],
            invisibleCols = [],
            unsearchableCols = [];
    // flags
    var searchSet = 0, discreteSearchSet = 0;

    var sortTimeout = null, searchTimeout = null;
    var lastTimeKeyup = (new Date()).getTime(), nowMillis = 0;
    var lastTimeKeyupDiscrete = (new Date()).getTime(), nowMillisDiscrete = 0;
    // if user set some opt to [] - unset opts
    struct.search = [];
    if (typeof options.struct.search === UNDEFINED) {
      struct.search = [POSITION_TOP];
    } else if (options.struct.search.length > 0) {
      struct.search = options.struct.search;
    }

    struct.rowsSelector = [];
    if (typeof options.struct.rowsSelector === UNDEFINED) {
      struct.rowsSelector = [SORT_ASC, POSITION_TOP, POSITION_BOTTOM];
    } else if (options.struct.rowsSelector.length > 0) {
      struct.rowsSelector = options.struct.rowsSelector;
    }

    struct.pagination = [];
    if (typeof options.struct.pagination === UNDEFINED) {
      struct.pagination = ['bottom'];
    } else if (options.struct.pagination.length > 0) {
      struct.pagination = options.struct.pagination;
    }

    var langs = {
      'en': {
        'gte_editor_popupheader_delete': 'Delete',
        'gte_editor_popupheader_edit': 'Edit',
        'gte_editor_popupheader_create': 'Create row',
        'gte_editor_sendbtn_create': 'Create',
        'gte_editor_sendbtn_update': 'Update',
        'gte_editor_sendbtn_delete': 'Delete',
        'show': 'Show',
        'entries': 'entries',
        'showing': 'Showing',
        'to': 'to',
        'of': 'of',
        'prev': 'Previous',
        'next': 'Next',
        'search': 'Search',
        'editor_create': 'New',
        'editor_edit': 'Edit',
        'editor_remove': 'Delete'
      },
      'gr': {
        'gte_editor_popupheader_delete': 'Löschen',
        'gte_editor_popupheader_edit': 'Bearbeiten',
        'gte_editor_popupheader_create': 'Neu zeile',
        'gte_editor_sendbtn_create': '',
        'gte_editor_sendbtn_update': '',
        'gte_editor_sendbtn_delete': '',
        'show': 'Zeigen',
        'entries': 'einträge',
        'showing': 'Zeigen',
        'to': 'bis',
        'of': 'von',
        'prev': 'früher',
        'next': 'Nächste',
        'search': 'Suche',
        'editor_create': 'Neu',
        'editor_edit': 'Bearbeiten',
        'editor_remove': 'Löschen'
      },
      'ru': {
        'gte_editor_popupheader_delete': 'Удалить',
        'gte_editor_popupheader_edit': 'Редактировать',
        'gte_editor_popupheader_create': 'Создать строку',
        'gte_editor_sendbtn_create': 'Создать',
        'gte_editor_sendbtn_update': 'Сохранить',
        'gte_editor_sendbtn_delete': 'Удвлить',
        'show': 'Показать',
        'entries': 'строк',
        'showing': 'Показано от',
        'to': 'до',
        'of': 'из',
        'prev': 'Пред.',
        'next': 'След.',
        'search': 'Поиск',
        'editor_create': 'Создать',
        'editor_edit': 'Редактировать',
        'editor_remove': 'Удалить'
      },
      'fr': {
        'gte_editor_popupheader_delete': 'Effacer',
        'gte_editor_popupheader_edit': 'éditer',
        'gte_editor_popupheader_create': 'Créer rangée',
        'gte_editor_sendbtn_create': '',
        'gte_editor_sendbtn_update': '',
        'gte_editor_sendbtn_delete': '',
        'show': 'Montrer',
        'entries': 'entrées',
        'showing': 'Projection',
        'to': 'à',
        'of': 'de',
        'prev': 'Précédent',
        'next': 'Suivant',
        'search': 'Recherche',
        'editor_create': 'Créer',
        'editor_edit': 'éditer',
        'editor_remove': 'Effacer'
      },
      'es': {
        'gte_editor_popupheader_delete': 'Borrar',
        'gte_editor_popupheader_edit': 'Editar',
        'gte_editor_popupheader_create': 'Crear fila',
        'gte_editor_sendbtn_create': '',
        'gte_editor_sendbtn_update': '',
        'gte_editor_sendbtn_delete': '',
        'show': 'Mostrar',
        'entries': 'Entradas',
        'showing': 'Demostración',
        'to': 'a',
        'of': 'de',
        'prev': 'Anterior',
        'next': 'Próximo',
        'search': 'Buscar',
        'editor_create': 'Crear',
        'editor_edit': 'Editar',
        'editor_remove': 'Borrar'
      },
      'ch': {
        'gte_editor_popupheader_delete': '删除',
        'gte_editor_popupheader_edit': '编辑',
        'gte_editor_popupheader_create': '创建行',
        'gte_editor_sendbtn_create': '',
        'gte_editor_sendbtn_update': '',
        'gte_editor_sendbtn_delete': '',
        'show': '显示',
        'entries': '项目',
        'showing': '显示',
        'to': '至',
        'of': '的',
        'prev': '前',
        'next': '未来',
        'search': '搜索',
        'editor_create': '创造',
        'editor_edit': '编辑',
        'editor_remove': '删除'
      },
      'hi': {
        'gte_editor_popupheader_delete': 'हटाना',
        'gte_editor_popupheader_edit': 'संपादन करना',
        'gte_editor_popupheader_create': 'पंक्ति बना',
        'gte_editor_sendbtn_create': '',
        'gte_editor_sendbtn_update': '',
        'gte_editor_sendbtn_delete': '',
        'show': 'प्रदर्शन',
        'entries': 'आइटम',
        'showing': 'नुमाइश',
        'to': 'तक',
        'of': 'की',
        'prev': 'पूर्व',
        'next': 'अगला',
        'search': 'खोज',
        'editor_create': 'बनाना',
        'editor_edit': 'संपादन करना',
        'editor_remove': 'हटाना'
      }
    };

    var settings = $.extend(true, {// merge defaults with options recursivelly
      // These are the defaults.
      styling: {
        color: '#333',
        bgColor: '#ccc',
        highlightColor: 'orange'
      },
      struct: struct,
      lang: 'en',
      perPageRows: [25, 50, 100, 200, 500],
      defaultPerPage: 25,
      columns: [],
      columnOpts: [],
      tableOpts: {
        buttons: [
        ],
        theme: 'std'
      }
    }, options);

    // to make it easy to call from editor when rows added/edited
    settings.setSelectedRows = setSelectRows;
    // set language
    switch (settings.lang) {
      case 'gr':
        language = langs.gr;
        break;
      case 'ru':
        language = langs.ru;
        break;
      case 'fr':
        language = langs.fr;
        break;
      case 'hi':
        language = langs.hi;
        break;
      case 'ch':
        language = langs.ch;
        break;
      case 'es':
        language = langs.es;
        break;
      default:
        language = langs.en;
        break;
    }
    
    function triggerCustomFunc(buttons, editorAction, before) {
        for (var k in buttons) {
          if (before && buttons[k].extended === editorAction && typeof buttons[k].triggerBefore === FUNCTION) {
            buttons[k].triggerBefore();
          } else if (!before && buttons[k].extended === editorAction && typeof buttons[k].triggerAfter === FUNCTION) {
            buttons[k].triggerAfter();
          }
        }
    }

    function setButtons(settings) {
      var buttons = settings.tableOpts.buttons.sort(function (a, b) {
        return b.extended.localeCompare(a.extended);
      }), btnsCnt = settings.tableOpts.buttons.length;

      var editorObj = buttons[0].editor; // there should be at least 1 editor obj - peek it up      
      if (typeof buttons !== UNDEFINED && btnsCnt > 0) {
        var button = null;

        for (var k in buttons) {
          button = buttons[k].editor.buttons[buttons[k].extended];
          if ($.inArray('top', settings.tableOpts.buttonsPosition) >= 0) {
            settings.headTools.prepend('<div class="gte_buttons_container">'
                    + button.replace('gte.button.' + buttons[k].extended, eval('language.' + buttons[k].extended))
                    + '<div class="clear"></div></div>');
          }

          if ($.inArray('bottom', settings.tableOpts.buttonsPosition) >= 0) {
            settings.footTools.prepend('<div class="gte_buttons_container">'
                    + button.replace('gte.button.' + buttons[k].extended, eval('language.' + buttons[k].extended))
                    + '<div class="clear"></div></div>');
          }
        }

        // setting the events for each button
        settings.headTools.find('.gte_button.create').click(function () {
          // trigger user custom func before popup creation
          triggerCustomFunc(buttons, 'editor_create', 1);
          editorObj.triggerPopupCreate(settings);
          var popup = settings.container.find('.gte_editor_popup');
          popup.find('.gte_editor_title').text(language.gte_editor_popupheader_create);
          popup.find('#gte_sent_btn').text(language.gte_editor_sendbtn_create);
          // trigger user custom func after popup creation
          triggerCustomFunc(buttons, 'editor_create', 0);
        });

        settings.footTools.find('.gte_button.create').click(function () {
          triggerCustomFunc(buttons, 'editor_create', 1);
          editorObj.triggerPopupCreate(settings);
          var popup = settings.container.find('.gte_editor_popup');
          popup.find('.gte_editor_title').text(language.gte_editor_popupheader_create);
          popup.find('#gte_sent_btn').text(language.gte_editor_sendbtn_create);
          triggerCustomFunc(buttons, 'editor_create', 0);
        });
      }
    }

    function setSort(settings, json) {
      var ths = settings.container.find('th'); // ths in this particular container
      var i = 0, c = ths.length / 2;

      ths.each(function () {
        var that = $(this), idx = that.index();

        if (settings.columns[idx].sortable !== false && (settings.columns[idx].discreteSearch !== true
                || (settings.columns[idx].discreteSearch === true && i < c))) {
          that.click(function () {
            sortTimeout = setTimeout(function () {
              var objTh = that, idx = objTh.index(),
                      nJson = json, cols = settings.columns,
                      sortingOrder = 0;

              // set arrows        
              if (objTh.hasClass('sorting') || objTh.hasClass('sorting_desc')) {
                ths.eq(idx).removeClass('sorting').removeClass('sorting_desc').addClass('sorting_asc'); // header
                ths.eq(idx + cols.length).removeClass('sorting').removeClass('sorting_desc').addClass('sorting_asc'); // footer                
                sortingOrder = 1;
              } else {
//            console.log(-1);
                sortingOrder = -1;
                ths.eq(idx).removeClass('sorting_asc').addClass('sorting_desc');
                ths.eq(idx + cols.length).removeClass('sorting_asc').addClass('sorting_desc');
              }

              var isNan = 0,
                      check = 0;

              /*nJson.sort(function (a, b) {
               a = eval('a.' + cols[idx].data) + '';
               b = eval('b.' + cols[idx].data) + '';
               
               if (check === 0) { // check just the 1st time
               if (isNaN(a - b)) {
               isNan = 1;
               }
               check = 1;
               }
               
               if (sortingOrder === 1) { // asc
               if (isNan & 1) {
               return a.localeCompare(b);
               }
               return a - b;
               } else { // desc
               if (isNan & 1)
               return b.localeCompare(a);
               
               return b - a;
               }
               });*/
              // ===========
              if (sortingOrder === 1) { // asc
                nJson.sort(function (a, b) {
                  a = eval('a.' + cols[idx].data) + '';
                  b = eval('b.' + cols[idx].data) + '';

                  if (check === 0) { // check just the 1st time
                    if (isNaN(a - b)) {
                      isNan = 1;
                    }
                    check = 1;
                  }

                  if (isNan) {
                    return a.localeCompare(b);
                  }
                  return a - b;
                });
              } else { // desc
                nJson.sort(function (a, b) {
                  a = eval('a.' + cols[idx].data) + '';
                  b = eval('b.' + cols[idx].data) + '';
                  if (check === 0) { // check just the 1st time
                    if (isNaN(a - b)) {
                      isNan = 1;
                    }
                    check = 1;
                  }

                  if (isNan) {
                    return b.localeCompare(a);
                  }
                  return b - a;
                });
              }
              setTableSort(settings, nJson);
            }, 50); // silly pressing buttons protection
          });
        }
        ++i;
      });
    }

    function setSearch(settings, json) {
      var nothing = false;
      var tOut = [], c = 0;
      settings.container.find('.gt_search').keyup(function () {
        var objSearch = $(this), val = objSearch.val(), len = val.length;
        nowMillis = (new Date()).getTime();
        var period = nowMillis - lastTimeKeyup;
//        console.log(period);
        if (len > 0 || (len === 0 && val === '')) { // do search          
          if (nothing === true && val === '') {
            return; // exit coz user pressed not a symbol keys 
          }
          if (nothing === false && val === '') { // rebuild full table if teared down
            setTableRows(settings, json);
            nothing = true;
            return;
          }
          var nJson = [], str = '', i = 0;
          for (var key in json) {
            for (var k in json[key]) {
              if (k !== 'GT_RowId' && unsearchableCols[k] === true) { // do not search unsearchable
                str = json[key][k] + '';
                if (str.indexOf(val) !== -1) {
                  nJson[i] = json[key];
                  ++i;
                  break;
                }
              }
            }
          }
          if (period > PERIOD_SEARCH) {// show quick results and tear down all timeouts if they are present
            for (var j in tOut) {
              clearTimeout(tOut[j]);
            }
            tOut = [];
            c = 0;
            setTableRows(settings, json, nJson);
          } else {
            tOut[c] = setTimeout(function () {
              setTableRows(settings, json, nJson);
            }, TIMEOUT_SEARCH);
            c++;
          }
          nothing = false;
        }
        lastTimeKeyup = nowMillis;
      });
    }

    function setDiscreteSearch(settings, json) { //@fixme - remove timeout like in setSearch
      var nothing = false;
      var tOut = [], c = 0;
      settings.tfoot.find('th input').keyup(function () {
        var objSearch = $(this), val = objSearch.val(), len = val.length, idx = objSearch.parent().index();
        nowMillisDiscrete = (new Date()).getTime();
        var period = nowMillisDiscrete - lastTimeKeyupDiscrete;
        if ((period > PERIOD_SEARCH && len > 0) || (len === 0 && val === '')) { // do search
          if (nothing === true && val === '') {
            return; // exit coz user pressed not a symbol keys 
          }

          if (nothing === false && val === '') { // rebuild full table if teared down
            setTableRows(settings, json);
            nothing = true;
            return;
          }

          var nJson = [], str = '', i = 0;
          for (var key in json) {
            for (var k in json[key]) {
              if (k !== 'GT_RowId' && unsearchableCols[k] === true
                      && settings.columns[idx].data === k) { // do not search unsearchable                  
                str = json[key][k] + '';
                if (str.indexOf(val) !== -1) {
                  nJson[i] = json[key];
                  ++i;
                  break;
                }
              }
            }
          }
          if (period > PERIOD_SEARCH) {// show quick results and tear down all timeouts if they are present
            for (var j in tOut) {
              clearTimeout(tOut[j]);
            }
            tOut = [];
            c = 0;
            setTableRows(settings, json, nJson);
          } else {
            tOut[c] = setTimeout(function () {
              setTableRows(settings, json, nJson);
            }, TIMEOUT_SEARCH);
            c++;
          }
          nothing = false;
        }
        lastTimeKeyupDiscrete = nowMillisDiscrete;
      });
    }

    function setPgnSelect(sets, json) {
      if (typeof sets.headTools !== UNDEFINED) {
        var selectPerPage = sets.container.find('.gt_select');
        // listen for event on all select in this container context
        selectPerPage.change(function () {
//          console.log($(this).val());
          settings.defaultPerPage = $(this).val();
          settings.fromRow = 0;

          setTableRows(settings, json);

          selectPerPage.find('option').prop(SELECTED, false);
          selectPerPage.find('option[value="' + settings.defaultPerPage + '"]').prop(SELECTED, true);
        });
      }
    }

    function drawPagnButtons(pages, fromRow, amount) {

      var MORE = 5,
              pagesDraw = '',
              selected = '',
              from = 0,
              prevFrom = 0, nextFrom = 0,
              selectedPage = fromRow / amount + 1,
              tail = parseInt(pages) - MORE;
//      var prev = pgnObj.find('.gt_page .prev'), next = pgnObj.find('.gt_page.next');
//      console.log(pgnObj);
//      prev.text('vsdfvds');

      for (var p = 0; p < pages; ++p) {
        from = (p * amount);
//        console.log(from + ' ' + fromRow);

        var prevPage = p - 1, nextPage = p + 1;

        if (selectedPage === nextPage) {

          prevFrom = prevPage * amount;
          if (prevPage < 0)
            prevFrom = (pages - 1) * amount;

          nextFrom = nextPage * amount;
          if (nextPage === pages)
            nextFrom = 0;
//          console.log(selectedPage);
//          selected = SELECTED;
        }

        if (p > MORE) {

          if (selectedPage < MORE) { // head

            pagesDraw += '<div class="gt_page_dots">...</div>';
            if (p + 1 === pages)
              selected = SELECTED;
            pagesDraw += '<div data-from="' + ((pages - 1) * amount) + '" class="gt_page ' + selected + '">' + pages + '</div>';
            break;
          } else if (selectedPage >= MORE && selectedPage <= pages - MORE) { //middle

            prevPage = selectedPage - 1;
            nextPage = selectedPage + 1;

            // erase everything - construct new
            pagesDraw = '<div data-from="0" class="gt_page">1</div>'; // 1st
            pagesDraw += '<div class="gt_page_dots">...</div>';

            prevFrom = (selectedPage - 2) * amount;
            nextFrom = (selectedPage) * amount;

            pagesDraw += '<div data-from="' + prevFrom + '" class="gt_page">' + (selectedPage - 1) + '</div>'; // prev
            pagesDraw += '<div data-from="' + ((selectedPage - 1) * amount) + '" class="gt_page selected">' + selectedPage + '</div>'; // current
            pagesDraw += '<div data-from="' + nextFrom + '" class="gt_page">' + (selectedPage + 1) + '</div>'; // next

            pagesDraw += '<div class="gt_page_dots">...</div>';
            pagesDraw += '<div data-from="' + ((pages - 1) * amount) + '" class="gt_page">' + pages + '</div>'; // last

            break;
          } else if (selectedPage > tail) { // tail

            pagesDraw = '<div data-from="0" class="gt_page">1</div>'; // 1st
            pagesDraw += '<div class="gt_page_dots">...</div>';

            for (var i = tail - 1; i < pages; ++i) {
              var from = i * amount;

              var prevPage = i - 1, nextPage = i + 1;

              if (selectedPage === nextPage) {
                prevFrom = prevPage * amount;
                if (prevPage < 0)
                  prevFrom = (pages - 1) * amount;

                nextFrom = nextPage * amount;
                if (nextPage === pages)
                  nextFrom = 0;

                selected = SELECTED;
              }

              pagesDraw += '<div data-from="' + from + '" class="gt_page ' + selected + '">' + (i + 1) + '</div>';
              selected = '';
            }
            break;
          }
        } else {
          if (selectedPage === nextPage)
            selected = SELECTED;
          pagesDraw += '<div data-from="' + from + '" class="gt_page ' + selected + '">' + nextPage + '</div>';
        }

        selected = '';
      }

      return '<div class="gt_pagn"><div data-from="' + prevFrom + '" class="gt_page prev">' + language.prev + '</div>'
              + pagesDraw + '<div data-from="' + nextFrom + '" class="gt_page next">' + language.next + '</div></div>';

    }

    /**
     * This method like setTableRows, but without revamp all elements of a page - only rows for sorting
     * @param {object} sets
     * @param {object} json
     * @returns {undefined}
     */

    function setTableSort(sets, json) { // without recreation of all structure
      var tBody = '', jsonStruct = json;
      var rows = parseInt(sets.defaultPerPage) + parseInt(sets.fromRow);
//      console.log('rows' + rows + ', from ' + sets.fromRow);
//      console.log(jsonStruct);

      var rows = 0;
      if (jsonStruct.length > sets.defaultPerPage) {
        rows = parseInt(sets.defaultPerPage) + parseInt(sets.fromRow);
      } else {
        rows = jsonStruct.length;
      }

      // get active ids to highlight and activate rows after diff opts
      var trsActive = settings.tbody.find('tr.active');
      var trActives = [];

      if (typeof trsActive !== UNDEFINED) {
        trsActive.each(function () {
          var tra = $(this).attr('gte-row-id');
          trActives[tra] = tra;
        });
      }

      for (var tr = sets.fromRow; tr < rows; ++tr) {
        var rowId = 0, active = '';
        if (typeof jsonStruct[tr]['GT_RowId'] !== UNDEFINED) {
          rowId = jsonStruct[tr]['GT_RowId'];
        } else if (typeof jsonStruct[tr]['id'] !== UNDEFINED) {
          rowId = jsonStruct[tr]['id'];
        } else {
          console.error('You have neither "GT_RowId" nor "id" in json structure.');
          return;
        }

        if (trActives.length > 0 && typeof trActives[rowId] !== UNDEFINED)
          active = 'active';

        tBody += '<tr class="' + active + '" gte-row-id="' + rowId + '">';
        var colOpts = settings.columnOpts, setColumns = sets.columns;
        if (colOpts.length > 0) {
          var col = 0, content = '';
          for (var colIdx in setColumns) {
            var td = setColumns[colIdx].data;
            if (td !== 'GT_RowId' && invisibleCols[td] === true) {
              content = jsonStruct[tr][td];
              for (var k in colOpts) {
                if (typeof colOpts[k].render !== UNDEFINED && colOpts[k].target === col) { // got some render user defined func
                  var row = {
                    id: rowId
                  };
                  var type = 'string';
                  content = colOpts[k].render(content, row, type);
                }
              }
              tBody += '<td data-name="' + td + '">' + content + '</td>';
            }
            ++col;
          }
        } else {
          for (var colIdx in setColumns) {
            var td = setColumns[colIdx].data;
            if (td !== 'GT_RowId' && invisibleCols[td] === true) {
              tBody += '<td data-name="' + td + '">' + jsonStruct[tr][td] + '</td>';
            }
          }
        }
        tBody += '</tr>';
      }
      sets.tbody.html(tBody);

      // clear timeouts
      clearTimeout(sortTimeout);
      setSelectRows(sets, 1);
    }

    // helpers
    function setTableRows(sets, json, jsonSearch) {
      var tBody = '', jsonStruct = json;
      if (typeof jsonSearch !== UNDEFINED) {
        jsonStruct = jsonSearch;
      }

      var rows = 0;
      if (jsonStruct.length > sets.defaultPerPage) {
        rows = parseInt(sets.defaultPerPage) + parseInt(sets.fromRow);
      } else {
        rows = jsonStruct.length;
      }

      // get active ids to highlight and activate rows after diff opts
      var trsActive = settings.tbody.find('tr.active');
      var trActives = [];
      if (typeof trsActive !== UNDEFINED) {
        trsActive.each(function () {
          var tra = $(this).attr('gte-row-id');
          trActives[tra] = tra;
        });
      }
//      console.log(jsonStruct + ' ' + rows + ' ' + sets.fromRow);
      for (var tr = sets.fromRow; tr <= rows - 1 && (typeof jsonStruct[tr] !== UNDEFINED); tr++) {
        var rowId = 0, active = '';
        if (typeof jsonStruct[tr]['GT_RowId'] !== UNDEFINED) {
          rowId = jsonStruct[tr]['GT_RowId'];
        } else if (typeof jsonStruct[tr]['id'] !== UNDEFINED) {
          rowId = jsonStruct[tr]['id'];
        } else {
          console.error('You have neither "GT_RowId" nor "id" in json structure.');
          return;
        }

        if (trActives.length > 0 && typeof trActives[rowId] !== UNDEFINED) {
          active = 'active';
        }
        tBody += '<tr class="' + active + '" gte-row-id="' + rowId + '">';
        var colOpts = settings.columnOpts, setColumns = sets.columns;
        if (colOpts.length > 0) {
          var col = 0, content = '';
          for (var colIdx in setColumns) {
            var td = setColumns[colIdx].data;
            if (td !== 'GT_RowId' && invisibleCols[td] === true) {
              content = jsonStruct[tr][td];
              for (var k in colOpts) {
                if (typeof colOpts[k].render !== UNDEFINED && colOpts[k].target === col) { // got some render user defined func
                  var row = {
                    id: rowId
                  };
                  var type = 'string';
                  content = colOpts[k].render(content, row, type);
                }
              }
              tBody += '<td data-name="' + td + '">' + content + '</td>';
            }
            ++col;
          }
        } else {
          for (var colIdx in setColumns) {
            var td = setColumns[colIdx].data;
            if (td !== 'GT_RowId' && invisibleCols[td] === true) {
              tBody += '<td data-name="' + td + '">' + jsonStruct[tr][td] + '</td>';
            }
          }
        }
        tBody += '</tr>';
      }
      sets.tbody.html(tBody);
      // clear timeouts      
      clearTimeout(searchTimeout);

      setSelectRows(sets, 0);
      setPagination(sets, json); // depends on per page select, search and sorts
      setPgnSelect(settings, json);
      // @warning - avoids recursive set of events
      if (searchSet === 0) {
        setSearch(settings, json);
        searchSet = 1;
      }
      if (discreteSearchSet === 0) {
        setDiscreteSearch(settings, json);
        discreteSearchSet = 1;
      }
    }

    function setEditBtn(btnObj) {
      var editorObj = settings.tableOpts.buttons[0].editor, buttons = settings.tableOpts.buttons;
      btnObj.removeClass('gte_btn_disabled');
      btnObj.off('click');

      btnObj.click(function () {
        triggerCustomFunc(buttons, 'editor_edit', 1);
        editorObj.triggerPopupEdit(settings);
        var popup = settings.container.find('.gte_editor_popup');
        popup.find('.gte_editor_title').text(language.gte_editor_popupheader_edit);
        popup.find('#gte_sent_btn').text(language.gte_editor_sendbtn_update);
        triggerCustomFunc(buttons, 'editor_edit', 0);
      });
    }

    function setDeleteBtn(btnObj) {
      var editorObj = settings.tableOpts.buttons[0].editor, buttons = settings.tableOpts.buttons;
      btnObj.removeClass('gte_btn_disabled');
      btnObj.off('click'); // avoid previous set with ex.: 1 row seelcted and then >= 2

      btnObj.click(function () {
        triggerCustomFunc(buttons, 'editor_remove', 1);
        editorObj.triggerPopupDelete(settings);
        var popup = settings.container.find('.gte_editor_popup');
        popup.find('.gte_editor_title').text(language.gte_editor_popupheader_delete);
        popup.find('#gte_sent_btn').text(language.gte_editor_sendbtn_delete);

        var rowsToDelete = '';
        var cntRows = 0;
        settings.tbody.find('tr.active').each(function () {
          rowsToDelete += '<input type="hidden" name="ids[]" value="' + $(this).attr('gte-row-id') + '"/>';
          ++cntRows;
        });
//          console.log(rowsToDelete);

        popup.find('#gte_msg').html('Are You sure You wish to delete ' + cntRows + ' rows?');
        popup.find('#gte_ids').html(rowsToDelete);
        triggerCustomFunc(buttons, 'editor_remove', 0);
      });
    }

    function unsetEditBtn(btnObj) {
      btnObj.addClass('gte_btn_disabled');
      btnObj.off('click');
    }

    function unsetDeleteBtn(btnObj) {
      btnObj.addClass('gte_btn_disabled');
      btnObj.off('click');
    }

    function setSelectRows(settings, isSet) {
      if (isSet) { // than reset
        settings.tbody.children().removeClass('even').removeClass('odd');
        settings.tbody.children().off('click');
      } else {
        $(document).keydown(function (event) {
          if (event.which === CNTRL_KEY) {
            cntrlPressed = true;
          }
          if (event.which === SHIFT_KEY) {
            shiftPressed = true;
          }
        });

        $(document).keyup(function () {
          cntrlPressed = false;
          shiftPressed = false;
        });
      }

      settings.tbody.children(':even').addClass('even');
      settings.tbody.children(':odd').addClass('odd');

      var cntrlPressed = false,
              shiftPressed = false;

      settings.tbody.children().click(function () {
        var trClicked = $(this), trs = trClicked.siblings();
        if (cntrlPressed === false && shiftPressed === false) {
          if (trClicked.hasClass('active')) { // 
            trClicked.removeClass('active');
          } else {
            that.find('tbody tr.active').removeClass('active');
            trClicked.addClass('active');
          }
        } else {
          if (cntrlPressed) {
            if (trClicked.hasClass('active')) { // 
              trClicked.removeClass('active');
            } else {
//            that.find('tbody tr.active').removeClass('active');
              trClicked.addClass('active');
            }
          } else if (shiftPressed) {
//            $('html').addClass('unselectable');

            var prev = trClicked.siblings('.active:first'),
                    next = trClicked.siblings('.active:last');

            var prevIdx = prev.index(), nextIdx = next.index(), curIdx = trClicked.index();
//            console.log(next + '  ' +prev);
            trClicked.addClass('active');
            if (nextIdx === prevIdx) { // selected 1 row before
//              console.log(curIdx + ' ' + nextIdx);
              if (nextIdx > curIdx) {
//                console.log(trs);
                trs.each(function () {
                  var tr = $(this),
                          idx = tr.index();
//                  console.log(idx);
                  if (idx > curIdx && idx < nextIdx) {
                    tr.addClass('active');
                  }
                });

              } else {
                trs.each(function () {
                  var tr = $(this), idx = tr.index();
                  if (idx < curIdx && idx > nextIdx) {
                    tr.addClass('active');
                  }
                });

              }
            } else { // selected several and then pressed shift+click need to select rows inclusive nearest
              var diff1 = Math.abs(curIdx - prevIdx);
              var diff2 = Math.abs(curIdx - nextIdx);

              if (diff1 <= diff2) {
                trs.each(function () {
                  var tr = $(this), idx = tr.index();
                  if (idx < curIdx && idx > prevIdx) { // fill active from top to current
                    tr.addClass('active');
                  }
                });
              } else {
                trs.each(function () {
                  var tr = $(this), idx = tr.index();
                  if (idx > curIdx && idx < nextIdx) { // fill active from bottom to current
                    tr.addClass('active');
                  }
                });
              }
            }
          }
        }

        var cntActive = (trClicked.hasClass('active')) ? 1 : 0;
        trs.each(function () {
          if ($(this).hasClass('active')) {
            ++cntActive;
          }
        });

        var editBtn = settings.container.find('.gte_button.edit'),
                deleteBtn = settings.container.find('.gte_button.remove');
        if (cntActive === 1) {
          setEditBtn(editBtn);
          setDeleteBtn(deleteBtn);
        } else {
          unsetEditBtn(editBtn);
          if (cntActive === 0) {
            unsetDeleteBtn(deleteBtn);
          } else {
            setDeleteBtn(deleteBtn);
          }
        }
      });
    }

    function setPagination(settings, json) {
      if (settings.struct.pagination.length > 0) {
        var pagination = settings.container.find('.gt_pagination');
        var rows = json.length, amount = parseInt(settings.defaultPerPage),
                pages = Math.ceil(rows / amount);
        var fromRow = settings.fromRow ? parseInt(settings.fromRow) : 0;
        var pagesDraw = drawPagnButtons(pages, fromRow, amount, pagination);

        pagination.remove();

        var pagesDrawContainer = '<div class="gt_pagination"><div class="gt_pgn_ttl">' + language.showing + ' ' + (fromRow + 1) + ' ' + language.to + ' '
                + (fromRow + amount) + ' ' + language.of + ' ' + rows + ' ' + language.entries + '. </div><div class="gt_pgn_pages">'
                + pagesDraw + '</div><div class="clear"></div></div>';

        if (settings.struct.pagination.indexOf('top') !== -1) {
          settings.headTools.after(pagesDrawContainer);
        }

        if (settings.struct.pagination.indexOf('bottom') !== -1) {
          settings.footTools.before(pagesDrawContainer);
        }
        // set event on every page btn
        settings.container.find('.gt_page').click(function () {
          var pageObj = $(this);
          settings.fromRow = parseInt(pageObj.attr('data-from'));
          setTableRows(settings, json);
        });
      }
    }

    var thead = that.children(":first"),
            tfoot = that.children(":last"),
            headThs = thead.children().children(),
            footThs = tfoot.children().children();

    var cntCols = headThs.length;

    // constructing container
    that.wrap('<div class="gt_container"></div>');


    var container = that.parent().parent().find('.gt_container').prepend('<div class="gt_head_tools"></div>'),
            headTools = that.parent().parent().find('.gt_head_tools');

    container.append('<div class="gt_foot_tools"></div>');
    var footTools = container.find('.gt_foot_tools');

    // onstruct from struct
    if (settings.struct.rowsSelector.length > 0) {

      var options = language.show + ' <select class="gt_select" name="per_page_rows">';

      for (var k in settings.perPageRows) {

        var rows = settings.perPageRows[k];

        options += '<option ' + ((settings.defaultPerPage === rows) ? 'selected=""' : '') + ' value="' + rows + '">' + rows + '</option>';

      }

      options += '</select> ' + language.entries;
//      console.log(options);
//      console.log(settings.struct.rowsSelector.indexOf('topss'));
      if (settings.struct.rowsSelector.indexOf('top') !== -1) {

        headTools.append('<div class="gt_rows_selector">' + options + '</div>');
      }

      if (settings.struct.rowsSelector.indexOf('bottom') !== -1) {

        footTools.append('<div class="gt_rows_selector">' + options + '</div>');

      }

    }

    if (settings.struct.search.length > 0) {
      headTools.append('<div class="gt_main_search"><input type="text" class="gt_search" value="" placeholder="' + language.search + '" /></div>');
    }

    headTools.append('<div class="clear"></div>');
    footTools.append('<div class="clear"></div>');

    // css classes adding
    that.addClass('gigatable');
    thead.addClass('gt_head');
    tfoot.addClass('gt_foot');

    thead.after('<tbody class="gt_body"><tr><td class="gt_loader" colspan="' + cntCols + '">Loading...</td></tr></tbody>');

    // set additional opts
    settings.thead = thead;
    settings.tbody = thead.next();
    settings.tfoot = tfoot;
    settings.headThs = headThs;
    settings.cntCols = cntCols;
    settings.headTools = headTools;
    settings.footTools = footTools;
    settings.container = container;
    settings.fromRow = 0;

    $.ajax({
      url: settings.ajax,
      type: 'GET',
      dataType: 'json'
    }).done(function (data) {
      json = data['rows'] ? data['rows'] : data['row']; // one row or several
//      console.log(Object.keys(json[0]).length + ' ' +cntCols);
      if (typeof json === UNDEFINED) {
        console.error('Put json into rows or row associative key!');
        return false;
      }
//      console.log(Object.keys(json[0]).length);
//      console.log(cntCols + ' ' + Object.keys(json[0]).length);
      //@fixme - we do not need to check it here, coz we assign columns by value
      /*if (json[0] !== null && (Object.keys(json[0]).length !== cntCols && Object.keys(json[0]).length !== cntCols + 1) // +1 is the room for GT_RowId
       || (json[0] === null) && json !== null && Object.keys(json).length !== cntCols) { // rows
       console.error('You ought to adjust columns in thead and tfoot tags to json output!');
       return false;
       }*/

      var ths = container.find('th'); // ths in this particular container

      ths.each(function () { // set for each th default sort opts except excluded 
        var th = $(this), idx = th.index();
        if (settings.columns[idx].sortable !== false) {
          th.addClass('sorting');
        }
        if (settings.columns[idx].visible === false) {
          th.hide();
          invisibleCols[settings.columns[idx].data] = false;
        } else {
          invisibleCols[settings.columns[idx].data] = true;
        }

        if (settings.columns[idx].searchable === false) {
          unsearchableCols[settings.columns[idx].data] = false;
        } else {
          unsearchableCols[settings.columns[idx].data] = true;
        }
      });

      tfoot.find('th').each(function () {
        var th = $(this), idx = th.index();
        if (settings.columns[idx].discreteSearch === true) {
          var val = 'Search in ' + th.text();

          if (typeof settings.columns[idx].discreteSearchValue !== UNDEFINED) {
            val = settings.columns[idx].discreteSearchValue(th.text());
            th.removeClass('sorting');
          }
          th.html('<input type="text" placeholder="' + val + '" />')
        }
      });
      setTableRows(settings, json);
      setSort(settings, json);

      if (settings.tableOpts.buttons.length > 0) {
        setButtons(settings);
      }
      // get ready structure 
      var tableWidth = that.width();
      container.css('width', (tableWidth + 40) + 'px');
    });
    return this;
  };
}(jQuery));