/**
 * @typedef {object} PathItem
 * @property {"Dir"|"SymlinkDir"|"File"|"SymlinkFile"} path_type
 * @property {string} name
 * @property {number} mtime
 * @property {number} size
 */

/**
 * @typedef {object} DATA
 * @property {string} href
 * @property {string} uri_prefix
 * @property {"Index" | "Edit" | "View"} kind
 * @property {PathItem[]} paths
 * @property {boolean} allow_upload
 * @property {boolean} allow_delete
 * @property {boolean} allow_search
 * @property {boolean} allow_archive
 * @property {boolean} auth
 * @property {string} user
 * @property {boolean} dir_exists
 * @property {string} editable
 */

var DUFS_MAX_UPLOADINGS = 1;

/**
 * @type {DATA} DATA
 */
var DATA;

/**
 * @type {PARAMS}
 * @typedef {object} PARAMS
 * @property {string} q
 * @property {string} sort
 * @property {string} order
 */
const PARAMS = Object.fromEntries(new URLSearchParams(window.location.search).entries());

const IFRAME_FORMATS = [
  ".pdf",
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg",
  ".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm",
  ".mp3", ".ogg", ".wav", ".m4a",
];

const dirEmptyNote = PARAMS.q ? 'No results' : DATA.dir_exists ? 'Empty folder' : 'Folder will be created when a file is uploaded';

const ICONS = {
  dir: `<svg height="16" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"></path></svg>`,
  symlinkFile: `<svg height="16" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M8.5 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V4.5L8.5 1zM11 14H1V2h7l3 3v9zM6 4.5l4 3-4 3v-2c-.98-.02-1.84.22-2.55.7-.71.48-1.19 1.25-1.45 2.3.02-1.64.39-2.88 1.13-3.73.73-.84 1.69-1.27 2.88-1.27v-2H6z"></path></svg>`,
  symlinkDir: `<svg height="16" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM1 3h5v1H1V3zm6 9v-2c-.98-.02-1.84.22-2.55.7-.71.48-1.19 1.25-1.45 2.3.02-1.64.39-2.88 1.13-3.73C4.86 8.43 5.82 8 7.01 8V6l4 3-4 3H7z"></path></svg>`,
  file: `<svg height="16" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>`,
  move: `<svg width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`,
  delete: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/></svg>`,
  view: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M 6 4 H 2 V 3 h 4 v 1 z M 2 7 h 7 V 6 H 2 v 1 z m 0 2 h 7 V 8 H 2 v 1 z m 0 2 h 7 v -1 H 2 v 1 z m 9 -7 v 8 C 11 12 11 13 10 13 H 1 c -0.6 0 -1 -0.5 -1 -1 V 2 c 0 -0.6 0.5 -1 1 -1 h 9 C 11 1 11 2 11 2 z M 10 4 L 10 2 H 1 v 10 h 9 V 4 m 3 0 L 13 14 C 13 14 13 15 12 15 L 3 15 C 3 15 2 15 2 14 L 2 13 L 3 13 L 3 14 L 12 14 L 12 4 L 11 4 L 11 3 L 12 3 C 12 3 13 3 13 4" /></svg>`,
}

/**
 * @type Map<string, Uploader>
 */
const failUploaders = new Map();

/**
 * @type Element
 */
let $pathsTable;
/**
 * @type Element
 */
let $pathsTableHead;
/**
 * @type Element
 */
let $pathsTableBody;
/**
 * @type Element
 */
let $uploadersTable;
/**
 * @type Element
 */
let $emptyFolder;
/**
 * @type Element
 */
let $editor;
/**
 * @type Element
 */
let $userBtn;
/**
 * @type Element
 */
let $userName;

// let mylog = console.log;
let mylog = () => { };

function ready() {
  $pathsTable = document.querySelector(".paths-table")
  $pathsTableHead = document.querySelector(".paths-table thead");
  $pathsTableBody = document.querySelector(".paths-table tbody");
  $uploadersTable = document.querySelector(".uploaders-table");
  $emptyFolder = document.querySelector(".empty-folder");
  $editor = document.querySelector(".editor");
  $userBtn = document.querySelector(".user-btn");
  $userName = document.querySelector(".user-name");

  addBreadcrumb(DATA.href, DATA.uri_prefix);

  if (DATA.kind == "Index") {
    document.title = `Index of ${DATA.href} - Dufs`;
    document.querySelector(".index-page").classList.remove("hidden");

    setupIndexPage();

  } else if (DATA.kind == "Edit") {
    document.title = `Edit ${DATA.href} - Dufs`;
    document.querySelector(".editor-page").classList.remove("hidden");;

    setupEditorPage();

  } else if (DATA.kind == "View") {
    document.title = `View ${DATA.href} - Dufs`;
    document.querySelector(".editor-page").classList.remove("hidden");;

    setupEditorPage();
  }
}


class Uploader {
  /**
  *
  * @param {File} file
  * @param {string[]} pathParts
  */
  constructor(file, pathParts) {
    /**
     * @type Element
     */
    this.$uploadStatus = null
    this.uploaded = 0;
    this.uploadOffset = 0;
    this.lastUptime = 0;
    this.name = [...pathParts, file.name].join("/");
    this.idx = Uploader.globalIdx++;
    this.file = file;
    this.url = newUrl(this.name);
  }

  upload() {
    const { idx, name, url } = this;
    const encodedName = encodedStr(name);
    $uploadersTable.insertAdjacentHTML("beforeend", `
  <tr id="upload${idx}" class="uploader">
    <td class="path cell-icon">
      ${getPathSvg()}
    </td>
    <td class="path cell-name">
      <a href="${url}">${encodedName}</a>
    </td>
    <td class="cell-status upload-status" id="uploadStatus${idx}"></td>
  </tr>`);
    $uploadersTable.classList.remove("hidden");
    $emptyFolder.classList.add("hidden");
    this.$uploadStatus = document.getElementById(`uploadStatus${idx}`);
    this.$uploadStatus.innerHTML = '-';
    this.$uploadStatus.addEventListener("click", e => {
      const nodeId = e.target.id;
      const matches = /^retry(\d+)$/.exec(nodeId);
      if (matches) {
        const id = parseInt(matches[1]);
        let uploader = failUploaders.get(id);
        if (uploader) uploader.retry();
      }
    });
    Uploader.queues.push(this);
    Uploader.runQueue();
  }

