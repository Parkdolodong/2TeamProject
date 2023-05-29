var currentPage = 0; // 현재 페이지 변수를 추가합니다.
var page = 0;
var categoryId = "all";
var search = "";
$(document).ready(function () {
    // 페이지 로드 시 게시글 목록을 비동기적으로 가져오는 함수 호출
    loadArticles(page, categoryId, search); // 초기 페이지를 0으로 설정

    // 탭 클릭 이벤트 처리
    $(".list-group-item").on("click", function () {
        categoryId = $(this).attr("id"); // 클릭한 탭의 id를 가져옴
        var categoryData = $(this).text(); // 클릭한 탭의 텍스트를 가져옴'
        var href = $(this).attr("href");

        // 선택된 탭 표시
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");

        var tabContent = $(".tab-content");
        tabContent.empty();

        var tabPane = $('<div class="tab-pane fade show active"></div>');
        tabPane.attr('id', href);
        var h1 = $('<h1 class="h3 mb-3 fw-normal"></h1>').text(categoryData);
        tabPane.append(h1);
        tabContent.append(tabPane);

        // 게시글 목록 로드
        loadArticles(page, categoryId, search);
    });

    $("#search").on("input", function() {
        search = $(this).val();

        // 게시글 목록 로드
        loadArticles(page, categoryId, search);
    });
    
    $(document).on('change', '#flexRadioDefault1', function () {
        var isChecked = $(this).prop('checked');
        // 모든 체크 박스들의 상태 변경
        $('#article-list input[type="checkbox"]').prop('checked', isChecked);
        var checkedValues = getCheckedValues();
    });

    $(document).on("click", "#deleteBtn", function() {
        var confirmDelete = confirm("정말 삭제하시겠습니까?");
        if(confirmDelete) {
            var checkedValues = getCheckedValues();
            console.log(checkedValues);
            if(checkedValues != null && checkedValues.length != 0){
                console.log(checkedValues);
                $.ajax({
                    url:"/profile/my-writing/delete",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json", // JSON 형식으로 데이터 전송
                    data: JSON.stringify(checkedValues), // JSON 데이터로 변환하여 전송
                    success: function (response) {
                        // 삭제 성공 시 처리하는 로직
                        console.log('삭제되었습니다.');
                        console.log(response);
                        // 추가적인 처리 로직을 구현하거나 페이지를 새로고침할 수 있습니다.
                    },
                    error: function (xhr) {
                        // 요청이 실패했을 때 처리하는 로직
                        console.error(xhr.responseText);
                    }
                });
            } else{
                console.log('삭제할 글을 선택해주세요.');
            }
        }
    });

});

function loadArticles(page, categoryId, search) {
    $.ajax({
        url: '/profile/my-writing/update', // 게시글 목록을 가져올 API 엔드포인트의 URL
        type: 'GET',
        data: {
            page: page,
            categoryId:categoryId,
            search: search
        },
        success: function (response) {
            // 성공적으로 응답을 받았을 때 처리하는 로직
            // 서버에서 받은 데이터를 사용하여 게시글 목록을 업데이트하는 등의 작업을 수행
            updateArticleList(response.content); // response를 사용하여 게시글 목록 업데이트
            updatePagination(page, response.totalPages); // 페이지네이션 업데이트
        },
        error: function (xhr) {
            // 요청이 실패했을 때 처리하는 로직
            console.error(xhr.responseText);
        }
    });
}

function updateArticleList(boardList) {
    var tbody = $("#article-list");
    var thead = $("#table-contents");
    tbody.empty();
    thead.empty();
        // 헤더 행 추가
    var headerRow = $('<tr></tr>');
    headerRow.append($('<th scope="col"><input class="form-check-input" type="checkbox" name="flexRadioDefault" id="flexRadioDefault1"></th>'));
    headerRow.append($('<th scope="col">No.</th>'));
    headerRow.append($('<th scope="col">카테고리</th>'));
    headerRow.append($('<th scope="col">제목</th>'));
    headerRow.append($('<th scope="col">조회수</th>'));
    headerRow.append($('<th scope="col">작성날짜</th>'));
    thead.append(headerRow);
    
    for (var i = 0; i < boardList.length; i++) {
        (function () {
            var board = boardList[i];
            var board_idx = board.board_idx;
            var row = $('<tr></tr>');
            var checkbox = $('<input>').attr({
                'type': 'checkbox',
                'name': 'board-checkbox',
                'value': board.board_idx,
                'class': 'checkbox-css' // CSS class for the checkbox
            });
            var checkboxCell = $('<th></th>').append(checkbox);
            row.append(checkboxCell);
            row.append($('<td></td>').text(board.memberDto.nick));
            row.append($('<td></td>').text(board.category));
            if (board.boardType == "NOTICE") {
                row.append($('<td></td>').html('<strong>' + board.title + '</strong>').css({
                    'max-width': '100px',
                    'white-space': 'nowrap',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis'
                }));
            } else {
                row.append($('<td></td>').text(board.title).css({
                    'max-width': '100px',
                    'white-space': 'nowrap',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis'
                }));
            }
            row.append($('<td></td>').text(board.count));
            row.append($('<td></td>').text(moment(board.regTime).format('YYYY-MM-DD HH:mm')));

            // 클릭 이벤트 처리
            row.find('td:not(:first-child)').click(function () {
                // 페이지 이동
                window.location.href = "/board/detail?board_idx=" + board_idx;
            });

            // 체크 박스 클릭 이벤트 처리
            checkbox.on('click', function () {
                var checkedValues = getCheckedValues(); // getCheckedValues 함수를 호출하여 선택된 값들을 가져옵니다.
            });

            tbody.append(row);
        })();
    }
}

function updatePagination(page, totalPages) {
    var pagination = $('.pagination');
    pagination.empty();

    var maxPageButtons = 5; // 최대 페이지 버튼 수를 설정합니다.
    var startPage = Math.max(page - Math.floor(maxPageButtons / 2), 0);
    var endPage = Math.min(startPage + maxPageButtons - 1, totalPages - 1); // endPage 값을 수정합니다.
  
    // Previous Page Button
    var previousButton = $('<li class="page-item"><a class="page-link" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>');
    previousButton.on('click', function() {
      if (currentPage > 0) {
        currentPage -= 5; // 이전 페이지로 이동하는 경우 5페이지씩 감소시킵니다.
        loadArticles(currentPage, categoryId, search);
      }
    });
    pagination.append(previousButton);

    // Page Buttons
    for (var i = startPage; i <= endPage; i++) {
        (function (page) {
            var pageNumber = page + 1;
            var pageButton = $('<li class="page-item"><a class="page-link"></a></li>');
            pageButton.find('.page-link').text(pageNumber).attr('data-page', page).on('click', function () {
                var clickedPage = parseInt($(this).attr('data-page'));
                loadArticles(clickedPage, categoryId, search);
            });
            pagination.append(pageButton);
        })(i);
    }

    // Next Page Button
    var nextButton = $('<li class="page-item"><a class="page-link" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>');
    nextButton.on('click', function () {
        if (currentPage + maxPageButtons < totalPages) {
            currentPage += 5; // 다음 페이지로 이동하는 경우 5페이지씩 증가시킵니다.
            loadArticles(currentPage, categoryId, search);
        }
    });
    pagination.append(nextButton);
}

function getCheckedValues() {
    var checkedValues = [];
    $('#article-list input[type="checkbox"]:checked').each(function () {
        checkedValues.push(parseInt($(this).val()));
    });
    return checkedValues;
}