  ajax() {
    const { url } = this;

    this.uploaded = 0;
    this.lastUptime = Date.now();

    const ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", e => this.progress(e), false);
    ajax.addEventListener("readystatechange", () => {
      if (ajax.readyState === 4) {
        if (ajax.status >= 200 && ajax.status < 300) {
          this.complete();
        } else {
          if (ajax.status != 0) {
            this.fail(`${ajax.status} ${ajax.statusText}`);
          }
        }
      }
    })
    ajax.addEventListener("error", () => this.fail(), false);
    ajax.addEventListener("abort", () => this.fail(), false);
    if (this.uploadOffset > 0) {
      ajax.open("PATCH", url);
      ajax.setRequestHeader("X-Update-Range", "append");
      ajax.send(this.file.slice(this.uploadOffset));
    } else {
      ajax.open("PUT", url);
      ajax.send(this.file);
      // setTimeout(() => ajax.abort(), 3000);
    }
  }

  async retry() {
    const { url } = this;
    let res = await fetch(url, {
      method: "HEAD",
    });
    let uploadOffset = 0;
    if (res.status == 200) {
      let value = res.headers.get("content-length");
      uploadOffset = parseInt(value) || 0;
    }
    this.uploadOffset = uploadOffset;
    this.ajax()
  }

  progress(event) {
    const now = Date.now();
    const speed = (event.loaded - this.uploaded) / (now - this.lastUptime) * 1000;
    const [speedValue, speedUnit] = formatSize(speed);
    const speedText = `${speedValue} ${speedUnit}/s`;
    const progress = formatPercent(((event.loaded + this.uploadOffset) / this.file.size) * 100);
    const duration = formatDuration((event.total - event.loaded) / speed)
    this.$uploadStatus.innerHTML = `<span style="width: 80px;">${speedText}</span><span>${progress} ${duration}</span>`;
    this.uploaded = event.loaded;
    this.lastUptime = now;
  }

  complete() {
    const $uploadStatusNew = this.$uploadStatus.cloneNode(true);
    $uploadStatusNew.innerHTML = `✓`;
    this.$uploadStatus.parentNode.replaceChild($uploadStatusNew, this.$uploadStatus);
    this.$uploadStatus = null;
    failUploaders.delete(this.idx);
    Uploader.runnings--;
    Uploader.runQueue();
  }

  fail(reason = "") {
    this.$uploadStatus.innerHTML = `<span style="width: 20px;" title="${reason}">✗</span><span class="retry-btn" id="retry${this.idx}" title="重试">↻</span>`;
    failUploaders.set(this.idx, this);
    Uploader.runnings--;
    Uploader.runQueue();
  }
}

Uploader.globalIdx = 0;

Uploader.runnings = 0;

Uploader.auth = false;

/**
 * @type Uploader[]
 */
Uploader.queues = [];


Uploader.runQueue = async () => {
  if (Uploader.runnings >= DUFS_MAX_UPLOADINGS) return;
  if (Uploader.queues.length == 0) return;
  Uploader.runnings++;
  let uploader = Uploader.queues.shift();
  if (!Uploader.auth) {
    Uploader.auth = true;
    try {
      await checkAuth()
    } catch {
      Uploader.auth = false;
    }
  }
  uploader.ajax();
}

/**
 * Add breadcrumb
 * @param {string} href
 * @param {string} uri_prefix
 */
function addBreadcrumb(href, uri_prefix) {
  const $breadcrumb = document.querySelector(".breadcrumb");
  let parts = [];
  if (href === "/") {
    parts = [""];
  } else {
    parts = href.split("/");
  }
  const len = parts.length;
  let path = uri_prefix;
  for (let i = 0; i < len; i++) {
    const name = parts[i];
    if (i > 0) {
      if (!path.endsWith("/")) {
        path += "/";
      }
      path += encodeURIComponent(name);
    }
    const encodedName = encodedStr(i === 1 ? "root" : name);
    if (i === 0) {
      // $breadcrumb.insertAdjacentHTML("beforeend", `<a href="${path}" title="Root"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/></svg></a>`);
    } else if (i === len - 1) {
      $breadcrumb.insertAdjacentHTML("beforeend", `<b>${encodedName}</b>`);
    } else {
      $breadcrumb.insertAdjacentHTML("beforeend", `<a href="${path}">${encodedName}</a>`);
    }
    if (i !== len - 1) {
      $breadcrumb.insertAdjacentHTML("beforeend", `<span class="separator">/</span>`);
    }
  }
}

function setupIndexPage() {
  const hints = document.querySelector("#operationHints")
  // hints.textContent = "单击选中，双击打开，shift + 单击范围选，ctrl/cmd + 单击多选，ESC 取消，右键菜单";
  hints.innerHTML = "单击选中，双击打开，shift + 单击范围选，ctrl/cmd + 单击多选，ESC 取消，右键菜单<br>解压只支持 zip/tar 格式，tar.gz 等不支持，上传文件夹请先压缩，然后上传后解压"
  hints.classList.remove("hidden");

  if (DATA.allow_archive) {
    const $download = document.querySelector(".download");
    $download.href = baseUrl() + "?zip";
    $download.title = "打包并下载";
    $download.classList.remove("hidden");
  }

  if (DATA.allow_upload) {
    setupDropzone();
    setupUploadFile();
    setupNewFolder();
    setupNewFile();
  }

  if (DATA.auth) {
    setupAuth();
  }

  if (DATA.allow_search) {
    setupSearch()
  }

  initBatchOperationButtons();

  renderPathsTableHead();
  renderPathsTableBody();

  monitorIndexPageEvents();
  initFileTree();
}

function initBatchOperationButtons() {
  const batchBtns = document.getElementById('batch-operation-btn');

  const removeButton = document.createElement('button');
  removeButton.classList.add("toolbox-btn-red")
  removeButton.textContent = '批量删除';
  removeButton.addEventListener('click', deleteSelectedItems);
  batchBtns.appendChild(removeButton);

  const batchMoveBtn = document.createElement('button');
  batchMoveBtn.classList.add("toolbox-btn")
  batchMoveBtn.textContent = '批量移动';
  batchMoveBtn.addEventListener('click', moveSelectedItems);
  batchBtns.appendChild(batchMoveBtn);

  const downloadButton = document.createElement('button');
  downloadButton.classList.add("toolbox-btn")
  downloadButton.textContent = '批量下载';
  downloadButton.addEventListener('click', downloadSelectedItems);
  batchBtns.appendChild(downloadButton);
}

/**
 * Toggle multi-item
 * only support delete now
 * @param {*} checkbox
 */
function toggleCheckBox() {
  const checkboxes = document.querySelectorAll('input[name="select[]"]');
  selectedItems.splice(0, selectedItems.length);
  checkboxes.forEach((checkbox, index) => {
    mylog(`checkbox index ${index}, value ${checkbox.checked}`)
    if (checkbox.checked) {
      checkbox.closest('tr').classList.add('selected')
      selectedItems.push(index)
    } else {
      checkbox.closest('tr').classList.remove('selected')
    }
  })
  mylog("toggleCheckBox", selectedItems)
  const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
  const isAllChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
  const selectAllCheckbox = document.querySelector('#selectAllCheckbox');
  updateBatchButtonVisibility();

  if (isAllChecked) {
    selectAllCheckbox.checked = true;
  } else {
    selectAllCheckbox.checked = false;
  }

  if (!isAnyChecked) {
    selectAllCheckbox.checked = false;
  }
}

/**
 * Toggle all checkboxeds based on "Select All" checkbox
 * @param {*} selectAllCheckbox
 */
function toggleSelectAll(selectAllCheckbox) {
  const checkboxes = document.querySelectorAll('input[name="select[]"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
  });
  toggleCheckBox();
  mylog("toggleSelectAll selected items", selectedItems)
}

function deleteSelectedItems() {
  deleteBatchPaths(selectedItems);
}

function downloadSelectedItems() {
  downloadBatchPaths(selectedItems);
}

function moveSelectedItems() {
  mylog("moveSelectedItems", selectedItems)
  moveBatchPaths(selectedItems);
}

/**
 * listen the change of Checkbox `selected`
 */
const selectedItems = [];

function updateSelectedItems(item, isSelected) {
  const index = selectedItems.indexOf(item);
  if (isSelected) {
    // Not in array return -1
    if (index === -1) selectedItems.push(item);
  } else {
    if (index !== -1) selectedItems.splice(index, 1);
  }
  updateBatchButtonVisibility();
};

function monitorIndexPageEvents() {
  const checkboxes = document.querySelectorAll('input[name="select[]"]');
  const selectAllCheckbox = document.querySelector('#selectAllCheckbox');

  // listen to esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      selectAllCheckbox.checked = false;
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      toggleCheckBox();
      cleanContextMenu();
    }
  })

  document.addEventListener('click', function (event) {
    const menu = document.getElementById('customContextMenu');
    const isClickInsideMenu = menu.contains(event.target);
    const isTriggerElement = event.target.classList.contains('context-menu-trigger');

    if (!isClickInsideMenu && !isTriggerElement) {
      cleanContextMenu();
    }
  });
}

function cleanContextMenu() {
  const menu = document.getElementById('customContextMenu');
  menu.innerHTML = ""
  menu.style.display = 'none';
}

function updateBatchButtonVisibility() {
  const batchBtns = document.getElementById('batch-operation-btn');
  if (selectedItems.length > 0) {
    batchBtns.classList.remove('disabled');
  } else {
    batchBtns.classList.add('disabled');
  }
}

/**
 * Render path table thead
 */
function renderPathsTableHead() {
  const headerItems = [
    {
      name: "name",
      props: `colspan="2"`,
      text: "名称",
    },
    {
      name: "mtime",
      props: ``,
      text: "最后修改于",
    },
    {
      name: "size",
      props: ``,
      text: "大小",
    }
  ];
  $pathsTableHead.insertAdjacentHTML("beforeend", `
    <tr>
      <th><input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this)"></th>
      ${headerItems.map(item => {
    let svg = `<svg width="12" height="12" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/></svg>`;
    let order = "desc";
    if (PARAMS.sort === item.name) {
      if (PARAMS.order === "desc") {
        order = "asc";
        svg = `<svg width="12" height="12" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/></svg>`
      } else {
        svg = `<svg width="12" height="12" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/></svg>`
      }
    }
    const qs = new URLSearchParams({ ...PARAMS, order, sort: item.name }).toString();
    const icon = `<span>${svg}</span>`
    return `<th class="cell-${item.name}" ${item.props}><a href="?${qs}">${item.text}${icon}</a></th>`
  }).join("\n")}
    </tr>
  `);
}

/**
 * Render path table tbody
 */
function renderPathsTableBody() {
  if (DATA.paths && DATA.paths.length > 0) {
    const len = DATA.paths.length;
    if (len > 0) {
      $pathsTable.classList.remove("hidden");
    }
    for (let i = 0; i < len; i++) {
      addPath(DATA.paths[i], i);
    }
  } else {
    $emptyFolder.textContent = dirEmptyNote;
    $emptyFolder.classList.remove("hidden");
  }
}

/**
 * Add pathitem
 * @param {PathItem} file
 * @param {number} index
 */
function addPath(file, index) {
  const encodedName = encodedStr(file.name);
  let url = newUrl(file.name)
  let isDir = file.path_type.endsWith("Dir");

  $pathsTableBody.insertAdjacentHTML("beforeend", `
<tr id="addPath${index}">
  <td><input class="hidden" type="checkbox" name="select[]" value="${index}" onchange="toggleCheckBox()"></td>
  <td class="path cell-icon" onclick="clickPathChangeCheckBox(event, ${index})">
    ${getPathSvg(file.path_type)}
  </td>
  <td class="path cell-name nonselect" 
    onclick="clickPathChangeCheckBox(event, ${index})" 
    ondblclick="dblclickPathOpenURL(event, '${index}', '${url}', ${isDir})"
    oncontextmenu="openContextMenu(event, ${index})" 
  >
  ${isDir ? `<a style="text-decoration: none;">${encodedName}</a>` : encodedName}
  </td>
  <td class="cell-mtime nonselect" 
    onclick="clickPathChangeCheckBox(event, ${index})"
    ondblclick="dblclickPathOpenURL(event, '${index}', '${url}', ${isDir})"
    oncontextmenu="openContextMenu(event, ${index})" 
  >
    ${formatMtime(file.mtime)}
  </td>
  <td class="cell-size nonselect" 
    onclick="clickPathChangeCheckBox(event, ${index})"
    ondblclick="dblclickPathOpenURL(event, '${index}', '${url}', ${isDir})"
    oncontextmenu="openContextMenu(event, ${index})" 
  >
    ${isDir ? "- B" : formatSize(file.size).join(" ")}
  </td>
</tr>`)
}

/**
 * 
 * @param {file size} size 
 * @returns time of unzip (statistics based, 5mb/s)
 */
function getUnzipTime(size) {
  const mb = Math.floor(size / 1024 / 1024);
  const millSec = mb * 1000 / 5;
  return millSec
}

async function unzipFile(index) {
  const file = DATA.paths[index];
  let url = newUrl(file.name);
  let output = file.name.replace(/\.zip$/, "");
  if (file.name.endsWith(".zip")) {
    url += "?unzip"
  } else if (file.name.endsWith(".tar")) {
    output = file.name.replace(/\.tar$/, "");
    url += "?untar"
  } else {
    alert("只支持解压 zip/tar 文件");
    return;
  }
  const outputUrl = newUrl(output);
  let progressIndex = 0
  let progress = 0
  try {
    const res1 = await fetch(outputUrl, {
      method: "HEAD",
    })
    if (res1.status === 200) {
      if (!confirm(`解压后文件夹 ${output} 已存在，是否覆盖？`)) {
        return;
      }
    }
    cleanContextMenu();
    document.getElementById('loadingIndicator').style.display = 'flex';
    document.querySelector(".loading-text").textContent = `正在解压中，请勿刷新，当前进度 0%`
    progress = setInterval(() => {
      if (progressIndex < 99) {
        progressIndex += 1;
        document.querySelector(".loading-text").textContent = `正在解压中，请勿刷新，当前进度 ${progressIndex}%`
      } else {
        clearInterval(progress);
      }
    }, getUnzipTime(file.size) / 100);
    const resp2 = await fetch(url)
    await assertResOK(resp2);
    document.getElementById('loadingIndicator').style.display = 'none';
    clearInterval(progress);
    window.location.reload();
  } catch (err) {
    clearInterval(progress);
    alert(`解压文件失败, ${err.message}`);
    document.getElementById('loadingIndicator').style.display = 'none';
  }
}

function openURL(url, newTab = false) {
  cleanContextMenu();
  if (newTab) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

function openContextMenu(e, index) {
  e.preventDefault()
  mylog("openContextMenu", index)

  const file = DATA.paths[index];
  let url = newUrl(file.name)
  let isDir = file.path_type.endsWith("Dir");

  let actionOpen = `<li class="contextMenuItem" onclick="openURL('${isDir ? url : url + "?view"}', ${isDir ? false : true})">打开</li>`;
  let actionDelete = "";
  let actionDownload = "";
  let actionRename = "";
  let actionMove = "";
  let actionEdit = "";
  let actionView = "";
  let actionCopyFile = "";
  let actionDirSize = "";
  let actionUnzip = "";
  let actionCopyPath = `<li class="contextMenuItem" onclick="copyPath(${index})" title="复制路径" target="_blank">复制路径</li>`
  if (isDir) {
    url += "/";
    if (DATA.allow_archive) {
      actionDownload = `
      <li class="contextMenuItem" onclick="openURL('${url}?zip')">打包并下载</li>`;
    }
  } else {
    actionDownload = `
    <li class="contextMenuItem" onclick="openURL('${url}')">下载</li>`;
  }
  if (DATA.allow_delete) {
    if (DATA.allow_upload) {
      actionRename = `<li class="contextMenuItem" onclick="renamePath(${index})" id="renameBtn${index}" title="重命名">重命名</li>`;
      actionMove = `<li class="contextMenuItem" onclick="movePathByFileTree(${index})" id="moveBtn${index}" title="移动">移动</li>`;
      if (!isDir) {
        actionEdit = `<li class="contextMenuItem" onclick="openURL('${url}?edit', true)">编辑</li>`;
        actionCopyFile = `<li class="contextMenuItem" onclick="copyFile(${index})" id="copyFileBtn${index}" title="拷贝">拷贝</li>`;
      }
    }
    actionDelete = `
    <li class="contextMenuItem" onclick="deletePath(${index})" id="deleteBtn${index}" title="删除">删除</li>`;
  }
  if (isDir) {
    actionDirSize = `<li class="contextMenuItem" onclick="calculateDirSize(${index})" id="dirSizeBtn${index}" title="统计文件大小">统计文件大小</li>`;
  } else {
    actionUnzip = `<li class="contextMenuItem" onclick="unzipFile(${index})" id="unzipBtn${index}" title="解压缩">解压 zip/tar 文件</li>`;
  }
  if (!actionEdit && !isDir) {
    actionView = `<li class="contextMenuItem" onclick="openURL('${url}?view', true)">查看</li>`;
  }
  let actions = `
  <ul>
    ${actionOpen}
    ${actionDirSize}
    ${actionDownload}
    ${actionUnzip}
    ${actionView}
    ${actionRename}
    ${actionMove}
    ${actionDelete}
    ${actionEdit}
    ${actionCopyFile}
    ${actionCopyPath}
  </ul>`

  const menus = document.getElementById('customContextMenu');
  menus.innerHTML = `${actions}`
  menus.style.display = 'block';
  menus.style.left = e.pageX + 'px';
  menus.style.top = e.pageY + 'px';

  const selectAllCheckbox = document.querySelector('#selectAllCheckbox');
  selectAllCheckbox.checked = false;
  const checkboxes = document.querySelectorAll('input[name="select[]"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  const checkbox = document.querySelector(`input[name="select[]"][value="${index}"]`);
  checkbox.checked = true
  toggleCheckBox();
  menus.classList.remove('hidden');
}

// key is index, value is timer
const checkBoxTimer = {};

/**
 * 
 * @param {click event} event 
 * @param {index, url, idDir} openURLObj 
 */
function dblclickPathOpenURL(event, index, url, isDir) {
  const timer = checkBoxTimer[index]
  if (timer) {
    clearTimeout(timer);
    delete checkBoxTimer[index];
  }
  if (isDir) {
    window.location.href = url;
  } else {
    window.open(url);
  }
}

function cleanCheckBoxAndSelectedItems() {
  const selectAllCheckbox = document.querySelector('#selectAllCheckbox');
  const checkboxes = document.querySelectorAll('input[name="select[]"]');
  selectAllCheckbox.checked = false;
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  selectedItems.splice(0, selectedItems.length);
  updateBatchButtonVisibility();
  toggleCheckBox();
}

/**
 * 
 * @param {onclick event} event 
 * @param {number, the index of path} index 
 */
function clickPathChangeCheckBox(event, index) {
  const timer = checkBoxTimer[index]
  if (timer) {
    clearTimeout(timer);
    delete checkBoxTimer[index];
  }
  checkBoxTimer[index] = setTimeout(() => {
    const checkbox = document.querySelector(`input[name="select[]"][value="${index}"]`);
    let value = checkbox.checked;

    const selectAllCheckbox = document.querySelector('#selectAllCheckbox');
    const checkboxes = document.querySelectorAll('input[name="select[]"]');

    if (!!!event.ctrlKey && !!!event.shiftKey && !!!event.metaKey) {
      // single click without ctrl, shift, cmd(mac), only choose one
      selectAllCheckbox.checked = false;
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });

    } else if (event.shiftKey) {
      // shift + click, choose all between last checked and current checked
      selectedItems.push(index)
      const minVal = Math.min(...selectedItems);
      const maxVal = Math.max(...selectedItems);
      for (let i = minVal; i < maxVal; i++) {
        checkboxes[i].checked = true;
      }
      value = false;
    }

    checkbox.checked = !value;
    toggleCheckBox();
  }, 150);
}

function setupDropzone() {
  ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(name => {
    document.addEventListener(name, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  document.addEventListener("drop", async e => {
    if (!e.dataTransfer.items[0].webkitGetAsEntry) {
      const files = e.dataTransfer.files.filter(v => v.size > 0);
      for (const file of files) {
        new Uploader(file, []).upload();
      }
    } else {
      const entries = [];
      const len = e.dataTransfer.items.length;
      for (let i = 0; i < len; i++) {
        entries.push(e.dataTransfer.items[i].webkitGetAsEntry());
      }
      addFileEntries(entries, [])
    }
  });
}

function setupAuth() {
  if (DATA.user) {
    $userBtn.classList.remove("hidden");
    $userName.textContent = DATA.user;
  } else {
    const $loginBtn = document.querySelector(".login-btn");
    $loginBtn.classList.remove("hidden");
    $loginBtn.addEventListener("click", async () => {
      try {
        await checkAuth()
        location.reload();
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function setupSearch() {
  const $searchbar = document.querySelector(".searchbar");
  $searchbar.classList.remove("hidden");
  $searchbar.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData($searchbar);
    const q = formData.get("q");
    let href = baseUrl();
    if (q) {
      href += "?q=" + q;
    }
    location.href = href;
  });
  if (PARAMS.q) {
    document.getElementById('search').value = PARAMS.q;
  }
}

function setupUploadFile() {
  document.querySelector(".upload-file").classList.remove("hidden");
  document.getElementById("file").addEventListener("change", async e => {
    const files = e.target.files;
    for (let file of files) {
      new Uploader(file, []).upload();
    }
  });
}

function setupNewFolder() {
  const $newFolder = document.querySelector(".new-folder");
  $newFolder.classList.remove("hidden");
  $newFolder.addEventListener("click", () => {
    const name = prompt("文件夹名称");
    if (name) createFolder(name);
  });
}

function setupNewFile() {
  const $newFile = document.querySelector(".new-file");
  $newFile.classList.remove("hidden");
  $newFile.addEventListener("click", () => {
    const name = prompt("文件名称");
    if (name) createFile(name);
  });
}

async function setupEditorPage() {
  const url = baseUrl();

  const $download = document.querySelector(".download");
  $download.classList.remove("hidden");
  $download.href = url;

  if (DATA.kind == "Edit") {
    const $moveFile = document.querySelector(".move-file");
    $moveFile.classList.remove("hidden");
    $moveFile.addEventListener("click", async () => {
      const query = location.href.slice(url.length);
      const newFileUrl = await doMovePath(url);
      if (newFileUrl) {
        location.href = newFileUrl + query;
      }
    });

    const $deleteFile = document.querySelector(".delete-file");
    $deleteFile.classList.remove("hidden");
    $deleteFile.addEventListener("click", async () => {
      const url = baseUrl();
      const name = baseName(url);
      await doDeletePath(name, url, () => {
        location.href = location.href.split("/").slice(0, -1).join("/");
      });
    })

    const $saveBtn = document.querySelector(".save-btn");
    $saveBtn.classList.remove("hidden");
    $saveBtn.addEventListener("click", saveChange);
  } else if (DATA.kind == "View") {
    $editor.readonly = true;
  }

  if (!DATA.editable) {
    const $notEditable = document.querySelector(".not-editable");
    const url = baseUrl();
    const ext = extName(baseName(url));
    if (IFRAME_FORMATS.find(v => v === ext)) {
      $notEditable.insertAdjacentHTML("afterend", `<iframe src="${url}" sandbox width="100%" height="${window.innerHeight - 100}px"></iframe>`)
    } else {
      $notEditable.classList.remove("hidden");
      $notEditable.textContent = "无法编辑大文件或二进制文件";
    }
    return;
  }

  $editor.classList.remove("hidden");
  try {
    const res = await fetch(baseUrl());
    await assertResOK(res);
    const encoding = getEncoding(res.headers.get("content-type"));
    if (encoding === "utf-8") {
      $editor.value = await res.text();
    } else {
      const bytes = await res.arrayBuffer();
      const dataView = new DataView(bytes)
      const decoder = new TextDecoder(encoding)
      $editor.value = decoder.decode(dataView);
    }
  } catch (err) {
    alert(`获取文件失败, ${err.message}`);
  }
}

/**
 * Delete path
 * @param {number} index
 * @returns
 */
async function deletePath(index) {
  cleanContextMenu();
  const file = DATA.paths[index];
  if (!file) return;
  await doDeletePath(file.name, newUrl(file.name), () => {
    document.getElementById(`addPath${index}`)?.remove();
    DATA.paths[index] = null;
    if (!DATA.paths.find(v => !!v)) {
      $pathsTable.classList.add("hidden");
      $emptyFolder.textContent = dirEmptyNote;
      $emptyFolder.classList.remove("hidden");
    }
  })
}

async function downloadBatchPaths(items) {
  if (items.length === 0) return;
  let dir = DATA.href;
  if (dir.startsWith("/")) {
    dir = dir.slice(1);
  }
  const files = items.map(index => DATA.paths[index].name);
  let url = baseUrl().replace(getEncodingHref(), "");
  if (url.endsWith("/")) {
    url += "multiple_download"
  } else {
    url += "/multiple_download"
  }

  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify({ dir, files }),
    }).then(response => {
      if (!response.ok) {
        throw new Error(`下载文件失败, ${response.status} ${response.statusText}`);
      }
      return response.blob();
    }).then(blob => {
      console.log(blob)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `批量下载-${getCurrentName()}-${new Date().toISOString()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      cleanCheckBoxAndSelectedItems();

    });
  } catch (err) {
    alert(`下载文件失败, ${err.message}`);
  }
}

function getCurrentName() {
  const paths = DATA.href.split("/")
  if (paths.length === 0) return "";
  return paths[paths.length - 1];
}

/**
 * Delete paths in batch
 * @param {[]} selectedItems
 * @returns
 */
async function deleteBatchPaths(items) {
  if (items.length === 0) return;
  if (!confirm(`是否删除选中的文件 ?`)) return;
  for (const index of items) {
    const file = DATA.paths[index];
    if (!file) continue;
    await doDeletePathWithoutComfirm(newUrl(file.name), () => {
      document.getElementById(`addPath${index}`)?.remove();
      DATA.paths[index] = null;
      if (!DATA.paths.find(v => !!v)) {
        $pathsTable.classList.add("hidden");
        $emptyFolder.textContent = dirEmptyNote;
        $emptyFolder.classList.remove("hidden");
      }
    })
  }
  window.location.reload();
  cleanCheckBoxAndSelectedItems();
}

async function calculateDirSize(index) {
  cleanContextMenu();
  const file = DATA.paths[index];
  const url = newUrl(file.name)
  try {
    const res = await fetch(url + "?statistic");
    await assertResOK(res);
    const data = await res.json();
    alert(`文件夹 ${file.name} 大小: ${formatSize(data.size).join(" ")}`);
  } catch (err) {
    alert(`无法获取文件夹内容 ${file.name}, ${err.message}`);
  }
}

async function moveBatchPaths(items) {
  const buttons = {
    "确认": async function () {
      if (selectedPath === notChoosePath) {
        alert("请选择目标路径");
        return;
      }
      let newFileUrl = ""
      for (const index of items) {
        mylog("dialog 确认", index, selectedPath);
        $(this).dialog("close");
        newFileUrl = await doMovePathByFileTree(index)
      }
      location.href = newFileUrl.split("/").slice(0, -1).join("/");
      cleanCheckBoxAndSelectedItems();
    },
    "取消": function () {
      mylog("dialog 取消");
      $(this).dialog("close");
    }
  }
  $('#treeDialog').dialog('option', 'buttons', buttons)
  $('#treeDialog').dialog('open')
  listPath(getDefaultPathPrefix()).then(data => {
    mylog("data", data)
    const nodes = pathDataToNodes(data, true)
    mylog("nodes", nodes)
    $('#tree').tree("loadData", wrapDefaultPathPrefixNode(nodes));
  })
}

function wrapDefaultPathPrefixNode(nodes) {
  return [{
    name: "/root",
    id: getDefaultPathPrefix(),
    children: nodes
  }]
}

async function doDeletePathWithoutComfirm(url, callback) {
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "DELETE",
    });
    await assertResOK(res);
    callback();
  } catch (err) {
    alert(`删除文件失败, ${err.message}`);
  }
}

async function doDeletePath(name, url, cb) {
  if (!confirm(`删除 \`${name}\`?`)) return;
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "DELETE",
    });
    await assertResOK(res);
    cb();
  } catch (err) {
    alert(`无法删除 \`${file.name}\`, ${err.message}`);
  }
}

/**
 * 
 * @param {string} path 
 * @returns DATA
 */
async function listPath(path) {
  let url = baseUrl().replace(getEncodingHref(), path.split("/").map(encodeURIComponent).join("/"))
  mylog(`base ${baseUrl()}, href ${DATA.href}, path ${path}, url ${url}`)
  try {
    const res = await fetch(url + "?json");
    await assertResOK(res);
    return await res.json();
  } catch {
    alert(`无法获取文件夹内容 ${path}, ${err.message}`);
    return {
      paths: [],
    };
  }
}

async function renamePath(index) {
  cleanContextMenu();
  const file = DATA.paths[index];
  if (!file) return;
  const newFileUrl = await doRenamePath(file.name);
  if (newFileUrl) {
    location.href = newFileUrl.split("/").slice(0, -1).join("/");
  }
}

function movePathByFileTree(index) {
  cleanContextMenu();
  const buttons = {
    "确认": async function () {
      if (selectedPath === notChoosePath) {
        alert("请选择目标路径");
        return;
      }
      mylog("dialog 确认", index, selectedPath);
      $(this).dialog("close");
      const newFileUrl = await doMovePathByFileTree(index)
      if (newFileUrl) {
        location.href = newFileUrl.split("/").slice(0, -1).join("/");
      }
    },
    "取消": function () {
      mylog("dialog 取消");
      $(this).dialog("close");
    }
  }
  $('#treeDialog').dialog('option', 'buttons', buttons)
  $('#treeDialog').dialog('open')
  listPath(getDefaultPathPrefix()).then(data => {
    mylog("data", data)
    const nodes = pathDataToNodes(data, true)
    mylog("nodes", nodes)
    $('#tree').tree("loadData", wrapDefaultPathPrefixNode(nodes));
  })
}

// megaease cloud file server, first part of href is the storage id
function getDefaultPathPrefix() {
  let parts = DATA.href.split('/');
  if (parts.length > 1) {
    return '/' + parts[1];
  } else {
    return '';
  }
}

async function copyFile(index) {
  cleanContextMenu();
  const file = DATA.paths[index];
  const name = file.name
  let newName = prompt("拷贝副本文件名", name)
  if (!newName) return;
  if (newName === name) return;
  if (newName.includes("/")) {
    alert(`文件名不能带有/`);
    return;
  }
  let fileUrl = newUrl(name)
  let newFileUrl = newUrl(newName);
  try {
    await checkAuth();
    const res1 = await fetch(newFileUrl, {
      method: "HEAD",
    });
    if (res1.status === 200) {
      if (!confirm(`文件 ${newName} 已存在，是否覆盖？`)) {
        return;
      }
    }
    const res2 = await fetch(fileUrl, {
      method: "COPY",
      headers: {
        "Destination": newFileUrl,
      }
    });
    await assertResOK(res2);
    window.location.reload();
  } catch (err) {
    alert(`无法拷贝, ${err.message}`);
  }
}

function getEncodingHref() {
  return DATA.href.split("/").map(encodeURIComponent).join("/")
}

async function doMovePathByFileTree(index) {
  const file = DATA.paths[index];
  const url = newUrl(file.name)
  let newFileUrl = baseUrl().replace(getEncodingHref(), "")
  if (newFileUrl.endsWith("/")) {
    newFileUrl = newFileUrl.slice(0, -1)
  }
  let path = selectedPath
  if (!path.startsWith("/")) {
    path = `/${path}`
  }

  newFileUrl = `${newFileUrl}${path.split("/").map(encodeURIComponent).join("/")}`
  if (newFileUrl.endsWith("/")) {
    newFileUrl += encodeURIComponent(file.name)
  } else {
    newFileUrl += `/${encodeURIComponent(file.name)}`
  }
  mylog("fileurl", url, "new file url", newFileUrl)
  try {
    await checkAuth();
    const res1 = await fetch(newFileUrl, {
      method: "HEAD",
    });
    if (res1.status === 200) {
      if (!confirm("是否覆盖？")) {
        return;
      }
    }
    const res2 = await fetch(url, {
      method: "MOVE",
      headers: {
        "Destination": newFileUrl,
      }
    });
    await assertResOK(res2);
    return newFileUrl;
  } catch (err) {
    alert(`无法移动 \`${file.name}\` 到 \`${path}\`, ${err.message}`);
  }
}

/**
 * Move path
 * @param {number} index
 * @returns
 */
async function movePath(index) {
  cleanContextMenu();
  const file = DATA.paths[index];
  if (!file) return;
  const fileUrl = newUrl(file.name);
  const newFileUrl = await doMovePath(fileUrl);
  if (newFileUrl) {
    location.href = newFileUrl.split("/").slice(0, -1).join("/");
  }
}

function copyPath(index) {
  cleanContextMenu();
  const file = DATA.paths[index];
  if (!file) return;
  const [filePath] = urlToRootPath(newUrl(file.name))
  navigator.clipboard.writeText(filePath).then(() => {
    alert("已复制路径到剪贴板");
  })
}

function urlToRootPath(fileUrl) {
  const fileUrlObj = new URL(fileUrl)
  const prefix = DATA.uri_prefix.slice(0, -1);
  const pathSegments = fileUrlObj.pathname.slice(prefix.length).split('/');
  const firstSegment = pathSegments[1];
  pathSegments[1] = ROOT;
  const filePath = decodeURIComponent(pathSegments.join('/'));
  return [filePath, firstSegment]
}

/**
 * 
 * @param {string, filename} name 
 * @returns 
 */
async function doRenamePath(name) {
  let newName = prompt("新文件名", name)
  if (!newName) return;
  if (newName === name) return;
  if (newName.includes("/")) {
    alert(`文件名不能带有/`);
    return;
  }

  const fileUrl = newUrl(name);
  const newFileUrl = newUrl(newName);
  try {
    await checkAuth();
    const res1 = await fetch(newFileUrl, {
      method: "HEAD",
    });
    if (res1.status === 200) {
      if (!confirm("是否覆盖？")) {
        return;
      }
    }
    const res2 = await fetch(fileUrl, {
      method: "MOVE",
      headers: {
        "Destination": newFileUrl,
      }
    });
    await assertResOK(res2);
    return newFileUrl;
  } catch (err) {
    alert(`无法将 ${name} 重命名为 ${newName}, ${err.message}`);
  }
}

const ROOT = "root";
async function doMovePath(fileUrl) {
  const [filePath, firstSegment] = urlToRootPath(fileUrl)
  let newPath = prompt("新路径", filePath)
  if (!newPath) return;
  if (filePath === newPath) return;
  if (!newPath.startsWith(`/${ROOT}`)) {
    alert(`不能将文件移出 /root 文件夹`);
    return;
  }

  const prefix = DATA.uri_prefix.slice(0, -1);
  const fileUrlObj = new URL(fileUrl)
  const newFileUrl = fileUrlObj.origin + prefix + newPath.split("/").map((segment, i) => i === 1 ? firstSegment : segment).map(encodeURIComponent).join("/");

  try {
    await checkAuth();
    const res1 = await fetch(newFileUrl, {
      method: "HEAD",
    });
    if (res1.status === 200) {
      if (!confirm("是否覆盖？")) {
        return;
      }
    }
    const res2 = await fetch(fileUrl, {
      method: "MOVE",
      headers: {
        "Destination": newFileUrl,
      }
    });
    await assertResOK(res2);
    return newFileUrl;
  } catch (err) {
    alert(`无法移动 \`${filePath}\` 到 \`${newPath}\`, ${err.message}`);
  }
}


/**
 * Save editor change
 */
async function saveChange() {
  try {
    await fetch(baseUrl(), {
      method: "PUT",
      body: $editor.value,
    });
    location.reload();
  } catch (err) {
    alert(`保存失败, ${err.message}`);
  }
}

async function checkAuth() {
  if (!DATA.auth) return;
  const res = await fetch(baseUrl(), {
    method: "WRITEABLE",
  });
  await assertResOK(res);
  document.querySelector(".login-btn").classList.add("hidden");
  $userBtn.classList.remove("hidden");
  $userName.textContent = "";
}

/**
 * Create a folder
 * @param {string} name
 */
async function createFolder(name) {
  const url = newUrl(name);
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "MKCOL",
    });
    await assertResOK(res);
    location.href = url;
  } catch (err) {
    alert(`无法创建文件夹 \`${name}\`, ${err.message}`);
  }
}

async function createFile(name) {
  const url = newUrl(name);
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "PUT",
      body: "",
    });
    await assertResOK(res);
    location.href = url + "?edit";
  } catch (err) {
    alert(`无法创建文件 \`${name}\`, ${err.message}`);
  }
}

async function addFileEntries(entries, dirs) {
  for (const entry of entries) {
    if (entry.isFile) {
      entry.file(file => {
        new Uploader(file, dirs).upload();
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();

      const successCallback = entries => {
        if (entries.length > 0) {
          addFileEntries(entries, [...dirs, entry.name]);
          dirReader.readEntries(successCallback);
        }
      };

      dirReader.readEntries(successCallback);
    }
  }
}


function newUrl(name) {
  let url = baseUrl();
  if (!url.endsWith("/")) url += "/";
  url += name.split("/").map(encodeURIComponent).join("/");
  return url;
}

function baseUrl() {
  return location.href.split('?')[0];
}

function baseName(url) {
  return decodeURIComponent(url.split("/").filter(v => v.length > 0).slice(-1)[0])
}

function extName(filename) {
  const dotIndex = filename.lastIndexOf('.');

  if (dotIndex === -1 || dotIndex === 0 || dotIndex === filename.length - 1) {
    return '';
  }

  return filename.substring(dotIndex);
}

function getPathSvg(path_type) {
  switch (path_type) {
    case "Dir":
      return ICONS.dir;
    case "SymlinkFile":
      return ICONS.symlinkFile;
    case "SymlinkDir":
      return ICONS.symlinkDir;
    default:
      return ICONS.file;
  }
}

function formatMtime(mtime) {
  if (!mtime) return ""
  const date = new Date(mtime);
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1, 2);
  const day = padZero(date.getDate(), 2);
  const hours = padZero(date.getHours(), 2);
  const minutes = padZero(date.getMinutes(), 2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function padZero(value, size) {
  return ("0".repeat(size) + value).slice(-1 * size)
}

function formatSize(size) {
  if (size == null) return [0, "B"]
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (size == 0) return [0, "B"];
  const i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
  ratio = 1
  if (i >= 3) {
    ratio = 100
  }
  return [Math.round(size * ratio / Math.pow(1024, i), 2) / ratio, sizes[i]];
}

function formatDuration(seconds) {
  seconds = Math.ceil(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds - h * 3600) / 60);
  const s = seconds - h * 3600 - m * 60
  return `${padZero(h, 2)}:${padZero(m, 2)}:${padZero(s, 2)}`;
}

function formatPercent(percent) {
  if (percent > 10) {
    return percent.toFixed(1) + "%";
  } else {
    return percent.toFixed(2) + "%";
  }
}

function encodedStr(rawStr) {
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
}

async function assertResOK(res) {
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(await res.text() || `Invalid status ${res.status}`);
  }
}

function getEncoding(contentType) {
  const charset = contentType?.split(";")[1];
  if (/charset/i.test(charset)) {
    let encoding = charset.split("=")[1];
    if (encoding) {
      return encoding.toLowerCase()
    }
  }
  return 'utf-8'
}

/**
 * 
 * @param {DATA} data 
 * @param {boolean} dirOnly
 */
function pathDataToNodes(data, dirOnly) {
  const prefix = data.href
  if (data.paths.length === 0) {
    return []
  }
  let paths = data.paths
  if (dirOnly) {
    paths = paths.filter(path => path.path_type.endsWith("Dir"))
  }
  const nodes = paths.map(path => {
    const name = path.name
    let url = prefix
    if (url.endsWith("/")) {
      url += name
    } else {
      url += "/" + name
    }
    const isDir = path.path_type.endsWith("Dir")
    return {
      name: name,
      id: url,
      // isDir: isDir,
      children: isDir ? [
        {
          name: treeLoading,
        }
      ] : null,
    }
  })
  return nodes
}

const treeLoading = "loading...";
const treeNoChildren = "没有子目录";
const notChoosePath = "没有选择路径";

let selectedPath = ""
function initFileTree() {
  $('#treeDialog').dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    position: {
      my: "center top",
      at: "center top+10%",
      of: window
    },
  })

  let iconOpen = document.createElement("i");
  iconOpen.classList.add("fas", "fa-folder-open")
  let iconClose = document.createElement("i");
  iconClose.classList.add("fas", "fa-folder")

  $('#tree').tree({
    data: [],
    autoOpen: false, // Automatically open all nodes when the tree is displayed
    openedIcon: iconOpen,
    closedIcon: iconClose,
  });

  // when open tree node, load children
  $("#tree").on("tree.open", function (e) {
    const node = e.node;
    mylog("tree open node", node);
    selectedPath = node.id || notChoosePath;
    const currentPath = selectedPath.replace(getDefaultPathPrefix(), "")
    document.getElementById("selectedPath").textContent = `已选择路径：${currentPath === "" ? "根目录" : currentPath}`
    if (node.children && node.children.length > 0 && !hasLoadingChildren(node)) {
      return;
    }
    if (node.name === treeNoChildren) {
      return;
    }
    mylog("tree click node", node)
    listPath(node.id).then(data => {
      let newNodes = pathDataToNodes(data, true)
      if (newNodes.length === 0) {
        newNodes = [{
          name: treeNoChildren,
          // id: node.id,
        }]
      }
      let updateNode = {
        name: node.name,
        id: node.id,
        isDir: node.isDir,
        children: newNodes,
      }
      $('#tree').tree('updateNode', node, updateNode);
      $('#tree').tree('openNode', node);
    })
  });

  // when click tree node, open or close it. 
  // also set selectedPath.
  $("#tree").bind("tree.click", function (event) {
    const node = event.node;
    selectedPath = node.id || notChoosePath;
    document.getElementById("selectedPath").textContent = `已选择路径：${selectedPath.replace(getDefaultPathPrefix(), "")}`
    if (node.is_open) {
      $('#tree').tree('closeNode', node);
    } else {
      $('#tree').tree('openNode', node);
    }
  });
}

/**
 * the code may use name or label as key
 * @param {jqtree child node} node 
 * @returns 
 */
function hasLoadingChildren(node) {
  if (node.children && node.children.length > 0) {
    const child = node.children[0]
    if (child.label && child.label === treeLoading) {
      return true
    } else if (child.name && child.name === treeLoading) {
      return true
    }
    return false
  } else {
    return false
  }
}
